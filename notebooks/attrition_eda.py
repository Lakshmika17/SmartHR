
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

# Project paths
BASE_DIR = Path(r"E:\Projects\SmartHR")
DATA_DIR = BASE_DIR / "Datasets"

file_path = DATA_DIR / "WA_Fn-UseC_-HR-Employee-Attrition.csv"

# Load dataset
df = pd.read_csv(file_path)

print("Original dataset shape:", df.shape)
print("\nFirst 5 rows:")
print(df.head())

print("\nColumn names:")
print(df.columns.tolist())

print("\nDataset information:")
df.info()

print("\nMissing values:")
print(df.isnull().sum()[df.isnull().sum() > 0])

print("\nDuplicate rows:", df.duplicated().sum())

print("\nAttrition distribution:")
print(df["Attrition"].value_counts())

print("\nAttrition percentage:")
print((df["Attrition"].value_counts(normalize=True) * 100).round(2))

# Visualizations
sns.set_theme(style="whitegrid")

plt.figure(figsize=(6, 4))
sns.countplot(data=df, x="Attrition")
plt.title("Employee Attrition Distribution")
plt.tight_layout()
plt.show()

plt.figure(figsize=(9, 5))
sns.countplot(data=df, x="Department", hue="Attrition")
plt.title("Attrition by Department")
plt.xticks(rotation=15)
plt.tight_layout()
plt.show()

plt.figure(figsize=(8, 5))
sns.histplot(data=df, x="Age", hue="Attrition", multiple="stack")
plt.title("Age Distribution by Attrition")
plt.tight_layout()
plt.show()

# Cleaning
cleaned = df.copy()

cleaned = cleaned.drop_duplicates()

# Remove columns containing only one unique value
constant_columns = [
    col for col in cleaned.columns
    if cleaned[col].nunique(dropna=False) <= 1
]
print("\nConstant columns:", constant_columns)

cleaned = cleaned.drop(columns=constant_columns)

# Save cleaned dataset
output_path = DATA_DIR / "attrition_cleaned.csv"
cleaned.to_csv(output_path, index=False)

print("\nCleaned dataset shape:", cleaned.shape)
print("Missing values after cleaning:", cleaned.isnull().sum().sum())
print("Saved to:", output_path)


# Additional EDA

print("\n--- ATTRITION ANALYSIS ---")

print("\nAttrition by Gender (%):")
print(pd.crosstab(
    df["Gender"], df["Attrition"], normalize="index"
).mul(100).round(2))

print("\nAttrition by Department (%):")
print(pd.crosstab(
    df["Department"], df["Attrition"], normalize="index"
).mul(100).round(2))

print("\nAverage Monthly Income by Attrition:")
print(df.groupby("Attrition")["MonthlyIncome"].mean().round(2))

print("\nAverage Years at Company by Attrition:")
print(df.groupby("Attrition")["YearsAtCompany"].mean().round(2))

print("\nOvertime vs Attrition:")
print(pd.crosstab(
    df["OverTime"], df["Attrition"], normalize="index"
).mul(100).round(2))

# Correlation heatmap for numeric features
numeric_df = df.select_dtypes(include="number")

plt.figure(figsize=(13, 9))
sns.heatmap(
    numeric_df.corr(),
    cmap="coolwarm",
    center=0
)
plt.title("Correlation Heatmap - Employee Attrition Dataset")
plt.tight_layout()
plt.show()
