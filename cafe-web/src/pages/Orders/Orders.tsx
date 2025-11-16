import { useEffect, useMemo, useState } from "react";
import TitleCard from "../../components/ui/TitleCard";
import { OrdersPanel } from "../../components/table/OrdersPanel";
import { Sparkles } from "lucide-react";
import type { TableItem } from "../../types/table";
import OrdersScene from "../../components/table/OrdersScene";
import requests from "../../services/api";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type Order from "../../types/order";
import type Category from "../../types/category";
import type Product from "../../types/product";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "../../hooks/useDebounce";
import type { ProductFilters } from "../../types/requestParameters";
import type { OrderLine, OrderStatusUpdateDto } from "../../types/order";
import OrderAddPanel from "../../components/order/OrderAddPanel";

export default function Orders() {
    const queryClient = useQueryClient();
    const [showOrderPanel, setShowOrderPanel] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState(searchParams.get("searchTerm") || "");
    const debouncedSearch = useDebounce(searchInput || "", 500);
    const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
    const [showAddProductPanel, setShowAddProductPanel] = useState(false);
    const [showPanel, setShowPanel] = useState(false);
    const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);

    const finalQuery: ProductFilters = useMemo(() => {
        const categoryIdStr = searchParams.get("categoryId");

        const categoryId = categoryIdStr ? Number(categoryIdStr) : undefined;

        return {
            categoryId: !isNaN(categoryId!) ? categoryId : undefined,
            searchTerm: debouncedSearch || undefined,
        };
    }, [searchParams, debouncedSearch]);
    const { data: tables, isLoading, error, isError } = useQuery({
        queryKey: ['tables'],
        queryFn: async ({ signal }): Promise<TableItem[]> => {
            return await requests.table.getAllTables(signal);
        },
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
    useEffect(() => {
        if (isError && error) {
            toast.error("Masalar yüklenirken bir hata oluştu.");
            console.error("Error fetching tables:", error);
        }
    }, [error, isError])
    const { data: categoriesList, isLoading: categoriesIsLoading } = useQuery({
        queryKey: ['categoriesList'],
        queryFn: async ({ signal }): Promise<Category[]> => {
            return await requests.category.getCategoriesList(signal);
        },
        enabled: showAddProductPanel,
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 20,
    });
    const { data: productsList, isLoading: productsListLoading } = useQuery({
        queryKey: ['productsList', finalQuery],
        queryFn: async ({ signal, queryKey }): Promise<Product[]> => {
            const [, params] = queryKey;
            return await requests.product.getProductsForOrder(params, signal);
        },
        enabled: finalQuery.categoryId !== undefined || debouncedSearch.length >= 2,
    });
    const { data: orders, isLoading: ordersLoading } = useQuery({
        queryKey: ['orders', selectedTable?.id],
        queryFn: async ({ signal, queryKey }): Promise<Order[]> => {
            const [, tableId] = queryKey;
            return await requests.order.getOrdersOfOneTable(tableId?.toString()!, signal);
        },
        enabled: selectedTable !== null,
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 20,
    })

    const handleOrderCreate = useMutation({
        mutationFn: async (order: Order) => {
            const orderLinesDto: OrderLine[] = order.orderLines.map(ol => {
                return {
                    productId: ol.productId,
                    quantity: ol.quantity,
                };
            });
            const orderCreateDto: Order = {
                tableId: order.tableId,
                orderLines: orderLinesDto,
            };

            await requests.order.createOrder(orderCreateDto);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders', selectedTable?.id] });
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            queryClient.invalidateQueries({ queryKey: ['order-stats'] });
            toast.success("Sipariş başarıyla oluşturuldu.");
            setPendingOrder(null);
            setShowOrderPanel(false);
        },
        onError: (error: any) => {
            toast.error("Sipariş oluşturulurken bir hata oluştu.");
            console.error("Error creating order:", error);
        }
    });

    const handleOrderStatusUpdate = useMutation({
        mutationFn: async (orderStatusDto: OrderStatusUpdateDto) => {
            await requests.order.changeOrderStatus(orderStatusDto);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders', selectedTable?.id] });
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            toast.success("Sipariş durumu başarıyla güncellendi.");
        },
        onError: (error: any) => {
            toast.error("Sipariş durumu güncellenirken bir hata oluştu.");
            console.error("Error updating order status:", error);
        },
    });

    useEffect(() => {
        const params = new URLSearchParams();
        Object.entries(finalQuery).forEach(([key, value]) => {
            if (value) params.set(key, value.toString());
        });
        setSearchParams(params, { replace: true });
    }, [finalQuery]);

    return (
        <div className="flex flex-col gap-y-4">
            <TitleCard title="Siparişler" />
            <div className="w-full h-screen flex justify-center bg-gray-800 rounded-lg overflow-hidden border border-gray-300 shadow-lg">
                {isLoading && !tables ? (
                    <div className="flex flex-col gap-y-2 self-center justify-center items-center pt-4">
                        <ClipLoader size={40} color="#06b6d4" />
                        <p className="text-white">Masalar yükleniyor...</p>
                    </div>
                ) : (
                    <div className="flex-1 relative">
                        <OrdersScene tables={tables ?? []} onTableSelect={() => setShowPanel(true)} selectedTable={selectedTable} setSelectedTable={setSelectedTable} />

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
                                {tables?.filter(t => t.status === 'Occupied').length ?? 0}
                            </p>
                        </div>
                    </div>
                )}
            </div>

                            {showPanel && (
                    ordersLoading && !orders ? (
                        <div className="flex flex-col gap-y-2 self-center justify-center items-center pt-4">
                            <ClipLoader size={40} color="#06b6d4" />
                        </div>
                    ) : (
                        <OrdersPanel
                            table={selectedTable}
                            orders={orders!}
                            handleOrderStatusUpdate={handleOrderStatusUpdate.mutate}
                            setShowOrderPanel={() => setShowOrderPanel(true)}
                            onClose={() => {
                                setShowPanel(false);
                                setSelectedTable(null);
                            }}
                        />
                    )
                )}

               <OrderAddPanel showOrderPanel={showOrderPanel} setShowOrderPanel={setShowOrderPanel} selectedTable={selectedTable} pendingOrder={pendingOrder} setPendingOrder={setPendingOrder} handleOrderCreate={handleOrderCreate} showAddProductPanel={showAddProductPanel} setShowAddProductPanel={setShowAddProductPanel} searchParams={searchParams} setSearchParams={setSearchParams} productsList={productsList} productsListLoading={productsListLoading} searchInput={searchInput} setSearchInput={setSearchInput} categoriesList={categoriesList} categoriesIsLoading={categoriesIsLoading} />
        </div>
    );
};