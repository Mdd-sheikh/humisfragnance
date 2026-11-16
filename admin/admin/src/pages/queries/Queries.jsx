import CustomerQueries from "../dashboard/CustomerQueries";
import "../dashboard/Dashboard.css";

// Full-page view of the customer messages (same list that is previewed on the dashboard)
const Queries = () => (
    <div className="dashboard">
        <div className="dashboard__header">
            <h1 className="dashboard__title">Customer Queries</h1>
            <p className="dashboard__subtitle">
                Messages your customers send from the contact form.
            </p>
        </div>
        <CustomerQueries />
    </div>
);

export default Queries;
