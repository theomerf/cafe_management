import { faLayerGroup, faPizzaSlice, faTable, faUser, faUserGear } from "@fortawesome/free-solid-svg-icons";
import DashboardStatCard from "../../components/ui/DashboardStatCard";
import TitleCard from "../../components/ui/TitleCard";
import DashboardButtonCard from "../../components/ui/DashboardButtonCard";
import { useEffect, useReducer } from "react";
import BackendDataObjectReducer from "../../types/backendDataObject";
import requests from "../../services/api";
import { toast } from "react-toastify";

interface ManagementStats {
    totalAccounts: number;
    totalProducts: number;
    totalCategories: number;
    totalTables: number;
}

export default function Management() {
    const [dashboardStats, dispatch] = useReducer(BackendDataObjectReducer<ManagementStats>, {
        data: null,
        isLoading: false,
        error: null,
    });

    async function fetchDashboardStats(signal?: AbortSignal) {
        dispatch({ type: 'FETCH_START' });
        try {
            const [totalAccountsRes, totalProductsRes, totalCategoriesRes, totalTablesRes] = await Promise.all([
                1,
                requests.product.productsCount(signal),
                requests.category.categoriesCount(signal),
                requests.table.tablesCount(signal),
            ]);

            dispatch({
                type: 'FETCH_SUCCESS', payload: {
                    totalAccounts: totalAccountsRes,
                    totalProducts: totalProductsRes,
                    totalCategories: totalCategoriesRes,
                    totalTables: totalTablesRes,
                }
            });
        }
        catch (error: any) {
            if (error.name === 'CanceledError' || error.name === "AbortError") {
                return;
            }
            else {
                dispatch({ type: "FETCH_ERROR", payload: error.message || "Dashboard istatistikleri çekilirken hata oluştu." });
                toast.error(dashboardStats.error || "Dashboard istatistikleri çekilirken hata oluştu.");
            }
        }
    }

    useEffect(() => {
        const controller = new AbortController();

        fetchDashboardStats(controller.signal);

        return () => {
            controller.abort();
        }
    }, []);

    return (
        <div className="flex flex-col gap-y-6">
            <TitleCard title="Kafe Yönetimi" />
            <div className="grid grid-cols-4 gap-x-6">
                <DashboardStatCard title="Toplam Kullanıcı" value={dashboardStats.data?.totalAccounts ?? 0} isLoading={dashboardStats.isLoading} icon={faUser} />
                <DashboardStatCard title="Toplam Ürün" value={dashboardStats.data?.totalProducts ?? 0} isLoading={dashboardStats.isLoading} icon={faPizzaSlice} />
                <DashboardStatCard title="Toplam Kategori" value={dashboardStats.data?.totalCategories ?? 0} isLoading={dashboardStats.isLoading} icon={faLayerGroup} />
                <DashboardStatCard title="Toplam Masa" value={dashboardStats.data?.totalTables ?? 0} isLoading={dashboardStats.isLoading} icon={faTable} />
            </div>
            <div className="grid grid-cols-6 gap-x-2">
                <DashboardButtonCard to="/management/accounts" label="Kullanıcıları Yönet" icon={faUserGear} color="bg-green-400" shadowColor="shadow-green-400" />
                <DashboardButtonCard to="/management/products" label="Ürünleri Yönet" icon={faPizzaSlice} color="bg-blue-400" shadowColor="shadow-blue-400" />
                <DashboardButtonCard to="/management/categories" label="Kategorileri Yönet" icon={faLayerGroup} color="bg-purple-400" shadowColor="shadow-purple-400" />
                <DashboardButtonCard to="/management/tables" label="Masaları Yönet" icon={faTable} color="bg-yellow-400" shadowColor="shadow-yellow-400" />
            </div>
        </div>
    );
}