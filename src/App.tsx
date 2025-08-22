import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Protected from "./components/Protected";

// Auth routes
import SignIn from "./routes/auth/SignIn";
import SignUpMotorista from "./routes/auth/SignUpMotorista";
import SignUpPosto from "./routes/auth/SignUpPosto";

// Motorista routes
import Home from "./routes/motorista/Home";
import Cupom from "./routes/motorista/Cupom";

// Posto routes
import Dashboard from "./routes/posto/Dashboard";
import CriarCupom from "./routes/posto/CriarCupom";
import GerenciarCupons from "./routes/posto/GerenciarCupons";
import HistoricoCupons from "./routes/posto/HistoricoCupons";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen">
          <Header />
          <Routes>
            {/* Public routes */}
            <Route path="/entrar" element={<SignIn />} />
            <Route path="/cadastro/motorista" element={<SignUpMotorista />} />
            <Route path="/cadastro/posto" element={<SignUpPosto />} />
            
            {/* Motorista routes */}
            <Route path="/" element={<Protected><Home /></Protected>} />
            <Route path="/cupom/:id" element={<Protected><Cupom /></Protected>} />
            
            {/* Posto routes */}
            <Route path="/posto" element={<Protected roleRequired="posto"><Dashboard /></Protected>} />
            <Route path="/posto/novo" element={<Protected roleRequired="posto"><CriarCupom /></Protected>} />
            <Route path="/posto/gerenciar" element={<Protected roleRequired="posto"><GerenciarCupons /></Protected>} />
            <Route path="/posto/historico" element={<Protected roleRequired="posto"><HistoricoCupons /></Protected>} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
