import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { FieldError } from "react-hook-form";

type InputProps = {
    register: any;
    type?: string;
    name: string;
    id?: string;
    icon?: IconProp;
    label: string;
    accept?: string;
    placeholder?: string;
    disabled?: boolean;
    error?: FieldError;
}

export default function FormInput({ register, type, name, id, icon, label, placeholder, error, disabled, accept }: InputProps) {
    return (
        <div className="flex flex-col gap-y-1">
            <label htmlFor={name} className="font-bold text-gray-500">
                {icon && <FontAwesomeIcon icon={icon} className="mr-1" />}
                {label}
            </label>
            <input type={type ?? "text"}
                {...register}
                name={name}
                disabled={disabled}
                accept={accept}
                id={id ? id : name}
                placeholder={placeholder}
                className="border-gray-200 border-2 rounded-2xl px-4 py-3 bg-white/90 transition-all duration-300 focus:border-cyan-200 focus:outline-none focus:shadow-gray-200 focus:shadow-md focus:scale-[102%] focus:bg-white placeholder:text-gray-400" />
            {error && (
                <p className="text-red-500 text-sm font-semibold">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="mr-1"/>
                    {error.message}
                </p>
            )}
        </div>
    );
}