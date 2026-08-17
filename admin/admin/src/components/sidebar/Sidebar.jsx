import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
    LayoutDashboard,
    PackagePlus,
    ClipboardList,
    Boxes,
    UserCircle2,
    Menu,
    X,
} from "lucide-react";
import "./Sidebar.css";

const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/add-product", label: "Add Product", icon: PackagePlus },
    { to: "/orders", label: "Orders", icon: ClipboardList },
    { to: "/productlist", label: "Product Stock", icon: Boxes },
];

const Sidebar = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const closeSidebar = () => setSidebarOpen(false);
    const [fixedsidebar, setFixedSidebar] = useState(false)

  


    return (
        <div className="layout">

            <div className="layout__body">
                {/* Backdrop — mobile only */}
                {sidebarOpen && (
                    <div className="sidebar__backdrop" onClick={closeSidebar} aria-hidden="true" />
                )}

                {/* Sidebar */}
                <aside className={`sidebar${sidebarOpen ? " sidebar--open" : ""}`}>
                    <nav className="sidebar__nav">
                        {navItems.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                onClick={closeSidebar}
                                className={({ isActive }) =>
                                    `sidebar__link${isActive ? " sidebar__link--active" : ""}`
                                }
                            >
                                <Icon size={20} strokeWidth={2} />
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </aside>

                {/* Page content */}
                <main className="layout__content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Sidebar;