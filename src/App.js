import React, {useEffect} from 'react';
import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
import Notes from './pages/notes/notes';
import './App.css';
import Login from "./pages/login/login";
import NoteView from "./pages/note-view/note-view";
import {get} from "./utils/http";
import QuizzInit from "./pages/quizz/quizz-init";
import QuizzRun from "./pages/quizz/quizz-run";
import Toaster from "./components/Toaster";
import { createClient } from "@supabase/supabase-js";


function App() {
  /*useEffect(() => {
    setInterval(() => get("/api/user").catch(err => console.error(err)), 60 * 1000)
  }, [])*/
  return (
    <div className="root">
      <div className="app-wrapper">
      <Router>
          <Routes>
            <Route path="/notes/:uri" element={<NoteView />}>
            </Route>
            <Route exact path="/notes" element={<Notes />}>
            </Route>
            <Route exact path="/quizz/init" element={<QuizzInit />}>
            </Route>
            <Route exact path="/quizz/run" element={<QuizzRun />}>
            </Route>
            <Route exact path="/" element={<Navigate to="/notes" />}>
            </Route>
            <Route path="/login" element={<Login />}>
            </Route>
          </Routes>
      </Router>
      <Toaster />
      </div>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
    </div>
  );
}

export default App;
