import {withRouter} from "react-router-dom";
import Header from "../../components/header/Header";
import LoadingMask from "../../components/loading-mask/loading-mask";
import Toaster from "../../components/Toaster";
import React, {useState} from "react";
import {TagsSelector} from "../../components/filter/tags-selector";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import {SourcesSelector} from "../../components/filter/sources-selector";
import {get} from "../../utils/http";
import {useHistory} from "react-router-dom/cjs/react-router-dom";


const QuizzInit = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState({msg:"", sev: "info"})
  const [tags, setTags] = useState([])
  const [sources, setSources] = useState([])
  const history = useHistory()

  function startQuizz() {
    if(!loading) {
      setLoading(true)
      setError({msg:"", sev: "info"})
      get("/api/quizz:generate", {tags: (tags || []).map(t => t.uri), sources: (sources || []).map(s => s.uri)})
      .then(notes => {
        localStorage.setItem("quizz", JSON.stringify(notes))
        history.push("/quizz/run")
      })
      .catch(err => setError({msg: "Erreur lors de la génération du quizz", sev: "error"}))
      .finally(() => setLoading(false))
    }
  }

  return (
    <div className="app">
      <Header title="Quizz" goBack={true} withSearch={false}/>
      <form onSubmit={startQuizz} className="form">
        <TagsSelector allowCreation={false} onChange={setTags}/>
        <SourcesSelector allowCreation={false} onChange={setSources} />
        <Button onClick={_ => startQuizz()} color="primary">
          Démarrer {loading ? <CircularProgress /> : ''}
        </Button>
      </form>
      <LoadingMask loading={loading}/>
      <Toaster error={error.msg} severity={error.sev}/>
    </div>
  )
}

export default withRouter(QuizzInit);
