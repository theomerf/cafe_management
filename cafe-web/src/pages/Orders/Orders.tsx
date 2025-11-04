import { useEffect, useReducer, useState } from "react";
import TitleCard from "../../components/ui/TitleCard";
import { OrdersPanel } from "../../components/table/OrdersPanel";
import { Sparkles } from "lucide-react";
import type { TableItem } from "../../types/table";
import OrdersScene from "../../components/table/OrdersScene";
import requests from "../../services/api";
import BackendDataListReducer from "../../types/backendDataList";

export default function Orders() {
    const [tables, dispatch] = useReducer(BackendDataListReducer<TableItem>, {
        data: null,
        isLoading: false,
        error: null,
    })
    const [showPanel, setShowPanel] = useState(false);
    const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);

    const handleTableSelect = (tableId: number) => {
        setShowPanel(true);
    };

    async function fetchSeats(signal: AbortSignal) {
        dispatch({ type: "FETCH_START" });
        try {
            const response = await requests.table.getAllTables(signal);
            console.log(response);
            dispatch({ type: "FETCH_SUCCESS", payload: response as TableItem[] });
        }
        catch (error: any) {
            if (error.name === 'CanceledError' || error.name === "AbortError") {
                return;
            }
            else {
                dispatch({ type: "FETCH_ERROR", payload: error.message || "Masalar çekilirken hata oluştu." });
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        fetchSeats(controller.signal);

        return () => {
            controller.abort();
        }
    }, []);

    return (
        <div className="flex flex-col gap-y-4">
            <TitleCard title="Siparişler" />
            <div className="w-full h-screen flex bg-gray-800">
                <div className="flex-1 relative">
                    <OrdersScene tables={tables} onTableSelect={handleTableSelect} selectedTable={selectedTable} setSelectedTable={setSelectedTable} />

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
                            {tables.data?.length || 0}
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