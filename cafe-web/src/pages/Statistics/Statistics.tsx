import { useQuery } from "@tanstack/react-query";
import TitleCard from "../../components/ui/TitleCard";
import requests from "../../services/api";
import type { OrderStatsResponse } from "../../types/order";
import DailyOrdersCountGraph from "../../components/stats/DailyOrdersCountGraph";

export default function Statistics() {
    const { data: ordersStats, isLoading, error } = useQuery({
        queryKey: ['order-stats'],
        queryFn: async ({ signal }): Promise<OrderStatsResponse> => {
            return await requests.order.stats(signal);
        },
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000
    });
    return (
        <div className="flex flex-col gap-y-6">
            <TitleCard title="İstatistikler" />
            <DailyOrdersCountGraph dailyOrdersStats={ordersStats?.Daily} isLoading={isLoading} error={error}/>
        </div>
    );
}