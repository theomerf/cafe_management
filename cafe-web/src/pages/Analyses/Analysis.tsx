import { faMoneyBill, faMugHot, faUser } from "@fortawesome/free-solid-svg-icons";
import DashboardStatCard from "../../components/ui/DashboardStatCard";
import TitleCard from "../../components/ui/TitleCard";
import { useQuery } from "@tanstack/react-query";
import requests from "../../services/api";
import type { OrderAnalysis } from "../../types/order";
import { TrendingDown, TrendingUp, Banknote } from 'lucide-react';
import { ClipLoader } from "react-spinners";

export default function Analysis() {
    const { data: orderAnalysis, isLoading: orderAnalysisLoading, error: orderAnalysiserror } = useQuery({
        queryKey: ['order-analysis'],
        queryFn: async ({ signal }): Promise<OrderAnalysis> => {
            return await requests.order.analysis(signal);
        }
    })

    const currentMonth = new Date().toLocaleDateString('tr-TR', { month: 'long' });

    return (
        <div className="flex flex-col gap-y-6">
            <TitleCard title="Analizler" />
            <div className="grid grid-cols-4 gap-x-4">
                <DashboardStatCard title={`${currentMonth} Ayı Siparişleri`} isLoading={orderAnalysisLoading} icon={faMugHot} value={orderAnalysis?.currentMonthOrderCount.toString() ?? 0} lastValue={orderAnalysis?.lastMonthOrderCount.toString() ?? 0} />
                <DashboardStatCard title={`${currentMonth} Ayı Toplam Geliri`} isLoading={orderAnalysisLoading} icon={faMoneyBill} value={orderAnalysis?.currentMonthIncome.toString() ?? 0} lastValue={orderAnalysis?.lastMonthIncome.toString() ?? 0} />
                <DashboardStatCard title={`${currentMonth} Ayı Ort. Sipariş Tutarı`} isLoading={orderAnalysisLoading} icon={faMoneyBill} value={orderAnalysis?.currentMonthAvgIncome.toFixed(2).toString() ?? 0} lastValue={orderAnalysis?.lastMonthAvgIncome.toString() ?? 0} />
                <DashboardStatCard title={`${currentMonth} Günlük Ort. Sipariş Sayısı`} isLoading={orderAnalysisLoading} icon={faMoneyBill} value={orderAnalysis?.currentMonthOrderCount.toString() ?? 0} lastValue={orderAnalysis?.lastMonthAvgCount.toString() ?? 0} />
            </div>
            <div className="flex flex-col bg-white border-2 border-gray-200 shadow-lg rounded-lg p-4 gap-y-4">
                <p className="text-center text-3xl text-gray-500 font-bold mb-4">Sipariş Analizleri</p>
                {orderAnalysisLoading && (
                    <div className="flex justify-center items-center pt-4">
                        <ClipLoader size={40} color="#06b6d4" />
                    </div>
                )}
                {!orderAnalysisLoading && orderAnalysis && (
                    orderAnalysis.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex flex-row gap-x-6 items-center">
                            <div className="w-4 h-4 rounded-full bg-green-400">

                            </div>
                            <div className="bg-gray-50 border-2 rounded-lg p-4 w-full shadow-md transition-all duration-500 hover:bg-gray-200 hover:scale-[102%]">
                                <p className="text-gray-600 font-medium">{suggestion}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}