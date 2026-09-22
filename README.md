# 🛡️ SentinelAI — COD & RTO Risk Intelligence Platform

> **An end-to-end Machine Learning system that predicts the probability of Return-to-Origin (RTO) for e-commerce orders and helps identify orders that may require additional review.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-SentinelAI-success?style=for-the-badge)](https://sentinel-gdi42hqvn-subham-das-projects-d0ff5a98.vercel.app/)
[![Backend](https://img.shields.io/badge/API-FastAPI-009688?style=for-the-badge)](https://sentinelai-backend-yfk5.onrender.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge)](https://react.dev/)
[![ML](https://img.shields.io/badge/ML-XGBoost-red?style=for-the-badge)](https://xgboost.readthedocs.io/)

---

## 🚀 Live Demo

### 👉 [Open SentinelAI](https://sentinel-gdi42hqvn-subham-das-projects-d0ff5a98.vercel.app/)

The deployed application provides an interactive interface where users can enter order, customer, seller, geographic, payment, velocity, and device information and receive an ML-generated RTO risk probability.

---

## 🎯 Problem Statement

E-commerce businesses lose revenue when orders are returned to the seller instead of being successfully delivered.

**Return-to-Origin (RTO)** can result in:

* Reverse logistics costs
* Shipping and handling losses
* Inventory blockage
* Cash-flow impact
* Operational inefficiency
* Increased risk associated with Cash-on-Delivery orders

SentinelAI approaches this problem as a **binary classification task**, estimating the probability that an order will result in RTO.

---

## 💡 Solution

SentinelAI combines multiple order and behavioral signals to generate an RTO risk probability.

The system considers:

* Order characteristics
* Payment information
* Customer history
* Seller risk
* Geographic signals
* Order velocity
* Device behavior

The resulting probability is passed through a configurable decision threshold.

### Decision Logic

```text
RTO Probability < 30%
        ↓
     APPROVE

RTO Probability ≥ 30%
        ↓
  REVIEW_OR_BLOCK
```

The system therefore supports a simple operational workflow:

```text
Low-risk order → Approve
Higher-risk order → Review / potentially block
```

---

# 🧠 Machine Learning

## Model

**XGBoost Classifier**

The final model uses **21 engineered features**.

### Feature Groups

#### 📦 Order Features

* `order_value`
* `number_of_items`
* `avg_freight_value`
* `payment_installments`
* `total_payment_value`

#### 👤 Customer Features

* `previous_orders`
* `customer_tenure_days`
* `previous_rto_count`

#### 🌍 Geographic Features

* `distance_from_warehouse`
* `distance_missing`
* `pincode_risk_score`

#### ⚡ Behavioral / Velocity Features

* `orders_last_24h`
* `orders_last_7d`
* `device_order_count`
* `accounts_per_device`

#### 🏪 Seller Features

* `seller_risk_score`

#### 💳 Payment Features

One-hot encoded payment indicators:

* `payment_boleto`
* `payment_credit_card`
* `payment_debit_card`
* `payment_voucher`

---

# 📊 Model Evaluation

The model was evaluated on a held-out test set.

| Metric         |      Score |
| -------------- | ---------: |
| ROC-AUC        |  **0.626** |
| PR-AUC         |  **0.109** |
| Test Orders    | **19,734** |
| Final Features |     **21** |

### Test-set decision distribution

| Decision        | Orders |
| --------------- | -----: |
| APPROVE         | 15,539 |
| REVIEW_OR_BLOCK |  4,195 |

The model's probability output is used for operational decisioning rather than relying on a simple binary prediction alone.

> **Note:** The reported metrics reflect the current project model and should not be interpreted as production-grade performance. The primary goal of this project is demonstrating an end-to-end ML system, feature engineering, API integration, and deployment workflow.

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │     React UI         │
                         │     Vercel           │
                         └──────────┬──────────┘
                                    │
                                    │ HTTP POST
                                    ▼
                         ┌─────────────────────┐
                         │     FastAPI         │
                         │     Render          │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Feature Engineering │
                         │                     │
                         │ Customer History    │
                         │ Seller Risk         │
                         │ ZIP Risk            │
                         │ Geographic Distance │
                         │ Velocity Signals    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      XGBoost        │
                         │    Risk Engine      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  RTO Probability    │
                         │                     │
                         │  < 30% → APPROVE   │
                         │  ≥ 30% → REVIEW     │
                         └─────────────────────┘
```

---

# ⚙️ Technology Stack

### Machine Learning

* Python
* Pandas
* NumPy
* Scikit-learn
* XGBoost
* Joblib

### Backend

* FastAPI
* Uvicorn
* Python

### Frontend

* React
* Vite
* Axios
* Lucide React
* CSS

### Deployment

* **Vercel** — React frontend
* **Render** — FastAPI backend
* **GitHub** — Source control

---

# 🔥 Key Features

### 1. ML-Based RTO Prediction

Predicts the probability of an order being returned to origin using an XGBoost classification model.

### 2. Behavioral Risk Signals

Uses order velocity and device-level signals such as:

* Orders in the last 24 hours
* Orders in the last 7 days
* Device order count
* Accounts per device

### 3. Customer Risk Intelligence

Historical customer behavior is incorporated through:

* Previous order count
* Previous RTO count
* Customer tenure

### 4. Seller Risk Intelligence

Historical seller-level risk is converted into a model feature through seller risk scoring.

### 5. Geographic Risk

The system incorporates:

* Customer/seller ZIP information
* Geographic distance
* ZIP-level historical risk

### 6. Real-Time API Prediction

The trained model is exposed through a FastAPI REST endpoint.

### 7. Interactive Dashboard

The React dashboard provides:

* Model overview
* Order prediction form
* RTO probability visualization
* Decision status
* Model analytics

---

# 📁 Project Structure

```text
SentinelAI/
│
├── model_artifacts/
│   ├── sentinelai_model.pkl
│   ├── zip_risk_map.pkl
│   ├── seller_risk_map.pkl
│   ├── model_constants.pkl
│   ├── geo_agg.pkl
│   └── customers_hist.pkl
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── __init__.py
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
└── notebooks/
    └── SentinelAI_Model_Development.ipynb
```

---

# 🔌 API

## Health Check

```http
GET /health
```

Example response:

```json
{
  "status": "ok",
  "model_loaded": true,
  "geo_loaded": true,
  "customer_history_loaded": true
}
```

## Prediction

```http
POST /predict
```

The endpoint accepts order information and returns an estimated RTO probability and operational decision.

Example response:

```json
{
  "rto_probability": 0.1234,
  "decision": "APPROVE"
}
```

---

# 🖥️ Running Locally

## 1. Clone the repository

```bash
git clone https://github.com/sd6295/SentinelAI.git
cd SentinelAI
```

## 2. Start the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

## 3. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🔄 Prediction Workflow

```text
User enters order data
        ↓
React frontend sends JSON request
        ↓
FastAPI receives order
        ↓
Feature engineering pipeline
        ↓
Historical risk features added
        ↓
21-feature model matrix created
        ↓
XGBoost predicts RTO probability
        ↓
Probability compared with threshold
        ↓
APPROVE / REVIEW_OR_BLOCK
        ↓
Result displayed in React dashboard
```

---

# 🧪 Example Use Case

An e-commerce platform receives a new COD order.

SentinelAI can combine information such as:

```text
Order Value
      +
Customer History
      +
Previous RTO Behaviour
      +
Seller Risk
      +
ZIP Risk
      +
Geographic Distance
      +
Order Velocity
      +
Device Behaviour
      ↓
XGBoost
      ↓
RTO Probability
      ↓
Operational Decision
```

This enables the platform to identify orders that may deserve additional verification before fulfillment.

---

# 🎓 What This Project Demonstrates

This project was designed as an end-to-end ML engineering project rather than a standalone notebook.

It demonstrates practical experience with:

* Data preprocessing
* Feature engineering
* Historical risk aggregation
* Machine learning classification
* XGBoost
* Model serialization
* REST API development
* React frontend development
* Frontend-backend integration
* CORS configuration
* Git/GitHub
* Cloud deployment
* ML inference through a web application

---

# 🚧 Future Improvements

Potential future iterations could include:

* Model calibration for better probability estimates
* Automated threshold optimization based on business cost
* SHAP-based explainability for individual predictions
* Model monitoring and drift detection
* Batch prediction for large order datasets
* Authentication and role-based access
* Persistent prediction history
* Automated model retraining
* More sophisticated fraud and device-risk signals

---

# 👨‍💻 Author

**Subham Das**

B.Tech — Electronics & Communication Engineering

### Project

**SentinelAI — COD & RTO Risk Intelligence Platform**

---

## ⭐ Project Links

🚀 **Live Application:**
https://sentinel-gdi42hqvn-subham-das-projects-d0ff5a98.vercel.app/

💻 **GitHub Repository:**
https://github.com/sd6295/SentinelAI

⚡ **Backend API:**
https://sentinelai-backend-yfk5.onrender.com/

---

> **SentinelAI transforms historical e-commerce behaviour and order-level signals into an actionable ML-driven risk assessment — from raw data to a deployed prediction system.**
