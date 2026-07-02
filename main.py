#from app.predictor import IntentPredictor

#predictor = IntentPredictor()

#while True:
#    text = input("User: ")
#    intent = predictor.predict(text)
#    print("Predicted intent:", intent)

from fastapi import FastAPI
from pydantic import BaseModel

from services.intent_service import IntentService
from services.recommendation_service import RecommendationService

app = FastAPI()

intent_service = IntentService()
rec_service = RecommendationService()

# Request format
class UserRequest(BaseModel):
    message: str

# API endpoint
@app.post("/recommend")
def recommend(req: UserRequest):
    # Step 1: detect intent
    intent = intent_service.predict(req.message)

    # Step 2: recommend movies
    movies = rec_service.recommend(intent)

    return {
        "intent": intent,
        "recommendations": movies
    }

from services.intent_service import IntentService
from services.recommendation_service import RecommendationService

intent_service = IntentService()
rec_service = RecommendationService()

while True:
    user_input = input("User: ")

    # Step 1 → NLP
    intent = intent_service.predict(user_input)
    print("Detected intent:", intent)

    # Step 2 → Recommendation
    movies = rec_service.recommend(intent)

    print("\nTop recommendations:")
    for i, movie in enumerate(movies, 1):
        print(f"{i}. {movie['title']} ({movie['genres']})")

    print("\n" + "-"*40)