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

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/signin" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      <Route path="/" element={<PrivateRoute><ExercisesList /></PrivateRoute>} />
      <Route path="/edit/:id" element={<PrivateRoute><EditExercise /></PrivateRoute>} />
      <Route path="/create" element={<PrivateRoute><CreateExercise /></PrivateRoute>} />
      <Route path="/workout" element={<PrivateRoute><CreateWorkout /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
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