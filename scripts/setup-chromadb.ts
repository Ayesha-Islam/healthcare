import { ChromaClient } from 'chromadb';

const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';
const COLLECTION_NAME = 'healthcare_knowledge';

async function setupChromaDB(): Promise<void> {
    console.log('🔍 Setting up ChromaDB...');

    try {
        // Create ChromaDB client
        const client = new ChromaClient({ path: CHROMA_URL });

        // Test connection
        await client.heartbeat();
        console.log('✅ ChromaDB is accessible');

        // Get or create collection
        let collection;
        try {
            collection = await client.getOrCreateCollection({
                name: COLLECTION_NAME,
                metadata: { description: 'Healthcare knowledge base' }
            });
            console.log(`✅ Collection ready: ${COLLECTION_NAME}`);
        } catch (error: any) {
            console.error('Error creating collection:', error.message);
            throw error;
        }

        await seedKnowledgeBase(client);
        console.log('✅ ChromaDB setup complete');
    } catch (error: any) {
        if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
            console.error('❌ Cannot connect to ChromaDB. Make sure it is running on', CHROMA_URL);
            console.log('💡 You can start ChromaDB with: docker run -p 8000:8000 chromadb/chroma');
        } else {
            console.error('❌ ChromaDB setup failed:', error.message);
        }
        throw error;
    }
}

async function seedKnowledgeBase(client: ChromaClient): Promise<void> {
    console.log('📚 Seeding knowledge base...');

    const documents = [
        'Our clinic operates Monday through Friday, 9 AM to 5 PM. We are closed on weekends and major holidays.',
        'For emergencies, please call 911 immediately. Our emergency transfer line is available 24/7.',
        'Appointment cancellations must be made at least 24 hours in advance. Late cancellations may incur a fee.',
        'We accept most major insurance providers. Please bring your insurance card to your appointment.',
        'If you are experiencing chest pain, difficulty breathing, or severe bleeding, this is a medical emergency. Call 911 immediately.'
    ];

    const metadatas = [
        { source: 'FAQ', type: 'POLICY', lastUpdated: new Date().toISOString() },
        { source: 'FAQ', type: 'PROCEDURE', lastUpdated: new Date().toISOString() },
        { source: 'Policy', type: 'POLICY', lastUpdated: new Date().toISOString() },
        { source: 'FAQ', type: 'POLICY', lastUpdated: new Date().toISOString() },
        { source: 'Emergency Protocol', type: 'PROCEDURE', lastUpdated: new Date().toISOString() }
    ];

    try {
        const collection = await client.getCollection({ name: COLLECTION_NAME });

        // Check if collection is empty
        const existingCount = await collection.count();

        if (existingCount === 0) {
            const ids = documents.map((_, i) => `seed_doc_${i}_${Date.now()}`);

            await collection.add({
                ids,
                documents,
                metadatas
            });

            console.log(`✅ Seeded ${documents.length} knowledge base documents`);
        } else {
            console.log(`ℹ️  Collection already has ${existingCount} documents, skipping seed`);
        }
    } catch (error: any) {
        console.warn('⚠️  Could not seed knowledge base:', error.message);
    }
}

setupChromaDB()
    .then(() => {
        console.log('✅ ChromaDB setup completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ ChromaDB setup failed');
        process.exit(1);
    });
