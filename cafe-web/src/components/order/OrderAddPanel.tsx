import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type Order from "../../types/order";
import type { TableItem } from "../../types/table";
import { faArrowLeft, faCheckCircle, faMinusCircle, faPlusCircle, faTrashAlt, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import type Product from "../../types/product";
import type { SetURLSearchParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import useRandomColor from "../../hooks/useRandomColor";
import type Category from "../../types/category";

type OrderAddPanelProps = {
    showOrderPanel: boolean;
    setShowOrderPanel: Dispatch<SetStateAction<boolean>>;
    selectedTable: TableItem | null;
    pendingOrder: Order | null;
    setPendingOrder: Dispatch<SetStateAction<Order | null>>;
    handleOrderCreate: UseMutationResult<void, any, Order, unknown>;
    showAddProductPanel: boolean;
    setShowAddProductPanel: Dispatch<SetStateAction<boolean>>;
    searchParams: URLSearchParams;
    setSearchParams: SetURLSearchParams;
    productsList: Product[] | undefined;
    productsListLoading: boolean;
    searchInput: string;
    setSearchInput: Dispatch<SetStateAction<string>>;
    categoriesList: Category[] | undefined;
    categoriesIsLoading: boolean;
}

export default function OrderAddPanel({ showOrderPanel, setShowOrderPanel, selectedTable, pendingOrder, setPendingOrder, handleOrderCreate, showAddProductPanel, setShowAddProductPanel, searchParams, setSearchParams, productsList, productsListLoading, searchInput, setSearchInput, categoriesList, categoriesIsLoading }: OrderAddPanelProps) {
    const [selectedProducts, setSelectedProducts] = useState<Product[] | null>(null);
    const randomColor = (id: number) => useRandomColor(id);

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
        <>
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
                                                <div key={orderLine.id} className="relative grid grid-cols-6 items-center gap-x-3 bg-blue-200/50 backdrop-blur-md border border-gray-200 rounded-lg shadow-md w-full p-2 transition-all duration-300 group hover:bg-gray-200">
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
                                                        <button type="button" onClick={() => setPendingOrder(prev => {
                                                            if (!prev) return prev;
                                                            const updatedLines = prev.orderLines.filter(ol => ol.productId !== orderLine.productId);
                                                            return {
                                                                ...prev,
                                                                orderLines: updatedLines,
                                                                totalAmount: updatedLines.reduce((sum, ol) => sum + ol.unitPrice! * ol.quantity, 0),
                                                            };
                                                        })} title="Ürünü kaldır" className="absolute top-[-3%] right-0 rounded-full w-6 h-6 flex items-center justify-center bg-red-500 transition-all duration-500 hover:bg-red-600 hover:scale-[102%]">
                                                            <FontAwesomeIcon icon={faTrashAlt} className="text-sm text-white hover:scale-105 transition-all duration-300" />
                                                        </button>
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
        </>
    );
}