import Header from "../../components/header/Header";
import LoadingMask from "../../components/loading-mask/loading-mask";
import Toaster from "../../components/Toaster";
import React, {useEffect, useState} from "react";
import {TagsSelector} from "../../components/filter/tags-selector";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import {SourcesSelector} from "../../components/filter/sources-selector";
import {FormControl, TextField} from "@mui/material";
import {useNavigate} from "react-router-dom";
import { countNotes, generateQuizz } from "services/note-services";
import { notifyError } from "store/features/notificationsSlice";
import LanguageTypeSelector from "../../components/language-type-selector/language-type-selector";
import './quizz-init.scss'

const QuizzInit = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState({msg:"", sev: "info"})
  const [tags, setTags] = useState([])
  const [notTags, setNotTags] = useState([])
  const [sources, setSources] = useState({})
  const [maxCards, setMaxCards] = useState(10)
  const [count, setCount] = useState(-1)
  const [types, setTypes] = useState(['local', 'foreign'])
  const history = useNavigate()

  useEffect(() => {
    countNotes({
      tags: (tags || []).map(t => t.uri),
      notTags: (notTags || []).map(t => t.uri),
      source: sources ? sources.uri : null
    })
    .then(count => setCount(count))
    .catch(_ => setCount(-1))
  }, [tags, notTags, sources])

  function startQuizz() {
    if(!loading) {
      setLoading(true)
      setError({msg:"", sev: "info"})
      generateQuizz({
        tags: (tags || []).map(t => t.uri),
        notTags: (notTags || []).map(t => t.uri),
        source: sources ? sources.uri : null,
        count: maxCards})
      .then(notes => {
        if(notes && notes.length > 0) {
          localStorage.setItem("quizz", JSON.stringify(notes))
          localStorage.setItem("languageTypes", JSON.stringify(types))
          history("/quizz/run")
        } else {
          notifyError("Le quizz est vide")
        }
      })
      .catch(err => {
        console.error(err)
        notifyError("Erreur lors de la génération du quizz")
      })
      .finally(() => setLoading(false))
    }
  }

  return (
    <div className="app">
      <Header title="Quizz" goBack={true} withSearch={false}/>
      <form onSubmit={startQuizz} className="form">
        <TagsSelector allowCreation={false} onChange={setTags}/>
        <TagsSelector allowCreation={false} onChange={setNotTags} title="Tags exclus"/>
        <SourcesSelector allowCreation={false} onChange={setSources} />
        <FormControl>
          <TextField id='maxCards' label="Nombre maximums de cartes" value={maxCards} type="number"
                     min="-1" onChange={e => setMaxCards(e.target.valueAsNumber)} />
        </FormControl>
        <div className="language-selector-embedding">
          <LanguageTypeSelector type={types} onTypeChanged={setTypes}/>
        </div>
        <Button onClick={_ => startQuizz()} color="primary">
          Démarrer ({maxCards} / {count}){loading ? <CircularProgress /> : ''}
        </Button>
      </form>
      <LoadingMask loading={loading}/>
      <Toaster error={error.msg} severity={error.sev}/>
    </div>
  )
}

export default QuizzInit;
