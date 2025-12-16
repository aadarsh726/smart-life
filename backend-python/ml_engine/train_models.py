import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_squared_error, accuracy_score
import joblib
import os
from .data_generator import generate_synthetic_data

class ModelTrainer:
    def __init__(self, model_dir="models"):
        self.model_dir = model_dir
        if not os.path.exists(self.model_dir):
            os.makedirs(self.model_dir)
            
    def train_productivity_model(self, df):
        X = df.drop('productivity_score', axis=1)
        y = df['productivity_score']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        preds = model.predict(X_test)
        mse = mean_squared_error(y_test, preds)
        
        joblib.dump(model, os.path.join(self.model_dir, "productivity_model.joblib"))
        return mse
        
    def train_task_completion_model(self, df):
        X = df.drop('completed', axis=1)
        y = df['completed']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        preds = model.predict(X_test)
        acc = accuracy_score(y_test, preds)
        
        joblib.dump(model, os.path.join(self.model_dir, "task_completion_model.joblib"))
        return acc

    def train_all(self):
        print("Generating synthetic data...")
        prod_df, task_df = generate_synthetic_data()
        
        print("Training Productivity Model...")
        mse = self.train_productivity_model(prod_df)
        
        print("Training Task Completion Model...")
        acc = self.train_task_completion_model(task_df)
        
        print(f"Training Complete. Productivity MSE: {mse}, Task Acc: {acc}")
        return {"productivity_mse": mse, "task_accuracy": acc}

if __name__ == "__main__":
    trainer = ModelTrainer()
    trainer.train_all()
