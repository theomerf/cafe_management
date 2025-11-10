import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

type TitleButtonProps = {
    isLoading: boolean;
    onClick: () => void;
    label: string;
    icon?: IconProp;
    color?: string;
}

export default function TitleButton({ isLoading, onClick, label, icon, color }: TitleButtonProps) {
    return (
        <button onClick={onClick} disabled={isLoading} className={`bg-gradient-to-r from-${color ?? "green"}-400/90 to-${color ?? "green"}-500/90 hover:from-${color ?? "green"}-500 hover:to-${color ?? "green"}-600 shadow-lg flex group px-4 py-3 font-semibold rounded-xl shadow-${color ?? "green"}-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] disabled:opacity-50 disabled:cursor-not-allowed`}>
            <FontAwesomeIcon icon={icon ?? faPlusCircle} className="mr-2 self-center group-hover:scale-110 duration-500 transition-all" />
            {label}
        </button>
    )
}