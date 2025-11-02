export interface TableItem {
  id: number;
  createdAt: Date;
  name: string;
  capacity: number;
  locationX: number;
  locationZ: number;
  status: 'Available' | 'Occupied' | 'OutOfOrder';
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