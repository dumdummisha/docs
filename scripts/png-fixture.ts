import { crc32 } from 'node:zlib'

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const BIT_DEPTH = 8
const RGBA = 6

export interface IPngFixtureChunk {
  type: string
  data: Buffer
}

const chunk = (type: string, data: Buffer): Buffer => {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const typeAndData = Buffer.concat([Buffer.from(type, 'latin1'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(typeAndData))

  return Buffer.concat([length, typeAndData, crc])
}

// A PNG with a header of the given size, the given extra chunks and no pixels: enough for the size and chunk readers.
export const pngFixture = (width: number, height: number, extraChunks: readonly IPngFixtureChunk[] = []): Buffer => {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header.writeUInt8(BIT_DEPTH, 8)
  header.writeUInt8(RGBA, 9)

  return Buffer.concat([
    SIGNATURE,
    chunk('IHDR', header),
    ...extraChunks.map((extra) => chunk(extra.type, extra.data)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}
