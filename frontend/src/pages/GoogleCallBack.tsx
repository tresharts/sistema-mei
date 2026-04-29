import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { refreshSession } from "../lib/api";
import { ROUTE_PATHS } from "../lib/constants";

function GoogleCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const finishGoogleLogin = async () => {
      localStorage.removeItem("acessToken");
      const token = await refreshSession();
      if (!mounted) {
        return;
      }

      if (token) {
        navigate(ROUTE_PATHS.dashboard, { replace: true });
        return;
      }

      navigate(ROUTE_PATHS.login, { replace: true });
    };

    finishGoogleLogin();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <p>Finalizando login...</p>
    </div>
  );
}

export default GoogleCallbackPage;
