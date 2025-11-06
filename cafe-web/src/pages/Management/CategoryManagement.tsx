import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TitleCard from "../../components/ui/TitleCard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import requests from "../../services/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import type RequestParameters from "../../types/requestParameters";
import type Category from "../../types/category";
import { faCheckCircle, faEdit, faPlus, faPlusCircle, faTrash, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { useSearchParams } from "react-router-dom";
import type PaginationHeader from "../../types/paginationHeader";
import { useDebounce } from "../../hooks/useDebounce";
import { ClipLoader } from "react-spinners";
import FormInput from "../../components/form/FormInput";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import PaginationComponent from "../../components/ui/PaginationComponent";
import { useBreakpoint } from "../../hooks/useBreakpoint";

export default function CategoryManagement() {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const debouncedSearch = useDebounce(searchParams.get("searchTerm") || "", 500);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<{
        id: number | undefined;
        name: string;
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
        queryKey: ['categories', finalQuery],
        queryFn: async ({ signal, queryKey }) => {
            const [, params] = queryKey;
            return await requests.category.getAllCategories(params, signal);
        },
        select: (response) => {
            const pagination: PaginationHeader = JSON.parse(response.headers["x-pagination"]);
            return { categories: response.data as Category[], pagination };
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

    const createCategory = useMutation({
        mutationFn: (data: { name: string }) => requests.category.createCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
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
        if (isModalOpen && isModalUpdate && selectedCategory) {
            reset({
                id: selectedCategory?.id,
                name: selectedCategory?.name
            });
        }
        else if (!isModalUpdate) {
            reset({
                id: undefined,
                name: "",
            });
        }
    }, [isModalOpen, isModalUpdate, selectedCategory, reset]);

    const updateCategory = useMutation({
        mutationFn: (data: { id: number | undefined; name: string }) => requests.category.updateCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success("Kategori başarıyla güncellendi.");
            setIsModalUpdate(false);
            setIsModalOpen(false);
            reset();
        },
        onError: (error: any) => {
            toast.error("Kategori güncellenirken bir hata oluştu.");
            console.error("Kategori güncelleme hatası:", error);
        }
    });

    const deleteCategory = useMutation({
        mutationFn: (id: number) => requests.category.deleteCategory(id.toString()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success("Kategori başarıyla silindi.");
        },
        onError: (error: any) => {
            toast.error("Kategori silinirken bir hata oluştu.");
            console.error("Kategori silme hatası:", error);
        }
    });

    return (
        <>
            <div className="flex flex-col gap-y-6">
                <TitleCard title="Kategori Yönetimi">
                    <button onClick={() => { setIsModalOpen(true) }} disabled={isLoading} className="bg-gradient-to-r from-green-400/90 to-green-500/90 hover:from-green-500 hover:to-green-600 shadow-lg flex group px-4 py-3 font-semibold rounded-xl shadow-green-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] disabled:opacity-50 disabled:cursor-not-allowed">
                        <FontAwesomeIcon icon={faPlusCircle} className="mr-2 self-center group-hover:scale-110 duration-500 transition-all" />
                        Yeni Kategori Ekle
                    </button>
                </TitleCard>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table-fixed w-full divide-y-2 divide-gray-200">
                            <thead className="bg-blue-400/90 backdrop-blur-md">
                                <tr>
                                    <th className="w-1/5 px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">Id</th>
                                    <th className="w-2/5 px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">Kategori Adı</th>
                                    <th className="w-1/5 px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">Ürün Sayısı</th>
                                    <th className="w-1/5 px-4 py-5 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <div className="flex flex-col gap-y-2 self-center justify-center items-center pt-4">
                                        <ClipLoader size={40} color="#06b6d4" />
                                        <p className="text-white">Kategoriler yükleniyor...</p>
                                    </div>
                                ) : (
                                    isError ? (
                                        <div className="flex flex-col gap-y-2 self-center justify-center items-center pt-4">
                                            <p className="text-white">Kategoriler yüklenirken bir hata oluştu. <br /> Hata: {error.message} </p>
                                        </div>
                                    ) : (
                                        data?.categories.map((category) => (
                                            <tr key={category.id} className="hover:bg-gray-100 transition-all duration-300">
                                                <td className="p-4 text-sm md:text-base font-medium text-gray-900">
                                                    {category.id}
                                                </td>
                                                <td className="p-4 text-sm md:text-base font-medium text-gray-900">
                                                    {category.name}

                                                </td>
                                                <td className="p-4 text-sm md:text-base font-medium text-gray-900">
                                                    0
                                                </td>
                                                <td className="p-4 text-sm font-medium">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => { setSelectedCategory(category); setIsModalUpdate(true); setIsModalOpen(true); }} className="w-10 h-10 rounded-lg text-white backdrop-blur-lg group shadow-md shadow-yellow-300 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 transition-all duration-500 hover:from-yellow-400/80 hover:via-yellow-600/80 hover:to-yellow-700/80 hover:shadow-lg hover:shadow-yellow-400 hover:scale-105">
                                                            <FontAwesomeIcon icon={faEdit} className="text-lg group-hover:scale-110 transition-all duration-500 group-hover:rotate-6" />
                                                        </button>
                                                        <button onClick={() => deleteCategory.mutate(category.id)} className="w-10 h-10 rounded-lg text-white backdrop-blur-lg group shadow-md shadow-red-300 bg-gradient-to-br from-red-500 via-red-600 to-red-700 transition-all duration-500 hover:from-red-600 hover:via-red-700 hover:to-red-800 hover:shadow-lg hover:shadow-red-400 hover:scale-105">
                                                            <FontAwesomeIcon icon={faTrash} className="text-lg group-hover:scale-110 transition-all duration-500 group-hover:rotate-6" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {data?.pagination && !isLoading && (
                    <PaginationComponent data={data?.categories ?? []} pagination={data?.pagination!} isLoading={isLoading} error={error?.message ?? null} up={up} />
                )}
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-2xl max-w-md w-full mx-4">
                        <div className="flex flex-col">
                            <div className="flex flex-row justify-center bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 w-full px-8 py-6 text-white">
                                <FontAwesomeIcon icon={isModalUpdate ? faEdit : faPlus} className="mr-3 self-center text-xl" />
                                <h2 className="text-2xl font-bold">{isModalUpdate ? "Kategori Bilgilerini Düzenle" : "Yeni Kategori Oluştur"}</h2>
                            </div>

                            <form
                                className="flex flex-col gap-y-4 px-8 py-6"
                                onSubmit={isModalUpdate ? handleSubmit((data) => updateCategory.mutate(data)) : handleSubmit((data) => createCategory.mutate(data))}
                            >
                                <FormInput
                                    name="name"
                                    label="Kategori Adı"
                                    error={errors.name}
                                    register={{
                                        ...register("name", {
                                            required: "Kategori adı gereklidir.",
                                            minLength: { value: 2, message: "Masa adı en az 2 karakter olmalıdır." },
                                            maxLength: { value: 100, message: "Kategori adı en fazla 100 karakter olabilir." },
                                        }),
                                    }}
                                />

                                <div className="flex flex-row gap-x-3 mt-6 justify-center">
                                    <button
                                        type="submit"
                                        className="bg-gradient-to-r from-green-500/90 to-green-600/90 hover:from-green-500 hover:to-green-600 shadow-lg flex items-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-green-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                    >
                                        <FontAwesomeIcon icon={faCheckCircle} />
                                        Onayla
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalUpdate(false);
                                            setIsModalOpen(false);
                                            reset();
                                        }}
                                        className="bg-gradient-to-r from-red-500/90 to-red-600/90 hover:from-red-600 hover:to-red-700 shadow-lg flex items-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-red-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] text-white disabled:opacity-50 disabled:cursor-not-allowed"
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