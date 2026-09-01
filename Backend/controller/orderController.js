import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Product from "../models/attarModel.js";
import Address from "../models/addressModel.js"
import Order from "../models/placeorder.js";
import { removefromCart, clearCartItem } from "./cartController.js";
import { mapShipmozoStatus } from '../utils/trackingStatusMap.js'
import { pushOrder, trackOrder, assignCourier, calculateRates } from "../services/shipmozoservices.js";

// ---------------- Shared: decrement stock + push to Shipmozo ----------------
// Used by both the COD path (right after order creation) and verifyPayment
// (after payment is confirmed) so this logic isn't duplicated.
const finalizeOrder = async (order, paymentType) => {
    // Decrement stock — atomic conditional decrement to avoid overselling
    
    // under concurrent checkouts
    for (const item of order.items) { 
        let result;
        if (item.variantId) {
            result = await Product.updateOne(
                {
                    _id: item.product,
                    "variants._id": item.variantId,
                    "variants.stock": { $gte: item.quantity },
                },
                { $inc: { "variants.$.stock": -item.quantity } }
            );
        } else {
            result = await Product.updateOne(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } }
            );
        }

        if (result.modifiedCount === 0) {
            // Oversold — order already confirmed, so don't fail the response.
            // Flag for manual review / refund instead of silently losing the mismatch.
            console.error(
                `Stock decrement failed for product ${item.product} (order ${order._id}) — possible oversell`
            );
            order.stockIssue = true;
        }
    }
    if (order.stockIssue) {
        await order.save();
    }

    // ---------------- Push order to Shipmozo ----------------
    // NOTE: requires SHIPMOZO_WAREHOUSE_ID and SHIPMOZO_PICKUP_PINCODE in your
    // .env — fetch the warehouse_id once via getWarehouses() (or create one via
    // createWarehouse()) in shipmozoservice.js, since push-order requires it
    // on every call.
    try {
        const shipmozoPayload = {
            order_id: order._id.toString(),
            order_date: new Date(order.createdAt).toISOString().slice(0, 10), // "YYYY-MM-DD"
            consignee_name: order.shippingAddress.fullName,
            consignee_phone: Number(order.shippingAddress.phone),
            consignee_address_line_one: order.shippingAddress.addressLine1,
            consignee_pin_code: Number(order.shippingAddress.postalCode),
            consignee_city: order.shippingAddress.city,
            consignee_state: order.shippingAddress.state,

            product_detail: order.items.map((item) => ({
                name: item.name,
                sku_number: item.product.toString(),
                quantity: item.quantity,
                discount: "",
                hsn: "",
                unit_price: item.price,
                product_category: "Other",
            })),

            payment_type: paymentType === "COD" ? "COD" : "PREPAID",
            cod_amount: paymentType === "COD" ? order.totalAmount.toString() : "",

            weight: order.packageWeightGrams,
            length: order.packageLengthCm,
            width: order.packageWidthCm,
            height: order.packageHeightCm,

            warehouse_id: process.env.SHIPMOZO_WAREHOUSE_ID,
        };

        const shipmozoRes = await pushOrder(shipmozoPayload);

        if (shipmozoRes.result === "1") {
            order.shipmozoPushed = true;
            order.shipmozoOrderId = shipmozoRes.data?.order_id;
            order.shipmozoReferenceId = shipmozoRes.data?.reference_id;
            order.orderStatus = "shipment_created";
            await order.save();

            // Get a courier_id via Rate-Calculator, then assign it explicitly.
            // (auto-assign-order is an alternative, but requires Settings > Auto
            // Assign to be configured in the Shipmozo panel first.)
            const rateRes = await calculateRates({
                order_id: order._id.toString(),
                pickup_pincode: Number(process.env.SHIPMOZO_PICKUP_PINCODE),
                delivery_pincode: Number(order.shippingAddress.postalCode),
                payment_type: paymentType === "COD" ? "COD" : "PREPAID",
                shipment_type: "FORWARD",
                order_amount: order.totalAmount,
                type_of_package: "SPS",
                rov_type: "ROV_OWNER",
                cod_amount: paymentType === "COD" ? order.totalAmount.toString() : "",
                weight: order.packageWeightGrams,
                dimensions: [
                    {
                        no_of_box: "1",
                        length: order.packageLengthCm.toString(),
                        width: order.packageWidthCm.toString(),
                        height: order.packageHeightCm.toString(),
                    },
                ],
            });

            // NOTE: picks the first courier option returned — the API docs PDF
            // didn't include a sample response body for rate-calculator, so once
            // you see the real shape (field names, price sorting) adjust this
            // selection logic to pick by price or your own criteria instead of
            // "first item".
            const chosenCourier = rateRes?.data?.[0];
            if (chosenCourier?.courier_id) {
                const assignRes = await assignCourier(order._id.toString(), chosenCourier.courier_id);

                if (assignRes?.result === "1") {
                    order.shipmozoCourierId = chosenCourier.courier_id;
                    order.courierPartner = assignRes.data?.courier || order.courierPartner;
                    await order.save();
                } else {
                    console.error("Shipmozo courier assignment failed:", assignRes);
                }
            } else {
                console.error("Shipmozo rate-calculator returned no courier options:", rateRes);
            }
        } else {
            console.error("Shipmozo push-order failed:", shipmozoRes.message || shipmozoRes);
        }
    } catch (shipErr) {
        // Don't fail the response if shipping push fails —
        // log it and handle manually / via a retry job
        console.error("Shipmozo integration error:", shipErr.response?.data || shipErr.message);
    }
};

