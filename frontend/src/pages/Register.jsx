import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  UserCircleIcon,
  EnvelopeIcon,
  LockClosedIcon,
  AcademicCapIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import AuthContext from "../context/AuthContext";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    role: "student",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await register(
        formData.name,
        formData.email,
        formData.password,
        confirmPassword,
        formData.college,
        formData.role,
      );
      if (res.success) {
        toast.success("Registration Successful");
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
            <UserCircleIcon className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Card */}
        <Card className="p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-secondary-500 text-sm">
              Join CampusEventHub today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                label="Full Name"
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                onChange={handleChange}
                className="pl-10"
                required
              />
              <UserCircleIcon className="h-5 w-5 text-gray-400 absolute left-3 top-[34px] pointer-events-none" />
            </div>

            <div className="relative">
              <Input
                label="Email Address"
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                onChange={handleChange}
                className="pl-10"
                required
              />
              <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-[34px] pointer-events-none" />
            </div>

            <div className="relative">
              <Input
                label="College/University"
                id="college"
                name="college"
                type="text"
                placeholder="Enter your college name"
                onChange={handleChange}
                className="pl-10"
                required
              />
              <AcademicCapIcon className="h-5 w-5 text-gray-400 absolute left-3 top-[34px] pointer-events-none" />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-secondary-700 mb-1"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                className="block w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white"
                onChange={handleChange}
                defaultValue="student"
              >
                <option value="student">Student</option>
                <option value="collegeAdmin">College Admin</option>
              </select>
            </div>

            <div className="relative">
              <Input
                label="Password"
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                onChange={handleChange}
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

            <div className="relative">
              <Input
                label="Confirm Password"
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-[34px] pointer-events-none" />
              <button
                type="button"
                className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full py-2.5 mt-2"
              isLoading={loading}
              variant="primary"
            >
              Create Account
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
