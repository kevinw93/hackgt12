from flask import Flask, jsonify, request
import subprocess

app = Flask(__name__)

@app.route('/run-script', methods=['GET'])
def run_script():
    # Get file paths from query parameters
    mri_path = request.args.get('mri')
    rna_path = request.args.get('rna')
    wsi_path = request.args.get('wsi')

    # Print the file paths (for debugging)
    print("MRI Path:", mri_path)
    print("RNA Path:", rna_path)
    print("WSI Path:", wsi_path)

    # Call the Python script with the file paths
    try:
        result = subprocess.run(
            ['python3', 'process_files.py', mri_path, rna_path, wsi_path],
            capture_output=True,
            text=True
        )
        output = result.stdout.strip()  # Remove any leading/trailing whitespace
        error = result.stderr.strip()    # Remove any leading/trailing whitespace

        # Handle errors and successful output
        if result.returncode != 0:
            print("Error:", error)
            return jsonify({"message": "Error running script", "details": error}), 500

        return jsonify({"message": f"Script output: {output}"})

    except Exception as e:
        return jsonify({"message": "Failed to run the script", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
