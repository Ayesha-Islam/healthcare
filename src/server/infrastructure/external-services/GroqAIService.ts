import axios from 'axios';
import { IAIService, AIAnalysisResult } from '../../domain/interfaces/services/IAIService';
import { CallIntent } from '../../domain/entities/VoiceSession';

export class GroqAIService implements IAIService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeTranscript(transcript: string): Promise<AIAnalysisResult> {
    const prompt = `Analyze this healthcare call transcript and extract:
1. Call intent (APPOINTMENT, EMERGENCY, INQUIRY, PRESCRIPTION, RESULTS, OTHER)
2. Symptoms mentioned
3. Urgency level (HIGH, MEDIUM, LOW)
4. Patient name if mentioned
5. Preferred appointment dates/times if mentioned
6. Whether call requires immediate transfer

Transcript: "${transcript}"

Respond in JSON format.`;

    const response = await this.callGroq(prompt, 'analysis');

    return this.parseAnalysisResponse(response);
  }

  async generateResponse(context: string, userInput: string): Promise<string> {
    const prompt = `You are a professional healthcare receptionist AI assistant. 

Conversation context:
${context}

User says: "${userInput}"

Generate a helpful, empathetic response. 
Be professional and concise. 
If this is an emergency, acknowledge it immediately. 
If collecting information, ask one question at a time.
`;

    return await this.callGroq(prompt, 'response');
  }

  async detectEmergency(text: string): Promise<boolean> {
    const emergencyKeywords = [
      'chest pain', 'can\'t breathe', 'severe bleeding', 'unconscious',
      'heart attack', 'stroke', 'overdose', 'suicide', 'emergency',
      'dying', 'severe pain', 'collapsed', 'seizure'
    ];

    const lowerText = text.toLowerCase();
    return emergencyKeywords.some(keyword => lowerText.includes(keyword));
  }

  async extractSymptoms(text: string): Promise<string[]> {
    const prompt = `Extract all medical symptoms mentioned in this text. Return only the symptoms as a JSON array.

Text: "${text}"`;

    const response = await this.callGroq(prompt, 'extraction');

    try {
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : parsed.symptoms || [];
    } catch {
      return [];
    }
  }

  private async callGroq(prompt: string, type: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'llama-3.1-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant for healthcare.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('Groq API error:', error.message);
      return this.getFallbackResponse(type);
    }
  }

  private parseAnalysisResponse(response: string): AIAnalysisResult {
    try {
      const parsed = JSON.parse(response);
      return {
        intent: parsed.intent || 'OTHER',
        symptoms: parsed.symptoms || [],
        urgency: parsed.urgency || 'MEDIUM',
        entities: parsed.entities || {},
        suggestedResponse: parsed.suggestedResponse || '',
        requiresTransfer: parsed.requiresTransfer || false,
        confidence: parsed.confidence || 0.7
      };
    } catch {
      return {
        intent: 'OTHER' as CallIntent,
        symptoms: [],
        urgency: 'MEDIUM',
        entities: {},
        suggestedResponse: 'I understand. How can I help you today?',
        requiresTransfer: false,
        confidence: 0.5
      };
    }
  }

  private getFallbackResponse(type: string): string {
    const fallbacks: Record<string, string> = {
      response: 'Thank you for calling. How can I assist you today?',
      analysis: JSON.stringify({
        intent: 'OTHER',
        symptoms: [],
        urgency: 'MEDIUM',
        requiresTransfer: false
      }),
      extraction: '[]'
    };
    return fallbacks[type] || '';
  }
}
