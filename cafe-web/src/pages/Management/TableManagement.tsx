import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TitleCard from "../../components/ui/TitleCard";
import { faPlus, faPlusCircle, faXmarkCircle, faSave, faTimes, faLightbulb, faEdit, faTrash, faCheckCircle, } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import FormInput from "../../components/form/FormInput";
import TablesSceneManagement from "../../components/table/management/TablesSceneManagement";
import type { TableItem, CreateTableDTO, UpdateTableDTO } from "../../types/table";
import { snapPositionToGrid } from "../../utils/gridUtils";
import requests from "../../services/api";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import FormModal from "../../components/ui/FormModal";

export default function TableManagement() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalUpdate, setIsModalUpdate] = useState(false);
    const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
    const [pendingUpdates, setPendingUpdates] = useState<Map<number, { x: number; z: number }>>(
        new Map()
    );
    const { register, handleSubmit, formState: { errors }, reset } = useForm<{
        name: string;
        capacity: number;
        locationX: number;
        locationZ: number;
    }>();

    const { data: tables, isLoading, error, isError } = useQuery({
        queryKey: ['tables'],
        queryFn: ({ signal }) => loadTables(signal),
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });

    useEffect(() => {
        if (isError && error) {
            toast.error("Masalar yüklenirken hata oluştu!");
            console.error(error);
        }
    }, [isError, error]);

    async function loadTables(signal: AbortSignal): Promise<TableItem[]> {
        const response = await requests.table.getAllTables(signal);
        return response;
    };

    const deleteTable = useMutation({
        mutationFn: (tableId: number) => handleTableDelete(tableId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            toast.success("Masa başarıyla silindi!");
        },
        onError: (error: any) => {
            toast.error("Masa silinirken bir hata oluştu");
            console.error("Masa silinirken hata:", error);
        }
    });

    const handleTableDelete = async (tableId: number) => {
        await requests.table.deleteTable(tableId.toString());
        setSelectedTable(null);
    };

    const updateTable = useMutation({
        mutationFn: (data: { name: string; capacity: number }) => handleTableUpdate(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            toast.success("Masa başarıyla güncellendi!");
            reset();
            setIsModalOpen(false);
            setIsModalUpdate(false);
        },
        onError: (error: any) => {
            toast.error("Masa güncellenirken bir hata oluştu");
            console.error("Masa güncellenirken hata:", error);
        }
    });

    const handleTableUpdate = async (data: { name: string; capacity: number }) => {
        const updateRequest: UpdateTableDTO = {
            id: selectedTable ? selectedTable.id : 0,
            name: data.name,
            capacity: data.capacity,
            locationX: selectedTable ? selectedTable.locationX : 0,
            locationZ: selectedTable ? selectedTable.locationZ : 0,
        };

        await requests.table.updateTable(updateRequest);
    };

    const createTable = useMutation({
        mutationFn: (data: { name: string; capacity: number }) => handleTableCreate(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            toast.success("Masa başarıyla oluşturuldu!");
            reset();
            setIsModalOpen(false);
            setSelectedTable(null);
        },
        onError: (error: any) => {
            toast.error("Masa oluşturulurken bir hata oluştu");
            console.error("Masa oluşturulurken hata:", error);
        }
    });

    const handleTableCreate = async (data: { name: string; capacity: number }) => {
        const [snappedX, snappedZ] = snapPositionToGrid(0, 0);
        const createRequest: CreateTableDTO = {
            name: data.name,
            capacity: data.capacity,
            locationX: snappedX,
            locationZ: snappedZ,
        };

        await requests.table.createTable(createRequest);
    };

    const updateTableLocation = useMutation({
        mutationFn: (tableId: number) => handleTableLocationUpdate(tableId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            toast.success("Masa konumu başarıyla güncellendi!");
            const updates = new Map(pendingUpdates);
            updates.delete(selectedTable?.id || 0);
            setPendingUpdates(updates);
        },
        onError: (error: any) => {
            toast.error("Masa konumu güncellenirken bir hata oluştu");
            console.error("Masa konumu güncellenirken hata:", error);
        }
    })

    const handleTableLocationUpdate = async (tableId: number) => {
        const update = pendingUpdates.get(tableId);
        if (!update) return;

        const updateRequest: UpdateTableDTO = {
            id: tableId,
            name: selectedTable ? selectedTable.name : "",
            capacity: selectedTable ? selectedTable.capacity : 0,
            locationX: update.x,
            locationZ: update.z,
        };

        await requests.table.updateTable(updateRequest);
    };

    useEffect(() => {
        if (selectedTable) {
            const freshTable = tables?.find(t => t.id === selectedTable.id);
            if (freshTable) {
                setSelectedTable(freshTable);
            }
        }
    }, [tables]);

    useEffect(() => {
        if (isModalOpen && isModalUpdate && selectedTable) {
            reset({
                name: selectedTable.name,
                capacity: selectedTable.capacity,
            });
        }
        else if (!isModalUpdate) {
            reset({
                name: "",
                capacity: undefined,
            });
        }
    }, [isModalOpen, isModalUpdate, selectedTable, reset]);

    const handleTableLocationChange = (tableId: number, newX: number, newZ: number) => {
        const updates = new Map(pendingUpdates);
        updates.set(tableId, { x: newX, z: newZ });
        setPendingUpdates(updates);
    };

    const handleCancelTableLocation = (tableId: number) => {
        const updates = new Map(pendingUpdates);
        updates.delete(tableId);
        setPendingUpdates(updates);

        const freshTable = tables?.find(t => t.id === tableId);
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

                <div className="flex-1 w-full bg-gray-800 rounded-lg overflow-hidden border justify-center flex border-gray-300 shadow-lg" style={{ minHeight: '600px' }}>
                    {isLoading && !tables ? (
                        <div className="flex flex-col gap-y-2 self-center justify-center items-center pt-4">
                            <ClipLoader size={40} color="#06b6d4" />
                            <p className="text-white">Masalar yükleniyor...</p>
                        </div>
                    ) : (
                        <TablesSceneManagement
                            tables={tables ?? []}
                            onTableSelect={(tableId) => {
                                const table = tables?.find((t) => t.id === tableId);
                                if (table) setSelectedTable(table);
                            }}
                            selectedTable={selectedTable}
                            setSelectedTable={setSelectedTable}
                            onTableLocationChange={handleTableLocationChange}
                            pendingUpdates={pendingUpdates}
                        />
                    )}
                </div>

                {selectedTable && (
                    <div className="bg-white border-2 border-blue-300 rounded-lg p-6 shadow-lg">
                        <div className="flex justify-between items-start gap-6">
                            <div className="flex-1">
                                <div className="flex flex-row">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-3">{selectedTable.name}</h3>
                                    <button
                                        onClick={() => { setIsModalUpdate(true); setIsModalOpen(true); }}
                                        className="ml-4 bg-gradient-to-r from-yellow-400/90 via-yellow-500 to-yellow-600/90 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-lg flex items-center gap-2 px-6 py-2 font-semibold rounded-lg shadow-yellow-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                        Düzenle
                                    </button>
                                    <button
                                        onClick={() => deleteTable.mutate(selectedTable.id)}
                                        className="ml-2 bg-gradient-to-r from-red-500/90 via-red-600 to-red-700/90 hover:from-red-600 hover:via-red-700 hover:to-red-800 shadow-lg flex items-center gap-2 px-6 py-2 font-semibold rounded-lg shadow-red-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                        Sil
                                    </button>
                                </div>
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
                                            <FontAwesomeIcon icon={faLightbulb} className="mr-1" />
                                            Değişiklikleri kaydetmek için "Kaydet" butonuna basın
                                        </p>
                                    </div>
                                )}
                            </div>

                            {hasTableUpdates && (
                                <div className="flex flex-col gap-3 ml-6 flex-shrink-0">
                                    <button
                                        onClick={() => updateTableLocation.mutate(selectedTable.id)}
                                        className="bg-gradient-to-r from-green-500/90 to-green-600/90 hover:from-green-500 hover:to-green-600 shadow-lg flex items-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-green-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] disabled:opacity-50 disabled:cursor-not-allowed text-white whitespace-nowrap"
                                    >
                                        <FontAwesomeIcon icon={faSave} />
                                        Kaydet
                                    </button>
                                    <button
                                        onClick={() => handleCancelTableLocation(selectedTable.id)}
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
                <FormModal isModalUpdate={isModalUpdate} label="Masa" createFunc={handleSubmit((data) => createTable.mutate(data))} updateFunc={handleSubmit((data) => updateTable.mutate(data))} setIsModalOpen={setIsModalOpen} setIsModalUpdate={setIsModalUpdate} reset={reset}>
                    <FormInput
                        name="name"
                        label="Masa Adı"
                        error={errors.name}
                        register={{
                            ...register("name", {
                                required: "Masa adı gereklidir.",
                                minLength: { value: 2, message: "Masa adı en az 2 karakter olmalıdır." },
                                maxLength: { value: 50, message: "Masa adı en fazla 50 karakter olabilir." },
                            }),
                        }}
                    />

                    <FormInput
                        name="capacity"
                        type="number"
                        label="Kapasite (1-20)"
                        error={errors.capacity}
                        register={{
                            ...register("capacity", {
                                required: "Masa kapasitesi gereklidir.",
                                min: { value: 1, message: "Masa kapasitesi en az 1 olmalıdır." },
                                max: { value: 20, message: "Masa kapasitesi en fazla 20 olabilir." },
                            }),
                        }}
                    />
                </FormModal>
            )}
        </>
    );
}