import './globals.css';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const PatientDetails = () => {
  const router = useRouter();
  const { id } = router.query; // Get the dynamic route parameter
  const [patient, setPatient] = useState(null); // State to hold patient data
  const [loading, setLoading] = useState(true); // State to manage loading

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

  // State for file uploads
  const [mriFile, setMriFile] = useState(null);
  const [rnaFile, setRnaFile] = useState(null);
  const [wsiFile, setWsiFile] = useState(null);

  // Handler for file uploads
  const handleFileChange = (event, setFile) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
    }
  };

  const handleUpload = async () => {
    // Logic to handle the uploaded files
    console.log('Uploading files:', { mriFile, rnaFile, wsiFile });
  };

  if (loading) return <p>Loading...</p>; // Show loading state

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
        {patient ? (
          <div>
            <h2 className="text-xl">{patient.name}</h2>
            <p>Age: {patient.age}</p>
            <p>Condition: {patient.details}</p> {/* Using details instead of condition */}

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

              {/* Upload Button */}
              <div className="mt-4">
                <button
                  onClick={handleUpload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Upload Files
                </button>
              </div>
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
