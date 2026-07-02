from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()

# load ONCE (very important)
model = pipeline("text-generation", model="./your-model")

class Request(BaseModel):
    message: str

@app.post("/recommend")
def recommend(req: Request):

    prompt = f"""
You are a movie recommendation system.

User message: {req.message}

Return ONLY JSON:
{{
  "intent": "...",
  "recommendations": ["movie1", "movie2", "movie3"]
}}
"""

    output = model(prompt, max_new_tokens=200)[0]["generated_text"]

    # simple safe extraction (basic version)
    import json
    import re

    try:
        match = re.search(r"\{.*\}", output, re.DOTALL)
        if match:
            return json.loads(match.group())
    except:
        pass

    return {
        "intent": "unknown",
        "recommendations": []
    }