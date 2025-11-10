import type Order from "./order";

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

export interface CreateTableDTO {
  name: string;
  capacity: number;
  locationX: number;
  locationZ: number;
}

export interface UpdateTableDTO {
  id: number;
  name?: string;
  capacity?: number;
  locationX?: number;
  locationZ?: number;
  status?: 'Available' | 'Occupied' | 'OutOfOrder';
}