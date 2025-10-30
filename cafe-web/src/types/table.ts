export interface TableItem {
  id: number;
  tableNumber: number;
  capacity: number;
  position: { x: number; z: number };
  status: 'available' | 'occupied' | 'reserved';
  orders?: Order[];
}

export interface Order {
  id: number;
  tableId: number;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'served';
  createdAt: Date;
  totalPrice: number;
}

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}