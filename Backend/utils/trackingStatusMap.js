// Add this to utils/trackingStatusMap.js, replacing mapShipmozoStatus.
// Shiprocket's `shipment_status` in the tracking response is a numeric code
// (and `track_status` in some responses is a small int too). Verify these
// against a real tracking response in your account, since Shiprocket doesn't
// publish a single canonical status-code table — the mapping below covers
// the commonly documented codes.
export const mapShiprocketStatus = (status) => {
    const code = Number(status);

    const map = {
        1: "shipment_created",  // AWB assigned / order booked
        2: "shipment_created",  // pickup scheduled
        3: "shipped",           // picked up / in transit
        6: "shipped",           // out for delivery
        7: "delivered",
        8: "cancelled",
        9: "rto",                // return to origin initiated
        11: "rto",                // RTO delivered
        17: "cancelled",
        18: "shipped",           // in transit (alt code seen in some responses)
        19: "shipped",           // out for delivery (alt code)
        20: "delivered",         // alt code
        38: "shipped",
        42: "shipped",
    };

    return map[code] || "shipment_created";
};