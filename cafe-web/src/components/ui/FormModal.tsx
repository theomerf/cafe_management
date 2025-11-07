import { faCheckCircle, faEdit, faPlus, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type FormModalProps = {
    isModalUpdate: boolean;
    label: string;
    createFunc: () => void;
    updateFunc: () => void;
    children: React.ReactNode;
    setIsModalOpen: (isOpen: boolean) => void;
    setIsModalUpdate: (isUpdate: boolean) => void;
    reset: () => void;
}

export default function FormModal({ isModalUpdate, label, createFunc, updateFunc, children, setIsModalOpen, setIsModalUpdate, reset }: FormModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-2xl max-w-md w-full mx-4">
                <div className="flex flex-col">
                    <div className="flex flex-row justify-center bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 w-full px-8 py-6 text-white">
                        <FontAwesomeIcon icon={isModalUpdate ? faEdit : faPlus} className="mr-3 self-center text-xl" />
                        <h2 className="text-2xl font-bold">{isModalUpdate ? `${label} Bilgilerini Düzenle` : `Yeni ${label} Oluştur`}</h2>
                    </div>

                    <form
                        className="flex flex-col gap-y-4 px-8 py-6"
                        onSubmit={isModalUpdate ? updateFunc : createFunc}
                    >
                        {children}

                        <div className="flex flex-row gap-x-3 mt-6 justify-center">
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-green-500/90 to-green-600/90 hover:from-green-500 hover:to-green-600 shadow-lg flex items-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-green-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] disabled:opacity-50 disabled:cursor-not-allowed text-white"
                            >
                                <FontAwesomeIcon icon={faCheckCircle} />
                                Onayla
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsModalUpdate(false);
                                    setIsModalOpen(false);
                                    reset();
                                }}
                                className="bg-gradient-to-r from-red-500/90 to-red-600/90 hover:from-red-600 hover:to-red-700 shadow-lg flex items-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-red-300 backdrop-blur-md transition-all duration-500 hover:scale-[103%] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FontAwesomeIcon icon={faXmarkCircle} />
                                İptal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}