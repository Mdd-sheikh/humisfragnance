import { useState, useEffect, useCallback } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import {
    TrendingUp,
    ShoppingCart,
    Users,
    AlertTriangle,
    SlidersHorizontal,
    Package,
} from "lucide-react";
import "./Dashboard.css";

/**
 * Expects a backend endpoint returning JSON shaped like:
 * {
 *   stats: {
 *     totalRevenue: 42500,
 *     revenueChangePct: 12,
 *     totalOrders: 1200,
 *     dailyTargetPct: 85,
 *     activeCustomers: 850,
 *     newCustomersToday: 42,
 *     lowStock: 12
 *   },
 *   recentOrders: [
 *     { id: "ORD-9021", customer: "Sofia V.", price: 240.0, status: "shipped" }
 *   ]
 * }
 *
 * Adjust API_URL and field names in mapResponse() to match your API.
 */
const API_URL = "/api/dashboard";

// Bar chart uses dummy placeholder data per request — swap for real
// monthly revenue figures from the backend when ready.
const MONTHLY_REVENUE = [
    { month: "Jan", revenue: 28400 },
    { month: "Feb", revenue: 31200 },
    { month: "Mar", revenue: 27600 },
    { month: "Apr", revenue: 42500 },
    { month: "May", revenue: 35800 },
    { month: "Jun", revenue: 39100 },
];

const CURRENT_MONTH = "Apr";

const formatCompactMoney = (value) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
    return `$${value}`;
};

const STATUS_BADGE = {
    pending: "badge--pending",
    shipped: "badge--shipped",
    completed: "badge--completed",
};

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error("Failed to load dashboard data");
            const data = await res.json();
            setStats(data.stats ?? null);
            setRecentOrders(data.recentOrders ?? []);
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return (
        <div className="dashboard">
            {/* Header */}
            <div className="dashboard__header">
                <h1 className="dashboard__title">Admin Dashboard</h1>
                <p className="dashboard__subtitle">
                    Welcome back. Here is your daily overview.
                </p>
            </div>

            {error && <div className="dashboard__state dashboard__state--error">{error}</div>}

            {/* Stat cards */}
            <div className="stat-grid">
                <div className="stat-tile">
                    <span className="stat-tile__label">Total Revenue</span>
                    <span className="stat-tile__value stat-tile__value--gold">
                        {loading ? "—" : formatCompactMoney(stats?.totalRevenue ?? 0)}
                    </span>
                    <span className="stat-tile__footnote stat-tile__footnote--up">
                        <TrendingUp size={13} />
                        {loading ? "" : `${stats?.revenueChangePct ?? 0}% vs last mo.`}
                    </span>
                </div>

                <div className="stat-tile">
                    <span className="stat-tile__label">Total Orders</span>
                    <span className="stat-tile__value">
                        {loading
                            ? "—"
                            : `${((stats?.totalOrders ?? 0) / 1000).toFixed(1)}k`}
                    </span>
                    <span className="stat-tile__footnote">
                        <ShoppingCart size={13} />
                        {loading ? "" : `Daily Target: ${stats?.dailyTargetPct ?? 0}%`}
                    </span>
                </div>

                <div className="stat-tile">
                    <span className="stat-tile__label">Active Customers</span>
                    <span className="stat-tile__value">
                        {loading ? "—" : stats?.activeCustomers ?? 0}
                    </span>
                    <span className="stat-tile__footnote">
                        <Users size={13} />
                        {loading ? "" : `+${stats?.newCustomersToday ?? 0} new today`}
                    </span>
                </div>

                <div className="stat-tile">
                    <span className="stat-tile__label">Low Stock</span>
                    <span className="stat-tile__value stat-tile__value--danger">
                        {loading ? "—" : stats?.lowStock ?? 0}
                    </span>
                    <span className="stat-tile__footnote stat-tile__footnote--danger">
                        <AlertTriangle size={13} />
                        Action Required
                    </span>
                </div>
            </div>

            {/* Monthly revenue chart */}
            <div className="panel">
                <div className="panel__header">
                    <div>
                        <h2 className="panel__title">Monthly Revenue</h2>
                        <p className="panel__subtitle">Revenue distribution by month</p>
                    </div>
                    <button className="panel__link">View Full Report</button>
                </div>

                <div className="chart-wrap">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={MONTHLY_REVENUE} barCategoryGap="32%">
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={(props) => <MonthTick {...props} />}
                            />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: "var(--bg-muted)" }}
                                formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
                                contentStyle={{
                                    fontFamily: "var(--font-body)",
                                    fontSize: "0.8rem",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "8px",
                                }}
                            />
                            <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={42}>
                                {MONTHLY_REVENUE.map((entry) => (
                                    <Cell
                                        key={entry.month}
                                        fill={
                                            entry.month === CURRENT_MONTH
                                                ? "var(--color-primary-light)"
                                                : "var(--bg-muted)"
                                        }
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent orders */}
            <div className="panel">
                <div className="panel__header">
                    <h2 className="panel__title">Recent Orders</h2>
                    <button className="icon-btn" aria-label="Filter recent orders">
                        <SlidersHorizontal size={16} />
                    </button>
                </div>

                <div className="recent-orders">
                    {loading && (
                        <div className="dashboard__state">Loading recent orders…</div>
                    )}

                    {!loading && recentOrders.length === 0 && (
                        <div className="dashboard__state">No recent orders.</div>
                    )}

                    {!loading &&
                        recentOrders.map((order) => (
                            <div className="recent-order" key={order.id}>
                                <span className="recent-order__icon">
                                    <Package size={16} />
                                </span>

                                <div className="recent-order__info">
                                    <p className="recent-order__id">#{order.id}</p>
                                    <p className="recent-order__meta">
                                        {order.customer} • ${Number(order.price).toFixed(2)}
                                    </p>
                                </div>

                                <span
                                    className={`badge ${STATUS_BADGE[order.status] ?? "badge--pending"}`}
                                >
                                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                                </span>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

// Custom X-axis tick so the current month can be styled/colored distinctly
const MonthTick = ({ x, y, payload }) => {
    const isCurrent = payload.value === CURRENT_MONTH;
    return (
        <text
            x={x}
            y={y + 14}
            textAnchor="middle"
            fontSize={11}
            fontWeight={isCurrent ? 700 : 500}
            fill={isCurrent ? "var(--color-primary-light)" : "var(--text-secondary)"}
            fontFamily="var(--font-body)"
        >
            {payload.value.toUpperCase()}
        </text>
    );
};

export default Dashboard;