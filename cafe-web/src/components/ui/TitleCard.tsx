type TitleCardProps = {
    title: string;
}

export default function TitleCard({ title }: TitleCardProps) {
    return (
        <div className="w-full bg-gradient-to-r from-blue-400/90 to-cyan-500/90 shadow-blue-300 shadow-lg backdrop-blur-md rounded-lg px-4 py-3 text-white">
            <p className="text-3xl font-semibold">{title}</p>
        </div>
    );
}