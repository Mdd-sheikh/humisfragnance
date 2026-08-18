import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Product from "../models/attarModel.js";
import Address from "../models/addressModel.js"
import Order from "../models/placeorder.js";

// ---------------- Create Razorpay order ----------------
// body: { items: [{ productId, variantId?, size?, quantity }], addressId }
export const createOrder = async (req, res) => {
    try {
        const userId = req.user.id; // fixed — was req.user._id
        const { items, addressId } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        const address = await Address.findOne({ _id: addressId, user: userId });
        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        // Recompute prices from DB — never trust amounts sent from frontend
        let itemsTotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product || !product.isActive) {
                return res.status(400).json({
                    success: false,
                    message: `Product not available: ${item.productId}`,
                });
            }

            let unitPrice;
            let variant = null;

            if (item.variantId) {
                variant = product.variants.id(item.variantId);
                if (!variant) {
                    return res.status(400).json({ success: false, message: "Variant not found" });
                }
                if (variant.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Insufficient stock for ${product.name} (${variant.size})`,
                    });
                }
                unitPrice = variant.discountPrice || variant.price;
            } else {
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Insufficient stock for ${product.name}`,
                    });
                }
                unitPrice = product.discountPrice || product.price;
            }

            itemsTotal += unitPrice * item.quantity;

            orderItems.push({
                product: product._id,
                name: product.name,
                image: product.images?.[0]?.url || "",
                size: variant?.size,
                variantId: variant?._id,
                price: unitPrice,
                quantity: item.quantity,
            });
        }

        const shippingFee = itemsTotal >= 999 ? 0 : 60; // adjust to your actual rule
        const totalAmount = itemsTotal + shippingFee;

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100), // paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        // Save as a pending order — confirmed once verifyPayment succeeds
        const order = await Order.create({
            user: userId,
            address: address._id,
            shippingAddress: {
                fullName: address.fullName,
                phone: address.phone,
                addressLine1: address.addressLine1,
                city: address.city,
                state: address.state,
                postalCode: address.postalCode,
                country: address.country,
            },
            items: orderItems,
            itemsTotal,
            shippingFee,
            totalAmount,
            razorpayOrderId: razorpayOrder.id,
            paymentStatus: "pending",
        });

        res.status(200).json({
            success: true,
            order: razorpayOrder,
            orderId: order._id,
            key: process.env.RAZORPAY_API_KEY, // fixed — was RAZORPAY_API_KEY
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ---------------- Verify payment ----------------
// body: { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
export const verifyPayment = async (req, res) => {
    try {
        const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY) // fixed — was RAZORPAY_SECRET_KEY
            .update(body)
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            await Order.findByIdAndUpdate(orderId, { paymentStatus: "failed" });
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if (order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({ success: false, message: "Order mismatch" });
        }

        order.paymentStatus = "paid";
        order.orderStatus = "placed";
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        await order.save();

        // Decrement stock now that payment is confirmed
        for (const item of order.items) {
            if (item.variantId) {
                await Product.updateOne(
                    { _id: item.product, "variants._id": item.variantId },
                    { $inc: { "variants.$.stock": -item.quantity } }
                );
            } else {
                await Product.updateOne(
                    { _id: item.product },
                    { $inc: { stock: -item.quantity } }
                );
            }
        }

        res.status(200).json({ success: true, message: "Payment verified", order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};



// ---------------- Get logged-in user's orders ----------------
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await Order.find({ user: userId })
            .populate("items.product", "name images")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ---------------- Get all orders (admin) ----------------
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate("user", "name email")
            .populate("items.product", "name images")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};