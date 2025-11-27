import TitleCard from "../../components/ui/TitleCard";

export default function Settings() {
    return (
        <div className="flex flex-col gap-y-6">
            <TitleCard title="Ayarlar" />
            <div className="h-[500px] bg-white border border-gray-200 backdrop-blur-lg rounded-lg shadow-lg flex items-center justify-center">
            </div>
        </div>
    );
}