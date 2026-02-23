import { BrowserRouter, Route, Routes } from "react-router-dom";

import RouteChangeTracker from "@/lib/analytics/RouteChangeTracker";

import { ToastContainer, ToastPortal } from "@/components/shared/toast";

import CompanionCreatePage from "@/pages/CompanionCreatePage";
import CompanionDetailPage from "@/pages/CompanionDetailPage";
import CompanionListPage from "@/pages/CompanionListPage";
import KakaoCallbackPage from "@/pages/KakaoCallbackPage";
import LoginPage from "@/pages/LoginPage";
import MainMapPage from "@/pages/MainMapPage";
import MainReviewPage from "@/pages/MainReviewPage";
import MyPage from "@/pages/MyPage";
import OnboardingPage from "@/pages/OnboardingPage";

import ProtectedRoute from "@/router/ProtectedRoute";
import OnboardingRoute from "@/router/OnboardingRoute";

import MobileLayout from "@/layout/MobileLayout";

function App() {
  return (
    <BrowserRouter>
      <RouteChangeTracker />
      <ToastContainer />
      <ToastPortal />
      <Routes>
        <Route element={<MobileLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/kakao/callback" element={<KakaoCallbackPage />} />

          <Route element={<OnboardingRoute />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainMapPage />} />
            <Route path="/review" element={<MainReviewPage />} />
            <Route path="/companion" element={<CompanionListPage />} />
            <Route path="/companion/:reservationId" element={<CompanionDetailPage />} />
            <Route path="/companion/create" element={<CompanionCreatePage />} />
            <Route path="/mypage" element={<MyPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
