import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;
