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
import ActivityDetail from "./pages/ActivityDetail";
import MealDetail from "./pages/MealDetail";
import VetVisitDetail from "./pages/VetVisitDetail";
import GroomingDetail from "./pages/GroomingDetail";
import VaccinationDetail from "./pages/VaccinationDetail";
import CheckupDetail from "./pages/CheckupDetail";
import WeightDetail from "./pages/WeightDetail";
import TreatmentDetail from "./pages/TreatmentDetail";
import InjuryDetail from "./pages/InjuryDetail";
import Analytics from "./pages/Analytics";
import RecordActivity from "./pages/RecordActivity";
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
                    <Route path="/activity/:activityId" element={
                      <ProtectedRoute>
                        <ActivityDetail />
                      </ProtectedRoute>
                    } />
                    <Route path="/meal/:mealId" element={
                      <ProtectedRoute>
                        <MealDetail />
                      </ProtectedRoute>
                    } />
                    <Route path="/vet-visit/:visitId" element={
                      <ProtectedRoute>
                        <VetVisitDetail />
                      </ProtectedRoute>
                    } />
                    <Route path="/grooming/:groomingId" element={
                      <ProtectedRoute>
                        <GroomingDetail />
                      </ProtectedRoute>
                    } />
                    <Route path="/vaccination/:vaccinationId" element={<ProtectedRoute><VaccinationDetail /></ProtectedRoute>} />
                    <Route path="/checkup/:checkupId" element={<ProtectedRoute><CheckupDetail /></ProtectedRoute>} />
                    <Route path="/weight/:weightId" element={<ProtectedRoute><WeightDetail /></ProtectedRoute>} />
                    <Route path="/treatment/:treatmentId" element={<ProtectedRoute><TreatmentDetail /></ProtectedRoute>} />
                    <Route path="/injury/:injuryId" element={<ProtectedRoute><InjuryDetail /></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                    <Route path="/record-activity" element={<ProtectedRoute><RecordActivity /></ProtectedRoute>} />
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
