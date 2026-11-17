🎬 Mood-Based Movie Recommendation System

An AI-powered recommendation engine that understands natural language.
Users describe how they feel in plain text → DistilBERT classifies the intent
→ a hybrid filtering algorithm returns the Top 10 movies.

🧠 NLP Model: Fine-tuned DistilBERT (distilbert-base-multilingual-cased)
   — 20 intent categories | 94%+ confidence | English & French

📊 Dataset: MovieLens (9,000+ movies · 100,000+ ratings)
   — Pandas pipeline: merge, average ratings, vote-count filtering

🔁 Pipeline: Raw text → Tokenization → Transformer inference
   → Intent label → Genre mapping → Ranked Top 10

🚀 API: FastAPI REST endpoint — POST /recommend
   Input:  { "message": "i want something scary" }
   Output: { "intent": "fear", "recommendations": [...] }

Tech Stack: Python · HuggingFace Transformers · DistilBERT · Scikit-learn
            Pandas · FastAPI · MovieLens · Uvicorn
