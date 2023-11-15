import React from 'react';
import './App.css';
import CalendarSummary from './calendar-summary';

function App() {
  return (
    <div className="App" style={{ maxWidth: '1000px', margin: 'auto', padding: "0 1rem" }}>
      <CalendarSummary />
    </div>
  );
}

export default App;
