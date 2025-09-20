import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useIdleLogout(timeout = 30 * 60 * 1000) {
  const navigate = useNavigate();

  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        // Auto-logout
        localStorage.removeItem("authToken");
        navigate("/login");
        window.location.reload(); // optional, clears state
      }, timeout);
    };

    // Listen for user activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("click", resetTimer);

    // Start timer
    resetTimer();

    // Cleanup
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [navigate, timeout]);
}
