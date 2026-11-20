
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
    roc_curve,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import (
    OneHotEncoder,
    StandardScaler,
)

import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt


# ==================================================
# 1. PATH CONFIGURATION
# ==================================================

BASE_DIR = Path(__file__).resolve().parent

DATA_PATH = BASE_DIR / "data" / "promotion_cleaned.csv"

MODEL_DIR = BASE_DIR / "models"
RESULTS_DIR = BASE_DIR / "results"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

TARGET = "is_promoted"

RANDOM_STATE = 42
TEST_SIZE = 0.20


# ==================================================
# 2. LOAD DATASET
# ==================================================

print("\n" + "=" * 65)
print("SMARTHR - PROMOTION PREDICTION")
print("THREE MACHINE LEARNING MODEL COMPARISON")
print("=" * 65)

if not DATA_PATH.exists():
    raise FileNotFoundError(
        f"Dataset not found: {DATA_PATH}"
    )

df = pd.read_csv(DATA_PATH)

print("\nDataset loaded successfully.")
print("Dataset shape:", df.shape)

if TARGET not in df.columns:
    raise ValueError(
        f"Target column '{TARGET}' not found."
    )

if df[TARGET].isna().any():
    raise ValueError(
        "Target column contains missing values."
    )

if df[TARGET].nunique() != 2:
    raise ValueError(
        "Expected a binary target column."
    )

y = df[TARGET].astype(int)

if not set(y.unique()).issubset({0, 1}):
    raise ValueError(
        "Promotion target must contain 0 and 1."
    )

print("\nPromotion distribution:")
print(y.value_counts())

print("\nPromotion percentages:")
print(
    (y.value_counts(normalize=True) * 100).round(2)
)


# ==================================================
# 3. FEATURES AND TARGET
# ==================================================

X = df.drop(
    columns=[TARGET, "employee_id"],
    errors="ignore",
)

# Remove columns containing only missing values.
empty_columns = X.columns[
    X.isna().all()
].tolist()

if empty_columns:
    print("\nRemoving empty columns:", empty_columns)
    X = X.drop(columns=empty_columns)

if X.empty:
    raise ValueError(
        "No usable input features found."
    )

categorical_columns = X.select_dtypes(
    include=["object", "category", "bool"]
).columns.tolist()

numeric_columns = X.select_dtypes(
    include=["number"]
).columns.tolist()

print("\nCategorical features:")
print(categorical_columns)

print("\nNumerical features:")
print(numeric_columns)

if not categorical_columns and not numeric_columns:
    raise ValueError(
        "No supported numeric or categorical features."
    )


# ==================================================
# 4. DATA PREPROCESSING
# ==================================================

numeric_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="median"),
        ),
        (
            "scaler",
            StandardScaler(),
        ),
    ]
)

categorical_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(
                strategy="most_frequent"
            ),
        ),
        (
            "encoder",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
        ),
    ]
)

transformers = []

if numeric_columns:
    transformers.append(
        (
            "numeric",
            numeric_pipeline,
            numeric_columns,
        )
    )

if categorical_columns:
    transformers.append(
        (
            "categorical",
            categorical_pipeline,
            categorical_columns,
        )
    )

preprocessor = ColumnTransformer(
    transformers=transformers
)


# ==================================================
# 5. TRAIN-TEST SPLIT
# ==================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=TEST_SIZE,
    random_state=RANDOM_STATE,
    stratify=y,
)

print("\nTraining records:", len(X_train))
print("Testing records:", len(X_test))

print("\nTraining class distribution:")
print(y_train.value_counts())

print("\nTesting class distribution:")
print(y_test.value_counts())


# ==================================================
# 6. DEFINE THREE ML ALGORITHMS
# ==================================================

models = {
    "Decision Tree": DecisionTreeClassifier(
        max_depth=20,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=RANDOM_STATE,
    ),

    "Random Forest": RandomForestClassifier(
        n_estimators=200,
        max_depth=20,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=RANDOM_STATE,
        n_jobs=-1,
    ),

    "Logistic Regression": LogisticRegression(
        class_weight="balanced",
        max_iter=3000,
        random_state=RANDOM_STATE,
    ),
}

model_filenames = {
    "Decision Tree": "promotion_decision_tree.joblib",
    "Random Forest": "promotion_random_forest_comparison.joblib",
    "Logistic Regression": "promotion_logistic_regression.joblib",
}

results = []
roc_results = {}


# ==================================================
# 7. TRAIN AND EVALUATE MODELS
# ==================================================

