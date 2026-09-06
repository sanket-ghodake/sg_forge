/**
 * SG Forge - Enterprise Brand Logo Generator (2026 LTS)
 * Generates transparent, ultra-crisp dual-theme brand logo matching user screenshot:
 * - 3D Isometric cubes cluster (cyan / sky blue / ocean teal)
 * - Rounded "SG" typographic emblem (ocean slate blue #377da3)
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync, inflateSync } from 'node:zlib';

function createChunk(type: string, data: Buffer): Buffer {
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crcTable[n] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < 4; i++) crc = crcTable[(crc ^ type.charCodeAt(i)) & 0xff] ^ (crc >>> 8);
  for (let i = 0; i < data.length; i++) crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  crc = (crc ^ 0xffffffff) >>> 0;

  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc, 8 + data.length);
  return chunk;
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

/**
 * processAndGenerateLogo
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export function processAndGenerateLogo(): void {
  const candidatePaths = [
    join(process.cwd(), 'public', 'brand', 'source-screenshot.png'),
    join(process.cwd(), 'scratch', 'screenshot.png'),
    join(process.cwd(), 'assets', 'source-screenshot.png'),
  ];

  const sourcePath = candidatePaths.find((p) => existsSync(p));
  if (!sourcePath) {
    console.error('Source screenshot not found in candidate paths.');
    return;
  }

  const buf = readFileSync(sourcePath);
  let pos = 8;
  const idatChunks: Buffer[] = [];
  let srcW = 0,
    srcH = 0;
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IHDR') {
      srcW = buf.readUInt32BE(pos + 8);
      srcH = buf.readUInt32BE(pos + 12);
    } else if (type === 'IDAT') {
      idatChunks.push(buf.subarray(pos + 8, pos + 8 + len));
    }
    pos += 12 + len;
  }

  const raw = inflateSync(Buffer.concat(idatChunks));
  const bpp = 4;
  const stride = 1 + srcW * bpp;
  const uncompressed = Buffer.alloc(srcW * srcH * bpp);

  for (let y = 0; y < srcH; y++) {
    const filter = raw[y * stride];
    const srcRow = y * stride + 1;
    const dstRow = y * srcW * bpp;
    const prevDstRow = (y - 1) * srcW * bpp;

    for (let x = 0; x < srcW * bpp; x++) {
      const rawVal = raw[srcRow + x];
      const left = x >= bpp ? uncompressed[dstRow + x - bpp] : 0;
      const up = y > 0 ? uncompressed[prevDstRow + x] : 0;
      const upLeft = (y > 0 && x >= bpp) ? uncompressed[prevDstRow + x - bpp] : 0;

      let val = 0;
      if (filter === 0) val = rawVal;
      else if (filter === 1) val = (rawVal + left) & 0xff;
      else if (filter === 2) val = (rawVal + up) & 0xff;
      else if (filter === 3) val = (rawVal + Math.floor((left + up) / 2)) & 0xff;
      else if (filter === 4) val = (rawVal + paeth(left, up, upLeft)) & 0xff;

      uncompressed[dstRow + x] = val;
    }
  }

  // Exact bounds of the logo in screenshot
  const minX = 280,
    maxX = 434;
  const minY = 54,
    maxY = 227;
  const pad = 10;

  const dstW = maxX - minX + 1 + pad * 2;
  const dstH = maxY - minY + 1 + pad * 2;
  const dstStride = 1 + dstW * 4;
  const outData = Buffer.alloc(dstH * dstStride, 0);

  for (let dy = 0; dy < dstH; dy++) {
    outData[dy * dstStride] = 0;
    const sy = minY - pad + dy;
    if (sy < 0 || sy >= srcH) continue;

    for (let dx = 0; dx < dstW; dx++) {
      const sx = minX - pad + dx;
      if (sx < 0 || sx >= srcW) continue;

      const sIdx = (sy * srcW + sx) * bpp;
      const r = uncompressed[sIdx],
        g = uncompressed[sIdx + 1],
        b = uncompressed[sIdx + 2];
      const dIdx = dy * dstStride + 1 + dx * 4;

      const sat = Math.max(r, g, b) - Math.min(r, g, b);
      const blueDelta = b - r;

      // Color isolation: filter out white background and neutral watermark
      if (sat > 10 && blueDelta > 8) {
        const alpha = Math.min(
          255,
          Math.max(
            0,
            Math.round(Math.max((255 - r) / 200, (255 - g) / 130, blueDelta / 80) * 255)
          )
        );

        // Alpha un-multiplication against white background
        const aNorm = Math.max(0.05, alpha / 255);
        const trueR = Math.min(255, Math.max(0, Math.round((r - (1 - aNorm) * 255) / aNorm)));
        const trueG = Math.min(255, Math.max(0, Math.round((g - (1 - aNorm) * 255) / aNorm)));
        const trueB = Math.min(255, Math.max(0, Math.round((b - (1 - aNorm) * 255) / aNorm)));

        outData[dIdx] = trueR;
        outData[dIdx + 1] = trueG;
        outData[dIdx + 2] = trueB;
        outData[dIdx + 3] = alpha;
      }
    }
  }

  const compressed = deflateSync(outData, { level: 9 });
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(dstW, 0);
  ihdr.writeUInt32BE(dstH, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const pngBuf = Buffer.concat([
    sig,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', compressed),
    createChunk('IEND', Buffer.alloc(0)),
  ]);

  const outPngPath = join(process.cwd(), 'public', 'brand', 'logo.png');
  writeFileSync(outPngPath, pngBuf);
  console.log(`Generated clean transparent SG logo.png (${dstW}x${dstH}) at: ${outPngPath}`);

  // Generate self-contained standalone SVG with embedded data URI
  const base64Png = pngBuf.toString('base64');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dstW} ${dstH}" width="${dstW}" height="${dstH}">
  <image href="data:image/png;base64,${base64Png}" width="${dstW}" height="${dstH}" />
</svg>
`;
  const outSvgPath = join(process.cwd(), 'public', 'brand', 'logo.svg');
  writeFileSync(outSvgPath, svg, 'utf8');
  console.log(`Generated self-contained vector wrapper logo.svg (${dstW}x${dstH}) at: ${outSvgPath}`);
}

processAndGenerateLogo();
