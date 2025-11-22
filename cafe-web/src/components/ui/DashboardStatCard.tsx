import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type LucideProps, TrendingUp, TrendingDown } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import React, { useEffect } from "react";
import { ClipLoader } from "react-spinners";

type DashboardCardProps = {
    title: string;
    value: string | number;
    lastValue?: string | number;
    isLoading: boolean;
    icon?: IconProp;
    lucideIcon?: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
};

export default function DashboardStatCard({ title, value, lastValue, isLoading, icon, lucideIcon }: DashboardCardProps) {
    const [percentageChange, setPercentageChange] = React.useState<number | null>(null);
    useEffect(() => {
        if (!isLoading && lastValue !== undefined) {
            if (Number(lastValue) === 0) {
                setPercentageChange(100);
                return;
            }
            const change = ((Number(value) - Number(lastValue)) / Number(lastValue)) * 100;
            setPercentageChange(change);
        }
    }, [isLoading, value, lastValue]);


    return (
        <div className="flex flex-col items-center justify-center text-center text-gray-400 bg-white/10 backdrop-blur-lg rounded-lg shadow-lg px-4 pt-8 pb-4 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:rounded-t-lg before:bg-gradient-to-r before:from-cyan-500 before:to-blue-500 relative transition-all duration-500 hover:scale-105">
            {icon && <FontAwesomeIcon icon={icon} className="text-cyan-500 text-[40px] mb-2" />}
            {lucideIcon && React.createElement(lucideIcon, { size: "50", className: "text-cyan-500 text-[40px] mb-2" })}
            <p className="text-3xl font-semibold ">{title}</p>
            {isLoading ? (
                <div className="flex justify-center items-center pt-4">
                    <ClipLoader size={40} color="#06b6d4" />
                </div>
            ) : (
                <div className="flex flex-row gap-x-1 items-center justify-center">
                    <p className="text-2xl mt-2 font-semibold">{value}</p>
                    {lastValue && percentageChange && (
                        percentageChange > 0 ? (
                            <TrendingUp size={24} className=" text-green-500 ml-2" />
                        ) : (
                            <TrendingDown size={24} className="text-red-500 ml-2" />
                        )
                    )}
                    <p>{lastValue && percentageChange && (<p className={`${percentageChange > 0 ? 'text-green-500' : 'text-red-500'} font-semibold`}>{percentageChange}%</p>)}</p>
                </div>
            )}
        </div>
    );
}