export default interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    categoryId: number;
    categoryName: string;
    image?: File;
}

export interface ProductStats {
    id: number,
    name: string,
    count: number
}