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
import LanguageTypeSelector from "../../components/language-type-selector/language-type-selector";

const QuizzRun = () => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState([])
  const [originalNote, setOriginalNote] = useState(null)
  const [note, setNote] = useState(null)
  const [position, setPosition] = useState(-1)
  const [rating, setRating] = useState(0)
  const [noteState, setNoteState] = useState("")
  const history = useNavigate()
  const [types, setTypes] = useState(['local', 'foreign'])
  useEffect(() => {
    const rawQuizzQuery = localStorage.getItem("quizz")
    if(rawQuizzQuery) {
      const notes = JSON.parse(rawQuizzQuery)
      if(notes && notes.length > 0) {
        setNotes(notes)
        setPosition(0)
        const languageTypes = localStorage.getItem("languageTypes");
        if(languageTypes) {
          setTypes(JSON.parse(languageTypes))
        }
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
        setOriginalNote(note)
        setRating(0)
        setNoteState("question")
      })
      .catch(() => notifyError("Erreur lors du chargement de la note " + position))
      .finally(() => setLoading(false))
    }
  }, [notes, position])

  useEffect(() => {
    if(originalNote && types) {
      setNote(applyQuizzMask(originalNote))
    }
  }, [originalNote, types])

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

  function applyQuizzMask(note) {
    const workingNote = deepCopy(note)
    if(types.indexOf('foreign') < 0) {
      workingNote.valueJson = replaceKoreanCharacters(workingNote.valueJson)
    }
    if(types.indexOf('local') < 0) {
      workingNote.valueJson = replaceNonKoreanCharacters(workingNote.valueJson)
    }
    return workingNote
  }
  function replaceKoreanCharacters(json) {
    const koreanRegex = /[\uAC00-\uD7A3]/g; // Matches all Hangul syllables (Korean characters)
  
    function traverse(node) {
      if (node.type === 'text' && node.text) {
        // Replace Korean characters in the text content
        node.text = node.text.replace(koreanRegex, '*');
      }
  
      // Recursively traverse child nodes if any
      if (node.content) {
        node.content.forEach(traverse);
      }
    }

    traverse(json);
    return json;
  }
  
  function replaceNonKoreanCharacters(json) {
    const nonKoreanRegex = /[^\uAC00-\uD7A3]/g; // Matches all characters except Hangul syllables (Korean characters)
  
    function traverse(node) {
      if (node.type === 'text' && node.text) {
        // Replace non-Korean characters in the text content
        node.text = node.text.replace(nonKoreanRegex, '*');
      }
  
      // Recursively traverse child nodes if any
      if (node.content) {
        node.content.forEach(traverse);
      }
    }
  
    traverse(json);
    return json;
  }

  async function refreshNoteContent() {
    setLoading(true)
    await refreshNote(note)
    setLoading(false)
  }

  function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  return (
    <div className="app quizz">
      <Header title="Quizz" goBack={true} withSearch={false}/>
      <LinearProgress variant="determinate" value={getProgress()} />
      <div className={"quizz-note " + noteState}>
        {note && note.uri ? <NoteDetail note={noteState === 'question' ? note : originalNote} /> : <></>}
      </div>
      <div className="quizz-rating">
        {noteState === "question" ?
          <div className='button-list'>
            <LanguageTypeSelector type={types} onTypeChanged={setTypes}/>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="reveal note"
              onClick={() => setNoteState("")}
              size="large">
              <Visibility />
            </IconButton>
            </div>
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
            className="refresh-button"
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

