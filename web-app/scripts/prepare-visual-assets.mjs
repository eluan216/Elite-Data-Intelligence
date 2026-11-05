import { mkdir, readFile, stat } from "node:fs/promises";
import sharp from "sharp";

const sources = [
  ["hero-background.png.jpg", "hero-collage.webp"],
  ["wireframe-head.gif.GIF", "wireframe-head-poster.webp"],
  ["network-brain.gif.GIF", "network-brain-poster.webp"],
  ["data-lattice.gif.GIF", "data-lattice-poster.webp"],
  ["terminal-interface.gif.GIF", "terminal-interface-poster.webp"],
];
await mkdir("public/images/optimized", { recursive: true });
const tiles = [];
for (let index = 0; index < sources.length; index++) {
  const [source, target] = sources[index];
  const path = "public/images/optimized/" + target;
  await sharp("public/images/" + source, { animated: false, pages: 1 })
    .rotate().resize({ width: 1100, withoutEnlargement: true })
    .webp({ quality: 82 }).toFile(path);
  const content = await readFile(path);
  const metadata = await sharp(content).metadata();
  console.log("VISUAL_ASSET_JSON=" + JSON.stringify({
    path: "web-app/" + path, base64: content.toString("base64"),
    bytes: content.length, width: metadata.width, height: metadata.height,
    source, sourceBytes: (await stat("public/images/" + source)).size,
  }));
  const tile = await sharp(content).resize(360, 300, { fit: "contain", background: "#111a14" })
    .extend({ bottom: 40, background: "#111a14" }).png().toBuffer();
  const label = Buffer.from('<svg width="360" height="40"><text x="12" y="25" fill="#f3f4e9" font-size="14" font-family="sans-serif">' + source + '</text></svg>');
  const labeled = await sharp(tile).composite([{ input: label, top: 300, left: 0 }]).png().toBuffer();
  tiles.push({ input: labeled, left: (index % 3) * 360, top: Math.floor(index / 3) * 340 });
}
const sheet = await sharp({ create: { width: 1080, height: 680, channels: 3, background: "#111a14" } })
  .composite(tiles).jpeg({ quality: 85 }).toBuffer();
console.log("VISUAL_CONTACT_SHEET=" + sheet.toString("base64"));
