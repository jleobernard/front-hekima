import React from 'react';
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import Notes from './pages/notes/notes';
import './App.css';
import Login from "./pages/login/login";

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
            <Route path="/login">
              <Login />
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
