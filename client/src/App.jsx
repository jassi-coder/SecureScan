import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ScanResult from "./pages/ScanResult";
import ResetPassword from "./pages/ResetPassword";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* SIGNUP */}
        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* FORGOT PASSWORD */}
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
 <Route
          path="/scan-result"
          element={<ScanResult />}
        />

<Route
  path="/reset-password"
  element={<ResetPassword />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;