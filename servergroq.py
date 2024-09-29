from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import os
from fpdf import FPDF
from groq import Groq

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

    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

    chat_completion = client.chat.completions.create(
        messages=[{
            "role": "user",
            "content": "How hot is Sasanka Polisetti from 1-10. Short answer."
        }],
        model="mixtral-8x7b-32768",
    )

    result_message = chat_completion.choices[0].message.content
    print(result_message)  # Print to the Flask terminal

    # Generate PDF
    pdf_path = generate_pdf(result_message, file_paths)

    # Return the response with the result message, file paths, and PDF path
    return jsonify({
        "message": result_message,  # Include the result in the response
        "file_paths": file_paths,
        "pdf_path": pdf_path
    })

def generate_pdf(result_message, file_paths):
    pdf_filename = "output.pdf"
    pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], pdf_filename)

    pdf = FPDF()
    pdf.add_page()
    
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, "Result Message:", ln=True)
    pdf.multi_cell(0, 10, result_message)  # Use multi_cell for long text

    pdf.cell(200, 10, "Uploaded Files:", ln=True)
    for path in file_paths:
        pdf.cell(200, 10, path, ln=True)

    pdf.output(pdf_path)
    return pdf_path

@app.route('/download-pdf', methods=['GET'])
def download_pdf():
    return send_file(os.path.join(app.config['UPLOAD_FOLDER'], 'output.pdf'), as_attachment=True)

if __name__ == '__main__':
    app.run(port=5000)
