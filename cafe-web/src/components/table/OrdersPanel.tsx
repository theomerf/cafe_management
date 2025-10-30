import React from 'react';
import { Clock, Users, TrendingUp } from 'lucide-react';
import { type TableItem, type Order } from '../../types/table'; 

interface OrdersPanelProps {
  table: TableItem | null;
  onClose: () => void;
}

export const OrdersPanel: React.FC<OrdersPanelProps> = ({ table, onClose }) => {
  if (!table) return null;

  const getStatusBadgeColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'served':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTableStatusBadgeColor = (status: TableItem['status']) => {
    switch (status) {
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-amber-100 text-amber-800';
      case 'available':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed right-0 top-[15%] h-fit w-96 bg-white shadow-2xl overflow-y-auto z-50">
      <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">Masa {table.tableNumber}</h2>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getTableStatusBadgeColor(table.status)}`}
            >
              {table.status === 'occupied'
                ? 'Dolu'
                : table.status === 'reserved'
                  ? 'Rezerve'
                  : 'Boş'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-2xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-6 border-b">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <Users size={16} />
              <span>Kapasite</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {table.capacity} <span className="text-sm">kişi</span>
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <TrendingUp size={16} />
              <span>Siparişler</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {table.orders?.length || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {table.orders && table.orders.length > 0 ? (
          <div className="space-y-4">
            {table.orders.map((order) => (
              <div
                key={order.id}
                className="border rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-gray-500">Sipariş #{order.id}</p>
                    <p className="font-semibold text-gray-900">
                      {order.items.reduce((acc, item) => acc + item.quantity, 0)}{' '}
                      Ürün
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(order.status)}`}
                  >
                    {order.status === 'pending'
                      ? 'Beklemede'
                      : order.status === 'preparing'
                        ? 'Hazırlanıyor'
                        : order.status === 'ready'
                          ? 'Hazır'
                          : 'Servis Edildi'}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm text-gray-700"
                    >
                      <span>
                        {item.name} <span className="text-gray-500">x{item.quantity}</span>
                      </span>
                      <span className="font-medium">
                        ₺{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-600 text-xs">
                      <Clock size={14} />
                      <span>
                        {new Date(order.createdAt).toLocaleTimeString('tr-TR')}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Toplam</p>
                      <p className="text-lg font-bold text-blue-600">
                        ₺{order.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-2">Henüz sipariş yok</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Yeni Sipariş Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
};