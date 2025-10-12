import { ChromaClient, Collection } from 'chromadb';
import { IVectorDBService, DocumentMetadata, SearchResult } from '../../domain/interfaces/services/IVectorDBService';

export class ChromaDBService implements IVectorDBService {
  private client: ChromaClient;
  private collectionName = 'healthcare_knowledge';
  private collection: Collection | null = null;

  constructor(baseUrl: string) {
    this.client = new ChromaClient({ path: baseUrl });
  }

  private async getCollection(): Promise<Collection> {
    if (this.collection) {
      return this.collection;
    }

    this.collection = await this.client.getCollection({ name: this.collectionName });
    return this.collection;
  }

  async addDocument(content: string, metadata: DocumentMetadata): Promise<string> {
    try {
      const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const collection = await this.getCollection();

      await collection.add({
        ids: [id],
        documents: [content],
        metadatas: [metadata as any]
      });

      return id;
    } catch (error: any) {
      console.error('ChromaDB add error:', error.message);
      throw new Error('Failed to add document to vector database');
    }
  }

  async search(query: string, limit = 5): Promise<SearchResult[]> {
    try {
      const collection = await this.getCollection();

      const response = await collection.query({
        queryTexts: [query],
        nResults: limit
      });

      const results: SearchResult[] = [];

      if (response.documents && response.documents[0]) {
        for (let i = 0; i < response.documents[0].length; i++) {
          const rawMetadata = response.metadatas?.[0]?.[i];

          // Convert ChromaDB metadata to DocumentMetadata
          const metadata: DocumentMetadata = {
            source: (rawMetadata as any)?.source || 'unknown',
            type: (rawMetadata as any)?.type || 'unknown',
            lastUpdated: (rawMetadata as any)?.lastUpdated || new Date().toISOString()
          };

          results.push({
            content: response.documents[0][i] as string,
            metadata,
            score: response.distances?.[0]?.[i] || 0
          });
        }
      }

      return results;
    } catch (error: any) {
      console.error('ChromaDB search error:', error.message);
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const collection = await this.getCollection();

      await collection.delete({
        ids: [id]
      });
    } catch (error: any) {
      console.error('ChromaDB delete error:', error.message);
      throw new Error('Failed to delete document from vector database');
    }
  }

  async updateDocument(id: string, content: string, metadata: DocumentMetadata): Promise<void> {
    await this.delete(id);
    await this.addDocument(content, metadata);
  }
}
