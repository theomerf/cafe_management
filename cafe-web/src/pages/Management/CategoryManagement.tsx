import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TitleCard from "../../components/ui/TitleCard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import requests from "../../services/api";
import { useEffect, useMemo, useState } from "react";
import type RequestParameters from "../../types/requestParameters";
import type Category from "../../types/category";
import { faArrowLeft, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import type PaginationHeader from "../../types/paginationHeader";
import { useDebounce } from "../../hooks/useDebounce";
import FormInput from "../../components/form/FormInput";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import PaginationComponent from "../../components/ui/PaginationComponent";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import FormModal from "../../components/ui/FormModal";
import DataTable from "../../components/ui/DataTable";
import TitleButton from "../../components/ui/TitleButton";

export default function CategoryManagement() {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const navigate = useNavigate();
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
                    <TitleButton isLoading={isLoading} onClick={() => navigate("/management")} label ="Geri" icon={faArrowLeft} fromColor="from-red-400" toColor="to-red-500" hoverFromColor="hover:from-red-500" hoverToColor="hover:to-red-600" shadowColor="red-400"/>
                    <TitleButton isLoading={isLoading} onClick={() => { setIsModalOpen(true) }} label ="Yeni Kategori Ekle" />
                </TitleCard>
                <DataTable colNames={
                    new Map<string, string>([["Id", "w-1/5"], ["Kategori Adı", "w-2/5"], ["Ürün Sayısı", "w-1/5"], ["İşlemler", "w-1/5"]])}
                    rows={["id", "name", "productCount"]}
                    isLoading={isLoading} isError={isError} data={data?.categories} error={error} renderActions={(category: Category) => (
                        <>
                            <button onClick={() => { setSelectedCategory(category); setIsModalUpdate(true); setIsModalOpen(true); }} className="w-10 h-10 rounded-lg text-white backdrop-blur-lg group shadow-md shadow-yellow-300 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 transition-all duration-500 hover:from-yellow-400/80 hover:via-yellow-600/80 hover:to-yellow-700/80 hover:shadow-lg hover:shadow-yellow-400 hover:scale-105">
                                <FontAwesomeIcon icon={faEdit} className="text-lg group-hover:scale-110 transition-all duration-500 group-hover:rotate-6" />
                            </button>

                            <button onClick={() => deleteCategory.mutate(category.id)} className="w-10 h-10 rounded-lg text-white backdrop-blur-lg group shadow-md shadow-red-300 bg-gradient-to-br from-red-500 via-red-600 to-red-700 transition-all duration-500 hover:from-red-600 hover:via-red-700 hover:to-red-800 hover:shadow-lg hover:shadow-red-400 hover:scale-105">
                                <FontAwesomeIcon icon={faTrash} className="text-lg group-hover:scale-110 transition-all duration-500 group-hover:rotate-6" />
                            </button>
                        </>
                    )}>
                </DataTable>
                {data?.pagination && !isLoading && (
                    <PaginationComponent data={data?.categories ?? []} pagination={data?.pagination!} isLoading={isLoading} error={error?.message ?? null} up={up} />
                )}
            </div >
            {isModalOpen && (
                <FormModal isModalUpdate={isModalUpdate} label="Kategori" createFunc={handleSubmit((data) => createCategory.mutate(data))} updateFunc={handleSubmit((data) => updateCategory.mutate(data))} setIsModalOpen={setIsModalOpen} setIsModalUpdate={setIsModalUpdate} reset={reset}>
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
                </FormModal>
            )}
        </>
    );
}