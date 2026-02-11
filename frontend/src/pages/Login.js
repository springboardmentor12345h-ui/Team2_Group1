import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );

      localStorage.setItem("token", res.data.token);
      alert(res.data.message);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response.data.message);
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <input type="email"
        placeholder="Email"
        onChange={e => setForm({ ...form, email: e.target.value })}
      />
      <input type="password"
        placeholder="Password"
        onChange={e => setForm({ ...form, password: e.target.value })}
      />
      <button onClick={handleSubmit}>Login</button>
      <p>New user? <Link to="/signup">Signup</Link></p>
    </div>
  );
}

export default Login;
