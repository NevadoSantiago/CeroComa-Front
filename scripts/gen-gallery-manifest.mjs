// Genera thumbnails (WebP, livianos) de cada imagen de public/gallery en
// public/gallery-thumbs, y escribe src/data/gallery.json apuntando a los thumbs.
// Los originales quedan intactos (para un futuro lightbox con la foto grande).
//
// Reejecutar cuando cambien las imágenes:  npm run gen:gallery
import { readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { join, extname, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = join(here, "..", "public", "gallery");
const THUMB_DIR = join(here, "..", "public", "gallery-thumbs");
const OUT_FILE = join(here, "..", "src", "data", "gallery.json");

// ~2x el ancho de columna del collage (240px) para que se vea nítido en retina.
const THUMB_WIDTH = 480;

const files = readdirSync(SRC_DIR)
  .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  .sort();

mkdirSync(THUMB_DIR, { recursive: true });

const manifest = [];
for (const file of files) {
  const thumbName = basename(file, extname(file)) + ".webp";

  // withoutEnlargement: no agranda imágenes ya más chicas que THUMB_WIDTH.
  const info = await sharp(join(SRC_DIR, file))
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(join(THUMB_DIR, thumbName));

  manifest.push({
    id: String(manifest.length + 1),
    url: "/gallery-thumbs/" + encodeURIComponent(thumbName),
    width: info.width,
    height: info.height,
  });
}

mkdirSync(dirname(OUT_FILE), { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Thumbs + manifest: ${manifest.length} imágenes -> ${THUMB_DIR}`);
