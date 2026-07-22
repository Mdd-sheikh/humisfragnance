import { useContext, useEffect, useState } from "react";
import { Link, Links, NavLink, useNavigate } from "react-router-dom";

import {
    FiMenu,
    FiX,
    FiShoppingBag,
    FiHeart,
    FiSearch,
    FiUser,
    FiLogOut,
    FiPackage,
    FiCreditCard,
    FiChevronDown,
    FiSettings
} from "react-icons/fi";

import "./Navbar.css";
import { Assets } from "../../assets/Assests";
import { Context } from "../../context/Context";

function Navbar({ setIsAuthOpen, isAuthopen }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const { cartCount, token, handleLogout } = useContext(Context)
    const navigate = useNavigate();



    // for search item
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const toggleSearch = () => {
        setSearchOpen((prev) => !prev);
    };

    // handle logout button click
    const handleLogoutClick = () => {
        handleLogout();
        setProfileOpen(false);
        navigate("/");
    };



    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            console.log("Searching for:", searchQuery);
            // navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
            setSearchOpen(false);
            setSearchQuery("");
        }
    };
    //----------------------------------

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);

        return () =>
            window.removeEventListener("scroll", handleScroll);
    }, []);

    const closeMenu = () => {
        setMenuOpen(false);
        handleLogout();
        setProfileOpen(false);
        navigate("/");
    };

    return (
        <>
            {/* Announcement */}

            <div className="top-strip">
                🚚 Free Delivery Above ₹999
            </div>

            {/* Navbar */}

            <header
                className={`navbar ${isScrolled ? "navbar-scrolled" : ""
                    }`}
            >
                <div className="navbar-container">

                    {/* Mobile Menu */}

                    <button
                        className="menu-btn"
                        onClick={() => setMenuOpen(true)}
                    >
                        <FiMenu />
                    </button>

                    {/* Logo */}

                    <Link
                        to="/"
                        className="logo"
                    >
                        <img src={Assets.logo} alt="" />
                    </Link>

                    {/* Desktop Navigation */}

                    <nav className="desktop-nav">

                        <NavLink to="/">
                            Home
                        </NavLink>

                        <NavLink to="/shop">
                            Shop
                        </NavLink>

                        <NavLink to="/collections">
                            Collections
                        </NavLink>

                        <NavLink to="/gift">
                            Gift
                        </NavLink>

                        <NavLink to="/about">
                            About
                        </NavLink>

                        <NavLink to="/contact">
                            Support
                        </NavLink>

                    </nav>

                    {/* Right Icons */}

                    <div className="right-section">

                        <button className="icon-btn" onClick={toggleSearch}>
                            <FiSearch />

                        </button>

                        <button className="icon-btn">
                            <FiHeart />
                        </button>

                        <Link to="/cart"> <button className="icon-btn cart-btn">

                            <FiShoppingBag />

                            <span className="cart-count">
                                {cartCount}
                            </span>

                        </button> </Link>

                        {!token ? (

                            <button
                                className="login-btn"
                                onClick={() => setIsAuthOpen(true)}
                            >
                                Login
                            </button>

                        ) : (

                            <div className="profile">

                                <button
                                    className="profile-btn"
                                    onClick={() =>
                                        setProfileOpen(!profileOpen)
                                    }
                                >
                                    <FiUser />
                                    <FiChevronDown />
                                </button>

                                {profileOpen && (

                                    <div className="profile-dropdown">

                                        <Link to="/account">
                                            Account
                                        </Link>

                                        <Link to="/orders">
                                            <FiPackage />
                                            Orders
                                        </Link>

                                        <Link to="/payments">
                                            <FiCreditCard />
                                            Payments
                                        </Link>


                                        <button
                                            onClick={handleLogoutClick}
                                        >
                                            <FiLogOut />
                                            Logout
                                        </button>
                                        <Link to="/settings">
                                            <FiSettings />
                                            Settings
                                        </Link>
                                        
                                        

                                    </div>

                                )}

                            </div>

                        )}

                    </div>

                </div>
            </header>
            {/* Search Bar */}

            {searchOpen && (
                <div className="search-bar-wrapper">
                    <form className="search-bar" onSubmit={handleSearchSubmit}>
                        <FiSearch className="search-bar-icon" />

                        <input
                            type="text"
                            placeholder="Search for products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />

                        <button
                            type="button"
                            className="search-close-btn"
                            onClick={() => {
                                setSearchOpen(false);
                                setSearchQuery("");
                            }}
                        >
                            <FiX />
                        </button>
                    </form>
                </div>
            )}

            {/* Overlay */}

            {menuOpen && (
                <div
                    className="overlay"
                    onClick={closeMenu}
                />
            )}

            {/* Mobile Sidebar */}

            <aside
                className={`mobile-sidebar ${menuOpen ? "show" : ""
                    }`}
            >

                <div className="mobile-header">

                    <img src={Assets.logo} alt="Humi's Logo" />

                    <button
                        onClick={closeMenu}
                    >
                        <FiX />
                    </button>

                </div>

                <nav className="mobile-nav">

                    <NavLink
                        to="/"
                        onClick={closeMenu}
                    >
                        Home
                    </NavLink>

                    <NavLink
                        to="/shop"
                        onClick={closeMenu}
                    >
                        Shop
                    </NavLink>

                    <NavLink
                        to="/collections"
                        onClick={closeMenu}
                    >
                        Collections
                    </NavLink>

                    <NavLink
                        to="/gift"
                        onClick={closeMenu}
                    >
                        Gift
                    </NavLink>

                    <NavLink
                        to="/about"
                        onClick={closeMenu}
                    >
                        About
                    </NavLink>

                    <NavLink
                        to="/contact"
                        onClick={closeMenu}
                    >
                        Contact
                    </NavLink>

                </nav>

                <hr />

                {!token ? (

                    <button
                        className="mobile-login"
                        onClick={() => {
                            setIsAuthOpen(true);
                            closeMenu();
                        }}
                    >
                        Login
                    </button>

                ) : (

                    <div className="mobile-account">

                        <NavLink
                            to="/account"
                            onClick={closeMenu}
                        >
                            <FiUser />
                            Account
                        </NavLink>

                        <NavLink
                            to="/orders"
                            onClick={closeMenu}
                        >
                            <FiPackage />
                            Orders
                        </NavLink>

                        <NavLink
                            to="/payments"
                            onClick={closeMenu}
                        >
                            <FiCreditCard />
                            Payments
                        </NavLink>
                        <button onClick={() => {
                            setIsLoggedIn(false);
                            closeMenu();
                        }}>
                            <FiSettings />
                            Settings
                        </button>

                        <button
                            onClick={() => {
                                setIsLoggedIn(false);
                                closeMenu();
                            }}
                        >
                            <FiLogOut />
                            Logout
                        </button>


                    </div>

                )}

            </aside>
        </>
    );
}

export default Navbar;