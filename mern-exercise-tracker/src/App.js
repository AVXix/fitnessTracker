// // filepath: mern-exercise-tracker/src/App.js
// import SignupForm from './SignupForm';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <SignupForm />
//     </div>
//   );
// }

// export default App;

import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/navbar.component";
import ExercisesList from "./components/exercises-list.component";
import EditExercise from "./components/edit-exercise.component";
import CreateExercise from "./components/create-exercise.component";
import CreateWorkout from "./components/create-workout.component";
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import { AuthProvider, useAuth } from './context/AuthContext';
import WorkoutsPage from './components/WorkoutsPage';
import Goals from './components/Goals';
import Calories from './components/Calories';
import Analytics from './components/Analytics';
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

      <Route path="/" element={<Navigate to="/workouts" replace />} />
      <Route path="/workouts" element={<PrivateRoute><WorkoutsPage /></PrivateRoute>} />
      <Route path="/edit/:id" element={<PrivateRoute><EditExercise /></PrivateRoute>} />
      <Route path="/create" element={<PrivateRoute><CreateExercise /></PrivateRoute>} />
      <Route path="/workout" element={<PrivateRoute><CreateWorkout /></PrivateRoute>} />

      <Route path="/goals" element={<PrivateRoute><Goals /></PrivateRoute>} />
      <Route path="/calories" element={<PrivateRoute><Calories /></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
      <Route path="/store" element={<PrivateRoute><Store /></PrivateRoute>} />
      <Route path="/trainer" element={<PrivateRoute><Trainer /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/workouts" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="container">
          <Navbar />
          <br/>
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;