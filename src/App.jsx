import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';
import TargetCursor from './components/feature/TargetCursor';
//import StarBorder from './components/feature/StarBorder';

function App() {
  return (
   
    <div>
       <TargetCursor 
        spinDuration={2}
        hideDefaultCursor={true}
      />
    <div>
    
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
      <Chatbot />
      <Footer />
    </div>
    </div>
    
  )
}

export default App
