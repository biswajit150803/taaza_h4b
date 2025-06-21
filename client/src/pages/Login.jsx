import React, { useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";

const Login = () => {
  const {
    login,
    logout,
    user,
    accessToken,
    authStatus,
    isAuthenticated,
    userData,
  } = useContext(AppContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (authStatus === "authenticated" && user) {
      console.log("✅ Civic Login Successful");
    }
  }, [authStatus, user, accessToken]);

  if (authStatus === "authenticating") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-green-300">
        <div className="text-xl font-medium text-gray-700 animate-pulse">Authenticating...</div>
      </div>
    );
  }

  return (
  <div className="flex min-h-screen">
  {/* Left Side - Image */}
  <div 
    className="hidden lg:flex lg:w-1/2 bg-cover bg-center bg-no-repeat relative"
    style={{
      backgroundImage: "url('https://www.indiabusinesstrade.in/wp-content/uploads/2023/11/Untitled-design-93.jpg')"
    }}
  >
    {/* Overlay for better text readability */}
    <div className="absolute inset-0 bg-black/20"></div>
    
    {/* Content over the image */}
    <div className="relative z-10 flex flex-col justify-end p-12 text-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to our portal</h1>
      <p className="text-xl opacity-90">Prevent food wastage powered by AI technology</p>
    </div>
  </div>

  {/* Right Side - Login Form */}
  <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-8 py-12">
    <div className="w-full max-w-md">
      {/* Login Card */}
      <div className="bg-white/80 backdrop-blur-sm border border-green-200 shadow-xl rounded-3xl p-8 text-center">
        
        {/* Logo Section - Fixed Layout */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <img 
              src={assets.logo} 
              alt="Taaza Logo" 
              className="w-12 h-12 rounded-full shadow-lg border-2 border-green-200" 
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
              Taaza
            </h1>
          </div>
          <p className="text-sm text-gray-500 font-medium">Food Detection • AI Powered</p>
        </div>

        <h2 className="text-3xl font-bold text-green-700 mb-6">
          {isAuthenticated ? "Welcome Back!" : "Login with Civic"}
        </h2>

        {!isAuthenticated ? (
          <div className="space-y-6">
            <p className="text-gray-500 mb-6">
              Sign in securely with your Civic identity to access personalized recipes
            </p>
            <button
              onClick={login}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="flex items-center justify-center gap-3 cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Login with Civic
              </span>
            </button>
            
            {/* Additional Info */}
            <div className="bg-green-50/80 border border-green-200 rounded-xl p-3">
              <p className="text-xs text-green-700">
                🔒 Your data is secure and encrypted with Civic's identity verification
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-2xl">👤</span>
              </div>
            </div>
            
            <p className="text-lg text-gray-800 mb-4">
              Hello, <span className="font-semibold text-green-700">{user?.name || user?.email || "User"}</span>! 🎉
            </p>

            {userData && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                <p className="text-sm text-green-700 font-medium">
                  ✅ Your profile is synced and ready to go!
                </p>
              </div>
            )}

            <button
              onClick={logout}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                Logout
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Secure authentication powered by{" "}
          <span className="font-semibold text-green-600">Civic</span>
        </p>
      </div>
    </div>
  </div>
</div>
);
};

export default Login;
