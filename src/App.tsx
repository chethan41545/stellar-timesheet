// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login";
import CandidateTimesheet from "./pages/CandidateTimesheet";
import TimesheetList from "./pages/TimesheetList";
import CommonLayout from "./Layout/Common";
import ReportsScreen from "./pages/Reports";
import Projects from "./pages/Projects";
import CreateProjectScreen from "./pages/Projects/CreateProject";
import { ToastContainer } from "react-toastify";
import ConfirmDialog, { type ConfirmDialogHandle } from "./shared/ConfirmDialogProvider/ConfirmDialogProvider";
import { useRef } from "react";
import CreateTaskScreen from "./pages/Projects/CreateTask";

// Simple auth guard
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {

  const confirmRef = useRef<ConfirmDialogHandle>(null);

  return (
    <div className="App">
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
          <Route path="create-project" element={<CreateProjectScreen />} />
          <Route path="create-task" element={<CreateTaskScreen />}/>
        </Route>


        {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        pauseOnHover={false}
        newestOnTop
        theme="colored" />
      <ConfirmDialog ref={confirmRef} />
    </div>

  );
}
