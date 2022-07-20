import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

// import './styles/index.scss';
import App from './App';
import store from './store';

import { fetchUser } from './features/auth/authSlice'


async function main() {
  store.dispatch(fetchUser())

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App/>
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
}

main()
