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
 */
export function packCollage(images: GalleryImage[], columns?: number): Collage {
  if (images.length === 0) {
    return { items: [], width: 0, height: 0 };
  }

  const cols = Math.max(1, columns ?? Math.round(Math.sqrt(images.length) * 1.3));
  const heights = new Array<number>(cols).fill(0);
  const items: PlacedImage[] = [];

  for (const img of images) {
    const ratio = img.height / img.width;
    const h = Math.round(COLUMN_WIDTH * ratio);

    let target = 0;
    for (let c = 1; c < cols; c++) {
      if (heights[c] < heights[target]) target = c;
    }

    const x = target * (COLUMN_WIDTH + GAP);
    const y = heights[target];
    items.push({ id: img.id, url: img.url, x, y, w: COLUMN_WIDTH, h });
    heights[target] = y + h + GAP;
  }

  const width = cols * (COLUMN_WIDTH + GAP) - GAP;
  const height = Math.max(...heights) - GAP;
  return { items, width, height };
}
