import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../lib/constants";

function GoogleCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace("#", ""));
    const token = hashParams.get("token");
    const refreshToken = hashParams.get("refreshToken");

    if (token) {
      localStorage.setItem("acessToken", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      navigate(ROUTE_PATHS.dashboard, { replace: true });
      
    } else {
      navigate(ROUTE_PATHS.login, { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <p>Finalizando login...</p>
    </div>
  );
}

export default GoogleCallbackPage;