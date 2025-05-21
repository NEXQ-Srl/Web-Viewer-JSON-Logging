import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import Layout from "../components/layout/Layout";
import PageLoader from "../components/common/PageLoader";

const Dashboard = lazy(() => import("../pages/Dashboard"));
const Login = lazy(() => import("../pages/Login"));
const NotFound = lazy(() => import("../components/pages/NotFound"));

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
