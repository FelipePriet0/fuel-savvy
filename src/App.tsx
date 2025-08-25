import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
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
import HistoricoCupons from "./routes/posto/HistoricoCupons";
import Perfil from "./routes/posto/Perfil";
import Precos from "./routes/posto/Precos";

// Layout
import PostoLayout from "./components/PostoLayout";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <div className="flex-1 flex flex-col">
              <Header />
              <Routes>
                {/* Public routes */}
                <Route path="/entrar" element={<SignIn />} />
                <Route path="/cadastro/motorista" element={<SignUpMotorista />} />
                <Route path="/cadastro/posto" element={<SignUpPosto />} />
                
                {/* Motorista routes */}
                <Route path="/" element={<Protected roleRequired="motorista"><Home /></Protected>} />
                <Route path="/cupom/:id" element={<Protected><Cupom /></Protected>} />
                
                {/* Posto routes */}
                <Route path="/posto" element={<Protected roleRequired="posto"><PostoLayout /></Protected>}>
                  <Route index element={<Dashboard />} />
                  <Route path="novo" element={<CriarCupom />} />
                  <Route path="historico" element={<HistoricoCupons />} />
                  <Route path="perfil" element={<Perfil />} />
                  <Route path="precos" element={<Precos />} />
                </Route>
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
