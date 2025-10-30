import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type DashboardCardProps = {
    title: string;
    value: string | number;
    icon: IconProp; 
};

export default function DashboardStatCard({ title, value, icon }: DashboardCardProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center text-gray-400 bg-white/10 backdrop-blur-lg rounded-lg shadow-lg px-4 py-8 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:rounded-t-lg before:bg-gradient-to-r before:from-cyan-500 before:to-blue-500 relative transition-all duration-500 hover:scale-105">
            <FontAwesomeIcon icon={icon} className="text-cyan-500 text-[40px] mb-2"/>
            <p className="text-3xl font-semibold ">{title}</p>
            <p className="text-2xl font-semibold">{value}</p>
        </div>
    );
}