import { Route } from 'react-router-dom'

import App from "./App";
import LandingPage from "./components/pages/LandingPage";
import ContactPage from "./components/pages/ContactPage";

const AppRoutes = () => ( 
    <App>
        <Route path="/" component={ContactPage} />
        <Route component={Error404} />
    </App>
)
  
export default AppRoutes