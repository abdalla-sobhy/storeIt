import './App.css'
import Signin from './components/loginAndSignin/Signin.tsx'
import Login from './components/loginAndSignin/Login.tsx';
import Dashboard from './components/insideFiles/Dashboard.tsx';
import Documents from './components/insideFiles/Documents.tsx'
import Images from './components/insideFiles/Images.tsx'
import Media from './components/insideFiles/Media.tsx'
import Others from './components/insideFiles/Others.tsx'
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { UserProvider } from "./components/user_context/UserContext.tsx";

function App() {

  return (
    <>
      <Router>
        <UserProvider>
          <Routes>
          <Route path="/" element={<Navigate to="/Dashboard" />} /> {/* Redirect root to /signin */}
          <Route path="/signin" element={<Signin />} />
          <Route path='/Login' element={<Login />} />
          <Route path='/Dashboard' element={<Dashboard />} />
          <Route path='/Documents'element={<Documents />} />
          <Route path='/Images'element={<Images />} />
          <Route path='/Media'element={<Media />} />
          <Route path='/Others'element={<Others />} />
          </Routes>
        </UserProvider>
      </Router>
    </>
  )
}

export default App
