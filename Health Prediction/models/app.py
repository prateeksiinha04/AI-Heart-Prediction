# app.py  —  HealthPredict AI Backend
# Works with the heart_model.pkl produced by train_model.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

# ── Load the full pipeline (model + scaler + imputer) ──────────────────
pipeline = joblib.load("models/heart_model.pkl")
model   = pipeline["model"]
scaler  = pipeline["scaler"]
imputer = pipeline["imputer"]
FEATURES = pipeline["features"]

# ── Feature name mapping: frontend field → training column name ─────────
FIELD_MAP = {
    "age":              "age",
    "sex":              "sex",       # male=1, female=0 (set in frontend)
    "chestPainType":    "cp",
    "restingBP":        "trestbps",
    "cholesterol":      "chol",
    "fastingBloodSugar":"fbs",
    "restingECG":       "restecg",
    "maxHeartRate":     "thalach",
    "exerciseAngina":   "exang",
    "oldpeak":          "oldpeak",
    "slope":            "slope",
    "majorVessels":     "ca",
    "thalassemia":      "thal",
}

def engineer_features(raw: dict) -> list:
    """Apply the same feature engineering used during training."""
    age     = raw.get("age", 50)
    thalach = raw.get("thalach", 140)
    trestbps = raw.get("trestbps", 120)
    chol    = raw.get("chol", 200)

    raw["age_thalach_ratio"] = age / (thalach + 1)
    raw["bp_chol_product"]   = trestbps * chol / 10000
    raw["age_group"] = 0 if age <= 40 else (1 if age <= 55 else (2 if age <= 70 else 3))

    return [raw.get(f, 0) for f in FEATURES]


@app.route('/predict', methods=['POST'])
def predict():
    """Accept JSON from the frontend, run the model, return prediction."""
    data = request.json

    # Map frontend field names → training column names
    raw = {}
    for front_key, model_key in FIELD_MAP.items():
        raw[model_key] = data.get(front_key, 0)

    # Convert gender string → numeric if needed
    if isinstance(raw.get("sex"), str):
        raw["sex"] = 1 if raw["sex"].lower() == "male" else 0

    # Build feature vector with engineered features
    X = np.array([engineer_features(raw)])

    # Impute → scale → predict
    X = imputer.transform(X)
    X = scaler.transform(X)

    prediction  = int(model.predict(X)[0])
    probability = model.predict_proba(X)[0]
    confidence  = float(probability[prediction])

    return jsonify({
        "prediction": prediction,           # 0 = No Disease, 1 = Disease
        "confidence": confidence,           # e.g. 0.92
        "risk_percent": round(confidence * 100, 1),
        "risk_label": "High Risk" if prediction == 1 else "Low Risk"
    })


if __name__ == '__main__':
    app.run(port=5001, debug=True)
