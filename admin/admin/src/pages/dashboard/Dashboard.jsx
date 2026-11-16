import { useState, useEffect, useCallback, useContext } from "react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    CartesianGrid,
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
import { Context } from "../../context/Context";
import CustomerQueries from "./CustomerQueries";
import "./Dashboard.css";

const formatCompactMoney = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
    return `₹${value}`;
};

const PERIODS = [
    { key: "week", label: "Week", hint: "Sales per week, last 12 weeks" },
    { key: "month", label: "Month", hint: "Sales per month, last 12 months" },
    { key: "year", label: "Year", hint: "Sales per year, last 5 years" },
];

const STATUS_BADGE = {
    placed: "badge--pending",
    shipment_created: "badge--shipped",
    picked_up: "badge--shipped",
    in_transit: "badge--shipped",
    out_for_delivery: "badge--shipped",
    delivered: "badge--completed",
    cancelled: "badge--cancelled",
    rto: "badge--cancelled",
};

const formatStatus = (status = "") =>
    status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

const Dashboard = () => {
    const { API_URL } = useContext(Context);
    const [stats, setStats] = useState(null);
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [salesTrend, setSalesTrend] = useState({ week: [], month: [], year: [] });
    const [period, setPeriod] = useState("month");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/api/dashboard`);
            if (!res.ok) throw new Error("Failed to load dashboard data");
            const data = await res.json();
            setStats(data.stats ?? null);
            setMonthlyRevenue(data.monthlyRevenue ?? []);
            setRecentOrders(data.recentOrders ?? []);
            setSalesTrend(data.salesTrend ?? { week: [], month: [], year: [] });
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

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
                        {loading ? "—" : stats?.totalOrders ?? 0}
                    </span>
                    <span className="stat-tile__footnote">
                        <ShoppingCart size={13} />
                        {loading ? "" : `${stats?.ordersToday ?? 0} placed today`}
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

            {/* Sales trend line chart */}
            <div className="panel">
                <div className="panel__header">
                    <div>
                        <h2 className="panel__title">Sales Trend</h2>
                        <p className="panel__subtitle">
                            {PERIODS.find((p) => p.key === period)?.hint}
                        </p>
                    </div>
                    <div className="segmented" role="tablist" aria-label="Sales period">
                        {PERIODS.map((p) => (
                            <button
                                key={p.key}
                                role="tab"
                                aria-selected={period === p.key}
                                className={`segmented__btn ${period === p.key ? "is-active" : ""}`}
                                onClick={() => setPeriod(p.key)}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="chart-wrap">
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={salesTrend[period]} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                            <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                            />
                            <YAxis
                                width={52}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                                tickFormatter={formatCompactMoney}
                            />
                            <Tooltip
                                formatter={(value, name) =>
                                    name === "sales"
                                        ? [`₹${Number(value).toLocaleString("en-IN")}`, "Sales"]
                                        : [value, "Orders"]
                                }
                                contentStyle={{
                                    fontFamily: "var(--font-body)",
                                    fontSize: "0.8rem",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "8px",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="sales"
                                stroke="var(--color-primary-light)"
                                strokeWidth={2.5}
                                dot={{ r: 3, fill: "var(--color-primary-light)" }}
                                activeDot={{ r: 5 }}
                            />
                            <Line dataKey="orders" stroke="transparent" dot={false} activeDot={false} legendType="none" />
                        </LineChart>
                    </ResponsiveContainer>
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
                        <BarChart data={monthlyRevenue} barCategoryGap="32%">
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={(props) => (
                                    <MonthTick
                                        {...props}
                                        currentMonth={monthlyRevenue.find((m) => m.isCurrent)?.month}
                                    />
                                )}
                            />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: "var(--bg-muted)" }}
                                formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
                                contentStyle={{
                                    fontFamily: "var(--font-body)",
                                    fontSize: "0.8rem",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "8px",
                                }}
                            />
                            <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={42}>
                                {monthlyRevenue.map((entry) => (
                                    <Cell
                                        key={`${entry.month}-${entry.isCurrent}`}
                                        fill={
                                            entry.isCurrent
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

            {/* Customer queries (contact form messages) */}
            <CustomerQueries />

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
                                        {order.customer} • ₹{Number(order.price).toLocaleString("en-IN")}
                                    </p>
                                </div>

                                <span
                                    className={`badge ${STATUS_BADGE[order.status] ?? "badge--pending"}`}
                                >
                                    {formatStatus(order.status)}
                                </span>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

// Custom X-axis tick so the current month can be styled/colored distinctly
const MonthTick = ({ x, y, payload, currentMonth }) => {
    const isCurrent = payload.value === currentMonth;
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