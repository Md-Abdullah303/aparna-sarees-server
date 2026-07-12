export type Saree = {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  fabric: string;
  color: string;
  size: string;           // e.g. "6.5 meters"
  quantity: number;
  images: string[];       // array of image URLs
  tags: string[];         // searchable keywords
  isAvailable: boolean;   // in stock toggle
  userId: string;         // owner's user ID from better-auth
  createdAt: Date;
  updatedAt: Date;
};
