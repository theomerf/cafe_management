import { faBuilding, faCalendarDay, faChartSimple, faDollar, faGears, faMugHot, faTable } from "@fortawesome/free-solid-svg-icons";
import DashboardStatCard from "../../components/ui/DashboardStatCard";
import DashboardButtonCard from "../../components/ui/DashboardButtonCard";
import TitleCard from "../../components/ui/TitleCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DashboardOrderGraph from "../../components/dashboard/DashboardOrderGraph";
import DashboardTableGraph, { type TableStats } from "../../components/dashboard/DashboardTableGraph";
import { useEffect, useReducer } from "react";
import BackendDataObjectReducer from "../../types/backendDataObject";
import requests from "../../services/api";
import { toast } from "react-toastify";
import type Order from "../../types/order";
import { ClipLoader } from "react-spinners";

export interface DashboardStats {
    totalOrders: number;
    dailyIncome: number;
    activeTables: number;
    dailyOrders: number;
    tableStats: TableStats;
    activeOrders: Order[];
}

export default function Dashboard() {
    const [dashboardStats, dispatch] = useReducer(BackendDataObjectReducer<DashboardStats>, {
        data: null,
        isLoading: false,
        error: null,
    });

    async function fetchDashboardStats(signal?: AbortSignal) {
        dispatch({ type: 'FETCH_START' });
        try {
            const [totalOrdersRes, dailyIncomeRes, activeTablesRes, dailyOrdersRes, activeOrdersRes] = await Promise.all([
                requests.order.ordersCount(signal),
                requests.order.dailyIncome(signal),
                requests.table.statusesStats(signal),
                requests.order.dailyOrdersCount(signal),
                requests.order.activeOrders(signal)
            ]);

            dispatch({
                type: 'FETCH_SUCCESS', payload: {
                    totalOrders: totalOrdersRes,
                    dailyIncome: dailyIncomeRes,
                    activeTables: activeTablesRes.occupiedCount,
                    dailyOrders: dailyOrdersRes,
                    tableStats: activeTablesRes,
                    activeOrders: activeOrdersRes,
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
            <TitleCard title="Dashboard" />
            <div className="grid grid-cols-4 gap-x-6">
                <DashboardStatCard title="Toplam Sipariş" isLoading={dashboardStats.isLoading} value={dashboardStats.data?.totalOrders!} icon={faMugHot} />
                <DashboardStatCard title="Günlük Gelir" isLoading={dashboardStats.isLoading} value={dashboardStats.data?.dailyIncome!} icon={faDollar} />
                <DashboardStatCard title="Aktif Masalar" isLoading={dashboardStats.isLoading} value={dashboardStats.data?.activeTables!} icon={faTable} />
                <DashboardStatCard title="Günlük Sipariş" isLoading={dashboardStats.isLoading} value={dashboardStats.data?.dailyOrders!} icon={faCalendarDay} />
            </div>
            <div className="grid grid-cols-6 gap-x-4">
                <DashboardButtonCard to="/orders" label="Siparişleri Yönet" icon={faMugHot} color="bg-green-400" shadowColor="shadow-green-400" />
                <DashboardButtonCard to="/management" label="Kafe Yönetimi" icon={faBuilding} color="bg-blue-400" shadowColor="shadow-blue-400" />
                <DashboardButtonCard to="/statistics" label="İstatistikleri Görüntüle" icon={faChartSimple} color="bg-purple-400" shadowColor="shadow-purple-400" />
                <DashboardButtonCard to="/analysis" label="Analizleri İncele" icon={faDollar} color="bg-yellow-400" shadowColor="shadow-yellow-400" />
                <DashboardButtonCard to="/management/tables" label="Masaları Yönet" icon={faTable} color="bg-indigo-400" shadowColor="shadow-indigo-400" />
                <DashboardButtonCard to="/settings" label="Ayarları Değiştir" icon={faGears} color="bg-red-400" shadowColor="shadow-red-400" />
            </div>
            <div className="grid grid-cols-3 gap-x-4">
                <div className="flex flex-col items-center text-center text-gray-400 bg-white/10 backdrop-blur-lg rounded-lg shadow-lg px-8 py-8 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:rounded-t-lg before:bg-gradient-to-r before:from-cyan-500 before:to-blue-500 relative transition-all duration-500 hover:scale-[102%]">
                    <p className="text-2xl font-bold">Bekleyen Siparişler</p>
                    <div className="w-full overflow-y-auto max-h-64">
                        {dashboardStats.isLoading && (
                            <div className="flex justify-center items-center pt-4">
                                <ClipLoader size={40} color="#06b6d4" />
                            </div>
                        )}
                        <ul className="mt-4 space-y-1 w-full">
                            {dashboardStats.data && !dashboardStats.isLoading && dashboardStats.data.activeOrders.map((order) => (
                                <li key={order.id} className="bg-white/20 rounded-lg p-3 grid grid-cols-8 items-center">
                                    <FontAwesomeIcon icon={faMugHot} className="text-cyan-500 col-span-1" />
                                    <span className="col-span-7 text-left">Masa {order.tableId} - {order.orderLines.map(ol => `${ol.productName} x${ol.quantity}`).join(', ')}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center text-center text-gray-400 bg-white/10 backdrop-blur-lg rounded-lg shadow-lg px-4 pt-8 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:rounded-t-lg before:bg-gradient-to-r before:from-cyan-500 before:to-blue-500 relative transition-all duration-500 hover:scale-[102%]">
                    <p className="text-2xl font-bold">Hazırlanıyor / Teslim Edildi</p>
                    <div className="w-full">
                        <DashboardOrderGraph />
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center text-center text-gray-400 bg-white/10 backdrop-blur-lg rounded-lg shadow-lg px-4 pt-8 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:rounded-t-lg before:bg-gradient-to-r before:from-cyan-500 before:to-blue-500 relative transition-all duration-500 hover:scale-[102%]">
                    <p className="text-2xl font-bold">Masa Durumları</p>
                    <div className="w-full">
                        <DashboardTableGraph stats={dashboardStats} />
                    </div>
                </div>
            </div>

        </div >
    );
}