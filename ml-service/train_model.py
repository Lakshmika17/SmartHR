
from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

# --------------------------------------------------
# 1. Load the dataset
# --------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "promotion_cleaned.csv"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(DATA_PATH)

TARGET = "is_promoted"

if TARGET not in df.columns:
    raise ValueError(f"Target column '{TARGET}' not found.")

if df[TARGET].nunique() != 2:
    raise ValueError("Expected a binary target with values 0 and 1.")

print("Dataset shape:", df.shape)
print("\nPromotion distribution:")
print(df[TARGET].value_counts())
print("\nPromotion percentages:")
print((df[TARGET].value_counts(normalize=True) * 100).round(2))

# --------------------------------------------------
# 2. Separate features and target
# --------------------------------------------------
# employee_id is an identifier, not a meaningful
# employee performance feature, so exclude it.
X = df.drop(columns=[TARGET, "employee_id"], errors="ignore")
y = df[TARGET].astype(int)

categorical_columns = X.select_dtypes(
    include=["object", "category", "bool"]
).columns.tolist()

numeric_columns = X.select_dtypes(
    include=["number"]
).columns.tolist()

print("\nCategorical features:", categorical_columns)
print("Numeric features:", numeric_columns)

# --------------------------------------------------
# 3. Preprocess the features
# --------------------------------------------------
numeric_pipeline = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="median")),
    ]
)

categorical_pipeline = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        (
            "encoder",
            OneHotEncoder(handle_unknown="ignore"),
        ),
    ]
)

preprocessor = ColumnTransformer(
    transformers=[
        ("numeric", numeric_pipeline, numeric_columns),
        ("categorical", categorical_pipeline, categorical_columns),
    ]
)

# --------------------------------------------------
# 4. Split data into training and testing sets
# --------------------------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

print("\nTraining records:", len(X_train))
print("Testing records:", len(X_test))

# --------------------------------------------------
# 5. Build the classification model
# --------------------------------------------------
model = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        (
            "classifier",
            RandomForestClassifier(
                n_estimators=200,
                max_depth=20,
                min_samples_leaf=2,
                class_weight="balanced",
                random_state=42,
                n_jobs=-1,
            ),
        ),
    ]
)

print("\nTraining model...")
model.fit(X_train, y_train)

# --------------------------------------------------
# 6. Evaluate on unseen test data
# --------------------------------------------------
predictions = model.predict(X_test)
probabilities = model.predict_proba(X_test)[:, 1]

print("\n========== MODEL EVALUATION ==========")
print(f"Accuracy: {accuracy_score(y_test, predictions):.4f}")
print(f"ROC-AUC: {roc_auc_score(y_test, probabilities):.4f}")
print(
    "Average precision (PR-AUC): "
    f"{average_precision_score(y_test, probabilities):.4f}"
)

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        predictions,
        labels=[0, 1],
        target_names=["Not Promoted", "Promoted"],
        zero_division=0,
    )
)

print("Confusion Matrix:")
print(confusion_matrix(y_test, predictions, labels=[0, 1]))

# --------------------------------------------------
# 7. Save the complete pipeline
# --------------------------------------------------
model_path = MODEL_DIR / "promotion_model.joblib"
joblib.dump(model, model_path)

print("\nModel saved successfully:")
print(model_path)
print("\nPromotion model training completed.")
