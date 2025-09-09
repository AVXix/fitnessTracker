import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/navbar.component";
import ExercisesList from "./components/exercises-list.component";
import EditExercise from "./components/edit-exercise.component";
import WorkoutBuilder from "./components/WorkoutBuilder";
import Home from "./components/Home";
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import { AuthProvider, useAuth } from './context/AuthContext';
import Goals from './components/Goals';
import Calories from './components/Calories';
import Weight from './components/Weight';
import Analytics from './components/Analytics';
import Forum from './components/Forum';
import Store from './components/Store';
import Trainer from './components/Trainer';
import Profile from './components/Profile';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/signin" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/workouts" element={<PrivateRoute><WorkoutBuilder /></PrivateRoute>} />
      <Route path="/edit/:id" element={<PrivateRoute><EditExercise /></PrivateRoute>} />

      <Route path="/goals" element={<PrivateRoute><Goals /></PrivateRoute>} />
      <Route path="/calories" element={<PrivateRoute><Calories /></PrivateRoute>} />
      <Route path="/weight" element={<PrivateRoute><Weight /></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
      <Route path="/forum" element={<PrivateRoute><Forum /></PrivateRoute>} />
      <Route path="/store" element={<PrivateRoute><Store /></PrivateRoute>} />
      <Route path="/trainer" element={<PrivateRoute><Trainer /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="container my-4">
          <AppRoutes />
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;