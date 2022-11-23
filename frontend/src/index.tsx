import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import App from "./App";
import { store } from "./store";

import { fetchUser } from "./features/auth/authSlice";

async function main() {
  store.dispatch(fetchUser());
  const container: HTMLElement | null = document.getElementById("root");

  if (container !== null) {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      </React.StrictMode>
    );
  }
}

main();
