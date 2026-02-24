import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Skeleton } from "./components/skeleton";

const Share = lazy(() => import("./pages/share"));

const Loader = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      width: "100%",
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: "800px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <Skeleton style={{ borderRadius: 20, width: "100%", height: 300 }} />
      <Skeleton style={{ borderRadius: 20, width: "100%", height: 200 }} />
      <Skeleton style={{ borderRadius: 20, width: "100%", height: 200 }} />
    </div>
  </div>
);

export default function App() {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/share/:publicId" element={<Share />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
