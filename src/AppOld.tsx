import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// Lazy loading pages for better performance
const Home = lazy(() => import('./pages/Home'));
// const Projects = lazy(() => import('./pages/Projects'));
// const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Home />} />
              {/* <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} /> */}
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}