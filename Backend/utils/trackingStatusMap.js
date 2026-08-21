// Maps Shipmozo's current_status text to your Order.orderStatus enum.
// Shipmozo's exact status strings aren't fully listed in the docs you have,
// so this covers the common courier-status vocabulary. Log unmapped values
// (see catch-all below) and extend this list as you see real statuses come in.

export const mapShipmozoStatus = (shipmozoStatus = "") => {
    const s = shipmozoStatus.toLowerCase();

    if (s.includes("delivered")) return "delivered";
    if (s.includes("out for delivery")) return "out_for_delivery";
    if (s.includes("in transit") || s.includes("intransit")) return "in_transit";
    if (s.includes("picked up") || s.includes("pickup done")) return "picked_up";
    if (s.includes("rto")) return "rto";
    if (s.includes("cancel")) return "cancelled";

    // Pickup Pending / shipment created / anything else not yet in transit
    return "shipment_created";
};