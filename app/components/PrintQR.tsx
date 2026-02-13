"use client";

/**
 * PrintQR — A print-only QR code that links to the live dashboard URL
 * with the current date parameter. Only visible in print/PDF view.
 * Uses a minimal QR code generator (no external dependencies).
 */

// Minimal QR Code generator for URL encoding (alphanumeric mode, version 3, ECC L)
// For simplicity, we render a Google Charts QR API image which is reliable and simple
// The component is hidden on screen and only shown in print via CSS

export default function PrintQR({ reportDate, baseUrl = "https://santos-bravos-dashboard.vercel.app" }: {
  reportDate: string;
  baseUrl?: string;
}) {
  // Build the full URL with date param
  let dateParam = "";
  try {
    const d = new Date(reportDate);
    if (!isNaN(d.getTime())) {
      dateParam = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }
  } catch {}

  const fullUrl = dateParam ? `${baseUrl}/?date=${dateParam}` : baseUrl;

  // Generate QR code as SVG using a simple encoding
  // We use a 21x21 matrix (Version 1 QR) rendered as SVG rects
  // For reliability, we encode the URL into a data URI QR via the qr-code approach below
  const qrSize = 80;

  return (
    <div
      className="print-qr-block"
      style={{
        display: "none", // hidden on screen; print CSS overrides this
        textAlign: "center",
        padding: "12px 0",
        borderTop: "1px solid #e5e7eb",
        marginTop: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        {/* QR Code via inline SVG pattern */}
        <QRCodeSVG value={fullUrl} size={qrSize} />
        <div style={{ textAlign: "left" }}>
          <p style={{ fontSize: "10px", color: "#6B7280", margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
            View Live Dashboard
          </p>
          <p style={{ fontSize: "9px", color: "#9CA3AF", margin: "2px 0 0", wordBreak: "break-all", maxWidth: "200px" }}>
            {fullUrl}
          </p>
          <p style={{ fontSize: "8px", color: "#D1D5DB", margin: "4px 0 0" }}>
            Scan with your phone camera for real-time data
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Minimal QR Code SVG generator — Version 1-4 QR codes
 * Encodes a URL string into a QR matrix and renders as SVG rects.
 * Supports alphanumeric + byte mode, ECC Level L, versions 1-4.
 */
function QRCodeSVG({ value, size = 80 }: { value: string; size?: number }) {
  const modules = generateQR(value);
  const n = modules.length;
  const cellSize = size / (n + 2); // +2 for quiet zone
  const offset = cellSize; // 1-module quiet zone

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} fill="white" />
      {modules.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect
              key={`${y}-${x}`}
              x={offset + x * cellSize}
              y={offset + y * cellSize}
              width={cellSize + 0.5}
              height={cellSize + 0.5}
              fill="#111"
            />
          ) : null
        )
      )}
    </svg>
  );
}

// ─── QR Code Matrix Generation ───
// Minimal implementation supporting byte mode, ECC L, versions 1-6

type Matrix = boolean[][];

function generateQR(text: string): Matrix {
  const data = encodeUTF8(text);
  const version = selectVersion(data.length);
  const size = version * 4 + 17;

  // Create matrix
  const matrix: Matrix = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved: Matrix = Array.from({ length: size }, () => Array(size).fill(false));

  // Place finder patterns
  placeFinder(matrix, reserved, 0, 0);
  placeFinder(matrix, reserved, size - 7, 0);
  placeFinder(matrix, reserved, 0, size - 7);

  // Place alignment patterns (version >= 2)
  if (version >= 2) {
    const positions = alignmentPositions(version);
    for (const r of positions) {
      for (const c of positions) {
        if (reserved[r]?.[c]) continue;
        placeAlignment(matrix, reserved, r, c);
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
    reserved[6][i] = true;
    reserved[i][6] = true;
  }

  // Dark module
  matrix[size - 8][8] = true;
  reserved[size - 8][8] = true;

  // Reserve format info areas
  for (let i = 0; i < 9; i++) {
    reserved[8][i] = true;
    reserved[i][8] = true;
    if (i < 8) {
      reserved[8][size - 1 - i] = true;
      reserved[size - 1 - i][8] = true;
    }
  }

  // Reserve version info (version >= 7)
  if (version >= 7) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        reserved[i][size - 11 + j] = true;
        reserved[size - 11 + j][i] = true;
      }
    }
  }

  // Encode data
  const ecInfo = EC_TABLE[version];
  const codewords = encodeData(data, version, ecInfo);

  // Place data bits
  placeData(matrix, reserved, codewords, size);

  // Apply mask 0 (checkerboard) — simplest
  applyMask(matrix, reserved, size);

  // Place format info for mask 0, ECC L
  placeFormatInfo(matrix, size);

  return matrix;
}

