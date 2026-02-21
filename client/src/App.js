import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import Dashboard, { EXPENSE_TYPE } from "./components/Dashboard";
import SideNav from "./components/SideNav";
import Signin from "./pages/signin";
import MonthlyExpenseGraph from "./pages/MonthlyExpenseGraph";
import ProtectedRoute from "./utils/Route";
import { ToastProvider } from "./components/Toast";
import PriceTracking from "./pages/PriceTracking";
import BankStatement from "./pages/BankStatement";
import Search from "./pages/Search";
import API from "./utils/API";

import "./App.css";

function App() {
  const isAuthenticated = API.isAuth();

  return (
    <ToastProvider>
      <Router>
        {isAuthenticated && <SideNav />}
        <div className={isAuthenticated ? "appSideContent" : ""}>
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
              <Route
                path="/monthly-expense-graph"
                element={<MonthlyExpenseGraph />}
              />
              <Route path="/tracking" element={<PriceTracking />} />
              <Route path="/search" element={<Search />} />
              <Route path="/bank-statement" element={<BankStatement />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
