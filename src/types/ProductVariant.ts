export interface ProductVariantSizeProps {
  size: string;
  stock: number;
  price: string;
  basePrice: string;
}

export interface ProductImagesProps {
  url?: string;
  position: number;
  file?: File;
}

export interface ProductVariantProps {
  colorName: string;
  colorCode: string;
  images: ProductImagesProps[];
  sizes: ProductVariantSizeProps[];
}
