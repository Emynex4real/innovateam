import { Route, Routes } from 'react-router-dom';
import './App.css';
import NavBar from './navbar';
import Home from './pages/Home';
import About from './pages/About';
import Blogs from './pages/Blogs';
import Login from './pages/login/index';
import SignUp from './pages/signup';

function App() {
  return (
    <div className="App">
      {/* Conditionally render the NavBar based on the route */}
      <Routes>
        <Route
          path="/*"
          element={
            <>
              <NavBar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/blogs" element={<Blogs />} />
              </Routes>
            </>
          }
        />
        {/* Login route without the NavBar */}
        <Route path="/login" element={<Login />} />
        <Route path='/signup'element={<SignUp />} />
      </Routes>
    </div>
  );
}

export default App;