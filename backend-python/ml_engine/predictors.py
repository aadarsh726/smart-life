import joblib
import os
import pandas as pd

class Predictor:
    def __init__(self, model_dir="models"):
        self.model_dir = model_dir
        self.productivity_model = None
        self.task_model = None
        self.reload_models()

    def reload_models(self):
        try:
            self.productivity_model = joblib.load(os.path.join(self.model_dir, "productivity_model.joblib"))
            self.task_model = joblib.load(os.path.join(self.model_dir, "task_completion_model.joblib"))
        except FileNotFoundError:
            print("Models not found. They need to be trained first.")

    def predict_productivity(self, features):
        if not self.productivity_model:
            raise Exception("Model not loaded")
        
        # Ensure order matches training
        # 'sleep_hours', 'work_hours_yesterday', 'tasks_completed_yesterday', 'exercise_minutes', 'mood_score'
        df = pd.DataFrame([features])
        prediction = self.productivity_model.predict(df)[0]
        return float(prediction)

    def predict_task_completion(self, features):
        if not self.task_model:
            raise Exception("Model not loaded")
            
        # 'priority', 'category_encoded', 'estimated_time', 'day_of_week'
        df = pd.DataFrame([features])
        prediction = self.task_model.predict_proba(df)[0][1] # Probability of class 1
        return float(prediction)
