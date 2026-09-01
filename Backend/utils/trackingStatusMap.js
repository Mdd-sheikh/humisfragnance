// Maps Shipmozo's free-text current_status (from the Track-Order API) to
// this app's Order.orderStatus enum: placed | shipment_created | picked_up |
// in_transit | out_for_delivery | delivered | cancelled | rto
//
// NOTE: the API docs PDF only gave one example value ("Pickup Pending").
// Add more entries here as you observe real statuses coming back from
// Shipmozo while an order moves through its lifecycle — place a real test
// order and log trackRes.data.current_status at each stage to fill this in.
const STATUS_MAP = {
    "Pickup Pending": "shipment_created",
    "Picked Up": "picked_up",
    "In Transit": "in_transit",
    "Out For Delivery": "out_for_delivery",
    "Delivered": "delivered",
    "RTO": "rto",
    "RTO Delivered": "rto",
    "Cancelled": "cancelled",
};

// fallback: if Shipmozo sends a status string we haven't mapped yet,
// keep whatever orderStatus the order already had instead of guessing.
export const mapShipmozoStatus = (currentStatus, fallbackStatus) => {
    return STATUS_MAP[currentStatus] || fallbackStatus;
};