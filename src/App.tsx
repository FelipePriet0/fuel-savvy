import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Protected from "./components/Protected";
import { SignupProvider } from "./contexts/SignupContext";

// Auth routes
import SignIn from "./routes/auth/SignIn";
import SignUpMotorista from "./routes/auth/SignUpMotorista";
import SignUpPosto from "./routes/auth/SignUpPosto";

// New signup flow
import ProfileChoice from "./pages/signup/ProfileChoice";
import MotoristaForm from "./pages/signup/MotoristaForm";
import PostoStep1 from "./pages/signup/PostoStep1";
import PostoStep2 from "./pages/signup/PostoStep2";

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
      <SignupProvider>
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
                  
                  {/* New progressive signup flow */}
                  <Route path="/signup" element={<ProfileChoice />} />
                  <Route path="/signup/step1" element={<MotoristaForm />} />
                  <Route path="/signup/step1/posto" element={<PostoStep1 />} />
                  <Route path="/signup/step2" element={<PostoStep2 />} />
                  
                  {/* Legacy signup routes (keep for backward compatibility) */}
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
      </SignupProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
