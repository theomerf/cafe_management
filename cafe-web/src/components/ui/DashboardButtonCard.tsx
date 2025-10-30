import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

type DashboardButtonCardProps = {
    to: string;
    label: string;
    icon: IconProp;
    color?: string;
    shadowColor?: string;
}

export default function DashboardButtonCard({ to, label, icon, color, shadowColor }: DashboardButtonCardProps) {
    return (
        <Link to={to} className={`${color} ${shadowColor} flex flex-col items-center group justify-center text-center text-white backdrop-blur-sm rounded-lg shadow-lg px-4 py-8 transition-all duration-500 hover:scale-105`}>
            <FontAwesomeIcon icon={icon} className="text-[40px] mb-2 group-hover:scale-110 duration-500 group-hover:rotate-6" />
            <p className="text-3xl font-semibold group-hover:scale-[103%] duration-500">{label}</p>
        </Link>
    );
}