import * as React from "react";
import {post, get, upload, uploadFilesWithRequest} from "../../utils/http";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import {withRouter} from "react-router-dom";
import FormControl from "@material-ui/core/FormControl";
import "../../styles/forms.scss";
import * as lodash from 'lodash';
import IconButton from "@material-ui/core/IconButton";
import "./note-creation.scss"
import CircularProgress from "@material-ui/core/CircularProgress";
import Toaster from "../Toaster";
import NoteFilter from "../filter/filter";
import {ButtonGroup, Input, InputAdornment, InputLabel, Paper} from "@material-ui/core";
import {Camera, Search} from "@material-ui/icons";
import FiberManualRecordRoundedIcon from '@material-ui/icons/FiberManualRecordRounded';
import gfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";
import {NoteFilesEdit} from "../note/note-files/note-files-edit";
import "../../styles/science.scss";
import VideoList from "../medias/video-list";
import {getKey} from "../../utils/keys";

class NoteCreation extends React.Component {

  defaultState =  {
    noteUri: null,
    selectedSubs: [],
    subs: [],
    valeur: "",
    sources: [],
    tags: [],
    tagsSuggestions: [],
    loadingSources: false,
    loadingTags: false,
    debouncedSource: null,
    debouncedTags: null,
    saving: false,
    error: null,
    version: 0,
    filesChanges: {},
    toolbar: '',
    parsedResult: null,
    searchsubs: '',
    searchingSubs: false
  };



  constructor(props) {
    super(props);
    this.state = lodash.cloneDeep(this.defaultState);
    this.colors = ['red', 'green', 'purple', 'gray'];
    this.handleClose = this.handleClose.bind(this);
    this.valueChanged = this.valueChanged.bind(this);
    this.fileChanged = this.fileChanged.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onFilterChanged = this.onFilterChanged.bind(this);
    this.addColorTag = this.addColorTag.bind(this);
    this.addMD = this.addMD.bind(this);
    this.parsePictureChanged = this.parsePictureChanged.bind(this);
    this.focusAfterFormatting = this.focusAfterFormatting.bind(this)
    this.addParsedResult = this.addParsedResult.bind(this)
    this.parsedResultChanged = this.parsedResultChanged.bind(this)
    this.searchSubs = this.searchSubs.bind(this)
    this.searchChanged = this.searchChanged.bind(this);
    this.setSubsChanged = this.setSubsChanged.bind(this)
    this.refInputFile = React.createRef();
    this.refValeur = React.createRef();
  }

  setSubsChanged(sub, fromSelectedList) {
    const selectedSubs = [...this.state.selectedSubs]
    const suggestedSubs = [...this.state.subs]
    if(fromSelectedList) {
      let index = lodash.findIndex(selectedSubs, {key: sub.key})
      if (sub.selected) {
        selectedSubs[index] = sub
      } else {
        suggestedSubs.unshift(sub)
        selectedSubs.splice(index, 1)
      }
    } else {
      let index = lodash.findIndex(suggestedSubs, {key: sub.key})
      if (sub.selected) {
        selectedSubs.unshift(sub)
        suggestedSubs.splice(index, 1)
      } else {
        suggestedSubs[index] = sub
      }
    }
    this.setState({subs: suggestedSubs, selectedSubs: selectedSubs})
  }

  searchSubs(q) {
    this.setState({searchingSubs: true})
    get('/kosubs/api/search', {q: this.state.searchsubs})
    .then(results => this.setState({subs: (results || []).map(r => ({...r, selected: false, key: getKey("subs")}))}))
    .finally(() => this.setState({searchingSubs: false}))
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    const prevNoteUri = (prevProps.note || {}).uri;
    const currentNoteUri = (this.props.note || {}).uri;
    if(currentNoteUri !== prevNoteUri) {
      const note = (this.props.note || {tags: [], source: {}})
      this.setState({
        noteUri: currentNoteUri,
        valeur: note.valeur,
        source: note.source,
        tags: note.tags,
        hasFile: note.hasFile,
        version: this.state.version + 1,
        selectedSubs: (note.subs || []).map(s => {
          return {... s, selected: true, key: getKey("subs") }
        })
      })
    }
  }
  setParsing(parsing) {
    this.setState({
      parsing
    })
  }

