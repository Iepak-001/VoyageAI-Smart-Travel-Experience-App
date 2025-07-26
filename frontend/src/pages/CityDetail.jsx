import React, { useEffect, useState } from "react";
import axios from "axios";

const CityDetail = ({ cityName }) => {
  const [city, setCity] = useState(null);
  const [places, setPlaces] = useState([]);
  const [videos, setVideos] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [prosCons, setProsCons] = useState({ pros: [], cons: [] });

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        const resCity = await axios.get(`/api/cities/${cityName}`);
        const resPlaces = await axios.get(`/api/cities/${cityName}/places`);
        const resVideos = await axios.get(`/api/cities/${cityName}/videos`);
        const resReviews = await axios.get(`/api/cities/${cityName}/reviews`);

        setCity(resCity.data);
        setPlaces(resPlaces.data);
        setVideos(resVideos.data);
        setReviews(resReviews.data.reviews);
        setProsCons(resReviews.data.prosCons);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCityData();
  }, [cityName]);

  if (!city) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* City Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">{city.name}</h1>
        <p className="text-gray-600 text-lg">{city.description}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {city.images && city.images.map((img, idx) => (
            <img key={idx} src={img} alt={`City view ${idx}`} className="rounded-xl w-full h-48 object-cover shadow" />
          ))}
        </div>
      </div>

      {/* Top Places */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Top Destinations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {places && places.map((place, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl shadow">
              <img src={place.image} alt={place.name} className="w-full h-40 object-cover rounded-lg mb-2" />
              <h3 className="text-lg font-bold">{place.name}</h3>
              <p className="text-gray-600">{place.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* YouTube Videos */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recommended Videos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {videos.map((video, idx) => (
            <div key={idx} className="aspect-w-16 aspect-h-9">
              <iframe
                className="w-full h-48 rounded-lg"
                src={`https://www.youtube.com/embed/${video.videoId}`}
                title={video.title}
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">User Reviews</h2>
        <div className="space-y-2">
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-gray-100 p-4 rounded-xl shadow-sm">
              <p className="text-gray-800">{review}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pros & Cons (AI Analysis) */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-4">AI Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-xl font-bold text-green-600 mb-2">Pros</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-800">
              {prosCons.pros.map((pro, idx) => (
                <li key={idx}>{pro}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-600 mb-2">Cons</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-800">
              {prosCons.cons.map((con, idx) => (
                <li key={idx}>{con}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityDetail;
