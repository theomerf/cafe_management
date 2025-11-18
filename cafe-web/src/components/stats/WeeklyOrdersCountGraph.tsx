import { useBreakpoint } from "../../hooks/useBreakpoint";
import { ResponsiveBar, type BarDatum } from "@nivo/bar";
import type { OrderStats } from "../../types/order";
import { ClipLoader } from "react-spinners";
import { useEffect, useState } from "react";

interface HistogramData extends BarDatum {
    day: string;
    count: number;
    color?: string;
    [key: string]: any;
}

type WeeklyOrdersCountGraphProps = {
    weeklyOrdersStats: OrderStats | undefined;
    isLoading: boolean;
    error: Error | null;
}

export default function WeeklyOrdersCountGraph({ weeklyOrdersStats, isLoading, error }: WeeklyOrdersCountGraphProps) {
    const [graphData, setGraphData] = useState<HistogramData[] | undefined>();
    const { up } = useBreakpoint();
    const isMobile = !up.md;
    const isTablet = up.md && !up.lg;
    const getBarMargins = () => {
        if (isMobile) return { top: 10, right: 10, bottom: 60, left: 40 };
        if (isTablet) return { top: 15, right: 20, bottom: 70, left: 50 };
        return { top: 20, right: 30, bottom: 80, left: 60 };
    };

    const getColorByCount = (count: number): string => {
        if (count === 0) return '#e5e7eb';
        if (count <= 5) return '#93c5fd';
        if (count <= 10) return '#60a5fa';
        if (count <= 15) return '#3b82f6';
        return '#1d4ed8';
    };

    useEffect(() => {
        if (weeklyOrdersStats) {
            const formattedData: HistogramData[] = weeklyOrdersStats.labels.map((label, index) => ({
                day: label,
                count: weeklyOrdersStats.totalCounts[index],
                color: getColorByCount(weeklyOrdersStats.totalCounts[index]),
            }));
            setGraphData(formattedData);
        }
    }, [weeklyOrdersStats]);

    const currentMonth = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

    return (
        <div className="border-gray-200 border shadow-lg rounded-lg w-full bg-white">
            {isLoading && (
                <div className="flex justify-center items-center h-[400px] md:h-[550px]">
                    <ClipLoader size={40} color="#8B5CF6" />
                </div>
            )}

            {error && (
                <div className="flex justify-center items-center h-[400px] md:h-[550px] text-red-500 px-4 text-center">
                    {error.message}
                </div>
            )}

            {graphData && graphData.length > 0 && (
                <div className="p-4 md:p-6">
                    <div className={`flex items-center mb-3 md:mb-4 ${isMobile ? 'flex-col gap-2' : 'flex-row justify-between'
                        }`}>
                        <h2 className={`font-semibold text-violet-400 ${isMobile ? 'text-lg text-center' : 'text-2xl'
                            }`}>
                            {isMobile ? currentMonth.split(' ')[0] : currentMonth} - Haftalık Sipariş Grafiği
                        </h2>
                        <div className="flex gap-2 md:gap-4 text-xs md:text-sm">
                            <div className="flex items-center gap-1 md:gap-2">
                                <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded" />
                                <span className="text-gray-600">Yoğun</span>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2">
                                <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-200 rounded" />
                                <span className="text-gray-600">Boş</span>
                            </div>
                        </div>
                    </div>

                    <div className={isMobile ? 'h-64' : isTablet ? 'h-80' : 'h-96'}>
                        <ResponsiveBar
                            data={graphData}
                            keys={['count']}
                            indexBy="day"
                            margin={getBarMargins()}
                            padding={isMobile ? 0.3 : 0.2}
                            valueScale={{ type: 'linear' }}
                            indexScale={{ type: 'band', round: true }}
                            colors={(bar) => graphData![bar.index]?.color || '#3b82f6'}
                            borderRadius={4}
                            borderColor={{
                                from: 'color',
                                modifiers: [['darker', 0.3]],
                            }}
                            axisTop={null}
                            axisRight={null}
                            axisBottom={{
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: isMobile ? -45 : 0,
                                legend: isMobile ? '' : 'Hafta',
                                legendPosition: 'middle',
                                legendOffset: isMobile ? 45 : 50,
                                format: (value) => isMobile ? `${value}` : `${value}.`,
                            }}
                            axisLeft={{
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: 0,
                                legend: isMobile ? '' : 'Sipariş Sayısı',
                                legendPosition: 'middle',
                                legendOffset: isMobile ? -35 : -50,
                                format: (value) => Number.isInteger(value) ? value.toString() : ''
                            }}
                            enableGridY={true}
                            labelSkipWidth={12}
                            labelSkipHeight={12}
                            labelTextColor="#ffffff"
                            animate={true}
                            motionConfig="gentle"
                            enableLabel={!isMobile}
                            tooltip={({ indexValue, value, color }) => {
                                const totalReservations = graphData!.reduce((sum, item) => sum + item.count, 0);
                                const averageReservations = totalReservations / graphData!.length;
                                const maxReservations = Math.max(...graphData!.map((d) => d.count));
                                const percentage = ((value / totalReservations) * 100).toFixed(1);
                                const isAboveAverage = value > averageReservations;
                                const isPeakDay = value === maxReservations;

                                return (
                                    <div className={`bg-gradient-to-br from-white to-gray-50 shadow-2xl rounded-xl border-2 border-violet-200 ${isMobile ? 'px-3 py-2 min-w-[200px]' : 'px-5 py-4 min-w-[280px]'
                                        }`}>
                                        <div className={`flex items-center mb-2 pb-2 border-b-2 border-gray-200 ${isMobile ? 'flex-col gap-1' : 'flex-row justify-between'
                                            }`}>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`rounded-full shadow-md ring-2 ring-white ${isMobile ? 'w-4 h-4' : 'w-5 h-5'
                                                        }`}
                                                    style={{ backgroundColor: color }}
                                                />
                                                <strong className={`text-gray-800 font-bold ${isMobile ? 'text-base' : 'text-xl'
                                                    }`}>
                                                    {indexValue}
                                                </strong>
                                            </div>
                                            {isPeakDay && (
                                                <span className={`bg-yellow-100 text-yellow-800 font-semibold px-2 py-1 rounded-full ${isMobile ? 'text-xs' : 'text-xs'
                                                    }`}>
                                                    🔥 En Yoğun
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-1.5 mb-2">
                                            <div className={`flex justify-between items-center bg-blue-50 px-2 md:px-3 py-1.5 md:py-2 rounded-lg`}>
                                                <span className={`text-gray-700 font-medium ${isMobile ? 'text-xs' : 'text-sm'
                                                    }`}>
                                                    Sipariş:
                                                </span>
                                                <span className={`font-bold text-blue-700 ${isMobile ? 'text-base' : 'text-xl'
                                                    }`}>
                                                    {value}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center bg-purple-50 px-2 md:px-3 py-1.5 md:py-2 rounded-lg">
                                                <span className={`text-gray-700 font-medium ${isMobile ? 'text-xs' : 'text-sm'
                                                    }`}>
                                                    Oran:
                                                </span>
                                                <span className={`font-bold text-purple-700 ${isMobile ? 'text-sm' : 'text-md'
                                                    }`}>
                                                    %{percentage}
                                                </span>
                                            </div>

                                            {!isMobile && (
                                                <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg">
                                                    <span className="text-sm text-gray-700 font-medium">Ortalama:</span>
                                                    <span className="text-md font-semibold text-gray-700">
                                                        {averageReservations.toFixed(1)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-2">
                                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                <span>0</span>
                                                <span>{maxReservations}</span>
                                            </div>
                                            <div className={`w-full bg-gray-200 rounded-full ${isMobile ? 'h-2' : 'h-2.5'
                                                }`}>
                                                <div
                                                    className={`rounded-full transition-all duration-300 ${isMobile ? 'h-2' : 'h-2.5'
                                                        }`}
                                                    style={{
                                                        width: `${(value / maxReservations) * 100}%`,
                                                        backgroundColor: color
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {!isMobile && (
                                            <>
                                                <div className="flex justify-center mt-3 pt-3 border-t border-gray-200">
                                                    {value === 0 ? (
                                                        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                                                            ⚪ Boş Hafta
                                                        </span>
                                                    ) : isAboveAverage ? (
                                                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                                                            📈 Ortalamanın Üstünde
                                                        </span>
                                                    ) : (
                                                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                                                            📊 Ortalamanın Altında
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-2 text-center">
                                                    <p className="text-xs text-gray-500">
                                                        Toplam {totalReservations} siparişten {value} tanesi
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            }}
                        />
                    </div>

                    <div className={`mt-3 md:mt-4 grid gap-2 md:gap-4 text-center ${isMobile ? 'grid-cols-2' : 'grid-cols-3'
                        }`}>
                        <div className="bg-blue-50 rounded-lg p-2 md:p-3">
                            <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                {isMobile ? 'Toplam' : 'Toplam Sipariş'}
                            </p>
                            <p className={`font-bold text-blue-600 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                                {graphData.reduce((sum, item) => sum + item.count, 0)}
                            </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2 md:p-3">
                            <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                Ortalama{isMobile ? '' : '/Hafta'}
                            </p>
                            <p className={`font-bold text-green-600 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                                {(graphData.reduce((sum, item) => sum + item.count, 0) / graphData.length).toFixed(1)}
                            </p>
                        </div>
                        {!isMobile && (
                            <div className="bg-purple-50 rounded-lg p-3">
                                <p className="text-sm text-gray-600">En Yoğun Hafta</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {Math.max(...graphData.map((d) => d.count))}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}