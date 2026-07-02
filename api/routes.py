from fastapi import APIRouter
from services.intent_service import IntentService
from services.recommendation_service import RecommendationService

router = APIRouter()

intent_service = IntentService()
rec_service = RecommendationService()

@router.post("/recommend")
def recommend(user_input: str):
    # Step 1: detect intent
    intent = intent_service.predict(user_input)

    # Step 2: get movies
    movies = rec_service.recommend(intent)

    return {
        "intent": intent,
        "recommendations": movies
    }