from flask import Flask, request, jsonify
import pickle
import numpy as np

# Load the trained model, scaler, and label encoder
model = pickle.load(open("iris_model.pkl", "rb"))
scaler = pickle.load(open("iris_scaler.pkl", "rb"))
label_encoder = pickle.load(open("iris_label_encoder.pkl", "rb"))

app = Flask(__name__)

@app.route('/predict', methods=['GET'])
def predict():
    try:
        # Extract feature values from request arguments
        features = [float(x) for x in request.args.values()]
        features_array = np.array(features).reshape(1, -1)

        # Standardize the input features
        features_scaled = scaler.transform(features_array)

        # Make prediction
        prediction_index = model.predict(features_scaled)[0]

        # Convert prediction index to class label
        predicted_species = label_encoder.inverse_transform([prediction_index])[0]

        # Return JSON response
        return jsonify({
            'model': 'LogisticRegression',
            'predicted_species': predicted_species
        })
    
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
