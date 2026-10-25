from pathlib import Path
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "promotion_model.joblib"

app = FastAPI(
    title="SmartHR ML Service",
    description="Employee promotion prediction API",
    version="1.0.0",
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

model = joblib.load(MODEL_PATH)


@app.get("/")
def home():
    return {"message": "SmartHR ML Service is running"}


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}

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

        prediction = int(model.predict(employee)[0])
        probabilities = model.predict_proba(employee)[0]
        classes = list(model.named_steps["classifier"].classes_)
        promoted_index = classes.index(1)
        probability = float(probabilities[promoted_index])

        return {
            "prediction": "Promoted" if prediction == 1 else "Not Promoted",
            "promotion_probability": round(probability * 100, 2),
            "model_prediction": prediction,
            "notice": "This is a model estimate, not a guaranteed HR decision."
        }

    except Exception as error:
        print("Prediction error:", str(error))
        raise HTTPException(
            status_code=500,
            detail="Unable to generate a promotion prediction."
        )

{
  "department": "Technology",
  "region": "region_7",
  "education": "Bachelor's",
  "gender": "m",
  "recruitment_channel": "sourcing",
  "no_of_trainings": 1,
  "age": 29,
  "previous_year_rating": 4,
  "length_of_service": 4,
  "awards_won": 0,
  "avg_training_score": 82
}