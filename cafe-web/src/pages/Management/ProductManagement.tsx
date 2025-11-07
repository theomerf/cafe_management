import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import type Product from "../../types/product";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { useForm } from "react-hook-form";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import type RequestParameters from "../../types/requestParameters";
import requests from "../../services/api";
import type PaginationHeader from "../../types/paginationHeader";
import TitleCard from "../../components/ui/TitleCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlusCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import DataTable from "../../components/ui/DataTable";
import { toast } from "react-toastify";
import PaginationComponent from "../../components/ui/PaginationComponent";
import FormModal from "../../components/ui/FormModal";
import FormInput from "../../components/form/FormInput";

export default function ProductManagement() {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const debouncedSearch = useDebounce(searchParams.get("searchTerm") || "", 500);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<{
        id: number | undefined;
        name: string;
        description: string | undefined;
        price: number;
        imageUrl: string;
        categoryId: number;
    }>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalUpdate, setIsModalUpdate] = useState(false);
    const { up } = useBreakpoint();

    const finalQuery: RequestParameters = useMemo(() => {
        const pageNumberStr = searchParams.get("pageNumber");
        const pageSizeStr = searchParams.get("pageSize");

        const pageNumber = pageNumberStr ? Number(pageNumberStr) : undefined;
        const pageSize = pageSizeStr ? Number(pageSizeStr) : undefined;

        return {
            pageNumber: !isNaN(pageNumber!) ? pageNumber : undefined,
            pageSize: !isNaN(pageSize!) ? pageSize : undefined,
            searchTerm: debouncedSearch || undefined,
        };
    }, [searchParams, debouncedSearch]);
    const { data, isLoading, error, isError } = useQuery({
        queryKey: ['products', finalQuery],
        queryFn: async ({ signal, queryKey }) => {
            const [, params] = queryKey;
            return await requests.product.getAllProducts(params, signal);
        },
        select: (response) => {
            const pagination: PaginationHeader = JSON.parse(response.headers["x-pagination"]);
            return { products: response.data as Product[], pagination };
        },
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });

    useEffect(() => {
        const params = new URLSearchParams();
        Object.entries(finalQuery).forEach(([key, value]) => {
            if (value) params.set(key, value.toString());
        });
        setSearchParams(params, { replace: true });
    }, [finalQuery]);

    const createProduct = useMutation({
        mutationFn: async (data: any) => await requests.product.createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success("Kategori başarıyla oluşturuldu.");
            setIsModalOpen(false);
            reset();
        },
        onError: (error: any) => {
            toast.error("Kategori oluşturulurken bir hata oluştu.");
            console.error("Kategori oluşturma hatası:", error);
        }
    });

    useEffect(() => {
        if (isModalOpen && isModalUpdate && selectedProduct) {
            reset({
                id: selectedProduct?.id,
                name: selectedProduct?.name,
                description: selectedProduct?.description ?? undefined,
                price: selectedProduct?.price,
                imageUrl: selectedProduct?.imageUrl,
                categoryId: selectedProduct?.categoryId,
            });
        }
        else if (!isModalUpdate) {
            reset({
                id: undefined,
                name: "",
            });
        }
    }, [isModalOpen, isModalUpdate, selectedProduct, reset]);

    const updateProduct = useMutation({
        mutationFn: (data: any) => requests.product.updateProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success("Ürün başarıyla güncellendi.");
            setIsModalUpdate(false);
            setIsModalOpen(false);
            reset();
        },
        onError: (error: any) => {
            toast.error("Ürün güncellenirken bir hata oluştu.");
            console.error("Ürün güncelleme hatası:", error);
        }
    });

    const deleteProduct = useMutation({
        mutationFn: (id: number) => requests.product.deleteProduct(id.toString()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success("Ürün başarıyla silindi.");
        },
        onError: (error: any) => {
            toast.error("Ürün silinirken bir hata oluştu.");
            console.error("Ürün silme hatası:", error);
        }
    });
    return (
        <>
            <div className="flex flex-col gap-y-6">
                <TitleCard title="Ürün Yönetimi">
                    <button onClick={() => { setIsModalOpen(true) }} disabled={isLoading} className="bg-gradient-to-r from-green-400/90 to-green-500/90 hover:from-green-500 hover:to-green-600 shadow-lg flex group px-4 py-3 font-semibold rounded-xl shadow-green-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] disabled:opacity-50 disabled:cursor-not-allowed">
                        <FontAwesomeIcon icon={faPlusCircle} className="mr-2 self-center group-hover:scale-110 duration-500 transition-all" />
                        Yeni Ürün Ekle
                    </button>
                </TitleCard>
                <DataTable colNames={new Map<string, string>([["Görsel", "w-1/6"], ["Ürün Adı", "w-2/6"], ["Kategori Adı", "w-1/6"], ["Fiyat", "w-1/6"], ["İşlemler", "w-1/6"]])}
                    rows={["imageUrl", "name", "categoryName", "price"]}
                    isLoading={isLoading} isError={isError} data={data?.products} error={error} renderActions={(product: Product) => (
                        <>
                            <button onClick={() => { setSelectedProduct(product); setIsModalUpdate(true); setIsModalOpen(true); }} className="w-10 h-10 rounded-lg text-white backdrop-blur-lg group shadow-md shadow-yellow-300 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 transition-all duration-500 hover:from-yellow-400/80 hover:via-yellow-600/80 hover:to-yellow-700/80 hover:shadow-lg hover:shadow-yellow-400 hover:scale-105">
                                <FontAwesomeIcon icon={faEdit} className="text-lg group-hover:scale-110 transition-all duration-500 group-hover:rotate-6" />
                            </button>

                            <button onClick={() => deleteProduct.mutate(product.id)} className="w-10 h-10 rounded-lg text-white backdrop-blur-lg group shadow-md shadow-red-300 bg-gradient-to-br from-red-500 via-red-600 to-red-700 transition-all duration-500 hover:from-red-600 hover:via-red-700 hover:to-red-800 hover:shadow-lg hover:shadow-red-400 hover:scale-105">
                                <FontAwesomeIcon icon={faTrash} className="text-lg group-hover:scale-110 transition-all duration-500 group-hover:rotate-6" />
                            </button>
                        </>
                    )}>
                </DataTable>
                {data?.pagination && !isLoading && (
                    <PaginationComponent data={data?.products ?? []} pagination={data?.pagination!} isLoading={isLoading} error={error?.message ?? null} up={up} />
                )}
            </div>
            {isModalOpen && (
                <FormModal isModalUpdate={isModalUpdate} label="Ürün" createFunc={handleSubmit((data) => createProduct.mutate(data))} updateFunc={handleSubmit((data) => updateProduct.mutate(data))} setIsModalOpen={setIsModalOpen} setIsModalUpdate={setIsModalUpdate} reset={reset}>
                    <div className="flex flex-row gap-x-2">
                        <div className="w-1/2">
                            <FormInput
                                name="name"
                                label="Ürün Adı"
                                error={errors.name}
                                register={{
                                    ...register("name", {
                                        required: "Ürün adı gereklidir.",
                                        minLength: { value: 2, message: "Ürün adı en az 2 karakter olmalıdır." },
                                        maxLength: { value: 100, message: "Ürün adı en fazla 100 karakter olabilir." },
                                    }),
                                }}
                            />
                        </div>
                        <div className="w-1/2">
                            <FormInput
                                name="description"
                                label="Açıklama"
                                error={errors.description}
                                register={{
                                    ...register("description", {
                                        maxLength: { value: 300, message: "Açıklama en fazla 300 karakter olabilir." },
                                    }),
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex flex-row gap-x-2">
                        <div className="w-1/2">
                            <FormInput
                                type="number"
                                name="price"
                                label="Fiyat"
                                error={errors.price}
                                register={{
                                    ...register("price", {
                                        required: "Fiyat gereklidir.",
                                        min: { value: 0, message: "Fiyat negatif olamaz." },
                                    }),
                                }}
                            />
                        </div>
                        <div className="w-1/2">
                            <FormInput
                                type="number"
                                name="categoryId"
                                label="Kategori ID"
                                error={errors.categoryId}
                                register={{
                                    ...register("categoryId", {
                                        required: "Kategori ID gereklidir.",
                                        min: { value: 1, message: "Kategori ID 1'den küçük olamaz." },
                                    }),
                                }}
                            />
                        </div>
                    </div>

                    <FormInput
                        name="imageUrl"
                        label="Görsel URL"
                        error={errors.imageUrl}
                        register={{
                            ...register("imageUrl", {
                                required: "Görsel URL gereklidir.",
                                maxLength: { value: 200, message: "Görsel URL en fazla 200 karakter olabilir." },
                            }),
                        }}
                    />
                </FormModal>
            )}
        </>
    );
}