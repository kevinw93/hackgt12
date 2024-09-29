from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import os
from transformers import ViTForImageClassification, ViTImageProcessor
from PIL import Image
import torch
import predict
import Mammo
from groq import Groq
import google.generativeai as genai
from pypdf import PdfReader
from fpdf import FPDF
import markdown
import re

app = Flask(__name__)
CORS(app)

# Specify the directory to save uploaded files
UPLOAD_FOLDER = 'uploads'  # Ensure this folder exists
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload directory exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def load_text_from_file(file_path):
    """Load text from a file or extract text from a PDF."""
    if file_path.endswith('.pdf'):
        try:
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"  # Combine text from all pages
            return text.strip()  # Return trimmed text
        except Exception as e:
            print(f"Error reading PDF file: {e}")
            return None
    else:
        try:
            with open(file_path, "r") as f:
                return f.read().strip()  # Return trimmed text
        except FileNotFoundError:
            print(f"Error: {file_path} not found.")
            return None

def call_groq_api(client, prompt, model="mixtral-8x7b-32768"):
    """Call the Groq API with a prompt and return the response."""
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=model,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return None

def call_google_genai(api_key, image_path, prompt):
    """Call Google Generative AI to generate content based on an image."""
    if not image_path:
        print("Warning: Image path is empty. Skipping image processing.")
        return ""  # Return an empty string if the image path is empty

    genai.configure(api_key=api_key)
    try:
        myfile = genai.upload_file(image_path)
        model = genai.GenerativeModel("gemini-1.5-flash")
        result = model.generate_content([myfile, "\n\n", prompt])
        return result.text
    except Exception as e:
        print(f"Error calling Google Generative AI: {e}")
        return None

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

def remove_non_latin1(text):
    """Remove characters that cannot be encoded in latin-1."""
    return ''.join([char if ord(char) < 256 else '' for char in text])
def markdown_to_pdf(markdown_text, output_pdf):
    """Convert Markdown text to PDF using FPDF and remove unsupported characters."""
    
    # Remove all asterisks from the markdown text
    markdown_text = markdown_text.replace("*", "")
    
    # Initialize FPDF instance
    pdf = FPDF()
    pdf.add_page()

    # Set the default font and size (this will use latin-1 encoding)
    pdf.set_font('Arial', '', 12)

    # Split text into lines
    lines = markdown_text.split("\n")

    for line in lines:
        # Remove unsupported characters from the line
        line = remove_non_latin1(line)

        # Regular line
        pdf.multi_cell(0, 10, line)

    # Output the PDF to the specified file path
    pdf.output(output_pdf)


