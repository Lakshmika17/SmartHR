
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = Path(__file__).resolve().parent

PROMOTION_MODEL_PATH = BASE_DIR / "models" / "promotion_model.joblib"
ATTRITION_MODEL_PATH = BASE_DIR / "models" / "attrition_model.joblib"

PROMOTION_DATA_PATH = BASE_DIR / "data" / "promotion_cleaned.csv"
ATTRITION_DATA_PATH = BASE_DIR / "data" / "attrition_cleaned.csv"

app = FastAPI(
    title="SmartHR ML Service",
    description="Employee promotion, attrition prediction, and HR analytics API",
    version="1.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load both trained models
promotion_model = joblib.load(PROMOTION_MODEL_PATH)
attrition_model = joblib.load(ATTRITION_MODEL_PATH)


@app.get("/")
def home():
    return {
        "message": "SmartHR ML Service is running",
        "available_predictions": ["promotion", "attrition"],
        "available_analytics": ["/analytics"],
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "promotion_model_loaded": promotion_model is not None,
        "attrition_model_loaded": attrition_model is not None,
    }


# ---------------- DYNAMIC HR ANALYTICS ----------------

@app.get("/analytics")
def get_analytics():
    try:
        if not PROMOTION_DATA_PATH.exists():
            raise HTTPException(
                status_code=500,
                detail="Promotion dataset was not found.",
            )

        if not ATTRITION_DATA_PATH.exists():
            raise HTTPException(
                status_code=500,
                detail="Attrition dataset was not found.",
            )

        # Read the actual CSV datasets
        promotion_df = pd.read_csv(PROMOTION_DATA_PATH)
        attrition_df = pd.read_csv(ATTRITION_DATA_PATH)

        # Validate required columns
        promotion_required = {"department", "is_promoted"}
        attrition_required = {
            "Attrition",
            "OverTime",
            "YearsAtCompany",
            "MonthlyIncome",
        }

        if not promotion_required.issubset(promotion_df.columns):
            raise HTTPException(
                status_code=500,
                detail="Promotion dataset is missing required columns.",
            )

        if not attrition_required.issubset(attrition_df.columns):
            raise HTTPException(
                status_code=500,
                detail="Attrition dataset is missing required columns.",
            )

        # -------- Promotion statistics --------
        promotion_total = int(len(promotion_df))
        promoted_total = int(
            (promotion_df["is_promoted"] == 1).sum()
        )

        promotion_rate = (
            round(promoted_total / promotion_total * 100, 2)
            if promotion_total
            else 0.0
        )

        # Calculate promotion rate for each department
        department_stats = (
            promotion_df.groupby("department", dropna=False)
            .agg(
                total_records=("is_promoted", "size"),
                promoted=("is_promoted", lambda values: (values == 1).sum()),
            )
            .reset_index()
        )

        department_stats["rate"] = (
            department_stats["promoted"]
            / department_stats["total_records"]
            * 100
        ).round(2)

        departments = [
            {
                "name": (
                    str(row["department"])
                    if pd.notna(row["department"])
                    else "Unknown"
                ),
                "rate": float(row["rate"]),
                "records": int(row["total_records"]),
                "promoted": int(row["promoted"]),
            }
            for _, row in department_stats.iterrows()
        ]

        departments.sort(
            key=lambda item: item["rate"],
            reverse=True,
        )

        # -------- Attrition statistics --------
        attrition_total = int(len(attrition_df))
        left_mask = attrition_df["Attrition"].eq("Yes")
        stayed_mask = attrition_df["Attrition"].eq("No")

        left_total = int(left_mask.sum())
        stayed_total = int(stayed_mask.sum())

        attrition_rate = (
            round(left_total / attrition_total * 100, 2)
            if attrition_total
            else 0.0
        )

        # Attrition rate among overtime employees
        overtime_mask = attrition_df["OverTime"].eq("Yes")
        overtime_total = int(overtime_mask.sum())
        overtime_leavers = int(
            (overtime_mask & left_mask).sum()
        )

        overtime_attrition_rate = (
            round(overtime_leavers / overtime_total * 100, 2)
            if overtime_total
            else 0.0
        )

        # Averages for employees who left
        leavers = attrition_df.loc[left_mask]

        average_years_at_company = (
            round(float(leavers["YearsAtCompany"].mean()), 2)
            if not leavers.empty
            else 0.0
        )

        average_monthly_income = (
            round(float(leavers["MonthlyIncome"].mean()), 2)
            if not leavers.empty
            else 0.0
        )

        return {
            "promotion": {
                "total_records": promotion_total,
                "promoted_count": promoted_total,
                "promotion_rate": promotion_rate,
                "departments": departments,
            },
            "attrition": {
                "total_records": attrition_total,
                "left_count": left_total,
                "stayed_count": stayed_total,
                "attrition_rate": attrition_rate,
                "stayed_percentage": (
                    round(stayed_total / attrition_total * 100, 2)
                    if attrition_total
                    else 0.0
                ),
                "left_percentage": (
                    round(left_total / attrition_total * 100, 2)
                    if attrition_total
                    else 0.0
                ),
                "overtime_attrition_rate": overtime_attrition_rate,
                "average_years_at_company": average_years_at_company,
                "average_monthly_income": average_monthly_income,
            },
            "notice": (
                "Statistics are calculated from the current CSV datasets. "
                "Descriptive associations do not establish causation."
            ),
        }

    except HTTPException:
        raise
    except Exception as error:
        print("HR analytics error:", str(error))
        raise HTTPException(
            status_code=500,
            detail="Unable to calculate HR analytics.",
        )


# ---------------- PROMOTION PREDICTION ----------------

class PromotionInput(BaseModel):
    department: str
    region: str
    education: str
    gender: str
    recruitment_channel: str
    no_of_trainings: int = Field(ge=0, le=100)
    age: int = Field(ge=18, le=100)
    previous_year_rating: float = Field(ge=1, le=5)
    length_of_service: int = Field(ge=0, le=60)
    awards_won: int = Field(ge=0, le=1)
    avg_training_score: float = Field(ge=0, le=100)


@app.post("/predict/promotion")
def predict_promotion(data: PromotionInput):
    try:
        employee = pd.DataFrame([{
            "department": data.department,
            "region": data.region,
            "education": data.education,
            "gender": data.gender,
            "recruitment_channel": data.recruitment_channel,
            "no_of_trainings": data.no_of_trainings,
            "age": data.age,
            "previous_year_rating": data.previous_year_rating,
            "length_of_service": data.length_of_service,
            "awards_won?": data.awards_won,
            "avg_training_score": data.avg_training_score,
        }])

        prediction = int(promotion_model.predict(employee)[0])
        probabilities = promotion_model.predict_proba(employee)[0]
        classes = list(
            promotion_model.named_steps["classifier"].classes_
        )
        promoted_index = classes.index(1)
        probability = float(probabilities[promoted_index])

        return {
            "prediction": (
                "Promoted" if prediction == 1 else "Not Promoted"
            ),
            "promotion_probability": round(probability * 100, 2),
            "model_prediction": prediction,
            "notice": (
                "This is a model estimate, not a guaranteed HR decision."
            ),
        }

    except Exception as error:
        print("Promotion prediction error:", str(error))
        raise HTTPException(
            status_code=500,
            detail="Unable to generate a promotion prediction.",
        )


# ---------------- ATTRITION PREDICTION ----------------

class AttritionInput(BaseModel):
    Age: int = Field(ge=18, le=100)
    BusinessTravel: str
    DailyRate: int = Field(ge=0)
    Department: str
    DistanceFromHome: int = Field(ge=0)
    Education: int = Field(ge=1, le=5)
    EducationField: str
    EnvironmentSatisfaction: int = Field(ge=1, le=4)
    Gender: str
    HourlyRate: int = Field(ge=0, le=100)
    JobInvolvement: int = Field(ge=1, le=4)
    JobLevel: int = Field(ge=1, le=5)
    JobRole: str
    JobSatisfaction: int = Field(ge=1, le=4)
    MaritalStatus: str
    MonthlyIncome: int = Field(ge=0)
    MonthlyRate: int = Field(ge=0)
    NumCompaniesWorked: int = Field(ge=0)
    OverTime: str
    PercentSalaryHike: int = Field(ge=0, le=100)
    PerformanceRating: int = Field(ge=1, le=4)
    RelationshipSatisfaction: int = Field(ge=1, le=4)
    StockOptionLevel: int = Field(ge=0, le=3)
    TotalWorkingYears: int = Field(ge=0)
    TrainingTimesLastYear: int = Field(ge=0)
    WorkLifeBalance: int = Field(ge=1, le=4)
    YearsAtCompany: int = Field(ge=0)
    YearsInCurrentRole: int = Field(ge=0)
    YearsSinceLastPromotion: int = Field(ge=0)
    YearsWithCurrManager: int = Field(ge=0)


@app.post("/predict/attrition")
def predict_attrition(data: AttritionInput):
    try:
        employee = pd.DataFrame([data.model_dump()])

        prediction = int(attrition_model.predict(employee)[0])
        probabilities = attrition_model.predict_proba(employee)[0]
        classes = list(
            attrition_model.named_steps["classifier"].classes_
        )
        attrition_index = classes.index(1)
        probability = float(probabilities[attrition_index])

        return {
            "prediction": (
                "Likely to Leave" if prediction == 1
                else "Likely to Stay"
            ),
            "attrition_probability": round(probability * 100, 2),
            "model_prediction": prediction,
            "notice": (
                "This is a model estimate, not a definitive assessment "
                "of an employee. Use it with human review."
            ),
        }

    except Exception as error:
        print("Attrition prediction error:", str(error))
        raise HTTPException(
            status_code=500,
            detail="Unable to generate an attrition prediction.",
        )
