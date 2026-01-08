
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./styles/index.css";
import App from "./App.tsx";

// AuthContext import
import { AuthProvider } from "./contexts/AuthContext.tsx";
// Theme Provider import
import { ThemeProvider } from "./contexts/ThemeContext.tsx";
// SideNav Provider import
import { SideNavProvider } from "./contexts/SideNavContext.tsx";
// Socket Provider import (for battle feature)
import { SocketProvider } from "./contexts/SocketContext.tsx";

// Layout Import
import RootLayout from "./rootlayout.tsx";
import MainLayout from "./pages/layout.tsx";
import AuthLayout from "./pages/auth/layout.tsx";

// Page Import
import HomePage from "./pages/main/home.tsx";
import LeaderboardPage from "./pages/main/leaderboard.tsx";
import ProfilePage from "./pages/main/profile.tsx";
import Courses from "./pages/main/course/Course.tsx";
import ExercisePage from "./pages/main/course/Exercise.tsx";
import Settings from "./pages/main/settings.tsx";
import ShopPage from "./pages/main/shop.tsx";
import TrialApp from "./pages/non-auth/trial-App.tsx";
import TrialHome from "./pages/non-auth/trial-home.tsx";

// Battle Pages Import
import BattleLobby from "./pages/main/battle/BattleLobby.tsx";
import BattleArena from "./pages/main/battle/BattleArena.tsx";

// Auth Pages Import
import Register from "./pages/auth/register.tsx";
import Login from "./pages/auth/login.tsx";
import { AuthGuard } from "./contexts/AuthGuard.tsx";
import { RequireAuth } from "./contexts/RequireAuth.tsx";
import AutoExercise from "./pages/main/course/AutoExercise.tsx";



createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <SideNavProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<RootLayout />}>
                  {/* Tanpa layout, standalone */}
                  <Route path="/" element={<App />} />
                  <Route path="/trialApp" element={<TrialApp />} />
                  <Route path="/trialHome" element={<TrialHome />} />

                  {/* Protected routes - Require authentication */}
                  <Route element={
                    <RequireAuth>
                      <MainLayout />
                    </RequireAuth>
                  }>
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/profile/:userId" element={<ProfilePage />} />
                    <Route path="/courses/:courseId" element={<Courses />} />
                    <Route path="/exercise/:exerciseId" element={<ExercisePage />} />
                    <Route path="/auto-exercise/:courseId" element={<AutoExercise />} />
                    <Route path="/settings" element={<Settings />} />
                    {/* Battle routes */}
                    <Route path="/battle" element={<BattleLobby />} />
                    <Route path="/battle/arena" element={<BattleArena />} />
                  </Route>

                  {/* Dengan layout auth */}
                  <Route element={<AuthGuard><AuthLayout /></AuthGuard>}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                  </Route>

                </Route>
              </Routes>
            </BrowserRouter>
          </SideNavProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);

