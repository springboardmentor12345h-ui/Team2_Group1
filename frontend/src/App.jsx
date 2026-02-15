import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import AdminPanel from "./pages/AdminPanel";
import Events from "./pages/Events";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          <Navbar />
          <div className="p-4">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/events" element={<Events />} />
            </Routes>
          </div>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
