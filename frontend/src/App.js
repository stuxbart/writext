import { Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'
// import './styles/App.scss';
// import 'semantic-ui-css/semantic.min.css'


import Home from './pages/Home';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Error404 from './pages/Error404';
import Projects from './pages/Projects';
import ProjectEdit from './pages/ProjectEdit';
import Logout from './pages/Logout';
import Register from './pages/Register';
import LoadingSpinner from './components/LoadingSpinner';


function App() {
  const isAuthLoadin = useSelector((state) => state.auth.loading)


  return (<>
  <Navbar />
  <main className="w-100 m-auto">

    {isAuthLoadin ? (
    <LoadingSpinner />
      ) : (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="logout" element={<Logout />} />
      <Route path="register" element={<Register />} />
      <Route path="projects" element={<Projects />}/>
      <Route path="project/:projectId" element={<ProjectEdit />}/>
      <Route path="*" element={<Error404 />} />
    </Routes> )}
    
  </main>
  </>
  );
}

export default App;