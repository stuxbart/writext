import logo from './logo.svg';
import './App.css';
import LandingPage from './components/pages/LandingPage';
import ContactPage from './components/pages/ContactPage';

<<<<<<< HEAD:frontend/src/App.tsx
type Props = {
  children: React.ReactNode
=======
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
>>>>>>> parent of bad434e (Switch to typescript):frontend/src/App.js
}

const App: React.FC<Props> = ({ children }) => ( 
  <div className="App">
    {children}
  </div> 
)

export default App;