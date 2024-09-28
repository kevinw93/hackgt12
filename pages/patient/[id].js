import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';

const PatientDetails = () => {
  const router = useRouter();
  const { id } = router.query;

  // Mock patient data or fetch it based on the ID
  const patientData = {
    1: { name: 'John Doe', age: 30, condition: 'Healthy', details: 'No health issues' },
    2: { name: 'Jane Smith', age: 40, condition: 'Diabetes', details: 'Requires regular check-ups' },
  };

  const patient = patientData[id] || {};

  // State for file uploads
  const [mriFile, setMriFile] = useState(null);
  const [rnaFile, setRnaFile] = useState(null);
  const [wsiFile, setWsiFile] = useState(null);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [error, setError] = useState(null);

  // Avatar upload state and ref
  const inputFileRef = useRef(null);
  const [blob, setBlob] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const handleFileChange = (event, setFile) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
    }
  };

  const handleUpload = async (file, type) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file); // Use the key 'image' for the API

    try {
      const response = await fetch(`/api/upload?type=${type}`, { // Include type to distinguish uploads
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setUploadResponse(data.url); // Store the uploaded file URL
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error(error);
      setError('An error occurred during upload');
    }
  };

  const handleAvatarUpload = async (event) => {
    event.preventDefault();

    const file = inputFileRef.current.files[0]; // Access the selected file
    if (!file) {
      setUploadError('No file selected');
      return;
    }

    try {
      const response = await fetch(`/api/avatar/upload?filename=${file.name}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setUploadError(errorData.error || 'Upload failed');
        return;
      }

      const newBlob = await response.json();
      setBlob(newBlob);
      setUploadError(null); // Clear any previous error
    } catch (error) {
      console.error('Error during avatar upload:', error);
      setUploadError('An error occurred during upload');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
        {patient.name ? (
          <div>
            <h2 className="text-xl">{patient.name}</h2>
            <p>Age: {patient.age}</p>
            <p>Condition: {patient.condition}</p>
            <p>Details: {patient.details}</p>

            {/* Avatar Upload Section */}
            <h3 className="text-lg font-medium mt-6">Upload Your Avatar</h3>
            <form onSubmit={handleAvatarUpload}>
              <input name="file" ref={inputFileRef} type="file" required />
              <button type="submit" className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50">
                Upload
              </button>
            </form>
            {blob && (
              <div className="mt-4">
                Blob URL: <a href={blob.url} target="_blank" rel="noopener noreferrer">{blob.url}</a>
              </div>
            )}
            {uploadError && <p className="mt-4 text-red-600">{uploadError}</p>}

            {/* File Upload Section */}
            <div className="mt-6">
              <h3 className="text-lg font-medium">Upload Data</h3>

              {/* MRI Data Upload */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Upload MRI Data (JPG, JPEG, PNG)
                </label>
                <input
                  type="file"
                  accept=".jpg, .jpeg, .png"
                  onChange={(event) => handleFileChange(event, setMriFile)}
                  className="mt-1 block w-full text-sm text-gray-500 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={() => handleUpload(mriFile, 'MRI')} // Call upload function with selected file
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Upload MRI File
                </button>
              </div>

              {/* RNA Data Upload */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Upload RNA Data (.h5ad)
                </label>
                <input
                  type="file"
                  accept=".h5ad"
                  onChange={(event) => handleFileChange(event, setRnaFile)}
                  className="mt-1 block w-full text-sm text-gray-500 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={() => handleUpload(rnaFile, 'RNA')} // Call upload function with selected file
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Upload RNA File
                </button>
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
                <button
                  onClick={() => handleUpload(wsiFile, 'WSI')} // Call upload function with selected file
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Upload WSI File
                </button>
              </div>
            </div>

            {uploadResponse && <p className="mt-4 text-green-600">Uploaded File URL: {uploadResponse}</p>}
            {error && <p className="mt-4 text-red-600">{error}</p>}
          </div>
        ) : (
          <p>Patient not found</p>
        )}
      </div>
    </div>
  );
};

export default PatientDetails;