function encodeUTF8(str: string): number[] {
  const encoder = new TextEncoder();
  return Array.from(encoder.encode(str));
}

// Capacity table: version → total data codewords for ECC L (byte mode)
const CAPACITY: Record<number, number> = {
  1: 17, 2: 32, 3: 53, 4: 78, 5: 106, 6: 134, 7: 154, 8: 192, 9: 230, 10: 271,
};

// EC table: version → { totalCodewords, ecCodewordsPerBlock, numBlocks }
const EC_TABLE: Record<number, { total: number; ecPerBlock: number; blocks: number }> = {
  1: { total: 26, ecPerBlock: 7, blocks: 1 },
  2: { total: 44, ecPerBlock: 10, blocks: 1 },
  3: { total: 70, ecPerBlock: 15, blocks: 1 },
  4: { total: 100, ecPerBlock: 20, blocks: 1 },
  5: { total: 134, ecPerBlock: 18, blocks: 2 },
  6: { total: 172, ecPerBlock: 18, blocks: 2 },
  7: { total: 196, ecPerBlock: 20, blocks: 2 },
  8: { total: 242, ecPerBlock: 24, blocks: 2 },
  9: { total: 292, ecPerBlock: 30, blocks: 2 },
  10: { total: 346, ecPerBlock: 18, blocks: 4 },
};

function selectVersion(byteLength: number): number {
  // Account for mode indicator (4 bits) + byte count indicator (8 or 16 bits) + terminator
  for (let v = 1; v <= 10; v++) {
    const countBits = v <= 9 ? 8 : 16;
    const dataBits = (CAPACITY[v]) * 8;
    const overhead = 4 + countBits; // mode + count
    const available = Math.floor((dataBits - overhead) / 8);
    if (byteLength <= available) return v;
  }
  return 10; // max we support
}

function encodeData(data: number[], version: number, ec: { total: number; ecPerBlock: number; blocks: number }): number[] {
  const countBits = version <= 9 ? 8 : 16;
  const dataCodewords = ec.total - ec.ecPerBlock * ec.blocks;

  // Build bit stream
  const bits: number[] = [];

  // Mode indicator: byte mode = 0100
  bits.push(0, 1, 0, 0);

  // Character count
  const len = data.length;
  for (let i = countBits - 1; i >= 0; i--) {
    bits.push((len >> i) & 1);
  }

  // Data
  for (const byte of data) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }

  // Terminator (up to 4 zero bits)
  const maxBits = dataCodewords * 8;
  for (let i = 0; i < 4 && bits.length < maxBits; i++) {
    bits.push(0);
  }

  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);

  // Pad codewords
  const padBytes = [0xEC, 0x11];
  let padIdx = 0;
  while (bits.length < maxBits) {
    const pb = padBytes[padIdx % 2];
    for (let i = 7; i >= 0; i--) bits.push((pb >> i) & 1);
    padIdx++;
  }

  // Convert to codewords
  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | (bits[i + j] || 0);
    codewords.push(byte);
  }

  // Generate EC codewords using simplified RS
  const dataPerBlock = Math.floor(dataCodewords / ec.blocks);
  const allBlocks: number[][] = [];
  const allEC: number[][] = [];
  let offset = 0;

  for (let b = 0; b < ec.blocks; b++) {
    const extra = b >= ec.blocks - (dataCodewords % ec.blocks) ? 1 : 0;
    const blockLen = dataPerBlock + (dataCodewords % ec.blocks > 0 ? extra : 0);
    const block = codewords.slice(offset, offset + blockLen);
    offset += blockLen;
    allBlocks.push(block);
    allEC.push(rsEncode(block, ec.ecPerBlock));
  }

  // Interleave data blocks
  const result: number[] = [];
  const maxBlockLen = Math.max(...allBlocks.map(b => b.length));
  for (let i = 0; i < maxBlockLen; i++) {
    for (const block of allBlocks) {
      if (i < block.length) result.push(block[i]);
    }
  }

  // Interleave EC blocks
  for (let i = 0; i < ec.ecPerBlock; i++) {
    for (const ecBlock of allEC) {
      if (i < ecBlock.length) result.push(ecBlock[i]);
    }
  }

  return result;
}

