from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
import tensorflow as tf
import base64
import re
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  

# Load model
model = tf.keras.models.load_model('models/food_freshness_model.keras')

# Load class labels
with open('models/class_indices.json', 'r') as f:
    class_indices = json.load(f)

# Reverse mapping: index -> label
index_to_label = {int(v): k for k, v in class_indices.items()}
IMG_SIZE = 224

def preprocess_image(image_data):
    image = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)
    image = cv2.resize(image, (IMG_SIZE, IMG_SIZE))
    image = image.astype('float32') / 255.0
    image = np.expand_dims(image, axis=0)
    return image

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    img_data = re.sub('^data:image/.+;base64,', '', data['image'])
    img_bytes = base64.b64decode(img_data)
    image = preprocess_image(img_bytes)

    preds = model.predict(image)
    class_id = int(np.argmax(preds))
    confidence = float(preds[0][class_id])

    full_label = index_to_label[class_id]  # e.g. Banana_Rotten

    match = re.match(r'(?i)^(fresh|rotten)[_ ]?(.*)$', full_label)
    if match:
        freshness = match.group(1).capitalize()  # 'Fresh' or 'Rotten'
        fruit = match.group(2).replace('_', ' ').strip().title()  # e.g., 'Green_Apple' → 'Green Apple'
    else:
        freshness = 'Unknown'
        fruit = full_label


    print("Predicted class ID:", class_id)
    print("Predicted label:", full_label)
    print("Confidence:", confidence)


    return jsonify({
        'fruit': fruit,
        'label': freshness,
        'confidence': confidence,
        'raw_label': full_label
    })


if __name__ == '__main__':
    app.run(debug=True)