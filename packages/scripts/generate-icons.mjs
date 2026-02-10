/* global Buffer, console, process */
import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webAppDir = resolve(__dirname, "../web/app");
const svgPath = resolve(webAppDir, "icon.svg");
const svgBuffer = readFileSync(svgPath);

async function generatePng(size, outputName) {
  const outputPath = resolve(webAppDir, outputName);
  await sharp(svgBuffer).resize(size, size).png().toFile(outputPath);
  console.log(`Generated ${outputName} (${size}x${size})`);
}

function createIco(buffers) {
  // ICO file format: header + directory entries + image data
  const numImages = buffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * numImages;

  let dataOffset = headerSize + dirSize;
  const entries = [];

  for (const buf of buffers) {
    entries.push({ buffer: buf, offset: dataOffset });
    dataOffset += buf.length;
  }

  const totalSize = dataOffset;
  const ico = Buffer.alloc(totalSize);

  // ICO header
  ico.writeUInt16LE(0, 0); // reserved
  ico.writeUInt16LE(1, 2); // type: icon
  ico.writeUInt16LE(numImages, 4); // number of images

  for (let i = 0; i < numImages; i++) {
    const buf = buffers[i];
    const offset = headerSize + i * dirEntrySize;
    const size = i === 0 ? 16 : 32;

    ico.writeUInt8(size === 256 ? 0 : size, offset); // width
    ico.writeUInt8(size === 256 ? 0 : size, offset + 1); // height
    ico.writeUInt8(0, offset + 2); // color palette
    ico.writeUInt8(0, offset + 3); // reserved
    ico.writeUInt16LE(1, offset + 4); // color planes
    ico.writeUInt16LE(32, offset + 6); // bits per pixel
    ico.writeUInt32LE(buf.length, offset + 8); // image size
    ico.writeUInt32LE(entries[i].offset, offset + 12); // data offset

    buf.copy(ico, entries[i].offset);
  }

  return ico;
}

async function main() {
  // Generate PNGs for PWA
  await generatePng(192, "icon-192.png");
  await generatePng(512, "icon-512.png");

  // Generate Apple touch icon
  await generatePng(180, "apple-icon.png");

  // Generate favicon.ico (multi-size: 16 + 32)
  const png16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const icoBuffer = createIco([png16, png32]);
  writeFileSync(resolve(webAppDir, "favicon.ico"), icoBuffer);
  console.log("Generated favicon.ico (16x16 + 32x32)");

  console.log("\nAll icons generated successfully!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
