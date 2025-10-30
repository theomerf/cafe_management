import { create } from 'zustand';
import { type TableItem, type Order } from '../types/table';

interface TableStore {
  tables: TableItem[];
  selectedTable: TableItem | null;
  setSelectedTable: (table: TableItem | null) => void;
  addOrder: (tableId: number, order: Order) => void;
  updateOrderStatus: (orderId: number, status: Order['status']) => void;
  getTables: () => void;
}

export const useTableStore = create<TableStore>((set, get) => ({
  tables: [],
  selectedTable: null,

  setSelectedTable: (table) => set({ selectedTable: table }),

  addOrder: (tableId, order) =>
    set((state) => ({
      tables: state.tables.map((table) =>
        table.id === tableId
          ? {
              ...table,
              orders: [...(table.orders || []), order],
              status: 'occupied',
            }
          : table
      ),
    })),

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      tables: state.tables.map((table) => ({
        ...table,
        orders: table.orders?.map((order) =>
          order.id === orderId ? { ...order, status } : order
        ),
      })),
    })),

  getTables: () => {
    const fakeTables: TableItem[] = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      tableNumber: i + 1,
      capacity: [2, 4, 6, 8][Math.floor(Math.random() * 4)],
      position: {
        x: (i % 4) * 5 - 7.5,
        z: Math.floor(i / 4) * 5 - 5,
      },
      status: ['available', 'occupied', 'reserved'][
        Math.floor(Math.random() * 3)
      ] as TableItem['status'],
      orders:
        Math.random() > 0.5
          ? [
              {
                id: i + 1,
                tableId: i + 1,
                items: [
                  {
                    id: 1,
                    name: 'Espresso',
                    quantity: 2,
                    price: 3.5,
                  },
                  {
                    id: 2,
                    name: 'Croissant',
                    quantity: 1,
                    price: 4.0,
                  },
                ],
                status: ['pending', 'preparing', 'ready'][
                  Math.floor(Math.random() * 3)
                ] as Order['status'],
                createdAt: new Date(),
                totalPrice: 11.0,
              },
            ]
          : [],
    }));

    set({ tables: fakeTables });
  },
}));