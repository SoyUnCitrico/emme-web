import { lazy, Suspense } from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  createBrowserRouter,
  Outlet,
  Route,
  RouterProvider,
  Routes,
} from "react-router-dom";
import Header from './components/Header';
import Footer from './components/Footer';

// Lazy loading pages for better performance
const Home = lazy(() => import('./pages/Home'));
// const Projects = lazy(() => import('./pages/Projects'));
// const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));

const routes = [
  { path: "*", element: <Root /> },
  { path: "/", element: <Home/>}
]
// 3️⃣ Router singleton created
const router = createBrowserRouter(
  routes,{
  future:{
    // v7_startTransition: true,
    v7_relativeSplatPath: true,
  }}
);

function Root() {
  return (
    <Routes>
      <Route element={<Layout />} />
      <Route path="/" element={<Home />} />
      {/* <Route path="/projects" element={<Projects />} /> */}
      {/* <Route path="/projects/:id" element={<ProjectDetail />} /> */}
    </Routes>          
  );
}

function Layout() {
  return (
    <>
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Suspense fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  </>
  )

}

export default function App() {
  return <RouterProvider router={router} />;
}