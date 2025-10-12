export interface DocumentMetadata {
    source: string;
    type: 'FAQ' | 'POLICY' | 'PROCEDURE';
    lastUpdated: Date;
}

export interface SearchResult {
    content: string;
    metadata: DocumentMetadata;
    score: number;
}

export interface IVectorDBService {
    addDocument(content: string, metadata: DocumentMetadata): Promise<string>;
    search(query: string, limit?: number): Promise<SearchResult[]>;
    delete(id: string): Promise<void>;
    updateDocument(id: string, content: string, metadata: DocumentMetadata): Promise<void>;
}