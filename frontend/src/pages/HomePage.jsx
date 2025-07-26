import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim() !== "") {
      navigate(`/city/${search.toLowerCase()}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-white">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Explore Cities</h1>
      <form onSubmit={handleSearch} className="w-full max-w-md flex">
        <input
          type="text"
          placeholder="Enter a city (e.g. Paris)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-grow px-4 py-2 rounded-l-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-r-xl hover:bg-blue-600 transition"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default HomePage;
