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

import "./App.css";

function App() {
  return (
    <ToastProvider>
      <SideNav />
      <div className="appSideContent">
        <Router>
          <Routes>
            <Route exact path={"/signin"} element={<Signin />} />
            <Route
              exact
              path={"/"}
              element={<Dashboard type={EXPENSE_TYPE.DASHBOARD} />}
            />
            <Route
              exact
              path={"/dashboard"}
              element={<Dashboard type={EXPENSE_TYPE.DASHBOARD} />}
            />
            <Route
              exact
              path={"/income"}
              element={<Dashboard type={EXPENSE_TYPE.INCOME} />}
            />
            <Route
              exact
              path={"/expense"}
              element={<Dashboard type={EXPENSE_TYPE.EXPENSE} />}
            />
            <Route
              exact
              path={"/debt"}
              element={<Dashboard type={EXPENSE_TYPE.DEBT} />}
            />
            <Route
              exact
              path={"/debt/:name"}
              element={<Dashboard type={EXPENSE_TYPE.DEBT} />}
            />
            <Route
              exact
              path={"/investment"}
              element={<Dashboard type={EXPENSE_TYPE.INVESTMENT} />}
            />
            <Route
              path="/monthly-expense-graph"
              element={<MonthlyExpenseGraph />}
            />
          </Routes>
        </Router>
      </div>
    </ToastProvider>
  );
}

export default App;
