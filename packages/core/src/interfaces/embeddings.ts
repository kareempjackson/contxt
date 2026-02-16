/**
 * Embeddings provider interface
 */

export interface IEmbeddingProvider {
  /**
   * Initialize embeddings provider
   */
  initialize(): Promise<void>;

  /**
   * Generate embedding for a single text
   */
  generateEmbedding(text: string): Promise<number[]>;

  /**
   * Generate embeddings for multiple texts (batch)
   */
  generateEmbeddings(texts: string[]): Promise<number[][]>;

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(embedding1: number[], embedding2: number[]): number;
}
