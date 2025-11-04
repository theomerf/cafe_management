import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

type SidebarButtonProps = {
    label: string;
    icon: IconProp;
    to: string;
    hasDropdown?: boolean;
    children?: React.ReactNode;
}

export default function SidebarButton({ label, icon, to, hasDropdown, children }: SidebarButtonProps) {
    if (hasDropdown) {
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);

        return (
            <>
                <NavLink to={to} className={({ isActive }) => `${isActive ? 'from-blue-600/90 to-cyan-600/90 hover:from-blue-700 hover:to-cyan-800 shadow-xl scale-[102%]' : 'from-blue-400/90 to-cyan-500/90 hover:from-blue-500 hover:to-cyan-600 shadow-lg'} flex group px-4 py-3 font-semibold rounded-xl bg-gradient-to-r  shadow-blue-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] hover:bg-gradient-to-r `}>
                    <FontAwesomeIcon icon={icon} className="mr-2 group-hover:scale-125 duration-500 self-center" />
                    {label}
                    {hasDropdown && (
                        <FontAwesomeIcon icon={faChevronDown} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }} className={`${isDropdownOpen ? 'rotate-180' : ''} ml-auto self-center font-bol text-xl`} />
                    )}
                </NavLink>
                <AnimatePresence mode="wait">
                    {isDropdownOpen && (
                        <motion.div initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="flex flex-col gap-y-2 px-2">
                            {children}
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        );
    }
    else {
        return (
            <NavLink to={to} className={({ isActive }) => `${isActive ? 'from-blue-600/90 to-cyan-600/90 hover:from-blue-700 hover:to-cyan-800 shadow-xl scale-[102%]' : 'from-blue-400/90 to-cyan-500/90 hover:from-blue-500 hover:to-cyan-600 shadow-lg'} group px-4 py-3 font-semibold rounded-xl bg-gradient-to-r  shadow-blue-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] hover:bg-gradient-to-r `}>
                <FontAwesomeIcon icon={icon} className="mr-2 group-hover:scale-125 duration-500" />
                {label}
            </NavLink>
        );
    }
}