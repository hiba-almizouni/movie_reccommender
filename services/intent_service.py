import torch
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification

id2label = {
    0: "relaxation",
    1: "sadness",
    2: "motivation",
    3: "fear",
    4: "happiness",
    5: "action",
    6: "romance",
    7: "mystery",
    8: "family",
    9: "adventure",
    10: "science_fiction",
    11: "fantasy",
    12: "documentary",
    13: "crime",
    14: "drama",
    15: "animation",
    16: "superhero",
    17: "thriller",
    18: "historical",
    19: "comedy"
}

class IntentService:
    def __init__(self):
        self.tokenizer = DistilBertTokenizerFast.from_pretrained("models/intent_model")
        self.model = DistilBertForSequenceClassification.from_pretrained("models/intent_model")

    def predict(self, text):
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True)

        with torch.no_grad():
            outputs = self.model(**inputs)

        logits = outputs.logits
        pred_id = torch.argmax(logits, dim=1).item()

        return id2label[pred_id]