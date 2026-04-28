"""
train_model.py
Trains a Random Forest Classifier on fitness_data.csv
Saves the trained model to model.pkl
Run: python train_model.py
"""

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

# ── Load dataset ───────────────────────────────────────────────────────────────
DATA_PATH = os.path.join(os.path.dirname(__file__), 'fitness_data.csv')
if not os.path.exists(DATA_PATH):
    raise FileNotFoundError('fitness_data.csv not found. Run generate_dataset.py first!')

df = pd.read_csv(DATA_PATH)
print(f'[OK] Loaded dataset: {df.shape[0]} records')

# ── Features & target ─────────────────────────────────────────────────────────
FEATURES = ['age', 'gender', 'weight', 'height', 'bmi', 'activity_level', 'dietary_preference']
TARGET   = 'recommended_plan'

X = df[FEATURES]
y = df[TARGET]

# ── Train / test split ────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f'   Train: {len(X_train)} | Test: {len(X_test)}')

# ── Train Random Forest ───────────────────────────────────────────────────────
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=10,
    random_state=42,
    class_weight='balanced',
)
model.fit(X_train, y_train)
print('[OK] Model trained!')

# ── Evaluate ──────────────────────────────────────────────────────────────────
y_pred   = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f'\n[RESULTS] Accuracy: {accuracy * 100:.2f}%')
print('\n[RESULTS] Classification Report:')
print(classification_report(
    y_test, y_pred,
    target_names=['Weight Loss', 'Maintenance', 'Muscle Gain']
))

# ── Feature importance ────────────────────────────────────────────────────────
importances = pd.Series(model.feature_importances_, index=FEATURES).sort_values(ascending=False)
print('[INFO] Feature Importances:')
for feat, imp in importances.items():
    print(f'   {feat:<22} {imp:.4f}')

# ── Save model ────────────────────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')
joblib.dump(model, MODEL_PATH)
print(f'\n[OK] Model saved to {MODEL_PATH}')
