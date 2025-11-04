import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TitleCard from "../../components/ui/TitleCard";
import {
    faPlus,
    faPlusCircle,
    faXmarkCircle,
    faSave,
    faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useCallback, useReducer } from "react";
import { set, useForm } from "react-hook-form";
import FormInput from "../../components/form/FormInput";
import TablesSceneManagement from "../../components/table/management/TablesSceneManagement";
import type { TableItem, CreateTableDTO, UpdateTableDTO } from "../../types/table";
import { snapPositionToGrid } from "../../utils/gridUtils";
import requests from "../../services/api";
import BackendDataListReducer from "../../types/backendDataList";

export default function TableManagement() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tables, setTables] = useReducer(BackendDataListReducer<TableItem>, {
        data: [],
        isLoading: false,
        error: null,
    });
    const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [pendingUpdates, setPendingUpdates] = useState<Map<number, { x: number; z: number }>>(
        new Map()
    );

    const { register, handleSubmit, formState: { errors }, reset } = useForm<{
        name: string;
        capacity: number;
        locationX: number;
        locationZ: number;
    }>();

    const loadTables = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await requests.table.getAllTables();
            setTables({ type: "FETCH_SUCCESS", payload: response as TableItem[] });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Masalar yüklenirken hata oluştu";
            setError(errorMessage);
            console.error("Load tables error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTables();
    }, [loadTables]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const handleCreateTableSubmit = async (data: { name: string; capacity: number }) => {
        try {
            setIsLoading(true);
            setError(null);

            const [snappedX, snappedZ] = snapPositionToGrid(0, 0);

            const createRequest: CreateTableDTO = {
                name: data.name,
                capacity: data.capacity,
                locationX: snappedX,
                locationZ: snappedZ,
            };

            await requests.table.createTable(createRequest);

            setSuccessMessage("Masa başarıyla oluşturuldu!");

            await loadTables();

            setIsModalOpen(false);
            reset();
            setSelectedTable(null);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Masa oluşturulamadı";
            setError(errorMessage);
            console.error("Create table error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTableLocationChange = (tableId: number, newX: number, newZ: number) => {
        const updates = new Map(pendingUpdates);
        updates.set(tableId, { x: newX, z: newZ });
        setPendingUpdates(updates);
    };

    const handleSaveTableLocation = async (tableId: number) => {
        const update = pendingUpdates.get(tableId);
        if (!update) return;

        try {
            setIsLoading(true);
            setError(null);

            const updateRequest: UpdateTableDTO = {
                id: tableId,
                locationX: update.x,
                locationZ: update.z,
            };

            await requests.table.updateTable(updateRequest);

            setSuccessMessage("Masa konumu güncellendi!");

            const updates = new Map(pendingUpdates);
            updates.delete(tableId);
            setPendingUpdates(updates);

            await loadTables();

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Konum güncellenemedi";
            setError(errorMessage);
            console.error("Save table location error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelTableLocation = (tableId: number) => {
        const updates = new Map(pendingUpdates);
        updates.delete(tableId);
        setPendingUpdates(updates);

        const freshTable = tables.data?.find(t => t.id === tableId);
        if (freshTable) {
            setSelectedTable(freshTable);
        }
    };

    const hasTableUpdates = selectedTable ? pendingUpdates.has(selectedTable.id) : false;

    return (
        <>
            <div className="flex flex-col gap-y-6 h-screen">
                <TitleCard title="Masa Yönetimi">
                    <button
                        onClick={() => {
                            setIsModalOpen(true);
                            reset();
                        }}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-green-400/90 to-green-500/90 hover:from-green-500 hover:to-green-600 shadow-lg flex group px-4 py-3 font-semibold rounded-xl shadow-green-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FontAwesomeIcon
                            icon={faPlusCircle}
                            className="mr-2 self-center group-hover:scale-110 duration-500 transition-all"
                        />
                        Yeni Masa Ekle
                    </button>
                </TitleCard>

                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg animate-pulse">
                        ✓ {successMessage}
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        ✕ {error}
                    </div>
                )}

                <div className="flex-1 w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-300 shadow-lg" style={{ minHeight: '600px' }}>
                    {isLoading && (!tables.data || tables.data.length === 0) ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                <p className="text-gray-600 font-semibold">Masalar yükleniyor...</p>
                            </div>
                        </div>
                    ) : (
                        <TablesSceneManagement
                            tables={tables}
                            onTableSelect={(tableId) => {
                                const table = tables.data?.find((t) => t.id === tableId);
                                if (table) setSelectedTable(table);
                            }}
                            selectedTable={selectedTable}
                            setSelectedTable={setSelectedTable}
                            onTableLocationChange={handleTableLocationChange}
                        />
                    )}
                </div>

                {selectedTable && (
                    <div className="bg-white border-2 border-blue-300 rounded-lg p-6 shadow-lg">
                        <div className="flex justify-between items-start gap-6">
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-800 mb-3">{selectedTable.name}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Kapasite</p>
                                        <p className="text-lg font-semibold text-gray-800">{selectedTable.capacity} kişi</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Durumu</p>
                                        <p className="text-lg font-semibold">
                                            <span className={`px-3 py-1 rounded-full text-white text-sm ${selectedTable.status === 'Available' ? 'bg-green-500' :
                                                    selectedTable.status === 'Occupied' ? 'bg-red-500' :
                                                        'bg-amber-500'
                                                }`}>
                                                {selectedTable.status === 'Available' ? 'Boş' :
                                                    selectedTable.status === 'Occupied' ? 'Dolu' :
                                                        'Bakımda'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                                    <p className="text-sm text-gray-600">Mevcut Konum</p>
                                    <p className="text-lg font-mono text-gray-800">
                                        X: {selectedTable.locationX.toFixed(1)} | Z: {selectedTable.locationZ.toFixed(1)}
                                    </p>
                                </div>
                                {hasTableUpdates && (
                                    <div className="mt-3 p-3 bg-amber-50 border-l-4 border-amber-500 rounded">
                                        <p className="text-sm text-amber-600 font-semibold">📍 Yeni Konum (Henüz Kaydedilmedi)</p>
                                        <p className="text-lg font-mono text-amber-800">
                                            X: {pendingUpdates.get(selectedTable.id)?.x.toFixed(1)} | Z: {pendingUpdates.get(selectedTable.id)?.z.toFixed(1)}
                                        </p>
                                        <p className="text-xs text-amber-600 mt-2">
                                            💡 Değişiklikleri kaydetmek için "Kaydet" butonuna basın
                                        </p>
                                    </div>
                                )}
                            </div>

                            {hasTableUpdates && (
                                <div className="flex flex-col gap-3 ml-6 flex-shrink-0">
                                    <button
                                        onClick={() => handleSaveTableLocation(selectedTable.id)}
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-green-500/90 to-green-600/90 hover:from-green-500 hover:to-green-600 shadow-lg flex items-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-green-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] disabled:opacity-50 disabled:cursor-not-allowed text-white whitespace-nowrap"
                                    >
                                        <FontAwesomeIcon icon={faSave} />
                                        Kaydet
                                    </button>
                                    <button
                                        onClick={() => handleCancelTableLocation(selectedTable.id)}
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-red-500/90 to-red-600/90 hover:from-red-600 hover:to-red-700 shadow-lg flex items-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-red-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] text-white whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                        İptal Et
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-2xl max-w-md w-full mx-4">
                        <div className="flex flex-col">
                            <div className="flex flex-row bg-gradient-to-r from-blue-400 to-blue-600 w-full px-8 py-6 text-white">
                                <FontAwesomeIcon icon={faPlus} className="mr-3 self-center text-xl" />
                                <h2 className="text-2xl font-bold">Yeni Masa Oluştur</h2>
                            </div>

                            <form
                                className="flex flex-col gap-y-4 px-8 py-6"
                                onSubmit={handleSubmit(handleCreateTableSubmit)}
                            >
                                <FormInput
                                    name="name"
                                    label="Masa Adı"
                                    register={{
                                        ...register("name", {
                                            required: "Masa adı gereklidir.",
                                            minLength: { value: 2, message: "Masa adı en az 2 karakter olmalıdır." },
                                            maxLength: { value: 50, message: "Masa adı en fazla 50 karakter olabilir." },
                                        }),
                                    }}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm font-semibold">⚠ {errors.name.message}</p>
                                )}

                                <FormInput
                                    name="capacity"
                                    type="number"
                                    label="Kapasite (1-20)"
                                    register={{
                                        ...register("capacity", {
                                            required: "Masa kapasitesi gereklidir.",
                                            min: { value: 1, message: "Masa kapasitesi en az 1 olmalıdır." },
                                            max: { value: 20, message: "Masa kapasitesi en fazla 20 olabilir." },
                                        }),
                                    }}
                                />
                                {errors.capacity && (
                                    <p className="text-red-500 text-sm font-semibold">⚠ {errors.capacity.message}</p>
                                )}

                                <div className="flex flex-row gap-x-3 mt-6 justify-center">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-green-500/90 to-green-600/90 hover:from-green-500 hover:to-green-600 shadow-lg flex items-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-green-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                    >
                                        <FontAwesomeIcon icon={faPlusCircle} />
                                        Oluştur
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            reset();
                                        }}
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-gray-500/90 to-gray-600/90 hover:from-gray-600 hover:to-gray-700 shadow-lg flex items-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-gray-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FontAwesomeIcon icon={faXmarkCircle} />
                                        İptal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}