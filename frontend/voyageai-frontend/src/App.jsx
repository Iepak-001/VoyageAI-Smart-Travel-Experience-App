import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Attractions from "./pages/Attractions";
import Planner from "./pages/Planner";
import Videos from "./pages/Videos";
import Itinerary from "./pages/Itinerary";

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md flex justify-between items-center px-3 py-1 z-50">
      <h1 className="text-2xl font-bold text-blue-600">VoyageAI</h1>
      
      <div className="space-x-4">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <Link to="/attractions" className="hover:text-blue-600">Attractions</Link>
        {/* <Link to="/planner" className="hover:text-blue-600">Planner</Link> */}
        <Link to="/videos" className="hover:text-blue-600">Videos</Link>
        <Link to="/itinerary" className="hover:text-blue-600">Itinerary</Link>
      </div>
    </nav>
  );
}




export default function App() {
  return (
    <Router>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8 mt-15">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/attractions" element={<Attractions />} />
          {/* <Route path="/planner" element={<Planner />} /> */}
          <Route path="/videos" element={<Videos />} />
          <Route path="/itinerary" element={<Itinerary />} />
        </Routes>
      </main>
    </Router>
  );
}