  hasImageChanges(){
    return Object.keys(this.state.filesChanges).length > 0
  }

  getUploadFilesRequest(savedNote) {
    const fileChangesIndices = Object.keys(this.state.filesChanges).map(k => parseInt(k) + 1)
    const lengthArray = Math.max(savedNote.files.length, Math.max(...fileChangesIndices));
    const request = new Array(lengthArray);
    const files = new Array(lengthArray);
    for(let i = 0; i < lengthArray; i++) {
      let action;
      files[i] = null
      if(i in this.state.filesChanges) {
        if(this.state.filesChanges[i]) {
          action = "UPSERT"
          files[i] = this.state.filesChanges[i]
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

  handleSubmit(closeAfterSaving) {
    if(!this.state.saving) {
      this.setState({saving: true, error: null});
      const request = {
        uri: (this.props.note || {}).uri,
        valeur: this.state.valeur,
        tags: lodash.map(this.state.tags, t => t.uri),
        source: this.state.source ? this.state.source.uri : null,
        subs: (this.state.selectedSubs || []).map(s => ({name: s.name, from: s.from, to: s.to}))
      };
      post('/api/notes', request).then(saved => {
        if(this.hasImageChanges()) {
          const metadata = this.getUploadFilesRequest(saved)
          uploadFilesWithRequest('/api/notes/'+saved.uri+'/files', metadata.request, metadata.files, false)
          .then(response => {
            this.handleClose({...saved, files: response.files}, closeAfterSaving);
          })
          .catch(err => this.setState({error: "Impossible d'enregistrer le fichier : " + err}))
          .finally(() => this.setState({saving: false}))
        } else {
          this.setState({saving: false})
          this.handleClose(saved, closeAfterSaving);
        }
      }).catch(err => this.setState({saving: false, error: "Impossible de sauvegarder : " + err}))
    }
  }

  onFilterChanged(event) {
    this.setState({source: event.source, tags: event.tags});
  }

  valueChanged(event) {
    this.setState({valeur: event.target.value});
  }

  searchChanged(event) {
    this.setState({searchsubs: event.target.value});
  }

  parsedResultChanged(event) {
    this.setState({parsedResult: event.target.value})
  }

  addParsedResult() {
    this.setState({
      valeur: (this.state.valeur || '') + '\n' + this.state.parsedResult,
      parsedResult: null
    })
  }

  handleClose(response, closeAfterSaving) {
    if(closeAfterSaving) {
      this.setState(lodash.cloneDeep(this.defaultState));
    } else {
      this.setState({filesChanges: {}})
    }
    this.props.onDone(response, closeAfterSaving);
  }

  fileChanged(idxOfChangedFile, imageFile) {
    const copy = {...this.state.filesChanges}
    copy[idxOfChangedFile] = imageFile
    this.setState({filesChanges: copy})
  }

  parsePictureChanged() {
    const file = document.getElementById('picture');
    if (file) {
      this.setState({parsing: true, error: null});
      const imageFile = file.files[0]
      upload(`/api/notes:parse`, imageFile, false)
      .then(response => {
        this.setState({parsedResult: response.lines.join('\n')});
      })
      .catch(err => {
        console.error(err)
        this.setState({error: "Erreur lors de l'analyse de la photo"})
      }).finally(() => this.setState({parsing: false}))
    } else {
      console.error("Sélectionnez un fichier");
    }
  }

  getCurrentSelection(){
    const element = document.getElementById("valeur-ne")
    const start = element.selectionStart || 0
    const end = element.selectionEnd || 0
    return {
      start,
      end,
      selecting: start !== end
    }
  }

  addColorTag(color) {
    this.addMD(`<span style="color:${color}">`, "</span>")
  }

  addSingle(entry) {
    const valeur = (this.state.valeur || '')
    const selection = this.getCurrentSelection()
    const newValeur = valeur.substr(0, selection.start) +
      entry
      + valeur.substr(selection.start)

    this.setState({valeur: newValeur}, () => this.focusAt(selection, entry))
  }

  addMD(md, mdEnd) {
    const _mdEnd = mdEnd || ''
    const valeur = (this.state.valeur || '')
    const selection = this.getCurrentSelection()
    const interText = selection.selecting ? valeur.substr(selection.start, selection.end - selection.start) : 'ici'
    const newValeur = valeur.substr(0, selection.start) + md
     + interText
    + _mdEnd + valeur.substr(selection.end, valeur.length - selection.end)

    this.setState({valeur: newValeur}, () => this.focusAfterFormatting(selection, md))
  }

  focusAfterFormatting(initialSelection, md) {
    const element = document.getElementById("valeur-ne")
    element.focus()
    element.selectionStart = initialSelection.start + md.length
    element.selectionEnd = initialSelection.selecting ?
      initialSelection.end + md.length :
      initialSelection.end + md.length + 3
  }

  focusAt(initialSelection, md) {
    const element = document.getElementById("valeur-ne")
    element.focus()
    element.selectionStart = initialSelection.start + md.length
    element.selectionEnd = element.selectionStart
  }

  setToolbar(tb) {
    if (this.state.toolbar === tb) {
      this.setState({toolbar: ''})
    } else {
      this.setState({toolbar: tb})
    }
  }

  renderColours() {
    return (
      <ButtonGroup className="button-group centered with-margin-top">
        {this.colors.map(color =>
          <IconButton style={{color}} aria-label={color} key={color} component="span" onClick={() => this.addColorTag(color)}>
            <FiberManualRecordRoundedIcon />
          </IconButton>
        )}
      </ButtonGroup>
    )
  }

  renderTitles() {
    return (
      <ButtonGroup className="button-group centered">
        <Button className="block" onClick={() => this.addMD('# ', ' #')}>Titre1</Button>
        <Button className="block" onClick={() => this.addMD('## ', ' ##')}>Titre2</Button>
        <Button className="block" onClick={() => this.addMD('### ', ' ###')}>Titre3</Button>
        <Button className="block" onClick={() => this.addMD('#### ', ' ####')}>Titre4</Button>
      </ButtonGroup>
    )
  }

  renderText() {
    return (
      <ButtonGroup className="button-group centered">
        <Button className="block" onClick={() => this.addMD('<span style="font-size:2em">','</span>')}>Important</Button>
        <Button className="block" onClick={() => this.addMD('**','**')}>Gras</Button>
        <Button className="block" onClick={() => this.addMD('*', '*')}><i>Italique</i></Button>
        <Button className="block" onClick={() => this.addMD('<strike>', '</strike>')}><strike>Barré</strike></Button>
        <Button className="block" onClick={() => this.addMD('<ins>', '</ins>')}><ins>Souligné</ins></Button>
      </ButtonGroup>
    )
  }

  renderMaths() {
    return (
      <ButtonGroup className="button-group centered">
        <Button className="block" onClick={() => this.addMD('<sub>','</sub>')}>I&nbsp;<sub>bas</sub></Button>
        <Button className="block" onClick={() => this.addMD('<sup>','</sup>')}>Is&nbsp;<sup>haut</sup></Button>
        <Button className="block" onClick={() => this.addSingle('∂')}>∂</Button>
        <Button className="block" onClick={() => this.addSingle('&nabla;')}>&nabla;</Button>
        <Button className="block" onClick={() => this.addSingle('&forall;')}>&forall;</Button>
        <Button className="block" onClick={() => this.addSingle('&isin;')}>&isin;</Button>
        <Button className="block" onClick={() => this.addSingle('&sube;')}>&sube;</Button>
        <Button className="block" onClick={() => this.addSingle('∃')}>∃</Button>
        <Button className="block" onClick={() => this.addSingle('⇒')}>⇒</Button>
        <Button className="block" onClick={() => this.addSingle('&int;')}>&int;</Button>
        <Button className="block" onClick={() => this.addSingle('⋂')}>⋂</Button>
        <Button className="block" onClick={() => this.addSingle('⋃')}>⋃</Button>
        <Button className="block" onClick={() => this.addSingle('&xrarr;')}>&rarr;</Button>
        <Button className="block" onClick={() => this.addSingle('⇔')}>⇔</Button>
        <Button className="block" onClick={() => this.addSingle('⇒')}>⇒</Button>
        <Button className="block" onClick={() => this.addSingle('⟼')}>⟼</Button>
        <Button className="block" onClick={() => this.addSingle('ℝ')}>ℝ</Button>
        <Button className="block" onClick={() => this.addSingle('<span style="font-size: 2em">∘</span>')}><span style={{fontSize: "2em"}}>∘</span></Button>
        <Button className="block scientific-notation" onClick={() => this.addMD('<fraction><numer>','</numer><denom></denom></fraction>')}><fraction><numer>a</numer>b</fraction></Button>
        <Button className="block scientific-notation" onClick={() => this.addMD('<superposed><up>','</up><down></down></superposed>')}><superposed><up>a</up><down>b</down></superposed></Button>
        <Button className="block scientific-notation" onClick={() => this.addMD('<upperposed><up>','</up><down></down></upperposed>')}><upperposed><up>a</up><down>b</down></upperposed></Button>
      </ButtonGroup>
    )
  }

  renderGreek() {
    const lower = ['α', 'β', 'γ', 'δ', 'ε', 'ζ','η','θ','λ','μ','ξ','π','ρ','σ','φ','ϕ','ψ','ω']
    const upper = ['Γ','Δ','Θ','Λ','Ξ','Π','Σ','Φ','Ψ','Ω']
    return (
      <div>
        <ButtonGroup className="button-group centered" key="lowercase">
          {lower.map(letter =>
            <IconButton key={"greek-" + letter} component="span" onClick={() => this.addSingle(letter)}>
              <span>{letter}</span>
            </IconButton>
          )}
        </ButtonGroup>
        <ButtonGroup className="button-group centered" key="uppercase">
          {upper.map(letter =>
            <IconButton key={"greek-" + letter} component="span" onClick={() => this.addSingle(letter)}>
              <span>{letter}</span>
            </IconButton>
          )}
        </ButtonGroup>
      </div>
    )
  }

  render() {
    const filter = {
      source : this.state.source,
      tags: this.state.tags || []
    };
    return (
      <>
        <Dialog open={this.props.creating || !!this.props.note} key="main-dialog"
                onClose={() => this.handleClose(null, true)}
                fullScreen={true}
                aria-labelledby="creation-dialog-title">
          <DialogTitle id="creation-dialog-title">{this.state.noteUri ? 'Nouvelle note' : 'Modification'}</DialogTitle>
          <DialogContent>
            <form onSubmit={() => this.handleSubmit(false)} className="form">
              <NoteFilesEdit note={this.props.note} onChange={this.fileChanged}/>
              <FormControl>
                <InputLabel htmlFor="valeur-ne">Note</InputLabel>
                <Input
                  id="valeur-ne"
                  required autoFocus={true}
                  value={this.state.valeur}
                  ref={this.refValeur}
                  multiline rows={3} rowsMax={25} variant="outlined"
                  onChange={this.valueChanged}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="analyse image"
                        onClick={() => this.refInputFile.current.click()}
                      >
                        {this.state.parsing ? <CircularProgress /> : <Camera />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                <ButtonGroup className="button-group centered with-margin-top">
                  <Button className="block" onClick={() => this.setToolbar("titles")}>Titres</Button>
                  <Button className="block" onClick={() => this.setToolbar('colours')}>Couleurs</Button>
                  <Button className="block" onClick={() => this.setToolbar('text')}>Texte</Button>
                  <Button className="block" onClick={() => this.setToolbar('maths')}>Maths</Button>
                  <Button className="block" onClick={() => this.setToolbar('greek')}>Grec</Button>
                </ButtonGroup>
                <div className="with-margin-top with-margin-bottom">
                  {this.state.toolbar === 'colours' ? this.renderColours(): <></>}
                  {this.state.toolbar === 'titles'  ? this.renderTitles(): <></>}
                  {this.state.toolbar === 'text'    ? this.renderText() : <></>}
                  {this.state.toolbar === 'maths'   ? this.renderMaths() : <></>}
                  {this.state.toolbar === 'greek'   ? this.renderGreek(): <></>}
                </div>
                <input type="file" id="picture" accept="image/*" onChange={this.parsePictureChanged} hidden={true} ref={this.refInputFile}/>

              </FormControl>
              <NoteFilter filter={filter} version={0}
                          onFilterChanged={this.onFilterChanged}
                          allowCreation={true} />

              <VideoList key={"selected-subs"} title={"Sous-titres"} videos={this.state.selectedSubs} editable={true} onChange={(sub) => this.setSubsChanged(sub, true)}/>
              <FormControl>
                <InputLabel htmlFor="valeur-ne">Sous-titres</InputLabel>
                <Input id="search-subs" value={this.state.searchsubs} onChange={this.searchChanged}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton aria-label="analyse image" onClick={() => this.searchSubs(this.state.searchsubs)}>
                        {this.state.searchingSubs ? <CircularProgress /> : <Search />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>
              <VideoList key={"suggested-subs"} title={"Sous-titres trouvées"} videos={this.state.subs} editable={true} onChange={(sub) => this.setSubsChanged(sub, false)}/>
            </form>
            {this.state.valeur ? <Paper elevation={3} className="with-padding with-margin-top">
              <ReactMarkdown className={"scientific-notation"} remarkPlugins={[gfm]} rehypePlugins={[rehypeRaw]} children={this.state.valeur}/>
            </Paper> : <></>}
            <Toaster error={this.state.error}/>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.handleClose(null,true)} color="primary">
              Fermer
            </Button>
            <Button onClick={_ => this.handleSubmit(false)} color="primary">
              Sauvegarder {this.state.saving ? <CircularProgress /> : ''}
            </Button>
            <Button onClick={_ => this.handleSubmit(true)} color="primary">
              Sauvegarder et fermer{this.state.saving ? <CircularProgress /> : ''}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={this.state.parsedResult} key="parsed-result"
                onClose={() => this.setState({parsedResult: null})}
                fullScreen={true}
                aria-labelledby="parsed-result-dialog-title">
          <DialogTitle id="parsed-result-dialog-title">Résultat de l'analyse</DialogTitle>
          <DialogContent>
            <form onSubmit={this.addParsedResult} className="form">
              <FormControl>
                <InputLabel htmlFor="parsed-value">Texte analysé</InputLabel>
                <Input
                  id="parsed-value"
                  required autoFocus={true}
                  value={this.state.parsedResult}
                  multiline rows={3} rowsMax={25} variant="outlined"
                  onChange={this.parsedResultChanged}
                />
              </FormControl>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({parsedResult: null})} color="primary">
              Fermer
            </Button>
            <Button onClick={this.addParsedResult} color="primary">
              Ajouter
            </Button>
          </DialogActions>
        </Dialog>
      </>
    )
  }
}

export default withRouter(NoteCreation);
