import Image from 'next/image';
import Link from 'next/link';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Logo */}
      <Image
        src="/oncolight.png" // Adjust the path if needed
        alt="OncoAI Logo"
        width={300} // Adjust size as necessary
        height={100} // Adjust size as necessary
        className="mb-8"
      />

      {/* Placeholder Quote */}
      <blockquote className="text-center text-lg italic text-gray-700 mb-8">
        "Four doctors. One click."
      </blockquote>

      {/* Login Button */}
      <Link href="login">
        <button className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition duration-200">
          Log In
        </button>
      </Link>
    </div>
  );
};

export default Home;
