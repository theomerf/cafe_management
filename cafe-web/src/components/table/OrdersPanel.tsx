import React from 'react';
import { Clock, Users, TrendingUp } from 'lucide-react';
import { type TableItem } from '../../types/table';
import type Order from '../../types/order';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faMoneyBill, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import type { OrderStatusUpdateDto } from '../../types/order';

interface OrdersPanelProps {
  table: TableItem | null;
  orders: Order[] | null;
  handleOrderStatusUpdate: (update: OrderStatusUpdateDto) => void;
  setShowOrderPanel: () => void;
  onClose: () => void;
}

export const OrdersPanel: React.FC<OrdersPanelProps> = ({ table, orders, handleOrderStatusUpdate, setShowOrderPanel, onClose }) => {
  if (!table) return null;

  const getStatusBadgeColor = (status: Order['status']) => {
    switch (status) {
      case 'Preparing':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-yellow-800';
      case 'Old':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTableStatusBadgeColor = (status: TableItem['status']) => {
    switch (status) {
      case 'Occupied':
        return 'bg-red-100 text-red-800';
      case 'OutOfOrder':
        return 'bg-amber-100 text-amber-800';
      case 'Available':
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
            <h2 className="text-3xl font-bold">Masa {table.name}</h2>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getTableStatusBadgeColor(table.status)}`}
            >
              {table.status === 'Occupied'
                ? 'Dolu'
                : table.status === 'OutOfOrder'
                  ? 'Servis Dışı'
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
              {orders?.length || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 max-h-80 overflow-y-auto">
        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-gray-500">Sipariş #{order.id}</p>
                    <p className="font-semibold text-gray-900">
                      {order.orderLines.reduce((acc, item) => acc + item.quantity, 0)}{' '}
                      Ürün
                    </p>
                  </div>
                  <div className='flex ml-auto mr-2 flex-row gap-x-1'>
                    {order.status != "Delivered" && order.status != "Cancelled" && (
                    <button onClick={() => handleOrderStatusUpdate({ id: order.id!, status: "Delivered" })} title="Teslim Edildi Olarak İşaretle" className="w-8 h-8 rounded-lg text-white backdrop-blur-lg group shadow-md shadow-green-300 bg-gradient-to-br from-green-300 via-green-500 to-green-600 transition-all duration-500 hover:from-green-400/80 hover:via-green-600/80 hover:to-green-700/80 hover:shadow-lg hover:green-yellow-400 hover:scale-105">
                      <FontAwesomeIcon icon={faCheckCircle} className=" group-hover:scale-110 transition-all duration-500 group-hover:rotate-6" />
                    </button>
                    )}

                    {order.status != "Delivered" && (
                      <button onClick={() => handleOrderStatusUpdate({ id: order.id!, status: "Cancelled" })} title="İptal Edildi Olarak İşaretle" className="w-8 h-8 rounded-lg text-white backdrop-blur-lg group shadow-md shadow-red-300 bg-gradient-to-br from-red-300 via-red-500 to-red-600 transition-all duration-500 hover:from-red-400/80 hover:via-red-600/80 hover:to-red-700/80 hover:shadow-lg hover:green-yellow-400 hover:scale-105">
                        <FontAwesomeIcon icon={faXmarkCircle} className=" group-hover:scale-110 transition-all duration-500 group-hover:rotate-6" />
                      </button>
                    )}
                    {order.status === "Delivered" && (
                      <button onClick={() => handleOrderStatusUpdate({ id: order.id!, status: "Old" })} title="Ödemeyi Gerçekleştir" className="w-8 h-8 rounded-lg text-white backdrop-blur-lg group shadow-md shadow-blue-300 bg-gradient-to-br from-blue-300 via-blue-500 to-blue-600 transition-all duration-500 hover:from-blue-400/80 hover:via-blue-600/80 hover:to-blue-700/80 hover:shadow-lg hover:green-yellow-400 hover:scale-105">
                        <FontAwesomeIcon icon={faMoneyBill} className=" group-hover:scale-110 transition-all duration-500 group-hover:rotate-6" />
                      </button>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(order.status)}`}
                  >
                    {order.status === 'Preparing'
                      ? 'Hazırlanıyor'
                      : order.status === 'Delivered'
                        ? 'Servis Edildi'
                        : order.status === 'Cancelled'
                          ? 'İptal Edildi'
                          : 'Eski'}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  {order.orderLines.map((ol) => (
                    <div
                      key={ol.id}
                      className="flex justify-between text-sm text-gray-700"
                    >
                      <span>
                        <img src={ol.productImageUrl} alt={`img-${ol.productId}`} className="w-8 h-8 border-2 bg-white/50 backdrop-blur-lg rounded-lg border-gray-200 object-cover hover:scale-105 transition-all duration-500" />
                      </span>
                      <span className='self-center'>
                        {ol.productName} <span className="text-gray-500 self-center">x{ol.quantity}</span>
                      </span>
                      <span className="font-medium self-center">
                        ₺{(ol.unitPrice! * ol.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-600 text-xs">
                      <Clock size={14} />
                      <span>
                        {new Date(order.createdAt!).toLocaleTimeString('tr-TR')}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Toplam</p>
                      <p className="text-lg font-bold text-blue-600">
                        ₺{order.totalAmount?.toFixed(2)}
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
            <button onClick={setShowOrderPanel} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Yeni Sipariş Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
};