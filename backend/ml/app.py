"""
FitPick ML Microservice
Flask REST API — exposes POST /predict endpoint
Loads the trained Random Forest model and returns plan type prediction
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os

app = Flask(__name__)
CORS(app)  # Allow Node.js backend to call this service

# ── Load model on startup ──────────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')

model = None
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    print('[OK] Model loaded from model.pkl')
else:
    print('[WARN] model.pkl not found. Run train_model.py first!')

# ── Label maps (must match train_model.py) ────────────────────────────────────
GENDER_MAP          = {'male': 0, 'female': 1}
GOAL_MAP            = {'weight loss': 0, 'maintenance': 1, 'muscle gain': 2}
ACTIVITY_MAP        = {'low': 0, 'medium': 1, 'high': 2}
DIET_MAP            = {'vegan': 0, 'vegetarian': 1, 'non-vegetarian': 2}
PLAN_LABEL_MAP      = {0: 'weight loss', 1: 'maintenance', 2: 'muscle gain'}

# ── Routes ────────────────────────────────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'modelLoaded': model is not None})


@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded. Run train_model.py first.'}), 503

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON body received'}), 400

    try:
        # Extract and encode features (7 features — must match train_model.py)
        age             = float(data.get('age', 25))
        gender          = GENDER_MAP.get(str(data.get('gender', 'male')).lower(), 0)
        weight          = float(data.get('weight', 70))
        height          = float(data.get('height', 170))
        bmi             = float(data.get('bmi', weight / ((height / 100) ** 2)))
        activity_level  = ACTIVITY_MAP.get(str(data.get('activityLevel', 'medium')).lower(), 1)
        dietary_pref    = DIET_MAP.get(str(data.get('dietaryPreference', 'non-vegetarian')).lower(), 2)

        features = pd.DataFrame([{
            'age': age, 'gender': gender, 'weight': weight,
            'height': height, 'bmi': bmi,
            'activity_level': activity_level, 'dietary_preference': dietary_pref
        }])

        prediction  = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        confidence  = round(float(probabilities[prediction]) * 100, 1)

        return jsonify({
            'predictedPlanType': PLAN_LABEL_MAP[prediction],
            'confidence':        confidence,
            'allProbabilities': {
                PLAN_LABEL_MAP[i]: round(float(p) * 100, 1)
                for i, p in enumerate(probabilities)
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print('[START] FitPick ML Service running on http://localhost:5001')
    app.run(host='0.0.0.0', port=5001, debug=True, use_reloader=False)
