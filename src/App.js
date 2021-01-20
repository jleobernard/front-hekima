import React from 'react';
import {Route, BrowserRouter as Router, Switch, Redirect} from "react-router-dom";
import Notes from './pages/notes/notes';
import './App.css';

function App() {
  return (
    <div className="root">
      <Router>
        <div className="app-wrapper">
          <Switch>
            <Route path="/notes">
              <Notes />
            </Route>
            <Route exact path="/">
              <Redirect to="/notes" />
            </Route>
          </Switch>
        </div>
      </Router>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
    </div>
  );
}

export default App;
