import {withRouter} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {useHistory} from "react-router-dom/cjs/react-router-dom";
import {get, post} from "../../utils/http";
import Header from "../../components/header/Header";
import LoadingMask from "../../components/loading-mask/loading-mask";
import Toaster from "../../components/Toaster";
import {NoteDetail} from "../../components/note/note-detail";
import {Rating} from "@material-ui/lab";
import {CircularProgress} from "@material-ui/core";
import './quizz-run.scss'
import {MAX_GRADE_QUIZZ} from "../../utils/const";

const QuizzRun = () => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState({msg:"", sev: "info"})
  const [notes, setNotes] = useState([])
  const [note, setNote] = useState(null)
  const [position, setPosition] = useState(-1)
  const [rating, setRating] = useState(0)
  const history = useHistory()

  useEffect(() => {
    const rawQuizzQuery = localStorage.getItem("quizz")
    if(rawQuizzQuery) {
      const notes = JSON.parse(rawQuizzQuery)
      if(notes && notes.length > 0) {
        setNotes(notes)
        setPosition(0)
      } else {
        history.push('/quizz/init')
      }
    } else {
      history.push('/quizz/init')
    }
  }, [])

  useEffect(() => {
    if(notes && position >= 0 && notes.length > position) {
      setLoading(true)
      get(`/api/notes/${notes[position].uri}`)
      .then(note => {
        setNote(note)
        setRating(0)
      })
      .catch(() => setError({msg: "Erreur lors du chargement de la note " + position, sev: "error"}))
      .finally(() => setLoading(false))
    }
  }, [notes, position])

  function rate(rating) {
    if(!saving) {
      setSaving(true)
      post("/api/quizz:answer", {noteUri: note.uri, score: rating})
      .then(() => {
        if(position >= notes.length - 1) {
          setError({msg: "Quizz terminé", sev: "info"})
          setTimeout(() => history.push('/quizz/init'), 3000)
        } else {
          setPosition(position + 1)
        }
      })
      .finally(() => setSaving(false))
    }
  }

  return (
    <div className="app">
      <Header title="Quizz" goBack={true} withSearch={false}/>
      {note && note.uri ? <NoteDetail note={note} /> : <></>}
      <div className="quizz-rating">
        <Rating
          name="simple-controlled"
          value={rating}
          onChange={(_, newValue) => {
            rate(newValue);
          }}
          size="large"
          max={MAX_GRADE_QUIZZ}
        />
        {saving ? <CircularProgress className="saving" /> : <></>}
      </div>
      <LoadingMask loading={loading}/>
      <Toaster error={error.msg} severity={error.sev}/>
    </div>
  )
}
export default withRouter(QuizzRun);
