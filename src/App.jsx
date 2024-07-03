import { useState } from 'react'

import viteLogo from '/vite.svg'
import Home from './Home';
import { BrowserRouter as Router, Routes , Route } from 'react-router-dom';
import './App.css'
import SignIn from './signin';
import SignUp from './signup';  
import Last from './last';
function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/last" element={<Last />} />
      </Routes>
    </Router>
  );
}

export default App
