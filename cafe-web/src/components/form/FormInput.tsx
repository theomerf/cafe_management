import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type InputProps = {
    register: any;
    type?: string;
    name: string;
    id?: string;
    icon?: IconProp;
    label: string;
}

export default function FormInput({ register, type, name, id, icon, label }: InputProps) {
    return (
        <div className="flex flex-col gap-y-1">
            <label htmlFor={name} className="font-bold text-gray-500">
                {icon && <FontAwesomeIcon icon={icon} className="mr-1" />}
                {label}
            </label>
            <input type={type ?? "text"}
                {...register}
                name={name}
                id={id ? id : name}
                className="border-gray-200 border-2 rounded-lg px-3 py-2 bg-white/90 transition-all duration-300 focus:border-cyan-200 focus:outline-none focus:shadow-gray-200 focus:shadow-md focus:scale-[102%] focus:bg-white" />
        </div>
    );
}