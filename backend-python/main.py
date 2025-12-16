from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import os
import sys
from textblob import TextBlob

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ml_engine.predictors import Predictor
from ml_engine.train_models import ModelTrainer

app = FastAPI()

# Note: Models are loaded on startup. If not found, run /train or python -m ml_engine.train_models


predictor = Predictor()
trainer = ModelTrainer()

class ProductivityInput(BaseModel):
    sleep_hours: float
    work_hours_yesterday: float
    tasks_completed_yesterday: int
    exercise_minutes: int
    mood_score: int # 1-10

class TaskInput(BaseModel):
    priority: int # 1=Low, 2=Med, 3=High
    category_encoded: int # Encoded value
    estimated_time: float # hours

    day_of_week: int # 0-6

class JournalInput(BaseModel):
    text: str

@app.get("/")
def home():
    return {"message": "Smart Daily Life Manager ML Service is Running"}

@app.post("/predict/productivity")
def predict_productivity(data: ProductivityInput):
    try:
        score = predictor.predict_productivity(data.dict())
        return {"predicted_productivity_score": score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/task_completion")
def predict_task_completion(data: TaskInput):
    try:
        prob = predictor.predict_task_completion(data.dict())
        return {"completion_probability": prob}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ScheduleRequest(BaseModel):
    tasks: list # List of task objects with urgency, priority, etc.
    start_hour: int = 9 # Default start at 9 AM

@app.post("/optimize/schedule")
def optimize_schedule(data: ScheduleRequest):
    try:
        # Simple Greedy Algorithm: Priority > Deadline
        tasks = data.tasks
        
        def priority_score(t):
            p_map = {'High': 3, 'Medium': 2, 'Low': 1}
            return p_map.get(t.get('priority', 'Medium'), 1)

        # Sort tasks: Higher priority first
        sorted_tasks = sorted(tasks, key=priority_score, reverse=True)
        
        scheduled_tasks = []
        current_hour = data.start_hour
        
        for task in sorted_tasks:
            # Assign time slots (1 hour per task for simplicity)
            start_time = f"{current_hour:02d}:00"
            end_time = f"{current_hour + 1:02d}:00"
            
            # Add scheduled info to task
            task['suggested_start'] = start_time
            task['suggested_end'] = end_time
            
            scheduled_tasks.append(task)
            current_hour += 1 # Move to next slot
            
        return {"optimized_schedule": scheduled_tasks}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
def trigger_training():
    try:
        metrics = trainer.train_all()
        predictor.reload_models() # Reload after training
        return {"message": "Models trained successfully", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/sentiment")
def analyze_sentiment(data: JournalInput):
    try:
        blob = TextBlob(data.text)
        polarity = blob.sentiment.polarity # -1.0 to 1.0
        
        # Map to 1-10 scale
        # (-1 + 1) * 4.5 + 1 = 1
        # (0 + 1) * 4.5 + 1 = 5.5 -> 6
        # (1 + 1) * 4.5 + 1 = 10
        mood_score = int((polarity + 1) * 4.5 + 1)
        mood_score = max(1, min(10, mood_score)) # Clamp
        
        if polarity > 0.2:
            label = "Positive 🌟"
        elif polarity < -0.2:
            label = "Negative 🌧️"
        else:
            label = "Neutral 😐"
            
        return {
            "mood_score": mood_score,
            "sentiment_label": label,
            "polarity": polarity
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Check if models exist, if not, train them using dummy data
    if not os.path.exists("models/productivity_model.joblib"):
        print("Models not found. Initializing with synthetic data...")
        trainer.train_all()
    
    uvicorn.run(app, host="0.0.0.0", port=8000)


