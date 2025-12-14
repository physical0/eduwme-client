import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@src/contexts/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { login, loginWithGoogle } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const location = useLocation();
  const navigate = useNavigate();

  // Responsive form container
  const formContainerClass =
    "flex flex-col items-center justify-center w-full p-5 gap-4 md:gap-5";

  // Responsive input with larger width on laptop
  const inputBaseClass =
    "appearance-none bg-[#A7B5E7] w-full max-w-sm px-3 py-2 md:py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base placeholder-[#E0E7FF]";

  const inputErrorBorderClass = "border border-red-300";
  const inputNormalBorderClass = "border border-[#7895FC]";

  // Responsive button with better sizing for laptop
  const submitButtonClass = `w-full max-w-[160px] md:max-w-[180px] flex justify-center py-2 px-4 md:py-2.5 md:px-5 rounded-full text-sm md:text-base font-medium text-white ${isSubmitting
    ? "bg-[#303442] cursor-not-allowed"
    : "bg-[#303442] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#303442]"
    }`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      await login(formData.username, formData.password);

      const from = location.state?.from?.pathname || "/home";
      navigate(from, { replace: true });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSubmitting(true);
      setSubmitError("");
      try {
        // The tokenResponse contains an access_token, but we need the id_token
        // We'll fetch the id_token using the access_token
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${tokenResponse.access_token}`
        );

        if (!userInfoResponse.ok) {
          throw new Error("Failed to get Google user info");
        }

        // For the backend, we need to get the credential (JWT token)
        // We'll use the access token to get user info and then send it to backend
        const response = await fetch(
          `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse.access_token}`
        );

        if (!response.ok) {
          throw new Error("Failed to authenticate with Google");
        }

        const googleUser = await response.json();

        // Create a credential object to send to backend
        // Note: In production, you should use the proper ID token flow
        await loginWithGoogle(tokenResponse.access_token);

        const from = location.state?.from?.pathname || "/home";
        navigate(from, { replace: true });
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : "Google login failed"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: () => {
      setSubmitError("Google login was cancelled or failed");
    },
  });

  return (
    <form className={formContainerClass} onSubmit={handleSubmit}>
      <div className="w-full max-w-sm">
        <label htmlFor="username" className="sr-only">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className={`${inputBaseClass} ${errors.username ? inputErrorBorderClass : inputNormalBorderClass
            }`}
        />
        {errors.username && (
          <p className="mt-1 text-sm text-red-600">{errors.username}</p>
        )}
      </div>

      <div className="w-full max-w-sm">
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className={`${inputBaseClass} ${errors.password ? inputErrorBorderClass : inputNormalBorderClass
            }`}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      {submitError && (
        <div className="p-2 text-sm md:text-base bg-red-100 text-red-700 rounded-md w-full max-w-sm">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={submitButtonClass}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      {/* Divider */}
      <div className="w-full max-w-sm flex items-center gap-3 my-2">
        <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
        <span className="text-sm text-gray-500 dark:text-gray-400">OR</span>
        <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
      </div>

      {/* Google Sign In Button */}
      <button
        type="button"
        onClick={() => handleGoogleLogin()}
        disabled={isSubmitting}
        className="w-full max-w-sm flex items-center justify-center gap-3 py-2 px-4 md:py-2.5 md:px-5 rounded-full text-sm md:text-base font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Sign in with Google
      </button>

      <Link to="/register">
        <div className="text-sm md:text-base text-gray-500 mt-2">
          Don't have an account?{" "}
          <span className="text-amber-300 hover:underline">
            Register
          </span>
        </div>
      </Link>
    </form>
  );
};

export default Login;