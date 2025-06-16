
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import pkg from "../package.json"

createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename={pkg.homepage}>
    <App />
  </BrowserRouter>
);