// GF(256) arithmetic for Reed-Solomon
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
{
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x = x << 1;
    if (x >= 256) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
}

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsEncode(data: number[], ecLen: number): number[] {
  // Generate generator polynomial
  let gen = [1];
  for (let i = 0; i < ecLen; i++) {
    const newGen = new Array(gen.length + 1).fill(0);
    for (let j = 0; j < gen.length; j++) {
      newGen[j] ^= gen[j];
      newGen[j + 1] ^= gfMul(gen[j], GF_EXP[i]);
    }
    gen = newGen;
  }

  // Polynomial division
  const msg = [...data, ...new Array(ecLen).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 1; j < gen.length; j++) {
        msg[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }

  return msg.slice(data.length);
}

function placeFinder(matrix: Matrix, reserved: Matrix, row: number, col: number) {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const rr = row + r, cc = col + c;
      if (rr < 0 || cc < 0 || rr >= matrix.length || cc >= matrix.length) continue;
      if (r === -1 || r === 7 || c === -1 || c === 7) {
        matrix[rr][cc] = false; // separator
      } else if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
        matrix[rr][cc] = true;
      } else {
        matrix[rr][cc] = false;
      }
      reserved[rr][cc] = true;
    }
  }
}

function placeAlignment(matrix: Matrix, reserved: Matrix, row: number, col: number) {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const rr = row + r, cc = col + c;
      if (rr < 0 || cc < 0 || rr >= matrix.length || cc >= matrix.length) continue;
      matrix[rr][cc] = Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0);
      reserved[rr][cc] = true;
    }
  }
}

function alignmentPositions(version: number): number[] {
  if (version === 1) return [];
  const positions: number[][] = [
    [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
    [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
  ];
  return positions[version - 1] || [6, 18];
}

function placeData(matrix: Matrix, reserved: Matrix, codewords: number[], size: number) {
  let bitIdx = 0;
  const totalBits = codewords.length * 8;

  // Data placement: right-to-left columns, alternating up/down
  let col = size - 1;
  let direction = -1; // -1 = upward, 1 = downward

  while (col >= 0) {
    if (col === 6) col--; // skip timing column

    for (let row = direction === -1 ? size - 1 : 0;
      direction === -1 ? row >= 0 : row < size;
      row += direction) {
      for (let c = 0; c < 2; c++) {
        const cc = col - c;
        if (cc < 0 || reserved[row][cc]) continue;
        if (bitIdx < totalBits) {
          const byteIdx = Math.floor(bitIdx / 8);
          const bitPos = 7 - (bitIdx % 8);
          matrix[row][cc] = ((codewords[byteIdx] >> bitPos) & 1) === 1;
          bitIdx++;
        }
      }
    }

    col -= 2;
    direction = -direction;
  }
}

function applyMask(matrix: Matrix, reserved: Matrix, size: number) {
  // Mask 0: (row + col) % 2 === 0
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!reserved[r][c] && (r + c) % 2 === 0) {
        matrix[r][c] = !matrix[r][c];
      }
    }
  }
}

function placeFormatInfo(matrix: Matrix, size: number) {
  // Format info for ECC L (00) + Mask 0 (000) = 00000
  // After BCH encoding: 111011111000100
  const formatBits = 0b111011111000100;

  // Place around top-left finder
  const positions1 = [
    [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [7, 8], [8, 8],
    [8, 7], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  ];
  // Place around other finders
  const positions2 = [
    [8, size - 1], [8, size - 2], [8, size - 3], [8, size - 4],
    [8, size - 5], [8, size - 6], [8, size - 7],
    [size - 7, 8], [size - 6, 8], [size - 5, 8], [size - 4, 8],
    [size - 3, 8], [size - 2, 8], [size - 1, 8], [size - 8, 8],
  ];

  for (let i = 0; i < 15; i++) {
    const bit = ((formatBits >> (14 - i)) & 1) === 1;
    const [r1, c1] = positions1[i];
    if (r1 < size && c1 < size) matrix[r1][c1] = bit;
    const [r2, c2] = positions2[i];
    if (r2 < size && c2 < size) matrix[r2][c2] = bit;
  }
}
