from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from transformers import ViTForImageClassification, ViTImageProcessor
from PIL import Image
import torch

app = Flask(__name__)
CORS(app)

# Specify the directory to save uploaded files
UPLOAD_FOLDER = 'uploads'  # Ensure this folder exists
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload directory exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/run-script', methods=['POST'])
def run_script():
    uploaded_files = request.files  # Get the uploaded files
    file_paths = []  # List to store file paths

    # Save uploaded files and store their paths
    for file_key in uploaded_files:
        file = uploaded_files[file_key]
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)  # Save the file
        file_paths.append(file_path)  # Append the path to the list
    print(file_paths)
    
    """
    # Load the pre-trained model and processor
    model = ViTForImageClassification.from_pretrained("BTX24/vit-base-patch16-224-in21k-finetuned-hongrui_mammogram_v_1")
    processor = ViTImageProcessor.from_pretrained("BTX24/vit-base-patch16-224-in21k-finetuned-hongrui_mammogram_v_1")

    # Load and preprocess your image
    image = Image.open()  # Replace with your image path
    inputs = processor(images=image, return_tensors="pt")

    # Run the image through the model
    with torch.no_grad():
        outputs = model(**inputs)

    # Get predicted label
    logits = outputs.logits
    predicted_label = logits.argmax(-1).item()

    # Print the result
    print(f"Predicted class: {predicted_label}")
    """
    # Return the response with the result message and file paths
    return jsonify({
        "message": result_message,  # Include the result in the response
        "file_paths": file_paths
    })

if __name__ == '__main__':
    app.run(port=5000)

