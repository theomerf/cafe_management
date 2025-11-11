import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TitleCard from "../../components/ui/TitleCard";
import { faArrowLeft, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import TitleButton from "../../components/ui/TitleButton";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "../../hooks/useDebounce";
import { useNavigate, useSearchParams } from "react-router-dom";
import type RequestParameters from "../../types/requestParameters";
import requests from "../../services/api";
import type PaginationHeader from "../../types/paginationHeader";
import type Account from "../../types/account";
import DataTable from "../../components/ui/DataTable";
import PaginationComponent from "../../components/ui/PaginationComponent";
import FormInput from "../../components/form/FormInput";
import FormModal from "../../components/ui/FormModal";
import { toast } from "react-toastify";
import { useBreakpoint } from "../../hooks/useBreakpoint";

export default function AccountManagement() {
    const queryClient = useQueryClient();
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalUpdate, setIsModalUpdate] = useState(false);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const debouncedSearch = useDebounce(searchParams.get("searchTerm") || "", 500);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<{
        id?: string;
        userName: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        password: string;
    }>();
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
        queryKey: ['accounts', finalQuery],
        queryFn: async ({ signal, queryKey }) => {
            const [, params] = queryKey;
            return await requests.account.getAllAccounts(params, signal);
        },
        select: (response) => {
            const pagination: PaginationHeader = JSON.parse(response.headers["x-pagination"]);
            return { accounts: response.data as Account[], pagination };
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

    useEffect(() => {
        if (isModalOpen && isModalUpdate && selectedAccount) {
            reset({
                id: selectedAccount.id,
                userName: selectedAccount.userName,
                firstName: selectedAccount.firstName,
                lastName: selectedAccount.lastName,
                email: selectedAccount.email,
                phoneNumber: selectedAccount.phoneNumber,
                password: "",
            });
        }
        else if (!isModalUpdate) {
            reset({
                id: undefined,
            });
        }
    }, [isModalOpen, isModalUpdate, selectedAccount, reset]);

    const createAccount = useMutation({
        mutationFn: async (data: { userName: string, firstName: string, lastName: string, email: string, phoneNumber: string, password: string }) => {
            return await requests.account.createAccount(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            toast.success("Kullanıcı başarıyla oluşturuldu.");
            setIsModalOpen(false);
            reset();
        },
        onError: (error: any) => {
            toast.error("Kullanıcı oluşturulurken hata oluştu.");
            console.error("Kullanıcı oluşturulurken hata oluştu:", error);
        }
    });

    const updateAccount = useMutation({
        mutationFn: async (data: { id?: string, userName: string, firstName: string, lastName: string, email: string, phoneNumber: string, password: string }) => {
            return await requests.account.updateAccount(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            toast.success("Kullanıcı başarıyla güncellendi.");
            setIsModalOpen(false);
            setIsModalUpdate(false);
            reset();
        },
        onError: (error: any) => {
            toast.error("Kullanıcı güncellenirken hata oluştu.");
            console.error("Kullanıcı güncellenirken hata oluştu:", error);
        }
    });

    const deleteAccount = useMutation({
        mutationFn: async (id: string) => {
            return await requests.account.deleteAccount(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            toast.success("Kullanıcı başarıyla silindi.");
        },
        onError: (error: any) => {
            toast.error("Kullanıcı silinirken hata oluştu.");
            console.error("Kullanıcı silinirken hata oluştu:", error);
        }
    });

    return (
        <>
            <div className="flex flex-col gap-y-6">
                <TitleCard title="Kullanıcı Yönetimi">
                    <TitleButton isLoading={isLoading} onClick={() => navigate("/management")} label ="Geri" icon={faArrowLeft} fromColor="from-red-400" toColor="to-red-500" hoverFromColor="hover:from-red-500" hoverToColor="hover:to-red-600" shadowColor="red-400"/>
                    <TitleButton isLoading={isLoading} onClick={() => setIsModalOpen(true)} label="Yeni Kullanıcı Ekle" />
                </TitleCard>
                <DataTable colNames={
                    new Map<string, string>([["Kullanıcı Adı", "w-1/6"], ["Ad", "w-1/6"], ["Soyad", "w-1/6"], ["E-Posta", "w-2/6"], ["İşlemler", "w-1/6"]])}
                    rows={["userName", "firstName", "lastName", "email"]}
                    isLoading={isLoading} isError={isError} data={data?.accounts} error={error} renderActions={(account: Account) => (
                        <>
                            <button onClick={() => { setSelectedAccount(account); setIsModalUpdate(true); setIsModalOpen(true); }} className="w-10 h-10 rounded-lg text-white backdrop-blur-lg group shadow-md shadow-yellow-300 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 transition-all duration-500 hover:from-yellow-400/80 hover:via-yellow-600/80 hover:to-yellow-700/80 hover:shadow-lg hover:shadow-yellow-400 hover:scale-105">
                                <FontAwesomeIcon icon={faEdit} className="text-lg group-hover:scale-110 transition-all duration-500 group-hover:rotate-6" />
                            </button>

                            <button onClick={() => deleteAccount.mutate(account.id!)} className="w-10 h-10 rounded-lg text-white backdrop-blur-lg group shadow-md shadow-red-300 bg-gradient-to-br from-red-500 via-red-600 to-red-700 transition-all duration-500 hover:from-red-600 hover:via-red-700 hover:to-red-800 hover:shadow-lg hover:shadow-red-400 hover:scale-105">
                                <FontAwesomeIcon icon={faTrash} className="text-lg group-hover:scale-110 transition-all duration-500 group-hover:rotate-6" />
                            </button>
                        </>
                    )}>
                </DataTable>
                {data?.pagination && !isLoading && (
                    <PaginationComponent data={data?.accounts ?? []} pagination={data?.pagination!} isLoading={isLoading} error={error?.message ?? null} up={up} />
                )}
            </div>

            {isModalOpen && (
                <FormModal isModalUpdate={isModalUpdate} label="Kullanıcı" createFunc={handleSubmit((data) => createAccount.mutate(data))} updateFunc={handleSubmit((data) => updateAccount.mutate(data))} setIsModalOpen={setIsModalOpen} setIsModalUpdate={setIsModalUpdate} reset={reset}>
                    <div className="grid grid-cols-2 gap-x-2">
                        <FormInput
                            name="userName"
                            label="Kullanıcı Adı"
                            placeholder="Kullanıcı adını giriniz."
                            error={errors.userName}
                            register={{
                                ...register("userName", {
                                    required: "Kategori adı gereklidir.",
                                    minLength: { value: 2, message: "Masa adı en az 2 karakter olmalıdır." },
                                    maxLength: { value: 100, message: "Kategori adı en fazla 100 karakter olabilir." },
                                }),
                            }}
                        />

                        <FormInput
                            name="email"
                            label="E-Posta"
                            placeholder="E-Posta adresini giriniz."
                            type="email"
                            error={errors.email}
                            register={{
                                ...register("email", {
                                    required: "E-Posta gereklidir.",
                                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Geçersiz e-posta formatı." },
                                }),
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                        <FormInput
                            name="firstName"
                            label="Ad"
                            placeholder="Ad giriniz."
                            error={errors.firstName}
                            register={{
                                ...register("firstName", {
                                    required: "Ad gereklidir.",
                                    maxLength: { value: 50, message: "Ad en fazla 30 karakter olabilir." },
                                }),
                            }}
                        />

                        <FormInput
                            name="lastName"
                            label="Soyad"
                            placeholder="Soyad giriniz."
                            error={errors.lastName}
                            register={{
                                ...register("lastName", {
                                    required: "Soyad gereklidir.",
                                    maxLength: { value: 50, message: "Soyad en fazla 30 karakter olabilir." },
                                }),
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                        <FormInput
                            name="phoneNumber"
                            label="Telefon Numarası"
                            placeholder="Telefon numarasını giriniz."
                            error={errors.phoneNumber}
                            register={{
                                ...register("phoneNumber", {
                                    required: "Telefon numarası gereklidir.",
                                }),
                            }}
                        />

                        {isModalUpdate ? (
                            <FormInput
                                name="id"
                                label="Kullanıcı ID"
                                placeholder="Kullanıcı ID"
                                type="text"
                                disabled={true}
                                error={errors.id}
                                register={{
                                    ...register("id"),
                                }}
                            />
                        ) : (<FormInput
                            name="password"
                            label="Parola"
                            placeholder="Parolayı giriniz."
                            type="password"
                            error={errors.password}
                            register={{
                                ...register("password", {
                                    required: isModalUpdate ? false : "Parola gereklidir.",
                                    minLength: isModalUpdate ? undefined : { value: 6, message: "Parola en az 6 karakter olmalıdır." },
                                    maxLength: { value: 100, message: "Parola en fazla 100 karakter olabilir." },
                                }),
                            }}
                        />)}
                    </div>
                </FormModal>
            )}
        </>
    );
}