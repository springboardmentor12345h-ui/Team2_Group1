import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import AdminPanel from "./pages/AdminPanel";
import Events from "./pages/Events";
import Landing from "./pages/Landing";

const AppContent = () => {
  const location = useLocation();
  const showNavbar = location.pathname !== "/" && location.pathname !== "/login" && location.pathname !== "/register";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {showNavbar && <Navbar />}
      <div className={showNavbar ? "" : ""}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/events" element={<Events />} />
        </Routes>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
