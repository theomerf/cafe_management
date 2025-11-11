import { useForm } from "react-hook-form";
import FormInput from "../../components/form/FormInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faLock, faRightToBracket, faTriangleExclamation, faUser } from "@fortawesome/free-solid-svg-icons";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { loginUser } from "./accountSlice";
import { ErrorDisplay } from "../../components/ui/ErrorDisplay";
import { ClipLoader } from "react-spinners";
import { useState } from "react";

export default function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm<{
        userName: string;
        password: string;
        rememberMe: boolean;
    }>();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const dispatch = useAppDispatch();
    const { status, error } = useAppSelector((state) => state.account);

    return (
        <div className="flex flex-1 h-screen bg-blue-50 justify-center items-center">
            <div className="flex flex-col bg-blue-100 rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-24 py-6 bg-gradient-to-r backdrop-blur-md from-blue-400/90 via-blue-500/90 to-blue-600/90 text-center">
                    <p className="text-white font-bold text-2xl">Lütfen giriş yapın!</p>
                </div>
                <div >
                    <form method="POST" onSubmit={handleSubmit(async (data: any) => await dispatch(loginUser(data)))}>
                        <div className="mt-4 mx-2 flex justify-center ">
                            {error && <ErrorDisplay error={error} />}
                        </div>
                        <div className="flex flex-col gap-y-2 px-6 py-4">
                            <FormInput
                                label="Kullanıcı Adı"
                                name="userName"
                                error={errors.userName}
                                icon={faUser}
                                placeholder="Kullanıcı adınızı giriniz."
                                register={{
                                    ...register("userName", {
                                        required: "Kullanıcı adı gereklidir.",
                                        min: { value: 3, message: "Kullanıcı adı en az 3 karakter olmalıdır." }
                                    })
                                }}
                            />

                            <div className="flex flex-col gap-y-1">
                                <label htmlFor="password" className="font-bold text-gray-500">
                                    <FontAwesomeIcon icon={faLock} className="mr-1" />
                                    Şifre
                                </label>
                                <div className="flex">
                                    <input type={isPasswordVisible ? "text" : "password"}
                                        {...register("password", {
                                            required: "Şifre gereklidir.",
                                            min: { value: 6, message: "Şifre en az 6 karakter olmalıdır." }
                                        })}
                                        name="password"
                                        id="password"
                                        placeholder="Şifrenizi giriniz."
                                        className="w-full rounded-r-none border-gray-200 border-2 !border-r-0 rounded-2xl px-4 py-3 bg-white/90 transition-all duration-300 focus:border-cyan-200 focus:outline-none focus:shadow-gray-200 focus:shadow-md focus:scale-[102%] focus:bg-white placeholder:text-gray-400" />
                                    <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} title={isPasswordVisible ? "Gizle" : "Göster"} className="cursor-pointer border-2 border-[#e5e7eb] border-l-0 rounded-tr-lg rounded-br-lg bg-blue-400 text-white px-4 text-lg py-2 transition-all duration-300 hover:bg-blue-500 hover:scale-105">
                                        <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} />
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-sm font-semibold">
                                        <FontAwesomeIcon icon={faTriangleExclamation} className="mr-1" />
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-row gap-x-2 mt-3">
                                <label htmlFor="rememberMe" className="text-gray-500 font-bold cursor-pointer">
                                    Beni Hatırla
                                </label>
                                <input type="checkbox" id="rememberMe" {...register("rememberMe")} className="w-5 h-5 self-center accent-blue-500" />
                            </div>

                            <button type="submit" disabled={status === "pending"} className="w-full rounded-xl bg-gradient-to-r backdrop-blur-md from-blue-400/90 via-blue-500/90 hover:to-blue-700/90 shadow-blue-300 shadow-lg text-white font-semibold text-lg mt-4 py-3 transition-all duration-500 hover:scale-[103%] hover:text-xl hover:from-blue-500/90 hover:via-blue-600/90 to-blue-600/90">
                                {status === "pending" ? (
                                    <ClipLoader size={20} className="justify-center align-middle text-center" color="#fff" />
                                ) : (
                                    <span>
                                        <FontAwesomeIcon icon={faRightToBracket} className="mr-2" />
                                        Giriş Yap
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}