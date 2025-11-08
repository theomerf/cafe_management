import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import type { RootState } from "../store/store";
import { toast } from "react-toastify";
import { useEffect } from "react";

export default function ProtectedRoute() {
    const { user, status } = useSelector((state: RootState) => state.account);

    useEffect(() => {
        if (status != "pending") {
            if (!user) {
                toast.warning("Bu sayfayı görüntülemek için giriş yapmalısınız.");
            }
        }
    }, [user]);

    if (!user && status != "pending") {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}