import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useForm } from "../../hooks/useForm";
import { validateEmail, validatePassword, validateConfirmPassword } from "../../utils/validation";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, isLoading, error, successMessage, clearMessages } = useAuth();
  const { values, errors, handleChange, setFieldError, clearErrors, reset } = useForm({
    email: "",
    password: "",
    confirmPassword: ""
  });

  const validateForm = () => {
    const emailError = validateEmail(values.email);
    const passwordError = validatePassword(values.password);
    const confirmPasswordError = !isLogin ? 
      validateConfirmPassword(values.password, values.confirmPassword) : null;

    if (emailError) setFieldError("email", emailError);
    if (passwordError) setFieldError("password", passwordError);
    if (confirmPasswordError) setFieldError("confirmPassword", confirmPasswordError);

    return !emailError && !passwordError && !confirmPasswordError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (isLogin) {
        await login(values.email, values.password);
      } else {
        await register(values.email, values.password);
      }
    } catch (err) {
      // Error handled by useAuth hook
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
    clearMessages();
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <h1>{isLogin ? "Login" : "Register"}</h1>
      
      {successMessage && (
        <div style={{ 
          color: "green", 
          backgroundColor: "#d4edda", 
          padding: 12, 
          borderRadius: 4, 
          marginBottom: 16 
        }}>
          {successMessage}
        </div>
      )}

      {error && (
        <div style={{ 
          color: "red", 
          backgroundColor: "#f8d7da", 
          padding: 12, 
          borderRadius: 4, 
          marginBottom: 16 
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <input
            type="email"
            placeholder="Email"
            value={values.email}
            onChange={(e) => handleChange("email", e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: errors.email ? "1px solid red" : "1px solid #ccc"
            }}
          />
          {errors.email && <div style={{ color: "red", fontSize: 12 }}>{errors.email}</div>}
        </div>

        <div style={{ marginBottom: 16 }}>
          <input
            type="password"
            placeholder="Password"
            value={values.password}
            onChange={(e) => handleChange("password", e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: errors.password ? "1px solid red" : "1px solid #ccc"
            }}
          />
          {errors.password && <div style={{ color: "red", fontSize: 12 }}>{errors.password}</div>}
        </div>

        {!isLogin && (
          <div style={{ marginBottom: 16 }}>
            <input
              type="password"
              placeholder="Confirm Password"
              value={values.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: errors.confirmPassword ? "1px solid red" : "1px solid #ccc"
              }}
            />
            {errors.confirmPassword && <div style={{ color: "red", fontSize: 12 }}>{errors.confirmPassword}</div>}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: 12,
            backgroundColor: isLoading ? "#6c757d" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: isLoading ? "not-allowed" : "pointer"
          }}
        >
          {isLoading ? "Loading..." : (isLogin ? "Login" : "Register")}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 16 }}>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={toggleMode}
          style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer" }}
        >
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  );
}