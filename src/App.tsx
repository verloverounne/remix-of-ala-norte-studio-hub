import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { ScrollToTop } from "./components/ScrollToTop";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CartProvider } from "./hooks/useCart";

// Lazy load pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const Equipos = lazy(() => import("./pages/Equipos"));
const Espacios = lazy(() => import("./pages/Espacios"));
const Servicios = lazy(() => import("./pages/Servicios"));
const Comunidad = lazy(() => import("./pages/Comunidad"));
const Nosotros = lazy(() => import("./pages/Nosotros"));
const Soporte = lazy(() => import("./pages/Soporte"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const AdminBlog = lazy(() => import("./pages/AdminBlog"));
const Cotizador = lazy(() => import("./pages/Cotizador"));
const Contacto = lazy(() => import("./pages/Contacto"));
const Admin = lazy(() => import("./pages/Admin"));
const Auth = lazy(() => import("./pages/Auth"));
const Cartoni = lazy(() => import("./pages/Cartoni"));
const MergeEquipment = lazy(() => import("./pages/MergeEquipment"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Header />
          <main>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/equipos" element={<Equipos />} />
              <Route path="/espacios" element={<Espacios />} />
              <Route path="/servicios" element={<Servicios />} />
              <Route path="/comunidad" element={<Comunidad />} />
              <Route path="/nosotros" element={<Nosotros />} />
              <Route path="/soporte" element={<Soporte />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/cotizador" element={<Cotizador />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/cartoni" element={<Cartoni />} />
              <Route path="/merge-equipment" element={<MergeEquipment />} />
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/blog" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminBlog />
                  </ProtectedRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <WhatsAppButton />
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