for name, classifier in models.items():

    print("\n" + "=" * 65)
    print("TRAINING:", name)
    print("=" * 65)

    model = Pipeline(
        steps=[
            (
                "preprocessor",
                clone(preprocessor),
            ),
            (
                "classifier",
                clone(classifier),
            ),
        ]
    )

    # Train model
    model.fit(X_train, y_train)

    # Predictions
    train_predictions = model.predict(X_train)
    test_predictions = model.predict(X_test)

    # Probabilities for positive class (1)
    positive_class_index = list(
        model.classes_
    ).index(1)

    test_probabilities = model.predict_proba(
        X_test
    )[:, positive_class_index]

    # Accuracy
    train_accuracy = accuracy_score(
        y_train, train_predictions
    )

    test_accuracy = accuracy_score(
        y_test, test_predictions
    )

    # Classification metrics
    precision = precision_score(
        y_test,
        test_predictions,
        zero_division=0,
    )

    recall = recall_score(
        y_test,
        test_predictions,
        zero_division=0,
    )

    f1 = f1_score(
        y_test,
        test_predictions,
        zero_division=0,
    )

    roc_auc = roc_auc_score(
        y_test,
        test_probabilities,
    )

    avg_precision = average_precision_score(
        y_test,
        test_probabilities,
    )

    # Confusion matrix
    cm = confusion_matrix(
        y_test,
        test_predictions,
        labels=[0, 1],
    )

    tn, fp, fn, tp = cm.ravel()

    print(
        "\nTraining Accuracy:",
        round(train_accuracy * 100, 2),
        "%",
    )

    print(
        "Testing Accuracy:",
        round(test_accuracy * 100, 2),
        "%",
    )

    print("Precision:", round(precision, 4))
    print("Recall:", round(recall, 4))
    print("F1 Score:", round(f1, 4))
    print("ROC-AUC:", round(roc_auc, 4))

    print(
        "Average Precision:",
        round(avg_precision, 4),
    )

    print("\nClassification Report:")

    print(
        classification_report(
            y_test,
            test_predictions,
            labels=[0, 1],
            target_names=[
                "Not Promoted",
                "Promoted",
            ],
            zero_division=0,
        )
    )

    print("\nConfusion Matrix:")
    print(cm)

    print("\nTrue Negatives:", tn)
    print("False Positives:", fp)
    print("False Negatives:", fn)
    print("True Positives:", tp)

    # Store results
    results.append(
        {
            "Algorithm": name,
            "Training Accuracy (%)": round(
                train_accuracy * 100, 2
            ),
            "Testing Accuracy (%)": round(
                test_accuracy * 100, 2
            ),
            "Precision": round(
                precision, 4
            ),
            "Recall": round(
                recall, 4
            ),
            "F1 Score": round(
                f1, 4
            ),
            "ROC-AUC": round(
                roc_auc, 4
            ),
            "Average Precision": round(
                avg_precision, 4
            ),
            "TN": int(tn),
            "FP": int(fp),
            "FN": int(fn),
            "TP": int(tp),
        }
    )

    # Save trained model
    filename = model_filenames[name]
    model_path = MODEL_DIR / filename

    joblib.dump(model, model_path)

    print("\nModel saved:", model_path)

    # Save individual confusion matrix
    fig, ax = plt.subplots(figsize=(6, 5))

    display = ax.imshow(
        cm,
        interpolation="nearest",
        cmap="Blues",
    )

    fig.colorbar(display, ax=ax)

    ax.set(
        xticks=[0, 1],
        yticks=[0, 1],
        xticklabels=[
            "Not Promoted",
            "Promoted",
        ],
        yticklabels=[
            "Not Promoted",
            "Promoted",
        ],
        xlabel="Predicted Label",
        ylabel="Actual Label",
        title=f"{name} - Confusion Matrix",
    )

    for i in range(2):
        for j in range(2):
            ax.text(
                j,
                i,
                str(cm[i, j]),
                ha="center",
                va="center",
                color="black",
            )

    fig.tight_layout()

    image_name = name.lower().replace(
        " ", "_"
    )

    confusion_path = (
        RESULTS_DIR /
        f"promotion_{image_name}_confusion_matrix.png"
    )

    fig.savefig(
        confusion_path,
        dpi=200,
        bbox_inches="tight",
    )

    plt.close(fig)

    # Store ROC curve data
    fpr, tpr, _ = roc_curve(
        y_test,
        test_probabilities,
    )

    roc_results[name] = {
        "fpr": fpr,
        "tpr": tpr,
        "auc": roc_auc,
    }

    print(
        "Confusion matrix saved:",
        confusion_path,
    )


