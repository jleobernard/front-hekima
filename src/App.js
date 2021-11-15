import React, {useEffect} from 'react';
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import Notes from './pages/notes/notes';
import './App.css';
import Login from "./pages/login/login";
import NoteView from "./pages/note-view/note-view";
import {get} from "./utils/http";
import QuizzInit from "./pages/quizz/quizz-init";
import QuizzRun from "./pages/quizz/quizz-run";

function App() {
  useEffect(() => {
    setInterval(() => get("/api/user", false), 60 * 1000)
  }, [])
  return (
    <div className="root">
      <Router>
        <div className="app-wrapper">
          <Switch>
            <Route path="/notes/:uri">
              <NoteView />
            </Route>
            <Route exact path="/notes">
              <Notes />
            </Route>
            <Route exact path="/quizz/init">
              <QuizzInit />
            </Route>
            <Route exact path="/quizz/run">
              <QuizzRun />
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
