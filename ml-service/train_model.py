
from pathlib import Path

import joblib
import pandas as pd

from sklearn.base import clone
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

# --------------------------------------------------
# 1. Load dataset
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
    raise ValueError("Expected a binary target.")

print("Dataset shape:", df.shape)
print("\nPromotion distribution:")
print(df[TARGET].value_counts())

# --------------------------------------------------
# 2. Separate features and target
# --------------------------------------------------

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
# 3. Preprocessing
# --------------------------------------------------

numeric_pipeline = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="median"))
    ]
)

categorical_pipeline = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore"))
    ]
)

preprocessor = ColumnTransformer(
    transformers=[
        ("numeric", numeric_pipeline, numeric_columns),
        ("categorical", categorical_pipeline, categorical_columns),
    ]
)

# --------------------------------------------------
# 4. Train-test split
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
# 5. Define three algorithms
# --------------------------------------------------

models = {
    "Decision Tree": DecisionTreeClassifier(
        max_depth=20,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
    ),

    "Random Forest": RandomForestClassifier(
        n_estimators=200,
        max_depth=20,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    ),

    "Logistic Regression": LogisticRegression(
        class_weight="balanced",
        max_iter=2000,
        random_state=42,
    ),
}

results = []

# --------------------------------------------------
# 6. Train and evaluate all three models
# --------------------------------------------------

for name, classifier in models.items():

    print("\n" + "=" * 55)
    print("TRAINING:", name)
    print("=" * 55)

    model = Pipeline(
        steps=[
            ("preprocessor", clone(preprocessor)),
            ("classifier", classifier),
        ]
    )

    # Train model
    model.fit(X_train, y_train)

    # Training predictions
    train_predictions = model.predict(X_train)

    # Testing predictions
    test_predictions = model.predict(X_test)

    # Prediction probabilities
    train_probabilities = model.predict_proba(X_train)[:, 1]
    test_probabilities = model.predict_proba(X_test)[:, 1]

    # Calculate accuracy
    train_accuracy = accuracy_score(
        y_train, train_predictions
    )

    test_accuracy = accuracy_score(
        y_test, test_predictions
    )

    # Other evaluation metrics
    precision = precision_score(
        y_test, test_predictions, zero_division=0
    )

    recall = recall_score(
        y_test, test_predictions, zero_division=0
    )

    f1 = f1_score(
        y_test, test_predictions, zero_division=0
    )

    roc_auc = roc_auc_score(
        y_test, test_probabilities
    )

    average_precision = average_precision_score(
        y_test, test_probabilities
    )

    print("\nTraining Accuracy:", round(train_accuracy * 100, 2), "%")
    print("Testing Accuracy:", round(test_accuracy * 100, 2), "%")
    print("Precision:", round(precision, 4))
    print("Recall:", round(recall, 4))
    print("F1 Score:", round(f1, 4))
    print("ROC-AUC:", round(roc_auc, 4))
    print("Average Precision:", round(average_precision, 4))

    print("\nClassification Report:")
    print(
        classification_report(
            y_test,
            test_predictions,
            labels=[0, 1],
            target_names=["Not Promoted", "Promoted"],
            zero_division=0,
        )
    )

    print("Confusion Matrix:")
    print(confusion_matrix(y_test, test_predictions))

    # Store results
    results.append({
        "Algorithm": name,
        "Training Accuracy (%)": round(train_accuracy * 100, 2),
        "Testing Accuracy (%)": round(test_accuracy * 100, 2),
        "Precision": round(precision, 4),
        "Recall": round(recall, 4),
        "F1 Score": round(f1, 4),
        "ROC-AUC": round(roc_auc, 4),
        "Average Precision": round(average_precision, 4),
    })

    # Save each trained model
    if name == "Decision Tree":
        filename = "promotion_decision_tree.joblib"

    elif name == "Random Forest":
        filename = "promotion_model.joblib"

    else:
        filename = "promotion_logistic_regression.joblib"

    joblib.dump(model, MODEL_DIR / filename)

    print("\nSaved model:", filename)

# --------------------------------------------------
# 7. Display comparison table
# --------------------------------------------------

comparison = pd.DataFrame(results)

print("\n")
print("=" * 90)
print("PROMOTION MODEL COMPARISON")
print("=" * 90)

print(comparison.to_string(index=False))

# Save comparison results
comparison_path = BASE_DIR / "promotion_model_comparison.csv"

comparison.to_csv(comparison_path, index=False)

print("\nComparison saved:", comparison_path)

print("\nPromotion model comparison completed successfully.")
