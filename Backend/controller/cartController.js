import Users from "../models/User.js";


//================================================== add item in cart ====================================


// Wipes the entire cart — used after an order is successfully placed
export const clearCartItem = async (userId) => {
    console.log("clearCart called for user:", userId);
    const userData = await Users.findById(userId);
    if (!userData) {
        throw new Error("User not found");
    }
    console.log("cart before:", userData.cartdata);
    userData.cartdata = {};
    userData.markModified("cartdata");
    await userData.save();
    console.log("cart after save:", userData.cartdata);
    return userData.cartdata;
};

export const AddtoCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId, qty } = req.body;

        if (!itemId || !qty) {
            return res.status(400).json({
                success: false,
                message: "itemId and qty are required",
            });
        }

        const updatedUser = await Users.findByIdAndUpdate(
            userId,
            { $inc: { [`cartdata.${itemId}`]: qty } },
            { returnDocument: 'after' } // replaces { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Added to cart",
            cartdata: updatedUser.cartdata,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ===================================== remove item from cart==========================================
export const removefromCart = async (req, res) => {
    try {
        const userId = req.user.id; // from Auth middleware
        const { itemId } = req.body;

        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: "itemId is required",
            });
        }

        const userData = await Users.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let cartData = userData.cartdata || {};

        // fully remove the item, regardless of qty
        delete cartData[itemId];

        userData.cartdata = cartData;
        userData.markModified("cartdata");
        await userData.save();

        return res.status(200).json({
            success: true,
            message: "Removed from cart",
            cartdata: userData.cartdata,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
// ========================================get cart item ==========================================


export const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const userData = await Users.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            cartdata: userData.cartdata || {},
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


//========================================update cart quatity===============================


export const updateCartQty = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId, qty } = req.body;

        if (!itemId || qty === undefined) {
            return res.status(400).json({
                success: false,
                message: "itemId and qty are required",
            });
        }

        if (qty < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1",
            });
        }

        const updatedUser = await Users.findByIdAndUpdate(
            userId,
            { $set: { [`cartdata.${itemId}`]: qty } },
            { returnDocument: "after" }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cartdata: updatedUser.cartdata,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

