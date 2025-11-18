import { useEffect, useState } from "react";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { ResponsivePie } from "@nivo/pie";
import { ClipLoader } from "react-spinners";
import type { CategoryStats } from "../../types/category";

interface PieData {
    id: string;
    label: string;
    value: number;
    color?: string;
}

type TopSoldCategoriesGraphProps = {
    topSoldStats: CategoryStats[] | undefined
    isLoading: boolean
    error: Error | null
}

export default function TopSoldCategoriesGraph({ topSoldStats, isLoading, error }: TopSoldCategoriesGraphProps) {
    const { up } = useBreakpoint();
    const isMobile = !up.md;
    const isTablet = up.md && !up.lg;
    const colors: string[] = ["#facc15", "#60a5fa", "#f87171", "#4ade80", "#fb923c"];
    const [topProducts, setTopProducts] = useState<PieData[]>();

    useEffect(() => {
        if (topSoldStats) {
            setTopProducts([
                ...topSoldStats.map((product, index) => ({
                    id: product.name,
                    label: product.name,
                    value: product.count,
                    color: colors[index]
                })),
            ]);
        }
    }, [topSoldStats]);

    const getPieMargins = () => {
        if (isMobile) return { top: 20, right: 20, bottom: 60, left: 20 };
        if (isTablet) return { top: 30, right: 40, bottom: 70, left: 40 };
        return { top: 40, right: 80, bottom: 80, left: 80 };
    };
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

            {topProducts && topProducts.length > 0 && (
                <div className="p-4 md:p-6">
                    <div className={`flex items-center mb-3 md:mb-4 ${isMobile ? "flex-col gap-2" : "flex-row justify-between"}`}>
                        <h2 className={`font-semibold text-violet-400 ${isMobile ? "text-lg text-center" : "text-2xl"}`}>
                            En Çok Satılan Kategoriler
                        </h2>
                    </div>
                    <div style={{ height: isMobile ? '350px' : isTablet ? '380px' : '420px' }}>
                        <ResponsivePie
                            data={topProducts}
                            margin={getPieMargins()}
                            innerRadius={isMobile ? 0.4 : 0.5}
                            padAngle={0.7}
                            cornerRadius={3}
                            theme={{
                                labels: {
                                    text: {
                                        fontSize: isMobile ? 10 : 12,
                                        fontWeight: 600,
                                    },
                                },
                            }}
                            colors={{ datum: 'data.color' }}
                            activeOuterRadiusOffset={isMobile ? 4 : 8}
                            borderWidth={1}
                            borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                            arcLinkLabelsSkipAngle={isMobile ? 15 : 10}
                            arcLinkLabelsTextColor="#333333"
                            arcLinkLabelsThickness={1}
                            arcLinkLabelsColor={{ from: 'color' }}
                            arcLabelsSkipAngle={isMobile ? 15 : 10}
                            arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                            enableArcLinkLabels={!isMobile}
                            tooltip={({ datum }) => {
                                return (
                                    <div className={`bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-xl border-2 border-blue-100 ${isMobile ? 'px-3 py-2 min-w-[160px]' : 'px-5 py-4 min-w-[200px]'
                                        }`}>
                                        <div className={`flex items-center gap-2 mb-2 pb-2 border-b border-gray-200 ${isMobile ? 'flex-col items-start' : 'flex-row'
                                            }`}>
                                            <div
                                                className={`rounded-full shadow-md ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`}
                                                style={{ backgroundColor: datum.color }}
                                            />
                                            <strong className={`text-gray-800 font-bold ${isMobile ? 'text-base' : 'text-xl'
                                                }`}>
                                                {datum.label}
                                            </strong>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <span className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                                    Sipariş Sayısı:
                                                </span>
                                                <span className={`font-bold text-cyan-600 ${isMobile ? 'text-base' : 'text-lg'
                                                    }`}>
                                                    {datum.value}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}