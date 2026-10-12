import pandas as pd

# Load both promotion dataset files
train = pd.read_csv(r"E:\Projects\SmartHR\Datasets\train.csv")
test = pd.read_csv(r"E:\Projects\SmartHR\Datasets\test.csv")

print("===== TRAIN DATASET =====")
print("Shape:", train.shape)
print("\nFirst 5 rows:")
print(train.head())

print("\nColumn names:")
print(train.columns.tolist())

print("\nMissing values:")
print(train.isnull().sum())

print("\nDuplicate rows:", train.duplicated().sum())

print("\n===== TEST DATASET =====")
print("Shape:", test.shape)
print(test.head())
print("\nColumn names:")
print(test.columns.tolist())


# ==========================================
# STEP 2: DETAILED DATA UNDERSTANDING
# ==========================================

print("\n===== DATA TYPES =====")
print(train.dtypes)

# Missing value summary
print("\n===== MISSING VALUE SUMMARY =====")

missing = pd.DataFrame({
    "Missing_Count": train.isnull().sum(),
    "Missing_Percentage": (train.isnull().mean() * 100).round(2)
})

print(missing[missing["Missing_Count"] > 0])

# Unique values in categorical columns
print("\n===== UNIQUE VALUES =====")

for col in train.select_dtypes(include="object").columns:
    print(f"\n{col}:")
    print(train[col].value_counts(dropna=False).head(10))

# Numerical summary
print("\n===== NUMERICAL SUMMARY =====")
print(train.describe())

# Target distribution
print("\n===== PROMOTION DISTRIBUTION =====")

print(train["is_promoted"].value_counts())
print(
    (train["is_promoted"].value_counts(normalize=True) * 100).round(2)
)

# Plot target distribution
import matplotlib.pyplot as plt
import seaborn as sns

sns.countplot(data=train, x="is_promoted")
plt.title("Employee Promotion Distribution")
plt.xlabel("Is Promoted (0 = No, 1 = Yes)")
plt.ylabel("Number of Employees")
plt.tight_layout()
plt.show()

# Exact promotion statistics
counts = train["is_promoted"].value_counts().sort_index()
percentages = (
    train["is_promoted"].value_counts(normalize=True).sort_index() * 100
)

print("\n===== PROMOTION SUMMARY =====")
print("Not promoted:", counts.get(0, 0))
print("Promoted:", counts.get(1, 0))
print("Not promoted percentage:", round(percentages.get(0, 0), 2), "%")
print("Promoted percentage:", round(percentages.get(1, 0), 2), "%")

plt.figure(figsize=(10, 5))

sns.barplot(
    data=train,
    x="department",
    y="is_promoted",
    estimator="mean",
    errorbar=None
)

plt.title("Promotion Rate by Department")
plt.xlabel("Department")
plt.ylabel("Promotion Rate")
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()


# Department-wise promotion rate

department_rate = (
    train.groupby("department")["is_promoted"]
    .mean()
    .mul(100)
    .sort_values(ascending=False)
)

print("\n===== PROMOTION RATE BY DEPARTMENT =====")
print(department_rate.round(2))

plt.figure(figsize=(10, 5))
sns.barplot(
    x=department_rate.index,
    y=department_rate.values
)

plt.title("Promotion Rate by Department")
plt.xlabel("Department")
plt.ylabel("Promotion Rate (%)")
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()


# Average training score by promotion status

print("\n===== TRAINING SCORE BY PROMOTION =====")

print(
    train.groupby("is_promoted")["avg_training_score"]
    .agg(["count", "mean", "median"])
    .round(2)
)

plt.figure(figsize=(8, 5))

sns.boxplot(
    data=train,
    x="is_promoted",
    y="avg_training_score"
)

plt.title("Training Score vs Promotion Status")
plt.xlabel("Is Promoted (0 = No, 1 = Yes)")
plt.ylabel("Average Training Score")
plt.tight_layout()
plt.show()

# ==========================================
# STEP 3: DATA CLEANING
# ==========================================

cleaned = train.copy()

# Remove exact duplicate rows, if any
cleaned = cleaned.drop_duplicates()

# Fill missing education values with the mode
education_mode = cleaned["education"].mode()[0]
cleaned["education"] = cleaned["education"].fillna(education_mode)

# Fill missing previous year rating with the median
rating_median = cleaned["previous_year_rating"].median()
cleaned["previous_year_rating"] = (
    cleaned["previous_year_rating"].fillna(rating_median)
)

# Verify missing values after cleaning
print("\n===== CLEANING SUMMARY =====")
print("Original shape:", train.shape)
print("Cleaned shape:", cleaned.shape)
print("\nMissing values after cleaning:")
print(cleaned.isnull().sum())
print("\nDuplicates after cleaning:", cleaned.duplicated().sum())

# Save cleaned dataset
cleaned.to_csv(
    r"E:\Projects\SmartHR\Datasets\promotion_cleaned.csv",
    index=False
)

print("\nCleaned dataset saved successfully!")