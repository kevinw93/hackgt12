import argparse
from transformers import ViTForImageClassification, ViTImageProcessor
from PIL import Image
import torch


def main(image_path):
    # Load the pre-trained model and processor
    model = ViTForImageClassification.from_pretrained(
        "BTX24/vit-base-patch16-224-in21k-finetuned-hongrui_mammogram_v_1")
    processor = ViTImageProcessor.from_pretrained("BTX24/vit-base-patch16-224-in21k-finetuned-hongrui_mammogram_v_1")

    # Load and preprocess your image
    image = Image.open(image_path)
    if image.mode != 'RGB':
        # Convert grayscale images to RGB
        image = image.convert('RGB')

    inputs = processor(images=image, return_tensors="pt")
    

    # Run the image through the model
    with torch.no_grad():
        outputs = model(**inputs)

    # Get predicted label
    logits = outputs.logits
    predicted_label = logits.argmax(-1).item()

    # Print the result
    return (f"Predicted class: {predicted_label}")