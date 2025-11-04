import { faLayerGroup, faPizzaSlice, faTable, faUser, faUserGear } from "@fortawesome/free-solid-svg-icons";
import DashboardStatCard from "../../components/ui/DashboardStatCard";
import TitleCard from "../../components/ui/TitleCard";
import DashboardButtonCard from "../../components/ui/DashboardButtonCard";

export default function Management() {
    return (
        <div className="flex flex-col gap-y-6">
            <TitleCard title="Kafe Yönetimi"/>
            <div className="grid grid-cols-4 gap-x-6">
                <DashboardStatCard title="Toplam Kullanıcı" value="3" isLoading={false} icon={faUser} />
                <DashboardStatCard title="Toplam Ürün" value="120" isLoading={false} icon={faPizzaSlice} />
                <DashboardStatCard title="Toplam Kategori" value="10" isLoading={false} icon={faLayerGroup} />
                <DashboardStatCard title="Toplam Masa" value="20" isLoading={false} icon={faTable} />
            </div>
            <div className="grid grid-cols-6 gap-x-2">
                <DashboardButtonCard to="/management/accounts" label="Kullanıcıları Yönet" icon={faUserGear} color="bg-green-400" shadowColor="shadow-green-400" />
                <DashboardButtonCard to="/management/products" label="Ürünleri Yönet" icon={faPizzaSlice} color="bg-blue-400" shadowColor="shadow-blue-400" />
                <DashboardButtonCard to="/management/categories" label="Kategorileri Yönet" icon={faLayerGroup} color="bg-purple-400" shadowColor="shadow-purple-400" />
                <DashboardButtonCard to="/management/tables" label="Masaları Yönet" icon={faTable} color="bg-yellow-400" shadowColor="shadow-yellow-400" />
            </div>
        </div>
    );
}