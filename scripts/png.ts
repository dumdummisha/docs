import { inflateSync } from 'node:zlib'

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const CHUNK_HEADER_BYTES = 8
const CHUNK_CRC_BYTES = 4
const NUL = 0

interface IPngChunk {
  type: string
  data: Buffer
}

export interface IPngSize {
  width: number
  height: number
}

export const isPng = (bytes: Buffer): boolean => bytes.subarray(0, SIGNATURE.length).equals(SIGNATURE)

const chunksOf = (bytes: Buffer): IPngChunk[] => {
  if (!isPng(bytes)) {
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

// iTXt: keyword, NUL, compression flag, compression method, language tag, NUL, translated keyword, NUL, text.
const itxtOf = (data: Buffer): string => {
  const keywordEnd = data.indexOf(NUL)
  const isCompressed = data[keywordEnd + 1] === 1
  const languageEnd = data.indexOf(NUL, keywordEnd + 3)
  const translatedEnd = data.indexOf(NUL, languageEnd + 1)
  const text = data.subarray(translatedEnd + 1)
  const header = data.toString('utf8', 0, translatedEnd).replaceAll('\0', ' ')

  return `${header} ${(isCompressed ? inflateSync(text) : text).toString('utf8')}`
}

// zTXt: keyword, NUL, compression method, zlib-compressed text.
const ztxtOf = (data: Buffer): string => {
  const keywordEnd = data.indexOf(NUL)

  return `${data.toString('latin1', 0, keywordEnd)} ${inflateSync(data.subarray(keywordEnd + 2)).toString('latin1')}`
}

// Every text a PNG carries outside its pixels (tEXt, zTXt, iTXt keywords and values), for the public-data scan.
export const pngTextsOf = (bytes: Buffer): string[] =>
  chunksOf(bytes).flatMap((chunk) => {
    switch (chunk.type) {
      case 'tEXt':
        return [chunk.data.toString('latin1').replaceAll('\0', ' ')]
      case 'zTXt':
        return [ztxtOf(chunk.data)]
      case 'iTXt':
        return [itxtOf(chunk.data)]
      default:
        return []
    }
  })
