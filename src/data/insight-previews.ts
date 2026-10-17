/** Shared presentation contract. Article copy lives only in the collection. */
export interface InsightPreview {
  id: string;
  title: string;
  category: string;
  description: string;
  featured: boolean;
  image: {
    alt: string;
    width: number;
    height: number;
    src: string;
    avifSrcSet?: string;
    webpSrcSet?: string;
    mobileWidth?: number;
    mobileHeight?: number;
    mobileAvifSrcSet?: string;
    mobileWebpSrcSet?: string;
  };
}
