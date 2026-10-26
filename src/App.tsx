import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Home from "@/pages/Home";
import StylePage from "@/pages/StylePage";
import AuthPage from "@/pages/AuthPage";
import Account from "@/pages/Account";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/styles/:slug" element={<StylePage />} />
          <Route path="/login" element={<AuthPage mode="login" key="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" key="signup" />} />
          <Route path="/account" element={<Account />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
