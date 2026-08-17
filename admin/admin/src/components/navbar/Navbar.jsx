import React from 'react'
import { useState } from 'react';
import {
    Menu, LayoutDashboard,
    PackagePlus,
    ClipboardList,
    Boxes,
    UserCircle2
} from 'lucide-react'
import './Navbar.css'

const Navbar = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
     const closeSidebar = () => setSidebarOpen(false);
    return (
        <>

            <header className="header ">
                <div className="header__left">
                    <button
                        className="header__menu-btn"
                        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                        aria-expanded={sidebarOpen}
                        onClick={() => setSidebarOpen((prev) => !prev)}
                    >
                        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>

                    <span className="header__logo">
                        Humis<span className="header__logo-accent">.</span>
                    </span>
                </div>

                <button className="header__profile" aria-label="Profile">
                    <UserCircle2 size={26} strokeWidth={1.8} />
                </button>
            </header>
        </>
    )
}

export default Navbar