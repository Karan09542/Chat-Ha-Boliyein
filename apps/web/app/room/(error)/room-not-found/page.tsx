"use client";

import { useRouter } from "next/navigation";

export default function RoomNotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 text-center">
      {/* Optional Shiv Image */}
      <img
        src="https://www.skmystic.in/cdn/shop/articles/1683680049609.jpg?v=1693805383&width=1100"
        alt="Lord Shiva"
        className="w-32 h-32 -mt-30 mb-3 object-cover rounded-full shadow-md"
      />

      {/* SVG: Trishul Icon */}
      <div className="mb-4">
        <svg
          width="60"
          height="60"
          viewBox="0 0 24 20"
          fill="none"
          stroke="#4B5563"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v20" />
          <g transform="rotate(180 12 5)">
            <path d="M12 2c-1 2-4 3-6 2 1 2 1 4 0 6" />
            <path d="M12 2c1 2 4 3 6 2-1 2-1 4 0 6" />
          </g>
          <path d="M10 9h4" />
        </svg>
      </div>

      {/* भक्ति टच */}
      <h2 className="text-2xl text-gray-700 font-semibold mb-2">ॐ नमः शिवाय 🙏</h2>

      {/* Main Heading */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Room नहीं मिला</h1>

      {/* Message */}
      <p className="text-gray-600 mb-6">
        यह रूम अब इस संसार में नहीं है —
        शायद भोलेनाथ ने आपकी राह किसी और ओर मोड़ दी हो।
      </p>

      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="bg-gray-800 hover:bg-gray-900 text-white text-base px-5 py-2 rounded-md"
      >
        🔙 वापस मुख्य पृष्ठ पर
      </button>
    </div>
  );
}
