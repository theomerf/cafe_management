import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink } from "react-router-dom";

type SidebarButtonProps = {
    label: string;
    icon: IconProp;
    to: string;
}

export default function SidebarButton({ label, icon, to }: SidebarButtonProps) {
    return (
        <NavLink to={to} className={({ isActive }) => `${isActive ? 'from-blue-600/90 to-cyan-600/90 hover:from-blue-700 hover:to-cyan-800 shadow-xl scale-[102%]' : 'from-blue-400/90 to-cyan-500/90 hover:from-blue-500 hover:to-cyan-600 shadow-lg'} group px-4 py-3 font-semibold rounded-xl bg-gradient-to-r  shadow-blue-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] hover:bg-gradient-to-r `}>
            <FontAwesomeIcon icon={icon} className="mr-2 group-hover:scale-125 duration-500" />
            {label}
        </NavLink>
    );
}