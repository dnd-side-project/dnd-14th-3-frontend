import { BrowserRouter, Route, Routes } from "react-router-dom";

import { ToastContainer, ToastPortal } from "@/components/shared/toast";

import Home from "@/pages/Home";

import MobileLayout from "@/layout/MobileLayout";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <ToastPortal />
      <Routes>
        <Route element={<MobileLayout />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
