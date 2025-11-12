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
import Nutrition from "./pages/Nutrition";
import Social from "./pages/Social";
import GuideIntro from "./pages/guide/GuideIntro";
import GuideOnboarding from "./pages/guide/GuideOnboarding";
import GuideModules from "./pages/guide/GuideModules";
import GuideLessonPlayer from "./pages/guide/GuideLessonPlayer";
import GuideInteractiveDemo from "./pages/guide/GuideInteractiveDemo";
import GuideQuiz from "./pages/guide/GuideQuiz";
import GuideFinalTest from "./pages/guide/GuideFinalTest";
import GuideCertificate from "./pages/guide/GuideCertificate";
import GuideRecommendations from "./pages/guide/GuideRecommendations";
import GuideResources from "./pages/guide/GuideResources";
import GuideProgress from "./pages/guide/GuideProgress";
import TopicSubcategories from "./pages/TopicSubcategories";
import TrainingProgramsRoadmap from "./pages/TrainingProgramsRoadmap";
import SkillDetailPage from "./pages/training/SkillDetailPage";
import Marketplace from "./pages/Marketplace";
import Insurance from "./pages/Insurance";
import Services from "./pages/Services";
import Relaxation from "./pages/Relaxation";
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
                    <Route path="/nutrition/:dogId" element={
                      <ProtectedRoute>
                        <Nutrition />
                      </ProtectedRoute>
                    } />
                    <Route path="/social" element={
                      <ProtectedRoute>
                        <Social />
                      </ProtectedRoute>
                    } />
                    <Route path="/marketplace" element={
                      <ProtectedRoute>
                        <Marketplace />
                      </ProtectedRoute>
                    } />
                    <Route path="/insurance" element={
                      <ProtectedRoute>
                        <Insurance />
                      </ProtectedRoute>
                    } />
                    <Route path="/services" element={
                      <ProtectedRoute>
                        <Services />
                      </ProtectedRoute>
                    } />
                    <Route path="/relaxation" element={
                      <ProtectedRoute>
                        <Relaxation />
                      </ProtectedRoute>
                    } />
                    
                    {/* Pre-Purchase Guide Routes */}
                    <Route path="/guide/intro" element={<GuideIntro />} />
                    <Route path="/guide/onboarding" element={
                      <ProtectedRoute>
                        <GuideOnboarding />
                      </ProtectedRoute>
                    } />
                    <Route path="/guide/modules" element={
                      <ProtectedRoute>
                        <GuideModules />
                      </ProtectedRoute>
                    } />
                    <Route path="/guide/module/:moduleId" element={
                      <ProtectedRoute>
                        <GuideLessonPlayer />
                      </ProtectedRoute>
                    } />
                    <Route path="/guide/interactive" element={
                      <ProtectedRoute>
                        <GuideInteractiveDemo />
                      </ProtectedRoute>
                    } />
                    <Route path="/guide/quiz/:quizId" element={
                      <ProtectedRoute>
                        <GuideQuiz />
                      </ProtectedRoute>
                    } />
                    <Route path="/guide/final-test" element={
                      <ProtectedRoute>
                        <GuideFinalTest />
                      </ProtectedRoute>
                    } />
                    <Route path="/guide/certificate" element={
                      <ProtectedRoute>
                        <GuideCertificate />
                      </ProtectedRoute>
                    } />
                    <Route path="/guide/resources" element={
                      <ProtectedRoute>
                        <GuideResources />
                      </ProtectedRoute>
                    } />
                    <Route path="/guide/progress" element={
                      <ProtectedRoute>
                        <GuideProgress />
                      </ProtectedRoute>
                    } />
                    <Route path="/guide/recommendations" element={
                      <ProtectedRoute>
                        <GuideRecommendations />
                      </ProtectedRoute>
                    } />
                    
                    {/* Training Topic Routes */}
                    <Route path="/training/:type/:topicId" element={
                      <ProtectedRoute>
                        <TopicSubcategories />
                      </ProtectedRoute>
                    } />
                    
                    {/* Training Programs Roadmap */}
                    <Route path="/training/programs" element={
                      <ProtectedRoute>
                        <TrainingProgramsRoadmap />
                      </ProtectedRoute>
                    } />
                    
                    {/* Training Skill Detail Routes */}
                    <Route path="/training/skill/:trickId/detail" element={
                      <ProtectedRoute>
                        <SkillDetailPage />
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
