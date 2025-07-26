import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CityDetail from "./pages/CityDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/city/:cityName" element={<CityDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
