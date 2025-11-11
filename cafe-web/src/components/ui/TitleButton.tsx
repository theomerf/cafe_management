import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

type TitleButtonProps = {
    isLoading: boolean;
    onClick: () => void;
    label: string;
    icon?: IconProp;
    fromColor?: string;
    toColor?: string;
    hoverFromColor?: string;
    hoverToColor?: string;
    shadowColor?: string;
}

export default function TitleButton({ isLoading, onClick, label, icon, fromColor, toColor, hoverFromColor, hoverToColor, shadowColor }: TitleButtonProps) {
    return (
        <button onClick={onClick} disabled={isLoading} className={`bg-gradient-to-r ${fromColor ?? "from-green-400/90"} ${toColor ?? "to-green-500/90"} ${hoverFromColor ?? "hover:from-green-500"} ${hoverToColor ?? "hover:to-green-600"} shadow-lg flex group px-4 py-3 font-semibold rounded-xl shadow-${shadowColor ?? "green-300"} backdrop-blur-md transition-all duration-500 hover:scale-[103%] disabled:opacity-50 disabled:cursor-not-allowed`}>
            <FontAwesomeIcon icon={icon ?? faPlusCircle} className="mr-2 self-center group-hover:scale-110 duration-500 transition-all" />
            {label}
        </button>
    )
}