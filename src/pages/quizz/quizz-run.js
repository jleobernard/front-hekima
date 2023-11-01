import React, {useEffect, useState} from "react";
import Header from "../../components/header/Header";
import LoadingMask from "../../components/loading-mask/loading-mask";
import {NoteDetail} from "../../components/note/note-detail";
import { Rating } from '@mui/material';
import {CircularProgress, IconButton, LinearProgress} from "@mui/material";
import './quizz-run.scss'
import {MAX_GRADE_QUIZZ} from "../../utils/const";
import {ArrowForward, Refresh} from "@mui/icons-material";
import {Visibility} from "@mui/icons-material";
import {findNoteByUri, getNumberOfTitles, refreshNote} from "../../services/note-services";
import {useNavigate} from "react-router-dom";
import { notifyError, notifyInfo } from "store/features/notificationsSlice";

const QuizzRun = () => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState([])
  const [note, setNote] = useState(null)
  const [position, setPosition] = useState(-1)
  const [rating, setRating] = useState(0)
  const [questionType, setQuestionType] = useState("")
  const [noteState, setNoteState] = useState("")
  const history = useNavigate()

  useEffect(() => {
    const rawQuizzQuery = localStorage.getItem("quizz")
    if(rawQuizzQuery) {
      const notes = JSON.parse(rawQuizzQuery)
      if(notes && notes.length > 0) {
        setNotes(notes)
        setPosition(0)
      } else {
        history('/quizz/init')
      }
    } else {
      history('/quizz/init')
    }
  }, [])

  useEffect(() => {
    if(notes && position >= 0 && notes.length > position) {
      setLoading(true)
      findNoteByUri(notes[position])
      .then(note => {
        setNote(note)
        setRating(0)
        const nbTitles = getNumberOfTitles(note)
        if(nbTitles > 0) {
          setQuestionType(Math.random() >= 0.5 ? "ask-title" : "ask-value")
          setNoteState("question")
        } else {
          setQuestionType("")
        }
      })
      .catch(() => notifyError("Erreur lors du chargement de la note " + position))
      .finally(() => setLoading(false))
    }
  }, [notes, position])

  function rate(rating) {
    //if(!saving) {
      //setSaving(true)
      //post("/api/quizz:answer", {noteUri: note.uri, score: rating})
      //.then(() => {
        if(position >= notes.length - 1) {
          notifyInfo("Quizz terminé")
          setTimeout(() => history('/quizz/init'), 1000)
        } else {
          setPosition(position + 1)
        }
     // })
     // .finally(() => setSaving(false))
    //}
  }

  function getProgress() {
    return (position + 1) * 100 / (((notes|| []).length) || 1)
  }

  async function refreshNoteContent() {
    setLoading(true)
    await refreshNote(note)
    setLoading(false)
  }

  return (
    <div className="app quizz">
      <Header title="Quizz" goBack={true} withSearch={false}/>
      <LinearProgress variant="determinate" value={getProgress()} />
      <div className={"quizz-note " + questionType + " " + noteState}>
        {note && note.uri ? <NoteDetail note={note} /> : <></>}
      </div>
      <div className="quizz-rating">
        {noteState === "question" ?
          <IconButton
            edge="end"
            color="inherit"
            aria-label="reveal note"
            onClick={() => setNoteState("")}
            size="large">
            <Visibility />
          </IconButton>
          :
        <>
          <Rating
            name="simple-controlled"
            value={rating}
            onChange={(_, newValue) => {
              rate(newValue);
            }}
            size="large"
            max={MAX_GRADE_QUIZZ}
          />
          <IconButton
            edge="end"
            className=""
            color="inherit"
            aria-label="refresh note"
            onClick={() => refreshNoteContent()}
            size="large">
            <Refresh />
          </IconButton>
          <IconButton
            edge="end"
            className="pass-button"
            color="inherit"
            aria-label="pass note"
            onClick={() => setPosition(position + 1)}
            size="large">
            <ArrowForward />
          </IconButton>
          {saving ? <CircularProgress className="saving" /> : <></>}
          </>
        }

      </div>
      <LoadingMask loading={loading}/>
    </div>
  );
}
export default QuizzRun;
