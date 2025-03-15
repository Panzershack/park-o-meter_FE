import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import { Toolbar } from "@mui/material";
import MapInterface from "./components/mapUI";
import CarAnim from "./components/carAnim";
import AuthForm from "./components/AuthForm";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./components/LandingPage";
import SelectionPage from "./components/UserSelectionPage";
import ListParkingPage from "./components/ListParkingSpace";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Toolbar />
        <Routes>
        <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapInterface />
              </ProtectedRoute>
            }
          />
          <Route path="/car" element={<CarAnim />} />
          {/* Default route */}
          <Route path="*" element={<AuthForm />} />
          <Route path="/selection" element={<SelectionPage />} />
          <Route path="/list-parking" element={<ListParkingPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
