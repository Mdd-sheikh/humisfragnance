import { createContext, useState, useMemo, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const Context = createContext(null);

const ContextProvider = ({ children }) => {

    const API_URL = "https://humisfragnance-3.onrender.com/api";  // for global url 

    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [cart, setCart] = useState({}); // { [productId]: { ...product, qty } } — local display shape
    const [products, setProducts] = useState([]); // needed to resolve cart item details






    //======================================product display data ========================
   

    // =================================================== fetch all products once, so cart can look up name/price/image==========================
    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/product/get`);
            const mapped = (res.data.products || []).map((p) => ({
                id: p._id,
                name: p.name,
                image: p.images?.[0]?.url || "",
                price: p.discountPrice || p.price,
            }));
            setProducts(mapped);
        } catch (err) {
            console.error("Failed to fetch products:", err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // ========================================fetch user's saved cart and rehydrate local state on load/refresh============================
    const fetchCart = async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_URL}/cart/get`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.data.success) return;

            const backendCartData = res.data.cartdata || {}; // { itemId: qty }

            const rehydrated = {};
            Object.entries(backendCartData).forEach(([itemId, qty]) => {
                const product = products.find((p) => p.id === itemId);
                if (product) {
                    rehydrated[itemId] = { ...product, qty };
                }
            });

            setCart(rehydrated);
        } catch (err) {
            console.error("Failed to load cart:", err);
        }
    };

    useEffect(() => {
        if (token && products.length > 0) {
            fetchCart();
        }
    }, [token, products]);

    //========================================add to cart (optimistic local update + backend sync)====================
    const addToCart = async (product, qty) => {
        setCart((prev) => ({
            ...prev,
            [product.id]: {
                ...product,
                qty: (prev[product.id]?.qty || 0) + qty,
            },
        }));

        if (!token) {
            toast.error("Please log in to save your cart");
            return;
        }

        try {
            const res = await axios.post(
                `${API_URL}/cart/addtocart`,
                { itemId: product.id, qty },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.data.success) {
                throw new Error(res.data.message || "Failed to sync cart");
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Something went wrong";
            toast.error(msg);
        }
    };

    // ===============================================================logout function===========================
    const handleLogout = () => {
        setToken(null);
        setCart({});
        localStorage.removeItem("token");
    };

    // ===================================================  update qty (local only — wire to backend later if needed================
    const updateQty = async (id, qty) => {
        const safeQty = Math.max(1, qty);

        // optimistic local update
        setCart((prev) => ({
            ...prev,
            [id]: { ...prev[id], qty: safeQty },
        }));

        if (!token) return;

        try {
            const res = await axios.put(
                `${API_URL}/cart/updatequantity`,
                { itemId: id, qty: safeQty },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.data.success) {
                throw new Error(res.data.message || "Failed to update cart");
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Something went wrong";
            toast.error(msg);
        }
    };

    // ============================================== remove from cart (local only — wire to backend later if needed) ==========================
    const removeFromCart = async (id) => {
        // optimistic local update
        setCart((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });

        if (!token) return;

        try {
            const res = await axios.post(
                `${API_URL}/cart/removecart`,
                { itemId: id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.data.success) {
                throw new Error(res.data.message || "Failed to remove item");
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Something went wrong";
            toast.error(msg);
        }
    };

    // =============================================  derive displayable cart rows ======================================
    const cartItems = useMemo(() => {
        return Object.entries(cart).map(([id, item]) => ({
            ...item,
            id,
        }));
    }, [cart]);



    const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);        //   cart count 
    const cartTotal = cartItems.reduce((sum, i) => sum + i.qty * i.price, 0);  // cart total amout 

    const value = {
        addToCart,
        removeFromCart,
        updateQty,
        cart,
        setCart,
        cartItems,
        cartCount,
        cartTotal,
        products,
        API_URL,
        token,
        setToken,
        handleLogout,
        
    };

    return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default ContextProvider;