import { useQuery } from "@tanstack/react-query";
import TitleCard from "../../components/ui/TitleCard";
import requests from "../../services/api";
import type { OrderStatsResponse } from "../../types/order";
import DailyOrdersCountGraph from "../../components/stats/DailyOrdersCountGraph";
import DailyIncomeGraph from "../../components/stats/DailyIncomeGraph";
import WeeklyOrdersCountGraph from "../../components/stats/WeeklyOrdersCountGraph";
import WeeklyIncomeGraph from "../../components/stats/WeeklyIncomeGraph";
import MonthlyOrdersCountGraph from "../../components/stats/MonthlyOrdersCountGraph";
import MonthlyIncomeGraph from "../../components/stats/MonthlyIncomeGraph";
import TopSoldProductsGraph from "../../components/stats/TopSoldProductsGraph";
import type { ProductStats } from "../../types/product";
import TopSoldCategoriesGraph from "../../components/stats/TopSoldCategoriesGraph";
import type { CategoryStats } from "../../types/category";
import HourlyIncomeDensityGraph from "../../components/stats/HourlyIncomeDensityGraph";
import HourlyOrderDensityGraph from "../../components/stats/HourlyOrderDensityGraph";

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

    const { data: topSoldProductsStats, isLoading: isTopSoldProdLoading, error: topSoldProdError } = useQuery({
        queryKey: ['top-sold-products'],
        queryFn: async ({ signal }): Promise<ProductStats[]> => {
            return await requests.product.topSold(signal);
        },
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000
    });

    const { data: topSoldCategoriesStats, isLoading: isTopSoldCatLoading, error: topSoldCatError } = useQuery({
        queryKey: ['top-sold-categories'],
        queryFn: async ({ signal }): Promise<CategoryStats[]> => {
            return await requests.category.topSold(signal);
        },
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000
    })
    
    return (
        <div className="flex flex-col gap-y-6">
            <TitleCard title="İstatistikler" />
            <div className="grid grid-cols-2 gap-x-3 gap-y-5">
                <DailyOrdersCountGraph dailyOrdersStats={ordersStats?.Daily} isLoading={isLoading} error={error} />
                <DailyIncomeGraph dailyIncomeStats={ordersStats?.Daily} isLoading={isLoading} error={error} />
                <WeeklyOrdersCountGraph weeklyOrdersStats={ordersStats?.Weekly} isLoading={isLoading} error={error} />
                <WeeklyIncomeGraph weeklyIncomeStats={ordersStats?.Weekly} isLoading={isLoading} error={error} />
                <MonthlyOrdersCountGraph monthlyOrdersStats={ordersStats?.Monthly} isLoading={isLoading} error={error} />
                <MonthlyIncomeGraph monthlyIncomeStats={ordersStats?.Monthly} isLoading={isLoading} error={error} />
                <TopSoldProductsGraph topSoldStats={topSoldProductsStats} isLoading={isTopSoldProdLoading} error={topSoldProdError} />
                <TopSoldCategoriesGraph topSoldStats={topSoldCategoriesStats} isLoading={isTopSoldCatLoading} error={topSoldCatError} />
            </div>
            <HourlyIncomeDensityGraph hourlyDensityStats={ordersStats?.Hourly} isLoading={isLoading} error={error} />
            <HourlyOrderDensityGraph hourlyDensityStats={ordersStats?.Hourly} isLoading={isLoading} error={error} />
        </div>
    );
}