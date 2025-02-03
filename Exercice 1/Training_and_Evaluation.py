import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# Load the dataset
file_path = "iris.csv"  # Update with your correct path
df = pd.read_csv("iris.csv")

# Encode the target variable (species) into numeric labels
label_encoder = LabelEncoder()
df["species"] = label_encoder.fit_transform(df["species"])  # 0: setosa, 1: versicolor, 2: virginica

# Split the dataset into features (X) and target (y)
X = df.drop(columns=["species"])
y = df["species"]

# Split into training and test sets (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Standardize the features (important for logistic regression)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train a Logistic Regression model
model = LogisticRegression(max_iter=200)
model.fit(X_train_scaled, y_train)

# Make predictions
y_pred = model.predict(X_test_scaled)

# Evaluate the model
accuracy = accuracy_score(y_test, y_pred)
classification_rep = classification_report(y_test, y_pred, target_names=label_encoder.classes_)
conf_matrix = confusion_matrix(y_test, y_pred)

# Print evaluation results
print(f"Model Accuracy: {accuracy:.2f}")
print("\nClassification Report:\n", classification_rep)
print("\nConfusion Matrix:\n", conf_matrix)

# Save the trained model and preprocessing tools
pickle.dump(model, open("iris_model.pkl", "wb"))
pickle.dump(scaler, open("iris_scaler.pkl", "wb"))
pickle.dump(label_encoder, open("iris_label_encoder.pkl", "wb"))

print("\n Model training complete. Files saved: iris_model.pkl, iris_scaler.pkl, iris_label_encoder.pkl")
