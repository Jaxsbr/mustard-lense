import { pipeline } from '@huggingface/transformers'

const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let extractor: any = null

export async function getEmbedder(): Promise<typeof extractor> {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', MODEL_NAME)
  }
  return extractor
}

export async function embed(text: string): Promise<number[]> {
  const model = await getEmbedder()
  const output = await model(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data as Float32Array)
}

export const EMBEDDING_DIM = 384
