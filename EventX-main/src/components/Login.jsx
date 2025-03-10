import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { login  } from "../store/authSlice";
import { Input} from "./index";
import { Mail } from "lucide-react";
import { Meteors } from "./magicui/meteors";
import authService from "../backend/auth";

function Login() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {

      const loginResponse = await authService.logIn(data)
      console.log(loginResponse);
      
      if(loginResponse && loginResponse.user){
        console.log("we here");
        
        dispatch(login({userData:loginResponse.user}))
        console.log("Dispatched");
      }
      navigate("/browse-events")
      
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50/50">
      {/* Left Section with Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-yellow-400 to-yellow-500 items-center justify-center p-12">
        <div className="max-w-lg">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
            alt="Team collaboration"
            className="rounded-2xl shadow-2xl"
          />
          <div className="mt-8 text-white">
            <h2 className="text-4xl font-bold mb-4">EVENTX</h2>
            <p className="text-xl opacity-90">
              Welcome back! Let's continue creating amazing events together.
            </p>
          </div>
        </div>
      </div>

      {/* Right Section with Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative bg-white">
        {/* Meteors Effect inside only the white section */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Meteors number={50} className="opacity-40" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="backdrop-blur-sm bg-white/90 rounded-2xl p-8 shadow-lg border border-yellow-300">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
              <p className="mt-2 text-gray-600">Welcome back!</p>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50/50 p-3 rounded-lg border border-red-100 text-center mt-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute mt-2.5 left-3 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...register("email", { required: "Email is required" })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...register("password", { required: "Password is required" })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 text-white py-3 px-4 rounded-lg font-medium hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? "Please wait..." : "Sign In"}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Don't have an account?{" "}
                <Link to="/signup" className="text-yellow-600 hover:text-yellow-700 font-medium">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
