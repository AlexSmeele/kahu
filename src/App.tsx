import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AcceptInvitation from "./pages/AcceptInvitation";
import AIChat from "./pages/AIChat";
import AccountSettings from "./pages/AccountSettings";
import FullTimeline from "./pages/FullTimeline";
import NotFound from "./pages/NotFound";
import { PasswordGate } from "@/components/PasswordGate";
import { logger } from "@/lib/logger";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        logger.error('React Query: Query error', error, { failureCount });
        return failureCount < 3;
      },
    },
    mutations: {
      retry: (failureCount, error) => {
        logger.error('React Query: Mutation error', error, { failureCount });
        return failureCount < 1;
      },
    },
  },
});

const App = () => {
  logger.info('App: Application initializing');
  
  return (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <div className="app-shell">
              <div className="app-viewport">
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/auth" element={
                      <PasswordGate>
                        <Auth />
                      </PasswordGate>
                    } />
                    <Route path="/accept-invitation" element={<AcceptInvitation />} />
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    } />
                    <Route path="/ai-chat" element={
                      <ProtectedRoute>
                        <AIChat />
                      </ProtectedRoute>
                    } />
                    <Route path="/account-settings" element={
                      <ProtectedRoute>
                        <AccountSettings />
                      </ProtectedRoute>
                    } />
                    <Route path="/full-timeline/:dogId" element={
                      <ProtectedRoute>
                        <FullTimeline />
                      </ProtectedRoute>
                    } />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </div>
            </div>
          </ErrorBoundary>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
