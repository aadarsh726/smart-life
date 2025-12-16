import pandas as pd
import numpy as np
import random

def generate_synthetic_data(num_samples=1000):
    # 1. Productivity Data
    # Features: sleep_hours, work_hours_yesterday, tasks_completed_yesterday, exercise_minutes, mood_score
    # Target: productivity_score (0-100)
    
    data = []
    for _ in range(num_samples):
        sleep = np.random.normal(7, 1.5)
        sleep = max(0, min(12, sleep))
        
        work_yesterday = np.random.normal(6, 2)
        work_yesterday = max(0, min(14, work_yesterday))
        
        tasks_yesterday = np.random.randint(0, 10)
        
        exercise = np.random.exponential(30) # Most people do less, some do more
        exercise = min(120, exercise)
        
        mood = np.random.randint(1, 11)
        
        # Logic for target
        base_score = 50
        base_score += (sleep - 7) * 5
        base_score -= abs(work_yesterday - 8) * 2 # Optimal work is ~8
        base_score += tasks_yesterday * 2
        base_score += (exercise / 30) * 5
        base_score += (mood - 5) * 3
        
        productivity_score = base_score + np.random.normal(0, 5) # Noise
        productivity_score = max(0, min(100, productivity_score))
        
        data.append([sleep, work_yesterday, tasks_yesterday, exercise, mood, productivity_score])
        
    productivity_df = pd.DataFrame(data, columns=['sleep_hours', 'work_hours_yesterday', 'tasks_completed_yesterday', 'exercise_minutes', 'mood_score', 'productivity_score'])
    
    # 2. Task Completion Data
    # Features: priority, category_encoded, estimated_time, day_of_week
    # Target: completed (0 or 1)
    
    task_data = []
    for _ in range(num_samples):
        priority = np.random.choice([1, 2, 3], p=[0.2, 0.5, 0.3])
        category = np.random.randint(0, 5)
        est_time = np.random.uniform(0.5, 5.0)
        dow = np.random.randint(0, 7)
        
        # Logic
        prob = 0.5
        prob += (priority * 0.1)
        prob -= (est_time * 0.05)
        if dow >= 5: # Weekend
            prob -= 0.1
            
        completed = 1 if random.random() < prob else 0
        task_data.append([priority, category, est_time, dow, completed])
        
    task_df = pd.DataFrame(task_data, columns=['priority', 'category_encoded', 'estimated_time', 'day_of_week', 'completed'])
    
    return productivity_df, task_df
