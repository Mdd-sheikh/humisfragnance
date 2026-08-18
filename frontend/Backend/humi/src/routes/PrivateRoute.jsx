import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import {toast} from "react-toastify";

const PrivateRoute = ({ setIsAuthOpen }) => {
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            setIsAuthOpen(true);
            toast.error("Please log in to access this page.", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        }
    }, [token]);

    if (!token) {
        return null;
    }

    return <Outlet />;
};

export default PrivateRoute;