import './globals.css';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const PatientDetails = () => {
  const router = useRouter();
  const { id } = router.query; // Get the dynamic route parameter
  const [patient, setPatient] = useState(null); // State to hold patient data
  const [loading, setLoading] = useState(true); // State to manage loading
  const [output, setOutput] = useState(''); // State to hold output from Python script

  // States for file uploads
  const [bloodFile, setBloodFile] = useState(null);
  const [mriFile, setMriFile] = useState(null);
  const [rnaFile, setRnaFile] = useState(null);
  const [wsiFile, setWsiFile] = useState(null);

  // Fetch patient details based on the id
  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return; // Return if id is not available
      try {
        const response = await fetch(`/api/patient/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch patient details');
        }
        const data = await response.json();
        setPatient(data); // Set the fetched patient data
      } catch (error) {
        console.error('Error fetching patient:', error);
      } finally {
        setLoading(false); // Set loading to false after fetch
      }
    };

    fetchPatient();
  }, [id]); // Run effect whenever id changes

  // Handler for file uploads
  const handleFileChange = (event, setFile) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file); // Store the selected file in state
    }
  };

  const handleUpload = async () => {
    const fileArgs = []; // Array to hold file names for the Python script

    // Prepare file arguments if they exist
    if (bloodFile) {
      fileArgs.push(bloodFile.name); // Add blood file name to arguments
    }
    if (mriFile) {
      fileArgs.push(mriFile.name); // Add MRI file name to arguments
    }
    if (rnaFile) {
      fileArgs.push(rnaFile.name); // Add RNA file name to arguments
    }
    if (wsiFile) {
      fileArgs.push(wsiFile.name); // Add WSI file name to arguments
    }

    // Sending files to the server or processing can be added here
    console.log('Uploading files:', fileArgs);
    setOutput(`Uploaded files: ${fileArgs.join(', ')}`); // Display uploaded file names
  };

  const handleRunScript = async () => {
    const formData = new FormData();
    if (bloodFile) formData.append('bloodFile', bloodFile);
    if (mriFile) formData.append('mriFile', mriFile);
    if (rnaFile) formData.append('rnaFile', rnaFile);
    if (wsiFile) formData.append('wsiFile', wsiFile);
  
    try {
      const response = await fetch('http://localhost:5000/run-script', {
        method: 'POST',
        body: formData,
      });
  
      console.log('Response Status:', response.status); // Log response status
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to run the script: ${errorData.message}`);
      }
  
      const data = await response.json();
      console.log('Response Data:', data); // Log the response data
  
      // Set the output from the Flask script
      setOutput(`Result: ${data.message}. Uploaded files: ${data.file_paths.join(', ')}`);
      
      // Download the PDF
      window.open('http://localhost:5000/download-pdf', '_blank');
    } catch (error) {
      console.error('Error running script:', error);
      setOutput('Error running script');
    }
  };

  const handleBack = () => {
    router.push('/dashboard'); // Change this path to your dashboard route
  };

  if (loading) return <p>Loading...</p>; // Show loading state

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50"
        >
          Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
        {patient ? (
          <div>
            <h2 className="text-xl">{patient.name}</h2>
            <p>Age: {patient.age}</p>
            <p>Condition: {patient.details}</p> {/* Using details instead of condition */}

            {/* File Upload Section */}
            <div className="mt-6">
              <h3 className="text-lg font-medium">Upload Data</h3>

              {/* Blood Data Upload */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Upload Blood Data (TXT, PDF)
                </label>
                <input
                  type="file"
                  accept=".txt, .pdf"
                  onChange={(event) => handleFileChange(event, setBloodFile)}
                  className="mt-1 block w-full text-sm text-gray-500 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Mammogram Data Upload */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Upload Mammogram Data (JPG, JPEG, PNG)
                </label>
                <input
                  type="file"
                  accept=".jpg, .jpeg, .png"
                  onChange={(event) => handleFileChange(event, setMriFile)}
                  className="mt-1 block w-full text-sm text-gray-500 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* RNA Data Upload */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Upload scRNA-seq Data (.h5ad)
                </label>
                <input
                  type="file"
                  accept=".h5ad"
                  onChange={(event) => handleFileChange(event, setRnaFile)}
                  className="mt-1 block w-full text-sm text-gray-500 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* WSI Data Upload */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Upload WSI Data (JPG, JPEG, PNG)
                </label>
                <input
                  type="file"
                  accept=".jpg, .jpeg, .png"
                  onChange={(event) => handleFileChange(event, setWsiFile)}
                  className="mt-1 block w-full text-sm text-gray-500 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            
              {/* Button to Run Python Script */}
              <div className="mt-4">
                <button
                  onClick={handleRunScript}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Run Python Script
                </button>
              </div>

              {/* Display output from Python script */}
              {output && (
                <div className="mt-4 p-4 bg-gray-200 rounded">
                  <h3 className="font-semibold">Script Output:</h3>
                  <pre>{output}</pre> {/* Display the output from the Python script */}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p>Patient not found</p>
        )}
      </div>
    </div>
  );
};

export default PatientDetails;