@app.route('/download-pdf', methods=['GET'])
def download_pdf():
    return send_file(os.path.join(app.config['UPLOAD_FOLDER'], 'output.pdf'), as_attachment=True)

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
    print(file_paths[0])
    print(file_paths[1])
    print(file_paths[2])
    print(file_paths[-1])

    blood_data_file = file_paths[0]  # Change this to the actual file name or path
    blood_text = load_text_from_file(blood_data_file)
    if blood_text is None:
        exit()

    # Initialize Groq client
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    blood_prompt = '''You are tasked with analyzing blood report data to predict breast cancer diagnosis. Given a dataset that includes various blood parameters, your goal is to identify patterns and biomarkers associated with breast cancer.
Describe the types of blood parameters included in the dataset, such as complete blood count (CBC), liver function tests (e.g., ALT, AST), kidney function markers (e.g., creatinine), and tumor markers (e.g., CA 15-3, CEA).
Clinical Implications: Reflect on how this predictive model could assist healthcare providers in early diagnosis and potential treatment decisions.
Don't include a data Overview and start off with: Blood report analysis header. Don't include future research directions or predictive model assumptions. remove most of clinical implications.
Do this for the following blood report data:
'''
    # Call Groq API for blood analysis
    blood_res = call_groq_api(client, blood_prompt + blood_text)
    if blood_res is not None:
        print(f"Blood analysis result: {blood_res}")

    # Prepare to collect results
    results = []

    # Process mammogram
    image_path = file_paths[1]
    if image_path:
        number = Mammo.main(image_path)
        if number:
            Xray_prompt_number = '''You are an AI assistant specializing in breast cancer screening. A vision transformer model has analyzed a mammogram and provided a score. Interpret this score concisely, addressing the following points:
Score meaning:
0: Likely normal or benign
1: Indeterminate or slightly suspicious
2: Highly suspicious of malignancy
Based on the score:
Explain the main implications
Suggest the corresponding BI-RADS category
Recommend immediate next steps
Briefly discuss:
Reliability of this AI-generated score
Key patient factors to consider
How to communicate this result to the patient
Provide a concise, clear interpretation suitable for medical professionals. Limit your response to 150-200 words.
Score: 
'''
            xray_res = call_groq_api(client, Xray_prompt_number  + number)
            if xray_res is not None:
                results.append(f"Xray analysis result: {xray_res}")
                print(f"Xray analysis result: {xray_res}")

            # Generate Xray image content
            Xray_img_prompt = '''You are an expert AI radiologist specializing in breast cancer detection. You have been presented with a mammogram X-ray image. Please analyze this image carefully and provide a detailed assessment, focusing on the detection and characterization of potential tumors. In your analysis, address the following points:
Overall image quality and breast composition:
Assess the image quality (e.g., contrast, clarity, positioning)
Describe the breast density according to the BI-RADS scale (a, b, c, or d)
Presence of masses or tumors:
Identify any suspicious masses or tumors
For each identified mass, describe:Location (quadrant of the breast and clock position)
Microcalcifications:
Note the presence of any microcalcifications
If present, describe their distribution (clustered, linear, segmental, etc.) and morphology
Architectural distortion:
Identify any areas of architectural distortion
Describe the location and extent of any distortion
Asymmetries:
Note any significant asymmetries between the breasts
Characterize the type of asymmetry (global, focal, or developing)
Associated findings:
Describe any skin thickening, nipple retraction, or axillary lymphadenopathy
Comparison with prior studies:
If available, compare with previous mammograms and note any changes
BI-RADS assessment:
Provide a BI-RADS category (0-6) based on your findings
Explain the rationale for your BI-RADS assessment
Recommendations:
Suggest appropriate follow-up actions (e.g., additional imaging, biopsy, short-term follow-up)
Overall impression:
Summarize the key findings and their potential clinical significance
Assess the likelihood of malignancy based on the imaging features
Please present your analysis in a clear, structured format using standard radiological terminology. Highlight any features that are particularly concerning or that require immediate attention. Include measurements where appropriate and be as specific as possible in your descriptions.
'''
            xray_image_res = call_google_genai(os.environ["API_KEY"], file_paths[1], Xray_img_prompt + "Classification number interpretation: " + xray_res)
            if xray_image_res is not None:
                results.append(f"Xray image result: {xray_image_res}")
                print(f"Xray image result: {xray_image_res}")
    else:
        print("Mammogram image path is empty. Skipping mammogram processing.")

    # RNA prediction
    prediction = predict.main(file_paths[2])
    if prediction:
        RNA_prompt = '''You are an expert in breast cancer immunology and single-cell transcriptomics. Analyze the following PBMC cell type counts from scRNA-seq data and interpret their significance in the context of breast cancer. Provide a concise yet comprehensive assessment addressing these points:
Overall immune profile: Evaluate the balance between effector and suppressor cells.
Key observations: Highlight any notable high or low cell counts and their potential impact.
Risk assessment: Discuss how this immune profile might relate to breast cancer risk or prognosis.
Treatment implications: Suggest how these results might influence treatment strategies.
Preface the answer with scRNA-seq analysis. Don't include a future directions or comprehensive insights section at the end.'''

        RNA_res = call_groq_api(client, RNA_prompt + prediction)
        if RNA_res is not None:
            results.append(f"RNA analysis result: {RNA_res}")
            print(f"RNA analysis result: {RNA_res}")

    # Whole Slide Image (WSI) handling
    WSI_prompt = '''You are an expert breast cancer pathologist analyzing a whole slide image (WSI) of breast tissue. Please examine the image carefully 
    and provide the following information:Describe the overall tissue architecture and any notable features.
Identify and measure the size of any invasive tumor, reporting the longest diameter in centimeters.
Determine the histologic grade (I, II, or III) based on tubule formation, nuclear pleomorphism, and mitotic count.
Assess for the presence or absence of lymphovascular invasion. If present, describe the extent (minimal, moderate, extensive).
Evaluate the surgical margins and report if they are clear, close, or positive. If close or positive, specify the distance to the nearest margin.
Describe any in situ carcinoma components, if present.
Note any significant features of the surrounding non-neoplastic breast tissue.
Based on the morphological features, suggest the most likely molecular subtype (Luminal A, Luminal B, HER2-positive, or Triple-negative).
Recommend any additional immunohistochemical stains that would be helpful for further characterization.
Provide a concise summary of the key findings and their potential implications for prognosis and treatment planning.
Please present your analysis in a clear, structured format, using standard pathological terminology. Include measurements where appropriate and highlight any features that may be particularly relevant for breast cancer staging or treatment decisions.
Don't include a disclaimer note at the end. Preface it with a title Whole-slide histopathological image analysis'''
    wsi_image_path = file_paths[3]
    if wsi_image_path:
        wsi_res = call_google_genai(os.environ["API_KEY"], wsi_image_path, WSI_prompt)
        if wsi_res is not None:
            results.append(f"WSI analysis result: {wsi_res}")
            print(f"WSI analysis result: {wsi_res}")
    else:
        print("WSI image path is empty. Skipping WSI processing.")

    # Combine all results
    final_res = ", ".join(results)
    
    if final_res:  # Only call the Groq API if there are results to send
        final_prompt = '''Breast Cancer Comprehensive Report Generation

You are tasked with generating a detailed and patient-friendly breast cancer report. The report will be based on several types of data, including blood report analysis, whole-slide histopathological image (WSI) analysis, single-cell RNA sequencing (scRNA-seq) data, and mammogram image analysis. Each section should be presented in a clear, structured format suitable for healthcare providers, and emphasize important findings relevant to diagnosis, prognosis, and potential treatment options. Avoid speculative or future directions, and focus on clinical significance.

Blood Report Analysis
Analyze the provided blood report data with a focus on identifying biomarkers related to breast cancer. This includes parameters such as complete blood count (CBC), liver function tests (ALT, AST), kidney function markers (e.g., creatinine), and tumor markers (e.g., CA 15-3, CEA). Highlight any abnormalities and patterns that may be relevant to breast cancer diagnosis and prognosis.

Whole-Slide Histopathological Image (WSI) Analysis
Analyze the WSI of breast tissue and provide a detailed pathology report. Your analysis should include:

Tissue architecture and any notable features
Size and location of invasive tumors (report the longest diameter in centimeters)
Histologic grade (I, II, or III) based on tubule formation, nuclear pleomorphism, and mitotic count
Lymphovascular invasion (presence, extent)
Surgical margins (clear, close, or positive) and distance to nearest margin if applicable
In situ carcinoma components, if present
Notable features of non-neoplastic breast tissue
Most likely molecular subtype (Luminal A, Luminal B, HER2-positive, or Triple-negative)
Key findings relevant to breast cancer staging and treatment decisions
scRNA-seq Analysis
Analyze the single-cell RNA sequencing (scRNA-seq) data from PBMC cell types. Provide an overview of the immune profile and interpret how effector and suppressor cell counts relate to breast cancer risk and prognosis. Highlight key observations (e.g., notable high or low cell counts) and explain their significance. Suggest potential treatment strategies based on the immune profile.

Mammogram Analysis
Interpret the mammogram data and provide a detailed assessment of any potential tumors or abnormalities. The report should include:

Image quality and breast density (BI-RADS scale a-d)
Presence of any suspicious masses or tumors, including their location
Microcalcifications (presence, distribution, morphology)
Architectural distortions or asymmetries
Associated findings (e.g., skin thickening, nipple retraction)
BI-RADS assessment (0-6) and rationale
Recommended next steps (e.g., additional imaging, biopsy, follow-up)
Summary of Findings
Summarize all findings from the blood report, WSI analysis, scRNA-seq analysis, and mammogram data. 
Provide an overall impression of the patient's condition, focusing on the likelihood of malignancy, the stage of cancer (if applicable), and the potential impact on treatment and prognosis.
 Offer clear, evidence-based recommendations for the next steps, including any further diagnostic tests or treatment considerations.'''
        # Explicitly use llama-3.2-11b-text-preview for the final output
        final_output = call_groq_api(client, final_prompt + final_res, model="llama-3.2-11b-text-preview")

        if final_output is not None:
            print(f"Final output: {final_output}")
    else:
        print("No results to combine for final output.")

    # Generate the PDF using FPDF instead of WeasyPrint
    markdown_text = final_output.replace("*", "") # Assuming final_output is the markdown or plain text to include in the PDF
    markdown_to_pdf(markdown_text, 'output.pdf')

    # Return the response with the result message and file paths
    return jsonify({
        "message": final_output,  # Include the result in the response
        "file_paths": file_paths
    })


if __name__ == '__main__':
    app.run(port=5000)
