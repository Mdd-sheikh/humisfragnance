import { createContext } from "react";
import { useState } from "react";
import { useMemo } from "react";
import { PRODUCTS } from "../assets/Assests";


export const Context = createContext(null)


const ContextProvider = ({ children }) => {

    const URL = "http://localhost:5000/api";

    const [token, setToken] = useState(localStorage.getItem("token") || null);


    // handle logout function
    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem("token");
    };

    const [cart, setCart] = useState({})

    // add to cart function
    const addToCart = (product, qty) => {
        setCart((prev) => ({
            ...prev,
            [product.id]: (prev[product.id] || 0) + qty,
        }));
    };

    // update to cart

    const updateQty = (id, qty) => {
        setCart((prev) => {
            if (qty <= 0) {
                const next = { ...prev };
                delete next[id];
                return next;
            }
            return { ...prev, [id]: qty };
        });
    };

    // remove to cart 
    const removeFromCart = (id) => {
        setCart((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };


    // show quatity on the top of cary icon 

    const cartItems = useMemo(
        () =>
            Object.entries(cart)
                .map(([id, qty]) => {
                    const product = PRODUCTS.find((p) => p.id === id);
                    return product ? { ...product, qty } : null;
                })
                .filter(Boolean),
        [cart]
    );


    const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
    const cartTotal = cartItems.reduce((sum, i) => sum + i.qty * i.price, 0);

    const value = {
        addToCart,
        removeFromCart,
        updateQty,
        cart,
        setCart,
        cartItems,
        cartCount,
        cartTotal,
        URL,
        token, 
        setToken,
        handleLogout
    }


    return <Context.Provider value={value}>
        {children}
    </Context.Provider>
}

export default ContextProvider;