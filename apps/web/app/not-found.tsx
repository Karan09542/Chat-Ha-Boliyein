import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white text-center p-5 relative">
      {/* Background */}
      <div
        className="bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url('/shivling.jpg')" }}
      ></div>

      <h1 className="text-6xl font-bold text-red-500 drop-shadow-md">404</h1>
      <h2 className="text-3xl font-semibold mt-2">हर हर महादेव!</h2>
      <p className="mt-4 text-lg max-w-lg">
        ओम नमः शिवाय! लगता है कि आपने किसी अनजानी गुफा में प्रवेश कर लिया है।
      </p>

      <Link
        href="/"
        className="mt-6 px-6 py-3 cursor-pointer bg-blue-600 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-lg"
      >
        🔱 वापस मुख्य पृष्ठ पर जाएं
      </Link>
    </div>
  );
}
