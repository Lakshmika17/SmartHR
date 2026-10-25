
import pandas as pd
from pathlib import Path

data_folder = Path("data")
csv_files = list(data_folder.glob("*.csv"))

if not csv_files:
    raise FileNotFoundError(
        "Place your downloaded HR promotion CSV in the data folder."
    )

df = pd.read_csv(csv_files[0])

print("Dataset file:", csv_files[0].name)
print("Dataset shape:", df.shape)
print("\nColumn names:")
print(df.columns.tolist())
print("\nFirst five rows:")
print(df.head())
print("\nMissing values:")
print(df.isnull().sum())
