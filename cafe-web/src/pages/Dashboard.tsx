import { faBuilding, faChartSimple, faDollar, faGears, faMugHot, faTable, faUser } from "@fortawesome/free-solid-svg-icons";
import DashboardStatCard from "../components/ui/DashboardStatCard";
import DashboardButtonCard from "../components/ui/DashboardButtonCard";
import TitleCard from "../components/ui/TitleCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DashboardOrderGraph from "../components/dashboard/DashboardOrderGraph";
import DashboardTableGraph from "../components/dashboard/DashboardTableGraph";

export default function Dashboard() {
    return (
        <div className="flex flex-col gap-y-6">
            <TitleCard title="Dashboard" />
            <div className="grid grid-cols-4 gap-x-6">
                <DashboardStatCard title="Toplam Sipariş" value={1280} icon={faMugHot} />
                <DashboardStatCard title="Günlük Gelir" value="₺5,600" icon={faDollar} />
                <DashboardStatCard title="Aktif Masalar" value={12} icon={faTable} />
                <DashboardStatCard title="Günlük Müşteriler" value={85} icon={faUser} />
            </div>
            <div className="grid grid-cols-6 gap-x-4">
                <DashboardButtonCard to="/orders" label="Siparişleri Yönet" icon={faMugHot} color="bg-green-400" shadowColor="shadow-green-400" />
                <DashboardButtonCard to="/management" label="Kafe Yönetimi" icon={faBuilding} color="bg-blue-400" shadowColor="shadow-blue-400" />
                <DashboardButtonCard to="/statistics" label="İstatistikleri Görüntüle" icon={faChartSimple} color="bg-purple-400" shadowColor="shadow-purple-400" />
                <DashboardButtonCard to="/analytics" label="Analizleri İncele" icon={faDollar} color="bg-yellow-400" shadowColor="shadow-yellow-400" />
                <DashboardButtonCard to="/tables" label="Masaları Yönet" icon={faTable} color="bg-indigo-400" shadowColor="shadow-indigo-400" />
                <DashboardButtonCard to="/settings" label="Ayarları Değiştir" icon={faGears} color="bg-red-400" shadowColor="shadow-red-400" />
            </div>
            <div className="grid grid-cols-3 gap-x-4">
                <div className="flex flex-col items-center justify-center text-center text-gray-400 bg-white/10 backdrop-blur-lg rounded-lg shadow-lg px-8 py-8 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:rounded-t-lg before:bg-gradient-to-r before:from-cyan-500 before:to-blue-500 relative transition-all duration-500 hover:scale-[102%]">
                    <p className="text-2xl font-bold mb-auto">Bekleyen Siparişler</p>
                    <div className="w-full overflow-y-auto max-h-64">
                        <ul className="mt-4 space-y-2 w-full">
                            <li className="bg-white/20 rounded-lg p-3 flex justify-between items-center">
                                <span>Masa 5 - Cappuccino x2</span>
                                <FontAwesomeIcon icon={faMugHot} className="text-cyan-500" />
                            </li>
                            <li className="bg-white/20 rounded-lg p-3 flex justify-between items-center">
                                <span>Masa 3 - Latte x1</span>
                                <FontAwesomeIcon icon={faMugHot} className="text-cyan-500" />
                            </li>
                            <li className="bg-white/20 rounded-lg p-3 flex justify-between items-center">
                                <span>Masa 8 - Espresso x3</span>
                                <FontAwesomeIcon icon={faMugHot} className="text-cyan-500" />
                            </li>
                            <li className="bg-white/20 rounded-lg p-3 flex justify-between items-center">
                                <span>Masa 1 - Mocha x1</span>
                                <FontAwesomeIcon icon={faMugHot} className="text-cyan-500" />
                            </li>
                            <li className="bg-white/20 rounded-lg p-3 flex justify-between items-center">
                                <span>Masa 4 - Americano x2</span>
                                <FontAwesomeIcon icon={faMugHot} className="text-cyan-500" />
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center text-center text-gray-400 bg-white/10 backdrop-blur-lg rounded-lg shadow-lg px-4 pt-8 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:rounded-t-lg before:bg-gradient-to-r before:from-cyan-500 before:to-blue-500 relative transition-all duration-500 hover:scale-[102%]">
                    <p className="text-2xl font-bold">Hazırlanıyor / Teslim Edildi</p>
                    <div className="w-full">
                        <DashboardOrderGraph />
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center text-center text-gray-400 bg-white/10 backdrop-blur-lg rounded-lg shadow-lg px-4 pt-8 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:rounded-t-lg before:bg-gradient-to-r before:from-cyan-500 before:to-blue-500 relative transition-all duration-500 hover:scale-[102%]">
                    <p className="text-2xl font-bold">Masa Durumları</p>
                    <div className="w-full">
                        <DashboardTableGraph />
                    </div>
                </div>
            </div>

        </div>
    );
}