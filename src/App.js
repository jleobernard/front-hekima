import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import './App.css';
import Toaster from "./components/Toaster";
import Login from "./pages/login/login";
import NoteView from "./pages/note-view/note-view";
import Notes from './pages/notes/notes';
import QuizzInit from "./pages/quizz/quizz-init";
import QuizzRun from "./pages/quizz/quizz-run";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
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
    </div></ThemeProvider>
  );
}

export default App;
