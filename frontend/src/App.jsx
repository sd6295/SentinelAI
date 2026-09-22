import { useState } from "react";
import axios from "axios";
import {
  ShieldCheck,
  Activity,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Zap,
  User,
  Package,
  Server,
} from "lucide-react";

import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    order_value: 500,
    number_of_items: 2,
    avg_freight_value: 50,
    payment_installments: 1,
    total_payment_value: 550,
    payment_type: "credit_card",
    customer_unique_id: "test_customer",
    customer_zip_code_prefix: 14409,
    seller_zip_code_prefix: 13023,
    seller_id: "test_seller",
    orders_last_24h: 1,
    orders_last_7d: 2,
    device_order_count: 1,
    accounts_per_device: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: [
        "order_value",
        "number_of_items",
        "avg_freight_value",
        "payment_installments",
        "total_payment_value",
        "customer_zip_code_prefix",
        "seller_zip_code_prefix",
        "orders_last_24h",
        "orders_last_7d",
        "device_order_count",
        "accounts_per_device",
      ].includes(name)
        ? Number(value)
        : value,
    });
  };

  const predictOrder = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/predict",
        form
      );

      setResult(response.data);
    } catch (error) {
      alert("Could not connect to SentinelAI backend.");
    }

    setLoading(false);
  };

  const riskPercentage = result
    ? (result.rto_probability * 100).toFixed(2)
    : "0.00";

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="logo">
          <div className="logo-icon">
            <ShieldCheck size={25} />
          </div>

          <div>
            <h2>SentinelAI</h2>
            <span>Risk Intelligence</span>
          </div>
        </div>

        <nav>
          <button
            className={activePage === "Dashboard" ? "active" : ""}
            onClick={() => setActivePage("Dashboard")}
          >
            <Activity size={19} />
            Dashboard
          </button>

          <button
            className={activePage === "Predict" ? "active" : ""}
            onClick={() => setActivePage("Predict")}
          >
            <Zap size={19} />
            Predict Order
          </button>

          <button
            className={activePage === "Analytics" ? "active" : ""}
            onClick={() => setActivePage("Analytics")}
          >
            <BarChart3 size={19} />
            Analytics
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="api-status">
            <span></span>
            API Connected
          </div>

          <small>XGBoost Risk Engine</small>
        </div>

      </aside>

      {/* MAIN */}
      <main className="main">

        <header>
          <div>
            <p className="eyebrow">AI-POWERED RISK PLATFORM</p>
            <h1>{activePage}</h1>
          </div>

          <div className="header-status">
            <span className="status-dot"></span>
            SentinelAI Online
          </div>
        </header>

        {/* DASHBOARD */}
        {activePage === "Dashboard" && (
          <>
            <section className="hero">
              <div>
                <p>COD & RTO RISK INTELLIGENCE</p>
                <h2>Protect every order<br />before it becomes a loss.</h2>

                <button onClick={() => setActivePage("Predict")}>
                  Analyze an Order <Zap size={17} />
                </button>
              </div>

              <div className="hero-icon">
                <ShieldCheck size={115} strokeWidth={1} />
              </div>
            </section>

            <section className="stats">

              <StatCard
                icon={<Package />}
                title="Orders Analyzed"
                value="20,000"
                text="Model test set"
              />

              <StatCard
                icon={<AlertTriangle />}
                title="Orders Flagged"
                value="4,195"
                text="Review or block"
              />

              <StatCard
                icon={<CheckCircle />}
                title="Orders Approved"
                value="15,539"
                text="Low-risk orders"
              />

              <StatCard
                icon={<Activity />}
                title="Risk Engine"
                value="XGBoost"
                text="21 predictive features"
              />

            </section>

            <section className="dashboard-grid">

              <div className="card">
                <div className="card-title">
                  <div>
                    <h3>Decision Distribution</h3>
                    <p>Model decision breakdown</p>
                  </div>
                </div>

                <div className="decision-chart">

                  <div
                    className="donut"
                    style={{
                      background:
                        "conic-gradient(#22c55e 0deg 280deg, #f59e0b 280deg 360deg)",
                    }}
                  >
                    <div>
                      <strong>20K</strong>
                      <span>Orders</span>
                    </div>
                  </div>

                  <div className="legend">
                    <div>
                      <span className="green"></span>
                      APPROVE
                      <b>15,539</b>
                    </div>

                    <div>
                      <span className="orange"></span>
                      REVIEW / BLOCK
                      <b>4,195</b>
                    </div>
                  </div>

                </div>
              </div>

              <div className="card">
                <div className="card-title">
                  <div>
                    <h3>Risk Engine</h3>
                    <p>Current model configuration</p>
                  </div>

                  <ShieldCheck size={25} />
                </div>

                <div className="engine-info">
                  <div>
                    <span>Model</span>
                    <strong>XGBoost</strong>
                  </div>

                  <div>
                    <span>Features</span>
                    <strong>21</strong>
                  </div>

                  <div>
                    <span>Decision Threshold</span>
                    <strong>30%</strong>
                  </div>

                  <div>
                    <span>Prediction Type</span>
                    <strong>RTO Probability</strong>
                  </div>
                </div>
              </div>

            </section>
          </>
        )}

        {/* PREDICT */}
        {activePage === "Predict" && (
          <section className="predict-layout">

            <div className="card form-card">

              <div className="section-heading">
                <Package size={22} />
                <div>
                  <h3>Order Information</h3>
                  <p>Enter the order attributes</p>
                </div>
              </div>

              <div className="form-grid">

                <Input label="Order Value" name="order_value" value={form.order_value} onChange={handleChange} />

                <Input label="Number of Items" name="number_of_items" value={form.number_of_items} onChange={handleChange} />

                <Input label="Average Freight" name="avg_freight_value" value={form.avg_freight_value} onChange={handleChange} />

                <Input label="Payment Installments" name="payment_installments" value={form.payment_installments} onChange={handleChange} />

                <Input label="Total Payment Value" name="total_payment_value" value={form.total_payment_value} onChange={handleChange} />

                <div className="input-group">
                  <label>Payment Type</label>

                  <select
                    name="payment_type"
                    value={form.payment_type}
                    onChange={handleChange}
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="boleto">Boleto / COD</option>
                    <option value="voucher">Voucher</option>
                  </select>
                </div>

              </div>

              <div className="section-heading second">
                <User size={22} />
                <div>
                  <h3>Customer & Seller</h3>
                  <p>Historical and geographic information</p>
                </div>
              </div>

              <div className="form-grid">

                <Input label="Customer ID" name="customer_unique_id" value={form.customer_unique_id} onChange={handleChange} />

                <Input label="Customer ZIP" name="customer_zip_code_prefix" value={form.customer_zip_code_prefix} onChange={handleChange} />

                <Input label="Seller ID" name="seller_id" value={form.seller_id} onChange={handleChange} />

                <Input label="Seller ZIP" name="seller_zip_code_prefix" value={form.seller_zip_code_prefix} onChange={handleChange} />

              </div>

              <div className="section-heading second">
                <Server size={22} />
                <div>
                  <h3>Velocity & Device Signals</h3>
                  <p>Behavioral risk indicators</p>
                </div>
              </div>

              <div className="form-grid">

                <Input label="Orders Last 24h" name="orders_last_24h" value={form.orders_last_24h} onChange={handleChange} />

                <Input label="Orders Last 7d" name="orders_last_7d" value={form.orders_last_7d} onChange={handleChange} />

                <Input label="Device Order Count" name="device_order_count" value={form.device_order_count} onChange={handleChange} />

                <Input label="Accounts Per Device" name="accounts_per_device" value={form.accounts_per_device} onChange={handleChange} />

              </div>

              <button
                className="predict-btn"
                onClick={predictOrder}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Analyze Order"}
                {!loading && <Zap size={18} />}
              </button>

            </div>

            {/* RESULT */}
            <div className="result-card">

              {!result ? (
                <div className="empty-result">
                  <div className="empty-icon">
                    <Activity size={40} />
                  </div>

                  <h3>Awaiting Prediction</h3>

                  <p>
                    Submit an order to calculate its predicted
                    RTO probability.
                  </p>
                </div>
              ) : (
                <div className="prediction-result">

                  <p className="result-label">PREDICTED RTO RISK</p>

                  <div className="risk-circle">
                    <strong>{riskPercentage}%</strong>
                    <span>Probability</span>
                  </div>

                  <div className={
                    result.decision === "APPROVE"
                      ? "decision approve"
                      : "decision review"
                  }>
                    {result.decision === "APPROVE"
                      ? <CheckCircle size={22} />
                      : <AlertTriangle size={22} />
                    }

                    <div>
                      <small>MODEL DECISION</small>
                      <strong>{result.decision}</strong>
                    </div>
                  </div>

                  <div className="result-summary">
                    <span>Prediction engine</span>
                    <strong>SentinelAI XGBoost</strong>
                  </div>

                  <div className="result-summary">
                    <span>Decision threshold</span>
                    <strong>30%</strong>
                  </div>

                </div>
              )}

            </div>

          </section>
        )}

        {/* ANALYTICS */}
        {activePage === "Analytics" && (
          <section className="analytics">

            <div className="card">
              <h3>Model Analytics</h3>
              <p className="muted">
                SentinelAI performance and decision overview
              </p>

              <div className="analytics-grid">

                <div className="metric">
                  <span>ROC-AUC</span>
                  <strong>0.626</strong>
                </div>

                <div className="metric">
                  <span>PR-AUC</span>
                  <strong>0.109</strong>
                </div>

                <div className="metric">
                  <span>Test Orders</span>
                  <strong>19,734</strong>
                </div>

                <div className="metric">
                  <span>Features</span>
                  <strong>21</strong>
                </div>

              </div>
            </div>

            <div className="card">
              <h3>Risk Decision Flow</h3>

              <div className="flow">

                <div>
                  <strong>Order</strong>
                  <span>Raw order data</span>
                </div>

                <b>→</b>

                <div>
                  <strong>Features</strong>
                  <span>21 signals</span>
                </div>

                <b>→</b>

                <div>
                  <strong>XGBoost</strong>
                  <span>Risk probability</span>
                </div>

                <b>→</b>

                <div>
                  <strong>Decision</strong>
                  <span>Approve / Review</span>
                </div>

              </div>
            </div>

          </section>
        )}

      </main>
    </div>
  );
}


/* COMPONENTS */

function Input({ label, name, value, onChange }) {
  return (
    <div className="input-group">
      <label>{label}</label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}


function StatCard({ icon, title, value, text }) {
  return (
    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <span>{title}</span>

      <strong>{value}</strong>

      <small>{text}</small>

    </div>
  );
}

export default App;