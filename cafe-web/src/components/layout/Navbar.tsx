import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { faBarsProgress, faBell, faChevronDown, faGears, faMugHot, faRightFromBracket, faUser } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Navbar() {
    const { up } = useBreakpoint();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener("click", handleClickOutside);
        }

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [isDropdownOpen]);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    }

    return (
        <nav className="sticky top-0 left-0 right-0 z-[101] rounded-b-md bg-gradient-to-r from-blue-400 to-cyan-500 shadow-blue-300 shadow-md border-b border-white/20 backdrop-blur-lg">
            <div className="flex justify-between items-center w-full px-6 py-4">
                <div className="flex flex-row gap-x-2 text-white text-2xl">
                    <FontAwesomeIcon icon={faMugHot} className="text-3xl text-amber-700 transition-all duration-300 hover:scale-110 hover:rotate-12" />
                    <h1 className="font-bold">Kafe Yönetimi</h1>
                </div>
                <div className="flex flex-row gap-x-2 ml-auto">
                    <Link to="/notifications" title="Bildirimler" aria-label="Bildirimler" className="flex justify-center text-white text-xl rounded-full border border-cyan-400 bg-cyan-400 w-10 h-10 text-center shadow-md shadow-cyan-200 transition-all duration-500 hover:scale-110 hover:bg-cyan-500 hover:shadow-cyan-400 hover:text-xl">
                        <FontAwesomeIcon icon={faBell} className="self-center" />
                    </Link>
                    <div ref={dropdownRef}>
                        <button onClick={toggleDropdown} className="flex flex-row gap-x-3" id="dropdownButton">
                            <img src="https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png" className="w-10 h-10 rounded-full self-center border border-cyan-400 bg-cyan-400 shadow-md shadow-cyan-200 transition-all duration-500 hover:scale-110 hover:bg-cyan-500 hover:shadow-cyan-400" />
                            <div className="flex flex-row gap-x-3">
                                <p className="self-center text-lg font-semibold text-white">Admin</p>
                                <FontAwesomeIcon icon={faChevronDown} className={`self-center text-white transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                            </div>
                        </button>
                        <AnimatePresence mode="wait">
                            {isDropdownOpen && <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                id="dropdownMenu"
                                className="z-10 absolute top-[100%] right-4 rounded-br-lg rounded-bl-lg shadow-lg border border-gray-200 bg-white p-4 flex flex-col gap-y-2">
                                <div className="flex flex-col gap-y-1 border-b-2 border-violet-200 pb-4">
                                    <img src="https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png" className="w-14 h-14 rounded-full self-center border border-cyan-400 bg-cyan-400 shadow-md shadow-cyan-200" />
                                    <p className="self-center text-lg font-semibold text-black">Admin</p>
                                </div>
                                <div className="flex flex-col gap-y-4 pt-4 px-2">
                                    <Link to="/account" onClick={() => setIsDropdownOpen(false)} className="font-semibold text-white w-full text-center px-8 py-2 rounded-2xl self-center border border-cyan-400 bg-cyan-400 shadow-md shadow-cyan-200 transition-all duration-500 hover:scale-105 hover:bg-cyan-500 hover:shadow-cyan-400">
                                        <FontAwesomeIcon icon={faGears} className="lg:mr-2" />
                                        {up.lg && "Ayarlar"}
                                    </Link>
                                    <button className="font-semibold text-white w-full text-center px-8 py-2 rounded-2xl self-center border border-red-400 bg-red-400 shadow-md shadow-red-200 transition-all duration-500 hover:scale-105 hover:bg-red-500 hover:shadow-red-400">
                                        <FontAwesomeIcon icon={faRightFromBracket} className="lg:mr-2" />
                                        {up.lg && "Çıkış Yap"}
                                    </button>
                                </div>
                            </motion.div>
                            }
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </nav>
    );
}