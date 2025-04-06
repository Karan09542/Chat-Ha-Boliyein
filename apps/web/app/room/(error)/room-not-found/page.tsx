"use client";

import { useRouter } from "next/navigation";

export default function RoomNotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-900 text-white p-6">
      <img 
        src="https://servdharm.com/cdn/shop/articles/Untitled_design_b7f25b05-29a1-463b-922f-f1f526a196ca_800x.jpg?v=1682571145" 
        alt="भगवान शिव" 
        className="w-64 h-48 object-cover rounded-lg shadow-lg"
      />
      <h1 className="text-4xl font-extrabold mt-5 text-blue-400">🔱 ॐ नमः शिवाय 🔱</h1>
      <p className="text-lg mt-2 text-gray-300">
        यह कक्ष (Room) इस समय उपलब्ध नहीं है।  
        महादेव की कृपा से आपको जल्द ही सही मार्ग मिलेगा। 🙏  
      </p>
      <div className="mt-5 flex gap-4">
        <button className="border-blue-400 text-blue-400 flex items-center border px-2" onClick={() => router.back()}>
          <span className="text-3xl">🔙</span> <span>वापस जाएं</span>
        </button>
        <button className="bg-blue-600 px-3 py-2 " onClick={() => router.push("/")}>
          🏠 होम पेज
        </button>
      </div>
    </div>
  );
}
