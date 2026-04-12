import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../lib/constants";

function GoogleCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace("#", ""));
    const queryParams = new URLSearchParams(window.location.search);

    const token = hashParams.get("token") ?? queryParams.get("token");
    const refreshToken =
      hashParams.get("refreshToken") ?? queryParams.get("refreshToken");

    if (token) {
      localStorage.setItem("acessToken", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      // Remove token/hash da barra para evitar exposição e reprocessamento no refresh.
      window.history.replaceState(null, "", ROUTE_PATHS.googleCallback);
      navigate(ROUTE_PATHS.dashboard, { replace: true });
      return;
    }

    // Em dev (StrictMode), o effect pode rodar duas vezes; se já salvou token, segue.
    if (localStorage.getItem("acessToken")) {
      navigate(ROUTE_PATHS.dashboard, { replace: true });
      return;
    }

    navigate(ROUTE_PATHS.login, { replace: true });
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <p>Finalizando login...</p>
    </div>
  );
}

export default GoogleCallbackPage;
