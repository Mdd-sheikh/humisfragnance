import Order from "../models/placeorder.js";
import Users from "../models/User.js";
import Product from "../models/attarModel.js";

const LOW_STOCK_THRESHOLD = 5;
const CHART_MONTHS = 6;

// Orders that count toward revenue: paid online, or COD that was delivered;
// never cancelled / returned-to-origin.
const REVENUE_MATCH = {
    orderStatus: { $nin: ["cancelled", "rto"] },
    $or: [{ paymentStatus: "paid" }, { orderStatus: "delivered" }],
};

const startOfMonth = (date, offset = 0) =>
    new Date(date.getFullYear(), date.getMonth() + offset, 1);

const sumRevenue = async (from, to) => {
    const [row] = await Order.aggregate([
        { $match: { ...REVENUE_MATCH, createdAt: { $gte: from, $lt: to } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    return row?.total ?? 0;
};


// ---- Sales trend (line graph) -------------------------------------------
// Buckets are computed in IST so "today / this week / this month" match what
// the shop owner sees, regardless of the server's timezone.
const TZ = "Asia/Kolkata";
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const WEEKS = 12;
const MONTHS = 12;
const YEARS = 5;

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const isoDay = (ms) => new Date(ms).toISOString().slice(0, 10);

const buildBuckets = (unit, istNow) => {
    const y = istNow.getUTCFullYear();
    const m = istNow.getUTCMonth();
    const d = istNow.getUTCDate();

    if (unit === "week") {
        const mondayMs = Date.UTC(y, m, d - ((istNow.getUTCDay() + 6) % 7));
        return Array.from({ length: WEEKS }, (_, i) => {
            const start = mondayMs - (WEEKS - 1 - i) * 7 * 86400000;
            const dt = new Date(start);
            return {
                key: isoDay(start),
                start,
                label: `${dt.getUTCDate()} ${MONTH_NAMES[dt.getUTCMonth()]}`,
                isCurrent: i === WEEKS - 1,
            };
        });
    }
    if (unit === "month") {
        return Array.from({ length: MONTHS }, (_, i) => {
            const dt = new Date(Date.UTC(y, m - (MONTHS - 1 - i), 1));
            const yy = dt.getUTCFullYear();
            const mm = dt.getUTCMonth();
            return {
                key: `${yy}-${String(mm + 1).padStart(2, "0")}`,
                start: dt.getTime(),
                label: `${MONTH_NAMES[mm]} ${String(yy).slice(2)}`,
                isCurrent: i === MONTHS - 1,
            };
        });
    }
    return Array.from({ length: YEARS }, (_, i) => {
        const yy = y - (YEARS - 1 - i);
        return { key: String(yy), start: Date.UTC(yy, 0, 1), label: String(yy), isCurrent: i === YEARS - 1 };
    });
};

const getSalesSeries = async (unit, istNow) => {
    const buckets = buildBuckets(unit, istNow);
    const from = new Date(buckets[0].start - IST_OFFSET_MS);

    const bucketDate =
        unit === "week"
            ? { $dateTrunc: { date: "$createdAt", unit: "week", startOfWeek: "monday", timezone: TZ } }
            : "$createdAt";
    const format = unit === "year" ? "%Y" : unit === "month" ? "%Y-%m" : "%Y-%m-%d";

    const rows = await Order.aggregate([
        { $match: { ...REVENUE_MATCH, createdAt: { $gte: from } } },
        {
            $group: {
                _id: { $dateToString: { format, date: bucketDate, timezone: TZ } },
                sales: { $sum: "$totalAmount" },
                orders: { $sum: 1 },
            },
        },
    ]);
    const byKey = new Map(rows.map((r) => [r._id, r]));

    return buckets.map((b) => ({
        label: b.label,
        sales: byKey.get(b.key)?.sales ?? 0,
        orders: byKey.get(b.key)?.orders ?? 0,
        isCurrent: b.isCurrent,
    }));
};

export const getDashboardData = async (req, res) => {
    try {
        const now = new Date();
        const istNow = new Date(now.getTime() + IST_OFFSET_MS);
        const thisMonthStart = startOfMonth(now);
        const lastMonthStart = startOfMonth(now, -1);
        const nextMonthStart = startOfMonth(now, 1);
        const chartStart = startOfMonth(now, -(CHART_MONTHS - 1));
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [
            totalRevenueRow,
            thisMonthRevenue,
            lastMonthRevenue,
            totalOrders,
            ordersToday,
            activeCustomerIds,
            newCustomersToday,
            lowStock,
            monthlyRows,
            recentOrders,
            salesWeek,
            salesMonth,
            salesYear,
        ] = await Promise.all([
            Order.aggregate([
                { $match: REVENUE_MATCH },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } },
            ]),
            sumRevenue(thisMonthStart, nextMonthStart),
            sumRevenue(lastMonthStart, thisMonthStart),
            Order.countDocuments(),
            Order.countDocuments({ createdAt: { $gte: todayStart } }),
            Order.distinct("user", { createdAt: { $gte: thirtyDaysAgo } }),
            Users.countDocuments({ createdAt: { $gte: todayStart } }),
            Product.countDocuments({
                isActive: true,
                $or: [
                    { "variants.0": { $exists: false }, stock: { $lte: LOW_STOCK_THRESHOLD } },
                    { variants: { $elemMatch: { stock: { $lte: LOW_STOCK_THRESHOLD } } } },
                ],
            }),
            Order.aggregate([
                { $match: { ...REVENUE_MATCH, createdAt: { $gte: chartStart, $lt: nextMonthStart } } },
                {
                    $group: {
                        _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
                        revenue: { $sum: "$totalAmount" },
                    },
                },
            ]),
            Order.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select("shippingAddress.fullName totalAmount orderStatus createdAt")
                .lean(),
            getSalesSeries("week", istNow),
            getSalesSeries("month", istNow),
            getSalesSeries("year", istNow),
        ]);

        const revenueByMonth = new Map(
            monthlyRows.map((r) => [`${r._id.y}-${r._id.m}`, r.revenue])
        );
        const monthlyRevenue = Array.from({ length: CHART_MONTHS }, (_, i) => {
            const d = startOfMonth(now, -(CHART_MONTHS - 1 - i));
            return {
                month: d.toLocaleString("en-US", { month: "short" }),
                revenue: revenueByMonth.get(`${d.getFullYear()}-${d.getMonth() + 1}`) ?? 0,
                isCurrent: i === CHART_MONTHS - 1,
            };
        });

        const revenueChangePct = lastMonthRevenue
            ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
            : thisMonthRevenue > 0 ? 100 : 0;

        res.status(200).json({
            success: true,
            stats: {
                totalRevenue: totalRevenueRow[0]?.total ?? 0,
                revenueChangePct,
                totalOrders,
                ordersToday,
                activeCustomers: activeCustomerIds.length,
                newCustomersToday,
                lowStock,
            },
            monthlyRevenue,
            salesTrend: { week: salesWeek, month: salesMonth, year: salesYear },
            recentOrders: recentOrders.map((o) => ({
                id: String(o._id).slice(-8).toUpperCase(),
                customer: o.shippingAddress?.fullName ?? "Guest",
                price: o.totalAmount,
                status: o.orderStatus,
            })),
        });
    } catch (error) {
        console.error("getDashboardData error:", error);
        res.status(500).json({ success: false, message: "Failed to load dashboard data" });
    }
};
