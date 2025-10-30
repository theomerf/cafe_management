import { ResponsivePie } from "@nivo/pie";
import { useBreakpoint } from "../../hooks/useBreakpoint";

interface PieData {
    id: string;
    label: string;
    value: number;
    color?: string;
}

export default function DashboardTableGraph() {
    const { up } = useBreakpoint();
    const isMobile = !up.md;
    const isTablet = up.md && !up.lg;

    const orderStatuses: PieData[] = [
        { id: "Dolu", label: "Dolu", value: 12, color: "#f55742" },
        { id: "Boş", label: "Boş", value: 8, color: "#48bb78" },
    ];

    const getPieMargins = () => {
        if (isMobile) return { top: 20, right: 20, bottom: 60, left: 20 };
        if (isTablet) return { top: 30, right: 40, bottom: 70, left: 40 };
        return { top: 40, right: 80, bottom: 80, left: 80 };
    };
    return (
        <div style={{ height: isMobile ? '350px' : isTablet ? '450px' : '300px' }}>
            <ResponsivePie
                data={orderStatuses}
                margin={getPieMargins()}
                innerRadius={isMobile ? 0.4 : 0.5}
                padAngle={0.7}
                cornerRadius={3}
                colors={{ datum: 'data.color' }}
                activeOuterRadiusOffset={isMobile ? 4 : 8}
                borderWidth={1}
                theme={{
                    labels: {
                        text: {
                            fontSize: isMobile ? 10 : 12,
                            fontWeight: 600,
                        },
                    },
                }}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                arcLinkLabelsSkipAngle={isMobile ? 15 : 10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={isMobile ? 15 : 10}
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
                                        Masa Sayısı:
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
    );
}