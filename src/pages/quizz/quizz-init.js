import {withRouter} from "react-router-dom";
import Header from "../../components/header/Header";
import LoadingMask from "../../components/loading-mask/loading-mask";
import Toaster from "../../components/Toaster";
import React, {useState} from "react";
import {TagsSelector} from "../../components/filter/tags-selector";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import {SourcesSelector} from "../../components/filter/sources-selector";

const QuizzInit = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState({msg:"", sev: "info"})
  const [tags, setTags] = useState([])
  const [sources, setSources] = useState([])

  function startQuizz() {
    console.log(tags, sources)
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
