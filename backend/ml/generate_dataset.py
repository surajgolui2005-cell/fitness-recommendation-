"""
generate_dataset.py
Generates 1000 synthetic fitness user records and saves to fitness_data.csv
Run this BEFORE train_model.py
"""

import pandas as pd
import numpy as np
import os

np.random.seed(42)
N = 1000  # number of records

# ── Generate raw features ──────────────────────────────────────────────────────
ages            = np.random.randint(18, 65, N)
genders         = np.random.randint(0, 2, N)          # 0=male, 1=female
weights         = np.random.uniform(45, 120, N)        # kg
heights         = np.random.uniform(150, 200, N)       # cm
bmis            = weights / ((heights / 100) ** 2)
activity_levels = np.random.randint(0, 3, N)           # 0=low, 1=medium, 2=high
dietary_prefs   = np.random.randint(0, 3, N)           # 0=vegan, 1=veg, 2=non-veg

# ── Derive realistic recommended_plan_type ─────────────────────────────────────
# Logic:
#   BMI < 18.5 or activity=high + age<35  → muscle gain (2)
#   BMI > 27   or activity=low            → weight loss (0)
#   Otherwise                             → maintenance (1)

plan_types = []
for i in range(N):
    bmi      = bmis[i]
    activity = activity_levels[i]
    age      = ages[i]
    noise    = np.random.random()   # add 15% noise for realism

    if noise < 0.15:
        plan_types.append(np.random.randint(0, 3))
    elif bmi > 27 or activity == 0:
        plan_types.append(0)  # weight loss
    elif bmi < 18.5 or (activity == 2 and age < 35):
        plan_types.append(2)  # muscle gain
    else:
        plan_types.append(1)  # maintenance

# ── Build DataFrame ────────────────────────────────────────────────────────────
df = pd.DataFrame({
    'age':               ages,
    'gender':            genders,
    'weight':            weights.round(1),
    'height':            heights.round(1),
    'bmi':               bmis.round(2),
    'activity_level':    activity_levels,
    'dietary_preference': dietary_prefs,
    'recommended_plan':  plan_types,
})

OUT_PATH = os.path.join(os.path.dirname(__file__), 'fitness_data.csv')
df.to_csv(OUT_PATH, index=False)

print(f'[OK] Dataset saved to {OUT_PATH}')
print(f'     Shape: {df.shape}')
print(f'     Plan distribution:')
print(df["recommended_plan"].value_counts().rename({0:"weight loss", 1:"maintenance", 2:"muscle gain"}))
