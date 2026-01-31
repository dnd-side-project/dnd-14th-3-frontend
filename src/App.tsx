import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";

import MobileLayout from "@/layout/MobileLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MobileLayout />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
