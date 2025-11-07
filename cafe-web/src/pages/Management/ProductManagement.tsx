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
import { faEdit, faPlusCircle, faTrash, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import DataTable from "../../components/ui/DataTable";
import { toast } from "react-toastify";
import PaginationComponent from "../../components/ui/PaginationComponent";
import FormModal from "../../components/ui/FormModal";
import FormInput from "../../components/form/FormInput";
import type Category from "../../types/category";

export default function ProductManagement() {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isPhotoUpdate, setIsPhotoUpdate] = useState(false);
    const debouncedSearch = useDebounce(searchParams.get("searchTerm") || "", 500);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<{
        id: number | undefined;
        name: string;
        description: string | undefined;
        price: number;
        image?: File;
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

    const { data: categoriesList, isLoading: categoriesIsLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async ({ signal }) => {
            return await requests.category.getCategoriesList(signal);
        },
        enabled: isModalOpen,
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 20,
    });

    useEffect(() => {
        const params = new URLSearchParams();
        Object.entries(finalQuery).forEach(([key, value]) => {
            if (value) params.set(key, value.toString());
        });
        setSearchParams(params, { replace: true });
    }, [finalQuery]);

    const createProduct = useMutation({
        mutationFn: async (data: any) => await handleCreateProduct(data),
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

    const handleCreateProduct = async (data: any) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description || "");
        formData.append("price", data.price.toString());
        formData.append("categoryId", data.categoryId.toString());
        if (data.image && data.image.length > 0) {
            formData.append("image", data.image[0]);
        }

        await requests.product.createProduct(formData);
    }

    useEffect(() => {
        if (isModalOpen && isModalUpdate && selectedProduct && !categoriesIsLoading) {
            reset({
                id: selectedProduct?.id,
                name: selectedProduct?.name,
                description: selectedProduct?.description ?? undefined,
                price: selectedProduct?.price,
                categoryId: selectedProduct?.categoryId,
            });
        }
        else if (!isModalUpdate) {
            reset({
                id: undefined,
                name: "",
            });
        }
    }, [isModalOpen, categoriesIsLoading, isModalUpdate, selectedProduct, reset]);

    const updateProduct = useMutation({
        mutationFn: async (data: any) => await handleUpdateProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success("Ürün başarıyla güncellendi.");
            setIsModalUpdate(false);
            setIsPhotoUpdate(false);
            setIsModalOpen(false);
            reset();
        },
        onError: (error: any) => {
            toast.error("Ürün güncellenirken bir hata oluştu.");
            console.error("Ürün güncelleme hatası:", error);
        }
    });

    const handleUpdateProduct = async (data: any) => {
        const formData = new FormData();
        formData.append("id", data.id.toString());
        formData.append("name", data.name);
        formData.append("description", data.description || "");
        formData.append("price", data.price.toString());
        formData.append("categoryId", data.categoryId.toString());
        if (isPhotoUpdate && data.image && data.image.length > 0) {
            formData.append("image", data.image[0]);
        }

        await requests.product.updateProduct(formData);
    }

    const deleteProduct = useMutation({
        mutationFn: async (id: number) => await requests.product.deleteProduct(id.toString()),
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
                    isFirstImage={true} isLoading={isLoading} isError={isError} data={data?.products} error={error} renderActions={(product: Product) => (
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
                <FormModal isModalUpdate={isModalUpdate} label="Ürün" createFunc={handleSubmit((data) => createProduct.mutate(data))} updateFunc={handleSubmit((data) => updateProduct.mutate(data))} setIsModalOpen={setIsModalOpen} setIsModalUpdate={setIsModalUpdate} setIsPhotoUpdate={setIsPhotoUpdate} reset={reset}>
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
                                label="Açıklama (isteğe bağlı)"
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
                            <div className="flex flex-col gap-y-1">
                                <label htmlFor="categoryId" className="font-bold text-gray-500">Kategori</label>
                                <select id="categoryId" {...register("categoryId", {
                                    required: "Kategori ID gereklidir.",
                                    min: { value: 1, message: "Geçersiz kategori ID." },
                                })} className="border-gray-200 border-2 rounded-lg w-full px-3 py-[9px] bg-white/90 transition-all duration-300 focus:border-cyan-200 focus:outline-none focus:shadow-gray-200 focus:shadow-md focus:scale-[102%] focus:bg-white">
                                    {categoriesIsLoading && <option>Yükleniyor...</option>}
                                    {!categoriesIsLoading &&
                                        <>
                                            <option value="">Kategori Seçin</option>
                                            {categoriesList.map((category: Category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </>
                                    }

                                </select>
                                {errors.categoryId &&
                                    <p className="text-red-500 text-sm font-semibold">
                                        <FontAwesomeIcon icon={faTriangleExclamation} className="mr-1" />
                                        {errors.categoryId?.message}
                                    </p>
                                }
                            </div>
                        </div>
                    </div>
                    {isModalUpdate && (
                        <div className="flex flex-row gap-x-2">
                            <label htmlFor="checkbox" className="font-bold text-gray-500 cursor-pointer">
                                Ürün görselini güncelle
                            </label>
                            <input id="checkbox" type="checkbox" className="self-center" onChange={() => setIsPhotoUpdate(!isPhotoUpdate)} />
                        </div>
                    )}

                    {((!isModalUpdate) || (isModalUpdate && isPhotoUpdate)) && (
                        <FormInput
                            type="file"
                            name="image"
                            accept="image/*"
                            label="Ürün Görseli"
                            error={errors.image}
                            register={{
                                ...register("image", {
                                    required: "Ürün görseli gereklidir.",
                                }),
                            }}
                        />
                    )}
                </FormModal>
            )}
        </>
    );
}