import { faBuilding, faChartSimple, faGears, faHome, faMagnifyingGlassChart, faMugHot } from "@fortawesome/free-solid-svg-icons";
import SidebarButton from "../ui/SidebarButton";

export default function Sidebar() {
    return (
        <nav className="flex flex-col h-[calc(100vh-4rem)] z-[101] bg-cyan-50/10 rounded-r-md text-white shadow-lg border-gray-200 border-r backdrop-blur-md overflow-hidden">
            <div className="flex flex-col h-full">
                <div className="flex flex-col overflow-y-auto gap-y-4 px-2 py-6 scrollbar-thin scrollbar-thumb-cyan-400 scrollbar-track-blue-200 hover:scrollbar-thumb-cyan-500">
                    <SidebarButton label="Dashboard" icon={faHome} to="/" />
                    <SidebarButton label="Siparişler" icon={faMugHot} to="/orders" />
                    <SidebarButton label="Kafe Yönetimi" icon={faBuilding} to="/management" />
                    <SidebarButton label="İstatistikler" icon={faChartSimple} to="/statistics" />
                    <SidebarButton label="Analizler" icon={faMagnifyingGlassChart} to="/analytics" />
                    <SidebarButton label="Ayarlar" icon={faGears} to="/settings" />
                </div>
                <div className="mt-auto bg-gray-100 text-gray-600 flex flex-col gap-y-2 text-center py-6">
                    <p>&copy; Kafe Yönetimi 2025</p>
                    <p className="bg-gray-200 w-fit rounded-lg px-2 self-center">v1.0.0</p>
                </div>
            </div>
        </nav>
    );
}