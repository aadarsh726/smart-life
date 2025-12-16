import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

try:
    from ml_engine.predictors import Predictor
    
    print("Initializing Predictor...")
    predictor = Predictor()
    
    print("Testing Productivity Prediction...")
    data = {
        "sleep_hours": 7,
        "work_hours_yesterday": 8,
        "tasks_completed_yesterday": 5,
        "exercise_minutes": 30,
        "mood_score": 8
    }
    score = predictor.predict_productivity(data)
    print(f"Prediction Success! Score: {score}")

except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