// ---------------- Create order ----------------
// body: { items: [{ productId, variantId?, size?, quantity }], addressId, paymentMode? }
// paymentMode: "COD" | "Prepaid" (defaults to "Prepaid" if omitted)
export const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items, addressId, paymentMode } = req.body;

        const mode = paymentMode === "COD" ? "COD" : "Prepaid";

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        // Validate quantities up front — reject non-positive/non-integer quantities
        for (const item of items) {
            if (!item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Each item must have a valid productId and a positive integer quantity",
                });
            }
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

        // ---------------- COD branch ----------------
        // No Razorpay order needed for COD; order is placed immediately and
        // finalized (stock decrement + Shipmozo push) right here, since
        // there's no verifyPayment call coming for COD orders.
        if (mode === "COD") {
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
                paymentMode: "COD",
                paymentStatus: "pending", // settled on delivery
                orderStatus: "placed",
            });

            await finalizeOrder(order, "COD");
            await clearCartItem(userId); // empty cart after COD order placed

            return res.status(200).json({
                success: true,
                message: "Order placed (COD)",
                orderId: order._id,
                order,
            });
        }

        // ---------------- Prepaid branch (unchanged — Razorpay flow) ----------------
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
            paymentMode: "Prepaid",
            razorpayOrderId: razorpayOrder.id,
            paymentStatus: "pending",
        });

        res.status(200).json({
            success: true,
            order: razorpayOrder,
            orderId: order._id,
            key: process.env.RAZORPAY_API_KEY,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ---------------- Verify payment ----------------
// body: { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
export const verifyPayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Ownership check — was fetching by orderId alone, allowing any
        // logged-in user to verify/confirm someone else's order
        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Idempotency guard — prevents double stock-decrement and double
        // Shipmozo push if this endpoint is called more than once for the
        // same order (retry, double-click, duplicate call)
        if (order.paymentStatus === "paid") {
            return res.status(200).json({ success: true, message: "Already verified", order });
        }

        if (order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({ success: false, message: "Order mismatch" });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
            .update(body)
            .digest("hex");

        // Timing-safe comparison
        let isAuthentic = false;
        try {
            const expectedBuf = Buffer.from(expectedSignature);
            const providedBuf = Buffer.from(razorpay_signature || "");
            isAuthentic =
                expectedBuf.length === providedBuf.length &&
                crypto.timingSafeEqual(expectedBuf, providedBuf);
        } catch {
            isAuthentic = false;
        }

        if (!isAuthentic) {
            await Order.findByIdAndUpdate(orderId, { paymentStatus: "failed" });
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        order.paymentStatus = "paid";
        order.orderStatus = "placed";
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        await order.save();

        // stock decrement + Shipmozo push shared with COD path via finalizeOrder()
        await finalizeOrder(order, "PREPAID");
        await clearCartItem(userId); // empty cart once online payment is verified

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
        // Admin-only — requires an isAdmin/role check to have run in middleware
        // and attached to req.user (see note below)

        const { status, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (status && status !== "all") {
            filter.orderStatus = status;
        }

        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            Order.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            orders,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ---------------- Get live order tracking ----------------
// GET /order/:orderId/tracking
export const getOrderTracking = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;

        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (!order.waybill) {
            // Shipment not yet assigned a courier/AWB
            return res.status(200).json({
                success: true,
                orderStatus: order.orderStatus,
                trackingAvailable: false,
            });
        }

        // Live lookup from Shipmozo (fresher than any cron sync you set up)
        const trackRes = await trackOrder(order.waybill);

        if (trackRes?.result !== "1" || !trackRes?.data) {
            // Fall back to whatever we last stored
            return res.status(200).json({
                success: true,
                orderStatus: order.orderStatus,
                trackingAvailable: true,
                live: false,
            });
        }

        const trackingData = trackRes.data;

        // Shipmozo's current_status is a free-text string (e.g. "Pickup
        // Pending", "In Transit", "Delivered") rather than a numeric code —
        // mapped to your orderStatus enum via mapShipmozoStatus()
        const liveStatus = mapShipmozoStatus(trackingData.current_status, order.orderStatus);

        // Keep DB in sync opportunistically
        if (liveStatus !== order.orderStatus) {
            order.orderStatus = liveStatus;
            if (liveStatus === "delivered") order.deliveredAt = new Date();
            await order.save();
        }

        res.status(200).json({
            success: true,
            orderStatus: liveStatus,
            trackingAvailable: true,
            live: true,
            courier: trackingData.courier,
            awbNumber: order.waybill,
            expectedDeliveryDate: trackingData.expected_delivery_date,
            scanDetail: trackingData.scan_detail,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};