import React from 'react';
import logo from './logo.svg';
import './App.css';
import LandingPage from './components/pages/LandingPage';
import ContactPage from './components/pages/ContactPage';

type Props = {
  children: React.ReactNode
}

const App: React.FC<Props> = ({ children }) => ( 
  <div className="App">
    {children}
  </div> 
)

export default App;