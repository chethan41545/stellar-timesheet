import React from "react";
import { useAuth } from "../contexts/AuthContext";

const Home: React.FC = () => {
  const { logout, token } = useAuth();
  return (
    <div style={{ padding: 24 }}>
      <h1>Welcome to Timesheet</h1>
      <p>Token: {token ? token.slice(0, 20) + "..." : "none"}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Home;
