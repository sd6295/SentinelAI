from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import math


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# LOAD SENTINELAI MODEL ARTIFACTS
# ============================================================

model = joblib.load("../model_artifacts/sentinelai_model.pkl")

zip_risk_map = joblib.load("../model_artifacts/zip_risk_map.pkl")

seller_risk_map = joblib.load("../model_artifacts/seller_risk_map.pkl")

model_constants = joblib.load("../model_artifacts/model_constants.pkl")

geo_agg = joblib.load("../model_artifacts/geo_agg.pkl")

customers_hist = joblib.load("../model_artifacts/customers_hist.pkl")


# Convert risk maps to normal dictionaries
zip_risk_dict = zip_risk_map.to_dict()

seller_risk_dict = seller_risk_map.to_dict()


# ============================================================
# HAVERSINE DISTANCE
# ============================================================

def haversine(lat1, lon1, lat2, lon2):

    R = 6371.0

    lat1 = math.radians(lat1)
    lon1 = math.radians(lon1)

    lat2 = math.radians(lat2)
    lon2 = math.radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


# ============================================================
# BUILD FEATURES
# ============================================================

def build_features(
    raw_order,
    geo_agg,
    customers_hist,
    model_constants,
    zip_risk_dict,
    seller_risk_dict
):

    f = {}

    f['order_value'] = raw_order.get(
        'order_value',
        model_constants['median_order_value']
    )

    f['number_of_items'] = raw_order.get(
        'number_of_items',
        model_constants['median_number_of_items']
    )

    f['avg_freight_value'] = raw_order.get(
        'avg_freight_value',
        model_constants['median_avg_freight_value']
    )

    f['payment_installments'] = raw_order.get(
        'payment_installments',
        model_constants['median_payment_installments']
    )

    f['total_payment_value'] = raw_order.get(
        'total_payment_value',
        model_constants['median_total_payment_value']
    )


    # --------------------------------------------------------
    # PAYMENT TYPE
    # --------------------------------------------------------

    payment_type = raw_order.get(
        'payment_type',
        'credit_card'
    )

    f['is_cod'] = 1 if payment_type == 'boleto' else 0


    # --------------------------------------------------------
    # CUSTOMER HISTORY
    # --------------------------------------------------------

    cust_id = raw_order.get('customer_unique_id')

    if cust_id is not None and cust_id in customers_hist.index:

        hist = customers_hist.loc[cust_id]

        f['previous_orders'] = hist['previous_orders']

        f['customer_tenure_days'] = hist['customer_tenure_days']

        f['previous_rto_count'] = hist['previous_rto_count']

    else:

        f['previous_orders'] = 0

        f['customer_tenure_days'] = 0

        f['previous_rto_count'] = 0


    # --------------------------------------------------------
    # DISTANCE
    # --------------------------------------------------------

    cust_zip = raw_order.get(
        'customer_zip_code_prefix'
    )

    seller_zip = raw_order.get(
        'seller_zip_code_prefix'
    )

    try:

        cust_lat = geo_agg.loc[cust_zip, 'lat']

        cust_lng = geo_agg.loc[cust_zip, 'lng']

        seller_lat = geo_agg.loc[seller_zip, 'lat']

        seller_lng = geo_agg.loc[seller_zip, 'lng']

        dist = haversine(
            cust_lat,
            cust_lng,
            seller_lat,
            seller_lng
        )

        f['distance_from_warehouse'] = dist

        f['distance_missing'] = 0

    except (KeyError, TypeError):

        f['distance_from_warehouse'] = (
            model_constants['median_distance']
        )

        f['distance_missing'] = 1


    # --------------------------------------------------------
    # RISK SCORES
    # --------------------------------------------------------

    f['pincode_risk_score'] = zip_risk_dict.get(
        cust_zip,
        model_constants['global_mean']
    )

    f['seller_risk_score'] = seller_risk_dict.get(
        raw_order.get('seller_id'),
        model_constants['global_mean']
    )


    # --------------------------------------------------------
    # VELOCITY / DEVICE FEATURES
    # --------------------------------------------------------

    f['orders_last_24h'] = raw_order.get(
        'orders_last_24h',
        0
    )

    f['orders_last_7d'] = raw_order.get(
        'orders_last_7d',
        0
    )

    f['device_order_count'] = raw_order.get(
        'device_order_count',
        0
    )

    f['accounts_per_device'] = raw_order.get(
        'accounts_per_device',
        1
    )


    # --------------------------------------------------------
    # PAYMENT ONE-HOT ENCODING
    # --------------------------------------------------------

    for pt in [
        'boleto',
        'credit_card',
        'debit_card',
        'voucher'
    ]:

        f[f'payment_{pt}'] = (
            1 if payment_type == pt else 0
        )


    # --------------------------------------------------------
    # FINAL MODEL FEATURE ORDER
    # --------------------------------------------------------

    return pd.DataFrame([f])[
        model_constants['model_feature_order']
    ]


# ============================================================
# HOME ENDPOINT
# ============================================================

@app.get("/")
def home():

    return {
        "message": "SentinelAI API is running"
    }


# ============================================================
# HEALTH ENDPOINT
# ============================================================

@app.get("/health")
def health():

    return {

        "status": "ok",

        "model_loaded": model is not None,

        "geo_loaded": geo_agg is not None,

        "customer_history_loaded":
            customers_hist is not None

    }

# ============================================================
# PREDICTION ENDPOINT
# ============================================================

@app.post("/predict")
def predict(raw_order: dict):

    features = build_features(
        raw_order,
        geo_agg,
        customers_hist,
        model_constants,
        zip_risk_dict,
        seller_risk_dict
    )

    probability = float(model.predict_proba(features)[0][1])

    decision = (
        "APPROVE"
        if probability < 0.30
        else "REVIEW_OR_BLOCK"
    )

    return {
        "rto_probability": round(probability, 4),
        "decision": decision
    }