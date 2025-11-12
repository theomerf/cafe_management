import { useCallback, useEffect, useMemo, useState } from "react";
import TitleCard from "../../components/ui/TitleCard";
import { OrdersPanel } from "../../components/table/OrdersPanel";
import { Sparkles } from "lucide-react";
import type { TableItem } from "../../types/table";
import OrdersScene from "../../components/table/OrdersScene";
import requests from "../../services/api";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheckCircle, faMinusCircle, faPlusCircle, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import type Order from "../../types/order";
import type Category from "../../types/category";
import type Product from "../../types/product";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "../../hooks/useDebounce";
import type { ProductFilters } from "../../types/requestParameters";
import useRandomColor from "../../hooks/useRandomColor";
import type { OrderLine, OrderStatusUpdateDto } from "../../types/order";

export default function Orders() {
    const queryClient = useQueryClient();
    const [showOrderPanel, setShowOrderPanel] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState(searchParams.get("searchTerm") || "");
    const debouncedSearch = useDebounce(searchInput || "", 500);
    const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<Product[] | null>(null);
    const [showAddProductPanel, setShowAddProductPanel] = useState(false);
    const [showPanel, setShowPanel] = useState(false);
    const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
    const randomColor = (id: number) => useRandomColor(id);

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
            return await await requests.table.getAllTables(signal);
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

    const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    }, []);

    const handleOrderLineAdd = () => {
        setPendingOrder(prev => {
            if (!prev) {
                const newLines = selectedProducts?.map(product => ({
                    id: 0,
                    orderId: 0,
                    productId: product.id,
                    productName: product.name,
                    productImageUrl: product.imageUrl,
                    unitPrice: product.price,
                    quantity: 1,
                })) || [];

                return {
                    id: 0,
                    tableId: selectedTable ? selectedTable.id : 0,
                    orderLines: newLines,
                    totalAmount: newLines.reduce((sum, ol) => sum + ol.unitPrice * ol.quantity, 0),
                };
            }

            let updatedLines = [...prev.orderLines];

            selectedProducts?.forEach(product => {
                const existingLine = updatedLines.find(ol => ol.productId === product.id);

                if (existingLine) {
                    updatedLines = updatedLines.map(ol =>
                        ol.productId === product.id
                            ? { ...ol, quantity: ol.quantity + 1 }
                            : ol
                    );
                } else {
                    updatedLines.push({
                        id: 0,
                        orderId: 0,
                        productId: product.id,
                        productName: product.name,
                        productImageUrl: product.imageUrl,
                        unitPrice: product.price,
                        quantity: 1,
                    });
                }
            });

            return {
                ...prev,
                orderLines: updatedLines,
                totalAmount: updatedLines.reduce((sum, ol) => sum + ol.unitPrice! * ol.quantity, 0),
            };
        });
        setShowAddProductPanel(false);
        setSearchInput("");
        setSearchParams({});
        setSelectedProducts(null);
    };

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

                {showOrderPanel && (
                    <div className="fixed inset-0 z-[98] bg-black/50 flex items-center justify-center backdrop-blur-md">
                        <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-2xl">
                            <div className="flex flex-col">
                                <div className="px-20 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white">
                                    <p className="font-bold text-2xl text-center">
                                        {selectedTable?.name} - Yeni Sipariş Oluştur
                                    </p>
                                </div>
                                <div className="flex flex-col px-2 py-4">
                                    <div className="flex justify-center flex-col gap-y-4 items-center mb-10">
                                        <div className=" gap-y-1 flex flex-col max-h-48 p-1 w-full overflow-y-auto">
                                            {pendingOrder && pendingOrder.orderLines.length > 0 ? (
                                                pendingOrder.orderLines.map((orderLine) => (
                                                    <div key={orderLine.id} className="grid grid-cols-6 items-center gap-x-3 bg-blue-200/50 backdrop-blur-md border border-gray-200 rounded-lg shadow-md w-full p-2 transition-all duration-300 group hover:bg-gray-200">
                                                        <div className="col-span-1">
                                                            <img src={orderLine.productImageUrl} alt={`img-${orderLine.productId}`} className="w-[72px] h-[72px] border-2 bg-white/50 backdrop-blur-lg rounded-lg border-gray-200 object-cover group-hover:scale-105 transition-all duration-500" />
                                                        </div>
                                                        <div className="col-span-2 text-center">
                                                            <p className="font-semibold text-lg">{orderLine.productName}</p>
                                                        </div>
                                                        <div className="col-span-1">
                                                            <p className="text-md text-center font-medium">Fiyat: <br />{(orderLine.unitPrice! * orderLine.quantity).toFixed(2)} ₺</p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <div className="flex flex-row gap-x-2 justify-end">
                                                                {orderLine.quantity > 1 && (
                                                                    <button onClick={() => setPendingOrder(prev => {
                                                                        if (!prev) return prev;
                                                                        const updatedLines = prev.orderLines.map(ol =>
                                                                            ol.productId === orderLine.productId
                                                                                ? { ...ol, quantity: ol.quantity - 1 }
                                                                                : ol
                                                                        ).filter(ol => ol.quantity > 0);
                                                                        return {
                                                                            ...prev,
                                                                            orderLines: updatedLines,
                                                                            totalAmount: updatedLines.reduce((sum, ol) => sum + ol.unitPrice! * ol.quantity, 0),
                                                                        };
                                                                    })}>
                                                                        <FontAwesomeIcon icon={faMinusCircle} className="text-2xl text-red-500 hover:text-red-600 hover:scale-105 transition-all duration-300" />
                                                                    </button>
                                                                )}
                                                                <p className="text-md font-medium">Adet: {orderLine.quantity}</p>
                                                                <button type="button" onClick={() => setPendingOrder(prev => {
                                                                    if (!prev) return prev;
                                                                    const updatedLines = prev.orderLines.map(ol =>
                                                                        ol.productId === orderLine.productId
                                                                            ? { ...ol, quantity: ol.quantity + 1 }
                                                                            : ol
                                                                    ).filter(ol => ol.quantity > 0);
                                                                    return {
                                                                        ...prev,
                                                                        orderLines: updatedLines,
                                                                        totalAmount: updatedLines.reduce((sum, ol) => sum + ol.unitPrice! * ol.quantity, 0),
                                                                    };
                                                                })}>
                                                                    <FontAwesomeIcon icon={faPlusCircle} className="text-2xl text-green-500 hover:text-green-600 hover:scale-105 transition-all duration-300" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-lg text-center font-medium">Şu an sipariş boş. Lütfen ürün ekleyin</p>
                                            )}
                                        </div>
                                        <div>
                                            <button
                                                onClick={() => setShowAddProductPanel(true)}
                                                type="submit"
                                                className="bg-gradient-to-r from-blue-500/90 to-blue-600/90 hover:from-blue-500 hover:to-blue-600 shadow-lg flex items-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-blue-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                            >
                                                <FontAwesomeIcon icon={faPlusCircle} />
                                                Ürün Ekle
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-row justify-center gap-x-2">
                                        <button
                                            type="submit"
                                            disabled={!pendingOrder}
                                            onClick={() => handleOrderCreate.mutate(pendingOrder!)}
                                            className="bg-gradient-to-r from-green-500/90 to-green-600/90 hover:from-green-500 hover:to-green-600 shadow-lg flex items-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-green-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                        >
                                            <FontAwesomeIcon icon={faCheckCircle} />
                                            Onayla
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowOrderPanel(false);
                                            }}
                                            className="bg-gradient-to-r from-red-500/90 to-red-600/90 hover:from-red-600 hover:to-red-700 shadow-lg flex items-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-red-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FontAwesomeIcon icon={faXmarkCircle} />
                                            İptal
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showAddProductPanel && (
                    <div className="fixed inset-0 z-[99] bg-black/50 flex items-center justify-center backdrop-blur-md">
                        <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-2xl">
                            <div className="flex flex-col">
                                <div className="relative px-20 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white">
                                    <p className="font-bold text-2xl text-center">
                                        Ürün Ekle
                                    </p>
                                    {searchParams.get("categoryId") && productsList && (
                                        <button onClick={() => setSearchParams({})} className=" absolute top-2 right-5 text-white rounded-lg bg-cyan-500 transition-all duration-500 hover:bg-cyan-600 hover:scale-105 px-3 py-2">
                                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                                            Geri
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-col min-w-[400px] gap-y-8 px-4 py-4">
                                    {!productsList && (
                                        <p className="text-xl font-semibold text-center">
                                            Ürün arayın veya kategori seçin
                                        </p>
                                    )}
                                    <div className="flex flex-col justify-center items-center text-center">
                                        <div className="flex flex-col gap-y-1 w-1/2 relative">
                                            <label htmlFor="searchTerm" className="font-bold text-gray-500">
                                                Ürün Adı
                                            </label>
                                            <div className="flex flex-col content-center justify-center relative">
                                                <input type="text"
                                                    value={searchInput}
                                                    onChange={handleSearchInputChange}
                                                    name="searchTerm"
                                                    id="searchTerm"
                                                    placeholder="Ürün adı girin"
                                                    className="border-gray-200 border-2 rounded-2xl px-4 py-3 bg-white/90 transition-all duration-300 focus:border-cyan-200 focus:outline-none focus:shadow-gray-200 focus:shadow-md focus:scale-[102%] focus:bg-white placeholder:text-gray-400" />
                                                {searchInput && <button onClick={() => { setSearchInput("") }} className="bg-red-600 right-2 rounded-full w-6 h-6 absolute text-white hover:scale-105 duration-300">X</button>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-40 overflow-y-auto p-2">
                                        <div className="grid grid-cols-5 gap-x-2 gap-y-4">
                                            {productsList && (searchInput || searchParams.get("categoryId")) ? (
                                                <>
                                                    {productsListLoading && (
                                                        <div className="flex flex-col gap-y-2 self-center justify-center items-center pt-4">
                                                            <ClipLoader size={40} color="#06b6d4" />
                                                        </div>
                                                    )}

                                                    {!productsListLoading && productsList && productsList.length === 0 && (
                                                        <p className="text-gray-500 col-span-5 text-center">Aramanıza uygun ürün bulunamadı.</p>
                                                    )}
                                                    {!productsListLoading && productsList && productsList.map((product) => (
                                                        <div key={product.id} onClick={() =>
                                                            setSelectedProducts(prev => {
                                                                if (!prev) return [product];
                                                                return prev.some(p => p.id === product.id)
                                                                    ? prev.filter(p => p.id !== product.id)
                                                                    : [...prev, product];
                                                            })
                                                        } title={product.name} 
                                                        className={`w-28 h-28 text-center items-center flex flex-col gap-y-1 justify-center rounded-lg ${randomColor(product.id)[0]} text-white transition-all group duration-500 hover:scale-105 hover:${randomColor(product.id)[1]} cursor-pointer shadow-lg shadow-black/30 ${selectedProducts?.some(p => p.id === product.id) && "border-2 border-black scale-105"}`}>
                                                            <img src={product.imageUrl} alt={`img-${product.id}`} className="w-[72px] h-[72px] border-2 bg-white/50 backdrop-blur-lg rounded-lg border-gray-200 object-cover group-hover:scale-105 transition-all duration-500" />
                                                            <p className="truncate w-24">{product.name}</p>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                <>
                                                    {categoriesIsLoading && (
                                                        <div className="flex flex-col gap-y-2 self-center justify-center items-center pt-4">
                                                            <ClipLoader size={40} color="#06b6d4" />
                                                        </div>
                                                    )}
                                                    {!categoriesIsLoading && categoriesList && categoriesList.map((category) => (
                                                        <div key={category.id} onClick={() => { setSearchParams(prev => { prev.set("categoryId", category.id.toString()); return prev; }); }} className={`w-24 h-24 text-center items-center flex justify-center rounded-lg ${randomColor(category.id)[0]} text-white transition-all duration-500 hover:scale-105 hover:text-lg hover:${randomColor(category.id)[1]} cursor-pointer shadow-lg shadow-black/30`}>
                                                            {category.name}
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-row justify-center gap-x-2">
                                        <button
                                            type="button"
                                            onClick={() => handleOrderLineAdd()}
                                            disabled={!selectedProducts || selectedProducts.length === 0}
                                            className="bg-gradient-to-r from-green-500/90 to-green-600/90 hover:from-green-500 hover:to-green-600 shadow-lg flex items-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-green-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                        >
                                            <FontAwesomeIcon icon={faCheckCircle} />
                                            Onayla
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddProductPanel(false);
                                                setSearchInput("");
                                                setSearchParams({});
                                                setSelectedProducts(null);
                                            }}
                                            className="bg-gradient-to-r from-red-500/90 to-red-600/90 hover:from-red-600 hover:to-red-700 shadow-lg flex items-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-red-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FontAwesomeIcon icon={faXmarkCircle} />
                                            İptal
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
            </div>
        </div>
    );
};