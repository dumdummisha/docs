const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const CHUNK_HEADER_BYTES = 8
const CHUNK_CRC_BYTES = 4

interface IPngChunk {
  type: string
  data: Buffer
}

export interface IPngSize {
  width: number
  height: number
}

const chunksOf = (bytes: Buffer): IPngChunk[] => {
  if (!bytes.subarray(0, SIGNATURE.length).equals(SIGNATURE)) {
    throw new Error('Not a PNG: the signature is missing')
  }
  const chunks: IPngChunk[] = []
  let offset = SIGNATURE.length
  while (offset < bytes.length) {
    if (offset + CHUNK_HEADER_BYTES > bytes.length) {
      throw new Error('Truncated PNG: a chunk header runs past the end')
    }
    const length = bytes.readUInt32BE(offset)
    const type = bytes.toString('latin1', offset + 4, offset + CHUNK_HEADER_BYTES)
    const start = offset + CHUNK_HEADER_BYTES
    const end = start + length
    if (end + CHUNK_CRC_BYTES > bytes.length) {
      throw new Error(`Truncated PNG: the ${type} chunk runs past the end`)
    }
    chunks.push({ type, data: bytes.subarray(start, end) })
    offset = end + CHUNK_CRC_BYTES
  }

  return chunks
}

// The width and height IHDR declares, which a capture's manifest entry must repeat.
export const pngSizeOf = (bytes: Buffer): IPngSize => {
  const header = chunksOf(bytes)[0]
  if (header?.type !== 'IHDR') {
    throw new Error('Not a PNG: the first chunk is not IHDR')
  }

  return { width: header.data.readUInt32BE(0), height: header.data.readUInt32BE(4) }
}

// The type of every chunk in file order, for the public-data scan's chunk allowlist.
export const pngChunkTypesOf = (bytes: Buffer): string[] => chunksOf(bytes).map((chunk) => chunk.type)
