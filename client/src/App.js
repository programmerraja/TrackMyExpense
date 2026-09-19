import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

import Dashboard from "./components/Dashboard";
import { EXPENSE_TYPE } from "./constants/expense";
import SideNav from "./components/SideNav";
import Signin from "./pages/signin";
import ProtectedRoute from "./utils/Route";
import { ToastProvider } from "./components/Toast";
import PriceTracking from "./pages/PriceTracking";
import People from "./pages/People";
import Search from "./pages/Search";
import BankStatement from "./pages/BankStatement";
import Mappings from "./pages/Mappings";
import Settings from "./pages/Settings";
import API from "./utils/API";
import { WorkspaceProvider } from "./context/WorkspaceContext";

import "./App.css";

function App() {
  const isAuthenticated = API.isAuth();

  return (
    <ToastProvider>
      <WorkspaceProvider enabled={isAuthenticated}>
        <Router>
          {isAuthenticated && <SideNav />}
          <div
            className={
              isAuthenticated
                ? "min-h-screen pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0 md:pl-[4.5rem] lg:pl-60"
                : "min-h-screen"
            }
          >
            <Routes>
            <Route path="/signin" element={<Signin />} />
            <Route element={<ProtectedRoute />}>
              <Route
                path="/"
                element={<Dashboard key="home" type={EXPENSE_TYPE.DASHBOARD} />}
              />
              <Route
                path="/dashboard"
                element={
                  <Dashboard key="dashboard" type={EXPENSE_TYPE.DASHBOARD} />
                }
              />
              <Route
                path="/income"
                element={<Dashboard key="income" type={EXPENSE_TYPE.INCOME} />}
              />
              <Route
                path="/expense"
                element={
                  <Dashboard key="expense" type={EXPENSE_TYPE.EXPENSE} />
                }
              />
              <Route path="/people" element={<People />} />
              <Route
                path="/debt"
                element={<Dashboard key="debt" type={EXPENSE_TYPE.DEBT} />}
              />
              <Route
                path="/debt/:name"
                element={<Dashboard key="debt-name" type={EXPENSE_TYPE.DEBT} />}
              />
              <Route
                path="/investment"
                element={
                  <Dashboard key="investment" type={EXPENSE_TYPE.INVESTMENT} />
                }
              />
              <Route
                path="/incometax"
                element={
                  <Dashboard key="incometax" type={EXPENSE_TYPE.INCOME_TAX} />
                }
              />
              <Route path="/tracking" element={<PriceTracking />} />
              <Route path="/search" element={<Search />} />
              <Route path="/bank-statement" element={<BankStatement />} />
              <Route path="/import-rules" element={<Mappings />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            </Routes>
          </div>
        </Router>
      </WorkspaceProvider>
    </ToastProvider>
  );
}

export default App;
