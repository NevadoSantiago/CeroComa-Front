import type { GalleryImage } from "../layout/packCollage";
import galleryManifest from "../data/gallery.json";

/**
 * Provee el set de imágenes de la galería.
 *
 * Las imágenes son estáticas: el manifest (public/gallery + dimensiones) se
 * genera con `npm run gen:gallery` y se bundlea. Cero llamadas al backend.
 * Se mantiene la forma { images, loading, error } para no tocar el consumidor.
 */
export function useImages() {
  return {
    images: galleryManifest as GalleryImage[],
    loading: false,
    error: null as string | null,
  };
}
