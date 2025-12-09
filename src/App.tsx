// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login";
import CandidateTimesheet from "./pages/CandidateTimesheet";

// Simple auth guard
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={<LoginPage />} />

      {/* EMPLOYEE / CANDIDATE TIMESHEETS */}
      <Route
        path="/timesheets"
        element={
          <PrivateRoute>
            <CandidateTimesheet />
          </PrivateRoute>
        }
      />

      {/* DEFAULT */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
