import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with:", email, password);
    // Logic for role-based access control goes here [cite: 21]
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-900">Welcome Back</h2>
        <input 
          type="email" 
          placeholder="Email Address" 
          className="w-full p-3 mb-4 border rounded"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full p-3 mb-6 border rounded"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-indigo-600 text-white p-3 rounded font-bold hover:bg-indigo-700">
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Login;