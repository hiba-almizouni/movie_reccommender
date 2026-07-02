import torch
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
from app.intents import id2label

class IntentPredictor:
    def __init__(self, model_path="models/intent_model"):
        self.tokenizer = DistilBertTokenizerFast.from_pretrained(model_path)
        self.model = DistilBertForSequenceClassification.from_pretrained(model_path)

    def predict(self, text):
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        
        with torch.no_grad():
            outputs = self.model(**inputs)
        
        logits = outputs.logits
        predicted_class_id = torch.argmax(logits, dim=1).item()
        
        return id2label[predicted_class_id]