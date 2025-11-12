import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import type { RootState } from "../store/store";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

export default function ProtectedRoute() {
    const { user } = useSelector((state: RootState) => state.account);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        const checkTime = setTimeout(() => {
            setHasChecked(true);
            if (!user) {
                toast.warning("Bu sayfayı görüntülemek için giriş yapmalısınız.");
            }
        }, 100);

        return () => {
            clearTimeout(checkTime);
        }
    }, [user]);

    if (!hasChecked) {
        return (
            <div className="w-screen h-screen flex self-center justify-center items-center pt-4">
                <ClipLoader size={40} color="#06b6d4" />
            </div>
        );
    }
    if (hasChecked && !user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}