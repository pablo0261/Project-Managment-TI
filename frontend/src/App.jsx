
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import Programmers from './components/Programmers';
import Tasks from './components/Tasks';
import Projects from './components/Projects';
import ProjectDetail from './components/ProjectDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-600 p-4 text-white shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold">Gestión de Proyectos</Link>
            <div>
              <Link to="/programmers" className="mx-2 hover:text-blue-200">Programadores</Link>
              <Link to="/tasks" className="mx-2 hover:text-blue-200">Tareas</Link>
              <Link to="/projects" className="mx-2 hover:text-blue-200">Proyectos</Link>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/programmers" element={<Programmers />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <h1 className="text-3xl font-bold text-gray-800">Bienvenido al Sistema de Gestión de Proyectos</h1>
  );
}

export default App;