# ==================================================
# 8. MODEL COMPARISON TABLE
# ==================================================

comparison = pd.DataFrame(results)

comparison = comparison.sort_values(
    by="F1 Score",
    ascending=False,
).reset_index(drop=True)

print("\n" + "=" * 90)
print("PROMOTION MODEL COMPARISON")
print("=" * 90)

print(comparison.to_string(index=False))

comparison_path = (
    RESULTS_DIR / "promotion_model_comparison.csv"
)

comparison.to_csv(
    comparison_path,
    index=False,
)

print("\nComparison saved:", comparison_path)


# ==================================================
# 9. ACCURACY COMPARISON GRAPH
# ==================================================

fig, ax = plt.subplots(figsize=(9, 5))

ax.bar(
    comparison["Algorithm"],
    comparison["Testing Accuracy (%)"],
)

ax.set_title(
    "SmartHR - Promotion Model Accuracy Comparison"
)

ax.set_ylabel("Testing Accuracy (%)")
ax.set_xlabel("Machine Learning Algorithm")

ax.set_ylim(0, 100)

for index, value in enumerate(
    comparison["Testing Accuracy (%)"]
):
    ax.text(
        index,
        value + 1,
        f"{value:.2f}%",
        ha="center",
    )

fig.tight_layout()

accuracy_chart_path = (
    RESULTS_DIR / "promotion_accuracy_comparison.png"
)

fig.savefig(
    accuracy_chart_path,
    dpi=200,
    bbox_inches="tight",
)

plt.close(fig)


# ==================================================
# 10. F1-SCORE COMPARISON GRAPH
# ==================================================

fig, ax = plt.subplots(figsize=(9, 5))

ax.bar(
    comparison["Algorithm"],
    comparison["F1 Score"],
)

ax.set_title(
    "SmartHR - Promotion F1-Score Comparison"
)

ax.set_ylabel("F1 Score")
ax.set_xlabel("Machine Learning Algorithm")

ax.set_ylim(0, 1.1)

for index, value in enumerate(
    comparison["F1 Score"]
):
    ax.text(
        index,
        value + 0.02,
        f"{value:.4f}",
        ha="center",
    )

fig.tight_layout()

f1_chart_path = (
    RESULTS_DIR / "promotion_f1_comparison.png"
)

fig.savefig(
    f1_chart_path,
    dpi=200,
    bbox_inches="tight",
)

plt.close(fig)


# ==================================================
# 11. ROC CURVE COMPARISON
# ==================================================

fig, ax = plt.subplots(figsize=(9, 6))

for name, values in roc_results.items():

    ax.plot(
        values["fpr"],
        values["tpr"],
        label=(
            f"{name} "
            f"(AUC = {values['auc']:.4f})"
        ),
    )

ax.plot(
    [0, 1],
    [0, 1],
    linestyle="--",
    color="gray",
    label="Random Classifier",
)

ax.set_title(
    "SmartHR - Promotion ROC Curve Comparison"
)

ax.set_xlabel("False Positive Rate")
ax.set_ylabel("True Positive Rate")

ax.legend(loc="lower right")
ax.grid(alpha=0.3)

fig.tight_layout()

roc_chart_path = (
    RESULTS_DIR / "promotion_roc_comparison.png"
)

fig.savefig(
    roc_chart_path,
    dpi=200,
    bbox_inches="tight",
)

plt.close(fig)


# ==================================================
# 12. DISPLAY BEST MODEL
# ==================================================

best_model = comparison.iloc[0]

print("\n" + "=" * 65)
print("BEST PROMOTION MODEL BASED ON F1 SCORE")
print("=" * 65)

print("Algorithm:", best_model["Algorithm"])

print(
    "Testing Accuracy:",
    best_model["Testing Accuracy (%)"],
    "%",
)

print("Precision:", best_model["Precision"])
print("Recall:", best_model["Recall"])
print("F1 Score:", best_model["F1 Score"])
print("ROC-AUC:", best_model["ROC-AUC"])

print("\n" + "=" * 65)
print("ALL THREE PROMOTION MODELS TRAINED SUCCESSFULLY")
print("=" * 65)

print("\nSaved model files:")

for name, filename in model_filenames.items():
    print(f"{name}: {MODEL_DIR / filename}")

print("\nSaved results:")
print(comparison_path)
print(accuracy_chart_path)
print(f1_chart_path)
print(roc_chart_path)
