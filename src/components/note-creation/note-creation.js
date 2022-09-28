import * as React from "react";
import {useEffect, useState} from "react";
import { useDispatch } from 'react-redux';
import {post, upload, uploadFilesWithRequest} from "../../utils/http";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import FormControl from "@material-ui/core/FormControl";
import "../../styles/forms.scss";
import * as lodash from 'lodash';
import IconButton from "@material-ui/core/IconButton";
import "./note-creation.scss"
import CircularProgress from "@material-ui/core/CircularProgress";
import NoteFilter from "../filter/filter";
import {ButtonGroup, Input, InputAdornment, InputLabel, Paper} from "@material-ui/core";
import {Camera, Visibility, VisibilityOff} from "@material-ui/icons";
import FiberManualRecordRoundedIcon from '@material-ui/icons/FiberManualRecordRounded';
import gfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";
import {NoteFilesEdit} from "../note/note-files/note-files-edit";
import "../../styles/science.scss";
import VideoList from "../medias/video-list";
import {getKey} from "../../utils/keys";
import LoadingMask from "../loading-mask/loading-mask";
import SubsSearcher from "../subs/subs-searcher";
import { notifyError, notifyWarn } from '../../store/features/notificationsSlice';

const NoteCreation = ({note, creating, onDone}) => {

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [noteUri, setNoteUri] = useState(note && note.uri ? note.uri : null)
  const [selectedSubs, setSelectedSubs] = useState([])
  const [valeur, setValeur] = useState("")
  const [source, setSource] = useState({})
  const [tags, setTags] = useState([])
  const [filesChanges, setFilesChanges] = useState(false)
  const [toolbar, setToolbar] = useState('')
  const [parsedResult, setParsedResult] = useState(null)
  const colors = ['red', 'green', 'purple', 'gray'];
  const refInputFile = React.createRef()
  const refValeur = React.createRef()
  const [displayMode, setDisplayMode] = useState(false);
  const dispatch = useDispatch()

  const _noteUri = (note || {}).uri
  useEffect(() => {
      const _note = (note || {})
      setNoteUri(_note.uri)
      setValeur(_note.valeur)
      setSource({...(_note.source || {}) })
      setTags([...(_note.tags || [])])
      setSelectedSubs((_note.subs || []).map(s => {
        return {...s, selected: true, key: getKey("subs") }
      }))
  }, [_noteUri]);

  function setSubsChanged(sub, fromSelectedList) {
    const _selectedSubs = [...selectedSubs]
    if(fromSelectedList) {
      let index = lodash.findIndex(_selectedSubs, {key: sub.key})
      if (sub.selected) {
        _selectedSubs[index] = sub
      } else {
        _selectedSubs.splice(index, 1)
      }
    } else {
      if (sub.selected) {
        _selectedSubs.unshift(sub)
      }
    }
    setSelectedSubs(_selectedSubs)
  }

  function hasImageChanges(){
    return Object.keys(filesChanges).length > 0
  }

  function getUploadFilesRequest(savedNote) {
    const fileChangesIndices = Object.keys(filesChanges).map(k => parseInt(k) + 1)
    const lengthArray = Math.max(savedNote.files.length, Math.max(...fileChangesIndices));
    const request = new Array(lengthArray);
    const files = new Array(lengthArray);
    for(let i = 0; i < lengthArray; i++) {
      let action;
      files[i] = null
      if(i in filesChanges) {
        if(filesChanges[i]) {
          action = "UPSERT"
          files[i] = filesChanges[i]
        } else {
          action = "DELETE"
        }
      } else {
        action = "NOTHING"
      }
      request[i] = action
    }
    return {request, files};
  }

  function handleSubmit(closeAfterSaving) {
    if(!saving) {
      setSaving(true)
      const request = {
        uri: noteUri,
        valeur: valeur,
        tags: lodash.map(tags, t => t.uri),
        source: source ? source.uri : null,
        subs: (selectedSubs || []).map(s => ({name: s.name, from: s.from, to: s.to}))
      };
      post('/api/notes', request).then(saved => {
        if(hasImageChanges()) {
          const metadata = getUploadFilesRequest(saved)
          uploadFilesWithRequest('/api/notes/'+saved.uri+'/files', metadata.request, metadata.files)
          .then(response => {
            handleClose({...saved, files: response.files}, closeAfterSaving);
          })
          .catch(err => dispatch(notifyError("Impossible d'enregistrer le fichier : " + err)))
          .finally(() => setSaving(false))
        } else {
          setSaving(false)
          handleClose(saved, closeAfterSaving);
        }
      }).catch(err => {
        setSaving(false)
        dispatch(notifyError("Impossible de sauvegarder : " + err))
      })
    }
  }

  function onFilterChanged(event) {
    setSource(event.source)
    setTags(event.tags)
  }

  function valueChanged(event) {
    setValeur(event.target.value)
  }
  function parsedResultChanged(event) {
    setParsedResult(event.target.value)
  }

  function addParsedResult() {
    setValeur((valeur || '') + '\n' + parsedResult)
    setParsedResult(null)
  }

  function handleClose(response, closeAfterSaving) {
    if(response && response.uri && !noteUri) {
      setNoteUri(response.uri)
    }
    if(closeAfterSaving) {
      onDone(response)
    } else {
      setFilesChanges({})
    }
  }

  function fileChanged(idxOfChangedFile, imageFile) {
    const copy = {...filesChanges}
    copy[idxOfChangedFile] = imageFile
    setFilesChanges(copy)
  }

  function parsePictureChanged() {
    const file = document.getElementById('picture');
    if (file) {
      setParsing(true)
      const imageFile = file.files[0]
      upload(`/api/notes:parse`, imageFile, false)
      .then(response => setParsedResult(response.lines.join('\n')))
      .catch(err => {
        notifyError("Erreur lors de l'analyse de la photo", err)
      }).finally(() => setParsing(false))
    } else {
      notifyWarn("Sélectionnez un fichier");
    }
  }

  function getCurrentSelection() {
    const element = document.getElementById("valeur-ne")
    const start = element.selectionStart || 0
    const end = element.selectionEnd || 0
    return {
      start,
      end,
      selecting: start !== end
    }
  }

  function addColorTag(color) {
    addMD(`<span style="color:${color}">`, "</span>")
  }

  function addSingle(entry) {
    const _valeur = (valeur || '')
    const selection = getCurrentSelection()
    const newValeur = _valeur.substr(0, selection.start) +
      entry
      + _valeur.substr(selection.start)

    setValeur(newValeur)
    setTimeout(() => focusAt(selection, entry), 500)
  }

  function addMD(md, mdEnd) {
    const _mdEnd = mdEnd || ''
    const _valeur = (valeur || '')
    const selection = getCurrentSelection()
    const interText = selection.selecting ? valeur.substr(selection.start, selection.end - selection.start) : 'ici'
    const newValeur = _valeur.substr(0, selection.start) + md
     + interText
    + _mdEnd + _valeur.substr(selection.end, _valeur.length - selection.end)

    setValeur(newValeur)
    setTimeout(() => focusAfterFormatting(selection, md), 500)
  }

  function focusAfterFormatting(initialSelection, md) {
    const element = document.getElementById("valeur-ne")
    element.focus()
    element.selectionStart = initialSelection.start + md.length
    element.selectionEnd = initialSelection.selecting ?
      initialSelection.end + md.length :
      initialSelection.end + md.length + 3
  }

  function focusAt(initialSelection, md) {
    const element = document.getElementById("valeur-ne")
    element.focus()
    element.selectionStart = initialSelection.start + md.length
    element.selectionEnd = element.selectionStart
  }

  function doSetToolbar(tb) {
    if (toolbar === tb) {
      setToolbar('')
    } else {
      setToolbar(tb)
    }
  }

  function renderColours() {
    return (
      <ButtonGroup className="button-group centered with-margin-top">
        {colors.map(color =>
          <IconButton style={{color}} aria-label={color} key={color} component="span" onClick={() => addColorTag(color)}>
            <FiberManualRecordRoundedIcon />
          </IconButton>
        )}
      </ButtonGroup>
    )
  }

  function renderTitles() {
    return (
      <ButtonGroup className="button-group centered">
        <Button className="block" onClick={() => addMD('# ', ' #')}>Titre1</Button>
        <Button className="block" onClick={() => addMD('## ', ' ##')}>Titre2</Button>
        <Button className="block" onClick={() => addMD('### ', ' ###')}>Titre3</Button>
        <Button className="block" onClick={() => addMD('#### ', ' ####')}>Titre4</Button>
      </ButtonGroup>
    )
  }

  function renderText() {
    return (
      <ButtonGroup className="button-group centered">
        <Button className="block" onClick={() => addMD('<span style="font-size:2em">','</span>')}>Important</Button>
        <Button className="block" onClick={() => addMD('**','**')}>Gras</Button>
        <Button className="block" onClick={() => addMD('*', '*')}><i>Italique</i></Button>
        <Button className="block" onClick={() => addMD('<del>', '</del>')}><del>Barré</del></Button>
        <Button className="block" onClick={() => addMD('<ins>', '</ins>')}><ins>Souligné</ins></Button>
      </ButtonGroup>
    )
  }

  function renderMaths() {
    return (
      <ButtonGroup className="button-group centered">
        <Button className="block" onClick={() => addMD('<sub>','</sub>')}>I&nbsp;<sub>bas</sub></Button>
        <Button className="block" onClick={() => addMD('<sup>','</sup>')}>Is&nbsp;<sup>haut</sup></Button>
        <Button className="block" onClick={() => addSingle('∂')}>∂</Button>
        <Button className="block" onClick={() => addSingle('&nabla;')}>&nabla;</Button>
        <Button className="block" onClick={() => addSingle('&forall;')}>&forall;</Button>
        <Button className="block" onClick={() => addSingle('&isin;')}>&isin;</Button>
        <Button className="block" onClick={() => addSingle('&sube;')}>&sube;</Button>
        <Button className="block" onClick={() => addSingle('∃')}>∃</Button>
        <Button className="block" onClick={() => addSingle('&int;')}>&int;</Button>
        <Button className="block" onClick={() => addSingle('⋂')}>⋂</Button>
        <Button className="block" onClick={() => addSingle('⋃')}>⋃</Button>
        <Button className="block" onClick={() => addSingle('&xrarr;')}>&rarr;</Button>
        <Button className="block" onClick={() => addSingle('⇔')}>⇔</Button>
        <Button className="block" onClick={() => addSingle('⇒')}>⇒</Button>
        <Button className="block" onClick={() => addSingle('⟼')}>⟼</Button>
        <Button className="block" onClick={() => addSingle('ℝ')}>ℝ</Button>
        <Button className="block" onClick={() => addSingle('<span style="font-size: 2em">∘</span>')}><span style={{fontSize: "2em"}}>∘</span></Button>
        <Button className="block scientific-notation" onClick={() => addMD('<fraction><numer>','</numer><denom></denom></fraction>')}><fraction><numer>a</numer>b</fraction></Button>
        <Button className="block scientific-notation" onClick={() => addMD('<superposed><up>','</up><down></down></superposed>')}><superposed><up>a</up><down>b</down></superposed></Button>
        <Button className="block scientific-notation" onClick={() => addMD('<upperposed><up>','</up><down></down></upperposed>')}><upperposed><up>a</up><down>b</down></upperposed></Button>
      </ButtonGroup>
    )
  }

  function renderGreek() {
    const lower = ['α', 'β', 'γ', 'δ', 'ε', 'ζ','η','θ','λ','μ','ξ','π','ρ','σ','φ','ϕ','ψ','ω']
    const upper = ['Γ','Δ','Θ','Λ','Ξ','Π','Σ','Φ','Ψ','Ω']
    return (
      <div>
        <ButtonGroup className="button-group centered" key="lowercase">
          {lower.map(letter =>
            <IconButton key={"greek-" + letter} component="span" onClick={() => addSingle(letter)}>
              <span>{letter}</span>
            </IconButton>
          )}
        </ButtonGroup>
        <ButtonGroup className="button-group centered" key="uppercase">
          {upper.map(letter =>
            <IconButton key={"greek-" + letter} component="span" onClick={() => addSingle(letter)}>
              <span>{letter}</span>
            </IconButton>
          )}
        </ButtonGroup>
      </div>
    )
  }

  const filter = {
    source : source,
    tags: tags || []
  };
  return (
    <>
      <Dialog open={creating || !!note} key="main-dialog"
              onClose={() => handleClose(null, true)}
              fullScreen={true}
              aria-labelledby="creation-dialog-title">
        <DialogTitle id="creation-dialog-title">{noteUri ? 'Nouvelle note' : 'Modification'}</DialogTitle>
        <DialogContent>
          <form onSubmit={() => handleSubmit(false)} className="form no-padding">
            <NoteFilesEdit note={note} onChange={fileChanged}/>
            <FormControl>
              <InputLabel htmlFor="valeur-ne">Note</InputLabel>
              {displayMode ?
                <Paper elevation={3} className="with-padding with-margin-top">
                  <ReactMarkdown className={"scientific-notation"} remarkPlugins={[gfm]} rehypePlugins={[rehypeRaw]} children={valeur}/>
                </Paper> :
                <Input
                  id="valeur-ne"
                  required autoFocus={true}
                  value={valeur}
                  ref={refValeur}
                  multiline rows={3} rowsMax={25} variant="outlined"
                  onChange={valueChanged}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="analyse image"
                        onClick={() => refInputFile.current.click()}
                      >
                        {parsing ? <CircularProgress/> : <Camera/>}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              }

              {displayMode ?
                <ButtonGroup className="button-group centered with-margin-top">
                  <IconButton className="block" onClick={() => setDisplayMode(false)} aria-label="Édition" component="span">
                    <VisibilityOff />
                  </IconButton>
                </ButtonGroup>
                :
                <ButtonGroup className="button-group centered with-margin-top">
                  <IconButton className="block" onClick={() => setDisplayMode(true)} aria-label="Aperçu" component="span">
                    <Visibility />
                  </IconButton>
                  <Button className="block" onClick={() => doSetToolbar("titles")}>Titres</Button>
                  <Button className="block" onClick={() => doSetToolbar('colours')}>Couleurs</Button>
                  <Button className="block" onClick={() => doSetToolbar('text')}>Texte</Button>
                  <Button className="block" onClick={() => doSetToolbar('maths')}>Maths</Button>
                  <Button className="block" onClick={() => doSetToolbar('greek')}>Grec</Button>
                </ButtonGroup>
              }

              <div className="with-margin-top with-margin-bottom">
                {toolbar === 'colours' ? renderColours() : <></>}
                {toolbar === 'titles' ? renderTitles() : <></>}
                {toolbar === 'text' ? renderText() : <></>}
                {toolbar === 'maths' ? renderMaths() : <></>}
                {toolbar === 'greek' ? renderGreek() : <></>}
              </div>
              <input type="file" id="picture" accept="image/*" onChange={parsePictureChanged} hidden={true}
                     ref={refInputFile}/>

            </FormControl>
            <NoteFilter filter={filter}
                        onFilterChanged={onFilterChanged}
                        allowCreation={true}
                        withKeyword={false}
                        withExcludedTags={false}/>

            <VideoList className="with-margin-top" key={"selected-subs"} title={""} videos={selectedSubs}
                       editable={true} onChange={(sub) => setSubsChanged(sub, true)} withTexts={false}/>
            <SubsSearcher className={"with-margin-top with-margin-bottom"}
                          onVideoSelected={sub => setSubsChanged(sub, false)}/>
          </form>
        </DialogContent>
        <DialogActions>
          <ButtonGroup className="button-group centered">
            <Button onClick={() => handleClose(null,true)} color="primary">
              Fermer
            </Button>
            <Button onClick={_ => handleSubmit(false)} color="primary">
              Sauvegarder {saving ? <CircularProgress /> : ''}
            </Button>
            <Button onClick={_ => handleSubmit(true)} color="primary">
              Sauvegarder et fermer{saving ? <CircularProgress /> : ''}
            </Button>
          </ButtonGroup>
        </DialogActions>
      </Dialog>
      <Dialog open={parsedResult} key="parsed-result"
              onClose={() => setParsedResult(null)}
              fullScreen={true}
              aria-labelledby="parsed-result-dialog-title">
        <DialogTitle id="parsed-result-dialog-title">Résultat de l'analyse</DialogTitle>
        <DialogContent>
          <form onSubmit={addParsedResult} className="form">
            <FormControl>
              <InputLabel htmlFor="parsed-value">Texte analysé</InputLabel>
              <Input
                id="parsed-value"
                required autoFocus={true}
                value={parsedResult}
                multiline rows={3} rowsMax={25} variant="outlined"
                onChange={parsedResultChanged}
              />
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setParsedResult(null)} color="primary">
            Fermer
          </Button>
          <Button onClick={addParsedResult} color="primary">
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
      <LoadingMask loading={loading || saving}/>
    </>
  )
}

export default NoteCreation;
