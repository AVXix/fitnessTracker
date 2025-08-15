import React from 'react';
import ExercisesList from './exercises-list.component';

// Home page for workouts overview
export default function WorkoutsPage() {
  return (
    <div>
      <h2>Current Workouts</h2>
      <ExercisesList />
    </div>
  );
}
