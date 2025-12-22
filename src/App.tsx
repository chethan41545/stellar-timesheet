// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login";
import CandidateTimesheet from "./pages/CandidateTimesheet";
import TimesheetList from "./pages/TimesheetList";
import CommonLayout from "./Layout/Common";
import ReportsScreen from "./pages/Reports";
import Projects from "./pages/Projects";

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
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <CommonLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="timesheets" replace />} />
        <Route path="timesheets" element={<CandidateTimesheet />} handle={{ title: 'My Timesheets' }} />
        <Route path="users-timesheet" element={<TimesheetList />} handle={{ title: 'Users Timesheet' }} />
        <Route path="reports" element={<ReportsScreen />} handle={{ title: 'Reports' }} />
        <Route path="projects" element={<Projects />} handle={{ title: 'Projects' }} />
      </Route>


      {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
    </Routes>

  );
}
