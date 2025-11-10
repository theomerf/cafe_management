type TitleCardProps = {
    title: string;
    children?: React.ReactNode;
}

export default function TitleCard({ title, children }: TitleCardProps) {
    return (
        <div className="w-full flex bg-gradient-to-r from-blue-400/90 to-cyan-500/90 shadow-blue-300 shadow-lg backdrop-blur-md rounded-lg px-4 py-3 text-white">
            <p className="text-3xl font-semibold self-center">{title}</p>
            <div className="ml-auto flex flex-row gap-x-2">
                {children}
            </div>
        </div>
    );
}