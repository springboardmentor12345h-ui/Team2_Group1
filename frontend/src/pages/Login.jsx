import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import AuthContext from "../context/AuthContext";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success("Login Successful");
        navigate("/dashboard");
      } else {
        toast.error(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300">
            <EnvelopeIcon className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Card */}
        <Card className="p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-secondary-500 text-sm">
              Sign in to your CampusEventHub account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
                <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-[34px] pointer-events-none" />
              </div>

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-[34px] pointer-events-none" />
                <button
                  type="button"
                  className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Demo Credentials */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 text-sm">
              <p className="font-semibold text-primary-900 mb-1">
                DEMO CREDENTIALS:
              </p>
              <div className="space-y-1 font-mono text-xs text-primary-700">
                <p>Student: max@example.com / test1234</p>
                <p>College Admin: admin@example.com / test1234</p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-2.5"
              isLoading={loading}
              variant="primary"
            >
              Sign In
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
