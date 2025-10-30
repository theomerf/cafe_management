import { useState } from "react";
import { OrdersScene } from "../components/table/OrdersScene";
import TitleCard from "../components/ui/TitleCard";
import { useTableStore } from "../store/tableStore";
import { OrdersPanel } from "../components/table/OrdersPanel";
import { Sparkles } from "lucide-react";

export const Orders: React.FC = () => {
    const { selectedTable, setSelectedTable } = useTableStore();
    const [showPanel, setShowPanel] = useState(false);

    const handleTableSelect = (tableId: number) => {
        setShowPanel(true);
    };

    return (
        <div className="flex flex-col gap-y-4">
            <TitleCard title="Siparişler" />
            <div className="w-full h-screen flex bg-gray-800">
                <div className="flex-1 relative">
                    <OrdersScene onTableSelect={handleTableSelect} />

                    <div className="absolute top-6 left-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="text-blue-400" size={24} />
                            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                Kafe Siparişleri
                            </h1>
                        </div>
                        <p className="text-gray-400 text-sm ml-9">
                            ✨ Masalardan seçim yapın
                        </p>
                    </div>

                    <div className="absolute bottom-6 left-6 bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl p-4 space-y-3">
                        <p className="text-gray-300 text-xs font-semibold uppercase tracking-wide">
                            Masa Durumları
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
                                <span className="text-sm text-gray-300">Boş</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
                                <span className="text-sm text-gray-300">Dolu</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50"></div>
                                <span className="text-sm text-gray-300">Rezerve</span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-6 right-6 bg-gradient-to-r from-gray-900 to-gray-800 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl p-4">
                        <p className="text-xs text-gray-400 mb-2">AKTIF MASALAR</p>
                        <p className="text-2xl font-bold text-blue-400">
                            {useTableStore.getState().tables.filter(t => t.status === 'occupied').length}
                        </p>
                    </div>
                </div>

                {showPanel && (
                    <OrdersPanel
                        table={selectedTable}
                        onClose={() => {
                            setShowPanel(false);
                            setSelectedTable(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default Orders;