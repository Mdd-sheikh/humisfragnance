import shipmozo from "../config/shipmozo.js";

// ---------------- Push order ----------------
// Docs: POST /push-order
// order_id must match the order created on your website.
// warehouse_id must come from Get-Warehouses (or Create-Warehouse) beforehand —
// see getWarehouses() / createWarehouse() below.
// Returns { result, message, data: { order_id, reference_id } } on success (result === "1")
export const pushOrder = async (payload) => {
    const { data } = await shipmozo.post("/push-order", payload);
    return data;
};

// ---------------- Assign a specific courier to an order ----------------
// Docs: POST /assign-courier
// courier_id must come from the Rate-Calculator API.
// Use this when you want to pick the courier yourself (equivalent to your
// Shiprocket assignAWB(shipmentId, courierId) with an explicit courier_id).
export const assignCourier = async (orderId, courierId) => {
    const { data } = await shipmozo.post("/assign-courier", {
        order_id: orderId,
        courier_id: courierId,
    });
    return data;
};

// ---------------- Auto-assign a courier to an order ----------------
// Docs: POST /auto-assign-order
// Closest equivalent to Shiprocket's assignAWB(shipmentId, 0) "let the
// platform auto-pick" behavior — but requires Setting > Auto Assign to be
// configured in the Shipmozo panel first, or it returns a "please setup
// auto assign" error.
export const autoAssignOrder = async (orderId) => {
    const { data } = await shipmozo.post("/auto-assign-order", {
        order_id: orderId,
    });
    return data;
};

// ---------------- Schedule pickup ----------------
// Docs: POST /schedule-pickup
// Only needed when pickups_automatically_scheduled = "NO" (from the
// Rate-Calculator response) — i.e. manual pickup scheduling.
export const schedulePickup = async (orderId) => {
    const { data } = await shipmozo.post("/schedule-pickup", {
        order_id: orderId,
    });
    return data;
};

// ---------------- Cancel order ----------------
// Docs: POST /cancel-order
export const cancelOrder = async (orderId, awbNumber) => {
    const { data } = await shipmozo.post("/cancel-order", {
        order_id: orderId,
        awb_number: awbNumber,
    });
    return data;
};

// ---------------- Track shipment by AWB ----------------
// Docs: GET /track-order?awb_number={awb}
export const trackOrder = async (awbNumber) => {
    const { data } = await shipmozo.get("/track-order", {
        params: { awb_number: awbNumber },
    });
    return data;
};

// ---------------- Get order details ----------------
// Docs: GET /get-order-detail/{order_id}
export const getOrderDetail = async (orderId) => {
    const { data } = await shipmozo.get(`/get-order-detail/${orderId}`);
    return data;
};

// ---------------- Get shipping label ----------------
// Docs: GET /get-order-label/{awb_number}
// Returns a base64-encoded PNG in data.data[0].label
export const getOrderLabel = async (awbNumber) => {
    const { data } = await shipmozo.get(`/get-order-label/${awbNumber}`);
    return data;
};

// ---------------- Rate calculator ----------------
// Docs: POST /rate-calculator
// Useful before assignCourier — lets you pick a courier_id and also tells
// you whether pickup is auto-scheduled for that courier.
export const calculateRates = async (payload) => {
    const { data } = await shipmozo.post("/rate-calculator", payload);
    return data;
};

// ---------------- Pincode serviceability ----------------
// Docs: POST /pincode-serviceability
export const checkServiceability = async (pickupPincode, deliveryPincode) => {
    const { data } = await shipmozo.post("/pincode-serviceability", {
        pickup_pincode: pickupPincode,
        delivery_pincode: deliveryPincode,
    });
    return data;
};

// ---------------- Warehouses ----------------
// Docs: GET /get-warehouses
export const getWarehouses = async () => {
    const { data } = await shipmozo.get("/get-warehouses");
    return data;
};

// Docs: POST /create-warehouse
// address_title must be unique — if it already exists, Shipmozo returns the
// existing warehouse_id instead of creating a duplicate.
export const createWarehouse = async (payload) => {
    const { data } = await shipmozo.post("/create-warehouse", payload);
    return data;
};