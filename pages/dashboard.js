import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter(); // Initialize useRouter
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([
    { id: 1, name: 'John Doe', age: 30, condition: 'Healthy' },
    { id: 2, name: 'Jane Smith', age: 40, condition: 'Diabetes' },
  ]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddPatient = () => {
    window.location.href = '/add-patient';
  };

  const handleViewDetails = (id) => {
    router.push(`/patient/${id}`); // Redirect to the patient's details page
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>

        <div className="mt-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search for patients..."
            className="px-4 py-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="mt-4">
          <button
            onClick={handleAddPatient}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            Add New Patient
          </button>
        </div>

        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {filteredPatients.map((patient) => (
              <li key={patient.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {patient.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Age: {patient.age} | Condition: {patient.condition}
                    </p>
                  </div>
                  <div>
                    <button 
                      onClick={() => handleViewDetails(patient.id)} // Add onClick handler
                      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
