import React from 'react';

const trendingDestinations = [
  { name: "Lisbon", image: "/images/lisbon.jpg" },
  { name: "Kyoto", image: "/images/kyoto.jpg" },
  { name: "Udaipur", image: "/images/udaipur.jpg" },
  { name: "Reykjavik", image: "/images/reykjavik.jpg" },
  { name: "Vancouver", image: "/images/vancouver.jpg" },
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="text-center py-16 px-4 bg-gradient-to-br from-blue-100 to-indigo-100">
        <h1 className="text-4xl font-bold mb-4">Plan Your Solo Adventure with AI</h1>
        <p className="text-lg mb-6">Smarter itineraries. Instant travel tips. Personalized experiences.</p>
        <input
          type="text"
          placeholder="Where do you want to go?"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none w-64"
        />
        <div className="mt-6">
          <a
            href="/planner"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700"
          >
            Plan Your Trip
          </a>
        </div>
      </section>

      {/* Trending */}
      <section className="py-12 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Trending Solo Destinations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {trendingDestinations.map((dest) => (
            <div key={dest.name} className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition">
              <img
                src={dest.image}
                alt={dest.name}
                className="h-48 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-medium">{dest.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-12 px-6">
        <h2 className="text-2xl font-semibold text-center mb-10">What VoyageAI Offers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            ["🧠", "AI Itinerary Generator"],
            ["🎥", "Travel Video Explorer"],
            ["💬", "Review Summarizer"],
            ["❤️", "Personalized Recommendations"],
          ].map(([icon, title]) => (
            <div
              key={title}
              className="bg-white p-6 rounded-xl shadow hover:shadow-md text-center"
            >
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-semibold">{title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-16 px-4 bg-indigo-100">
        <h2 className="text-2xl font-semibold mb-4">Ready to start your next adventure?</h2>
        <a
          href="/login"
          className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700"
        >
          Login to Get Started
        </a>
      </section>
    </div>
  );
};

export default HomePage;
