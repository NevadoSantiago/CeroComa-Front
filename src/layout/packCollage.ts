export interface GalleryImage {
  id: string;
  url: string;
  width: number;
  height: number;
}

export interface PlacedImage {
  id: string;
  url: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Collage {
  items: PlacedImage[];
  width: number;
  height: number;
}

const COLUMN_WIDTH = 240;
const GAP = 12;

/**
 * Ubica las imágenes en un plano 2D con packing masonry (columna más corta).
 *
 * Todas se escalan al mismo ancho de columna respetando su aspect ratio, y cada
 * una cae en la columna más baja hasta ese momento: así el collage queda denso,
 * sin huecos, y con alto parejo entre columnas.
 *
 * La cantidad de columnas se deriva de la cantidad de imágenes para que el plano
 * quede aproximadamente cuadrado — que haya para arrastrar tanto en horizontal
 * como en vertical.
 *
 * Para que el plano sea TOROIDAL sin costuras negras, el rectángulo tiene que ser
 * periódico: al repetirlo, el borde de abajo debe encajar con el de arriba. El
 * masonry deja las columnas a alturas distintas (borde inferior irregular), así
 * que después de armarlo igualamos cada columna a la más alta escalándola. Con
 * `object-fit: cover` en el item, escalar el alto no deforma la foto: solo recorta
 * un poco más o menos. Resultado: sin huecos, sin distorsión.
 */
export function packCollage(images: GalleryImage[], columns?: number): Collage {
  if (images.length === 0) {
    return { items: [], width: 0, height: 0 };
  }

  const cols = Math.max(1, columns ?? Math.round(Math.sqrt(images.length) * 1.3));
  const heights = new Array<number>(cols).fill(0);
  const byColumn: PlacedImage[][] = Array.from({ length: cols }, () => []);

  for (const img of images) {
    const ratio = img.height / img.width;
    const h = Math.round(COLUMN_WIDTH * ratio);

    let target = 0;
    for (let c = 1; c < cols; c++) {
      if (heights[c] < heights[target]) target = c;
    }

    const x = target * (COLUMN_WIDTH + GAP);
    const y = heights[target];
    byColumn[target].push({ id: img.id, url: img.url, x, y, w: COLUMN_WIDTH, h });
    heights[target] = y + h + GAP;
  }

  // Borde inferior real de cada columna (sin el gap final del acumulador).
  const bottoms = heights.map((hh) => hh - GAP);
  const targetBottom = Math.max(
    ...bottoms.filter((_, c) => byColumn[c].length > 0),
  );

  // Igualamos: cada columna escala para terminar exactamente en targetBottom.
  const items: PlacedImage[] = [];
  for (let c = 0; c < cols; c++) {
    const list = byColumn[c];
    if (list.length === 0) continue;
    const s = targetBottom / bottoms[c];
    for (const it of list) {
      items.push({ ...it, y: Math.round(it.y * s), h: Math.round(it.h * s) });
    }
  }

  // Gap final en ambos ejes → la costura del tile repite el mismo aire de 12px
  // que hay entre imágenes, en vez de un salto o un vacío.
  const width = cols * (COLUMN_WIDTH + GAP);
  const height = targetBottom + GAP;
  return { items, width, height };
}
