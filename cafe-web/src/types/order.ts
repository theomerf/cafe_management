export default interface Order{
    id?: number;
    createdAt?: Date;
    status?: "Processing" | "Delivered" | "Cancelled" | "Old";
    totalAmount: number;
    orderLines: OrderLine[];
    tableId: number;
}

export interface OrderLine{
    id: number;
    orderId: number;
    productId: number;
    productName?: string;
    productImageUrl?: string;
    unitPrice: number;
    quantity: number;
}