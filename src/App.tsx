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
import AccountPage from "@/pages/my-page/AccountPage";
import CompanionScheduleDetailPage from "@/pages/my-page/CompanionScheduleDetailPage";
import CompanionSchedulePage from "@/pages/my-page/CompanionSchedulePage";
import ProfileCardPage from "@/pages/my-page/ProfileCardPage";
import ProfileEditPage from "@/pages/my-page/ProfileEditPage";
import SettingsPage from "@/pages/my-page/SettingsPage";
import MyPage from "@/pages/MyPage";
import OnboardingPage from "@/pages/OnboardingPage";

import ProtectedRoute from "@/router/ProtectedRoute";

import OnboardingRoute from "./router/OnboardingRoute";

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
            <Route path="/mypage/profile" element={<ProfileCardPage />} />
            <Route path="/mypage/profile/edit" element={<ProfileEditPage />} />
            <Route path="/mypage/account" element={<AccountPage />} />
            <Route path="/mypage/settings" element={<SettingsPage />} />
            <Route path="/mypage/companion-schedule" element={<CompanionSchedulePage />} />
            <Route
              path="/mypage/companion-schedule/:scheduleId"
              element={<CompanionScheduleDetailPage />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
