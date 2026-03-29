import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserCircleIcon,
  AcademicCapIcon,
  EyeIcon,
  EyeSlashIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import AuthContext from "../context/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const Auth = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname === "/login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(location.pathname === "/login");
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Login States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register States
  const [regData, setRegData] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    role: "student",
    adminPin: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast.success("Welcome back to Campus Pulse!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (regData.password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setLoading(true);
    try {
      await register(regData);
      toast.success("Registration successful! Welcome to the hub.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role) => {
    setRegData({ ...regData, role });
  };

  const demoCredentials = [
    { role: "Super Admin", email: "admin@example.com", pass: "test1234" },
    { role: "College Admin", email: "admin@college.edu", pass: "test1234" },
    { role: "Student", email: "max@example.com", pass: "test1234" },
  ];

  const formVariants = {
    hidden: { opacity: 0, x: 20, transition: { duration: 0.2 } },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <div className="h-screen w-full relative bg-white font-sans overflow-hidden">
      <div className="flex h-full w-full">
        <div className="flex flex-col lg:flex-row h-full w-full">
          {/* Brand/Marketing Side */}
          <div className="hidden lg:flex lg:w-[40%] bg-primary-600 relative overflow-hidden p-12 flex-col justify-center items-center text-center shrink-0 shadow-2xl z-20">
            <div className="absolute inset-0">
              <img
                src="/auth_side_bg.png"
                alt="Background"
                className="w-full h-full object-cover mix-blend-overlay opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary-900/60 to-primary-600/40" />
            </div>

            <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
              <div className="flex flex-col items-center gap-4 mb-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
                  <RocketLaunchIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <span className="block text-2xl font-black text-white tracking-widest uppercase italic">
                    CAMPUS <span className="text-primary-200">PULSE</span>
                  </span>
                  <span className="text-[10px] font-black tracking-[0.4em] uppercase text-primary-200/60 leading-none">
                    Elevate Your Journey
                  </span>
                </div>
              </div>

              <h1 className="text-5xl font-black text-white mb-6 leading-tight tracking-tight uppercase">
                Elevate <br />
                <span className="text-primary-200 whitespace-nowrap">Your Campus.</span>
              </h1>

              <p className="text-primary-100/70 text-lg font-bold leading-relaxed mb-10">
                The definitive platform for verified recognition and student engagement.
              </p>
            </div>

            <div className="relative z-10 space-y-4 inline-block text-left mb-10">
              {["Smart Event Sync", "Digital Recognition", "Swift Onboarding"].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-white/90">
                  <CheckCircleIcon className="w-6 h-6 text-primary-300" />
                  <span className="text-md font-black tracking-tight uppercase">{item}</span>
                </div>
              ))}
            </div>

            <div className="relative z-10 pt-8 border-t border-white/10 w-full max-w-sm">
              <p className="text-white/40 text-[10px] font-black tracking-[0.4em] uppercase">
                Campus Pulse Secure Platform v2.0
              </p>
            </div>
          </div>

          {/* Form Side */}
          <div className="w-full lg:w-[60%] bg-white flex flex-col h-full overflow-y-auto custom-scrollbar">
            <div className="p-8 sm:p-12 lg:p-16 w-full max-w-md mx-auto my-auto">
              <div className="flex gap-8 mb-12 border-b border-gray-100">
                <button
                  onClick={() => navigate("/login")}
                  className={`relative pb-4 text-xs font-black tracking-widest transition-all uppercase ${isLogin ? "text-primary-600" : "text-gray-300 hover:text-gray-500"}`}
                >
                  Sign In
                  {isLogin && (
                    <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className={`relative pb-4 text-xs font-black tracking-widest transition-all uppercase ${!isLogin ? "text-primary-600" : "text-gray-300 hover:text-gray-500"}`}
                >
                  Sign Up
                  {!isLogin && (
                    <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full" />
                  )}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.div key="login" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                    <div className="mb-10">
                      <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">Welcome Back</h2>
                      <p className="text-gray-400 text-sm font-bold uppercase tracking-wider opacity-60">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                        <div className="relative">
                          <Input
                            type="email"
                            placeholder="mail@institute.edu"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="pl-12 h-14 bg-gray-50 border-gray-100 focus:bg-white rounded-2xl text-md font-bold"
                            required
                          />
                          <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Secure Password</label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="pl-12 pr-12 h-14 bg-gray-50 border-gray-100 focus:bg-white rounded-2xl text-md font-bold"
                            required
                          />
                          <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                          >
                            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <Button type="submit" className="w-full h-14 rounded-2xl bg-primary-600 hover:bg-black font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary-500/20 transition-all duration-300" disabled={loading}>
                        {loading ? "Authenticating..." : "Access Dashboard"}
                      </Button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-gray-50">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Demo Credentials</p>
                      <div className="grid grid-cols-1 gap-2">
                        {demoCredentials.map((cred, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors group cursor-pointer" onClick={() => { setLoginEmail(cred.email); setLoginPassword(cred.pass); }}>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter leading-none mb-1">{cred.role}</span>
                              <span className="text-xs font-bold text-gray-700">{cred.email}</span>
                            </div>
                            <CheckCircleIcon className="w-5 h-5 text-gray-200 group-hover:text-primary-500 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="register" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                    <div className="mb-10">
                      <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">Create Account</h2>
                      <p className="text-gray-400 text-sm font-bold uppercase tracking-wider opacity-60">Join your campus network</p>
                    </div>

                    <form onSubmit={handleRegisterSubmit} className="space-y-5">
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        {["student", "collegeAdmin"].map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => handleRoleChange(role)}
                            className={`p-3 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all ${regData.role === role ? "bg-primary-600 text-white border-primary-600 shadow-md scale-105" : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"}`}
                          >
                            {role === "student" ? "Student" : "Admin"}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                          <div className="relative">
                            <Input
                              type="text"
                              placeholder="Your Full Name"
                              value={regData.name}
                              onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                              className="pl-12 h-14 bg-gray-50 border-gray-100 focus:bg-white rounded-2xl text-md font-bold"
                              required
                            />
                            <UserCircleIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                          <div className="relative">
                            <Input
                              type="email"
                              placeholder="mail@institute.edu"
                              value={regData.email}
                              onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                              className="pl-12 h-14 bg-gray-50 border-gray-100 focus:bg-white rounded-2xl text-md font-bold"
                              required
                            />
                            <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Institution</label>
                          <div className="relative">
                            <Input
                              type="text"
                              placeholder="College Name"
                              value={regData.college}
                              onChange={(e) => setRegData({ ...regData, college: e.target.value })}
                              className="pl-12 h-14 bg-gray-50 border-gray-100 focus:bg-white rounded-2xl text-md font-bold"
                              required
                            />
                            <AcademicCapIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              value={regData.password}
                              onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                              className="h-14 bg-gray-50 border-gray-100 focus:bg-white rounded-2xl text-md font-bold"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm</label>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="h-14 bg-gray-50 border-gray-100 focus:bg-white rounded-2xl text-md font-bold"
                              required
                            />
                          </div>
                        </div>

                        {regData.role === "collegeAdmin" && (
                          <div className="space-y-1 animate-in slide-in-from-top-2">
                             <label className="text-[10px] font-black text-primary-600 uppercase tracking-widest ml-1">Admin Verification Code</label>
                             <Input
                               type="password"
                               placeholder="Admin Pin"
                               value={regData.adminPin}
                               onChange={(e) => setRegData({ ...regData, adminPin: e.target.value })}
                               className="h-14 bg-blue-50 border-blue-100 focus:bg-white rounded-2xl text-md font-bold"
                               required
                             />
                          </div>
                        )}
                      </div>

                      <Button type="submit" className="w-full h-14 rounded-2xl bg-primary-600 hover:bg-black font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary-500/20 mt-6" disabled={loading}>
                        {loading ? "Creating Account..." : "Join Campus Pulse"}
                      </Button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
