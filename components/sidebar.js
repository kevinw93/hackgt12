import Link from 'next/link';

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-gray-200 shadow-md p-5 fixed">
      <div className="mb-4">
        <img src="/oncoai.png" alt="OncoAI Logo" className="w-full h-auto" />
      </div>
      <h2 className="text-lg font-bold mb-4">Navigation</h2>
      <ul className="space-y-2">
        <li>
          <Link href="/" className="text-blue-600 hover:underline">
            Home
          </Link>
        </li>
        <li>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/add-patient" className="text-blue-600 hover:underline">
            Add Patient
          </Link>
        </li>
        <li>
          <Link href="/" className="text-blue-600 hover:underline">
            Logout
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
