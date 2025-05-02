export interface ProductProps {
  product: {
    id: string;
    name: string;
    description: string;
    totalSold: number;
    rating: number;
    ratingCount: number;
    variations: ProductVariationsProps[];
  };
  onClose: () => void;
}

export interface ProductVariationsProps {
  colorName: string;
  colorCode: string;
  id: string;
  images: ProductImageProps[];
  productId: string;
  sizes: ProductSizesProps[];
}

export interface ProductSizesProps {
  id: string;
  price: number;
  basePrice: number;
  stock: number;
  size: string;
}

export interface ProductImageProps {
  id: string;
  url: string;
  position: number;
  file?: File;
}
