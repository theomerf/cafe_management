import { ResponsiveLine } from '@nivo/line'
import type { OrderStats } from '../../types/order'
import { useState, useEffect } from 'react'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { ClipLoader } from 'react-spinners'

interface LineData {
    id: string
    color?: string
    data: { x: string; y: number }[]
}

type HourlyOrderDensityGraphProps = {
    hourlyDensityStats: OrderStats | undefined
    isLoading: boolean
    error: Error | null
}

export default function HourlyOrderDensityGraph({ hourlyDensityStats, isLoading, error }: HourlyOrderDensityGraphProps) {
    const [graphData, setGraphData] = useState<LineData | undefined>()
    const { up } = useBreakpoint()
    const isMobile = !up.md
    const isTablet = up.md && !up.lg

    useEffect(() => {
        if (!hourlyDensityStats) return

        const labels = hourlyDensityStats.labels.map((label) => label.toString());
        const counts = hourlyDensityStats.totalCounts.map((count) => count);

        const line: LineData = {
            id: "Saatlik Sipariş Yoğunluğu",
            color: "#3b82f6",
            data: labels.map((label, index) => ({ x: label, y: counts[index] }))
        }

        setGraphData(line)
    }, [hourlyDensityStats])

    const getMargins = () => {
        if (isMobile) return { top: 10, right: 10, bottom: 60, left: 40 }
        if (isTablet) return { top: 15, right: 20, bottom: 70, left: 50 }
        return { top: 20, right: 30, bottom: 80, left: 60 }
    }

    const currentYear = new Date().toLocaleDateString('tr-TR', { year: 'numeric' });

    const total = graphData?.data.reduce((sum, d) => sum + d.y, 0) ?? 0
    const avg = graphData ? total / graphData.data.length : 0
    const max = graphData ? Math.max(...graphData.data.map((d) => d.y)) : 0

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

            {graphData && graphData.data.length > 0 && (
                <div className="p-4 md:p-6">
                    <div className={`flex items-center mb-3 md:mb-4 ${isMobile ? "flex-col gap-2" : "flex-row justify-between"}`}>
                        <h2 className={`font-semibold text-violet-400 ${isMobile ? "text-lg text-center" : "text-2xl"}`}>
                            {currentYear} - Saatlik Sipariş Yoğunluğu Grafiği
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

                    <div className={isMobile ? "h-64" : isTablet ? "h-80" : "h-96 overflow-visible"}>
                        <ResponsiveLine
                            data={[graphData]}
                            margin={getMargins()}
                            curve="monotoneX"
                            colors={[graphData.color || "#3b82f6"]}
                            lineWidth={3}
                            useMesh={true}
                            pointSize={10}
                            pointColor={{ from: "color" }}
                            pointBorderWidth={2}
                            pointBorderColor={{ from: "color", modifiers: [["darker", 0.3]] }}
                            axisTop={null}
                            axisRight={null}
                            xScale={{ type: "point" }}
                            axisBottom={{
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: isMobile ? -45 : 0,
                                legend: isMobile ? "" : "Ay",
                                legendPosition: "middle",
                                legendOffset: isMobile ? 45 : 50
                            }}
                            axisLeft={{
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: 0,
                                legend: isMobile ? "" : "Sipariş Sayısı",
                                legendPosition: "middle",
                                legendOffset: isMobile ? -35 : -50
                            }}
                            enableGridY={true}
                            motionConfig="gentle"
                            tooltip={({ point }) => {
                                const value = point.data.y
                                const day = point.data.x
                                const percentage = ((value / total) * 100).toFixed(1)

                                const isAboveAvg = value > avg
                                const isPeak = value === max

                                return (
                                    <div className="bg-white shadow-xl border border-violet-200 rounded-lg p-3 min-w-[240px]">
                                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
                                            <strong className="text-gray-800">
                                                {day}
                                            </strong>
                                            {isPeak && (
                                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs">
                                                    🔥 En Yüksek
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-700 flex justify-between">
                                                <span>Sipariş:</span>
                                                <span className="font-semibold text-blue-700">{value}</span>
                                            </p>
                                            <p className="text-sm text-gray-700 flex justify-between">
                                                <span>Oran:</span>
                                                <span className="font-semibold text-purple-700">%{percentage}</span>
                                            </p>
                                            {!isMobile && (
                                                <p className="text-sm text-gray-700 flex justify-between">
                                                    <span>Ortalama:</span>
                                                    <span className="font-semibold">{avg.toFixed(1)}</span>
                                                </p>
                                            )}
                                        </div>
                                        {!isMobile && (
                                            <div className="mt-2 text-center">
                                                {value === 0 ? (
                                                    <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                                                        ⚪ Boş Ay
                                                    </span>
                                                ) : isAboveAvg ? (
                                                    <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                                                        📈 Ortalamanın Üstünde
                                                    </span>
                                                ) : (
                                                    <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                                                        📊 Ortalamanın Altında
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            }}
                        />
                    </div>

                    <div className={`mt-3 md:mt-4 grid gap-2 md:gap-4 text-center ${isMobile ? "grid-cols-2" : "grid-cols-3"}`}>
                        <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-gray-600 text-sm">Toplam Saatlik Sipariş</p>
                            <p className="font-bold text-blue-600 text-2xl">{total}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-gray-600 text-sm">Ortalama/Saat</p>
                            <p className="font-bold text-green-600 text-2xl">{avg.toFixed(1)}</p>
                        </div>
                        {!isMobile && (
                            <div className="bg-purple-50 rounded-lg p-3">
                                <p className="text-sm text-gray-600">En Yoğun Saat</p>
                                <p className="text-2xl font-bold text-purple-600">{max}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
