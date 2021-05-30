import * as React from "react";
import {post, upload} from "../../utils/http";
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
import CloseIcon from "@material-ui/core/SvgIcon/SvgIcon";
import "./note-creation.scss"
import CircularProgress from "@material-ui/core/CircularProgress";
import Toaster from "../Toaster";
import NoteFilter from "../filter/filter";
import {Input, InputAdornment, InputLabel} from "@material-ui/core";
import {Camera} from "@material-ui/icons";


class NoteCreation extends React.Component {

  defaultState =  {
    noteUri: null,
    valeur: "",
    sources: [],
    tags: [],
    tagsSuggestions: [],
    loadingSources: false,
    loadingTags: false,
    debouncedSource: null,
    debouncedTags: null,
    preview: null,
    imageFile: null,
    saving: false,
    error: null,
    version: 0
  };

  constructor(props) {
    super(props);
    this.state = lodash.cloneDeep(this.defaultState);
    this.handleClose = this.handleClose.bind(this);
    this.valueChanged = this.valueChanged.bind(this);
    this.fileChanged = this.fileChanged.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onFilterChanged = this.onFilterChanged.bind(this);

    this.parsePictureChanged = this.parsePictureChanged.bind(this);
    this.refInputFile = React.createRef();
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
        version: this.state.version + 1
      })
    }
  }
  setParsing(parsing) {
    this.setState({
      parsing
    })
  }

  handleSubmit() {
    if(!this.state.saving) {
      this.setState({saving: true, error: null});
      const request = {
        uri: (this.props.note || {}).uri,
        valeur: this.state.valeur,
        tags: lodash.map(this.state.tags, t => t.uri),
        source: this.state.source ? this.state.source.uri : null
      };
      post('/api/notes', request).then(saved => {
        if(this.state.imageFile) {
          upload('/api/notes/'+saved.uri+'/file', this.state.imageFile, false)
          .then(response => {
            this.handleClose(response);
          })
          .catch(err => this.setState({error: "Impossible d'enregistrer le fichier : " + err}))
          .finally(() => this.setState({saving: false}))
        } else {
          this.handleClose(saved);
        }
      }).catch(err => this.setState({error: "Impossible de sauvegarder : " + err}))
    }
  }

  onFilterChanged(event) {
    this.setState({source: event.source, tags: event.tags});
  }

  valueChanged(event) {
    this.setState({valeur: event.target.value});
  }

  handleClose(response) {
    this.setState(lodash.cloneDeep(this.defaultState));
    this.props.onDone(response);
  }

  fileChanged() {
    const file = document.getElementById('hekima-picture');
    if (!file) {
      console.error("Sélectionnez un fichier");
    }
    const reader = new FileReader();
    reader.onloadend = result => {
      this.setState({preview: result.target.result});
    };
    reader.onerror = (err) => console.error(err);
    reader.onabort = (err) => console.error(err);
    const imageFile = file.files[0];
    reader.readAsDataURL(imageFile);
    this.setState({imageFile});
  }

  parsePictureChanged() {
    const file = document.getElementById('picture');
    if (file) {
      this.setState({parsing: true, error: null});
      const imageFile = file.files[0]
      upload(`/api/notes:parse`, imageFile, false)
      .then(response => {
        this.setState({valeur: response.lines.join('\n')});
      })
      .catch(err => {
        console.error(err)
        this.setState({error: "Erreur lors de l'analyse de la photo"})
      }).finally(() => this.setState({parsing: false}))
    } else {
      console.error("Sélectionnez un fichier");
    }
  }


  render() {
    const filter = {
      source : this.state.source,
      tags: this.state.tags || []
    };
    return (
      <Dialog open={this.props.creating || !!this.props.note}
              onClose={this.handleClose}
              fullScreen={true}
              aria-labelledby="creation-dialog-title">
        <DialogTitle id="creation-dialog-title">{this.state.noteUri ? 'Nouvelle note' : 'Modification'}</DialogTitle>
        <DialogContent>
          <form onSubmit={this.handleSubmit} className="form">
            <FormControl>
              <input type="file" id="hekima-picture" accept="image/*" onChange={this.fileChanged}/>
              {this.state.preview ?
                <div className="hekima-picture">
                  <img src={this.state.preview} alt={"Note "}/>
                  <div className="close-icon">
                    <IconButton size="small" aria-label="close" color="inherit">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
                : <></>}
              {this.state.hasFile ?
                <div className="hekima-picture">
                  <img src={'/api/notes/' + this.state.noteUri + '/file'}  alt={"Note " + this.state.noteUri}/>
                  <div className="close-icon">
                    <IconButton size="small" aria-label="close" color="inherit">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
                : <></>}
            </FormControl>
            <FormControl>
              <InputLabel htmlFor="valeur-ne">Note</InputLabel>
              <Input
                id="valeur-ne"
                required
                value={this.state.valeur}
                multiline rows={3} rowsMax={10} variant="outlined"
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
              <input type="file" id="picture" accept="image/*" onChange={this.parsePictureChanged} hidden={true} ref={this.refInputFile}/>
            </FormControl>
            <NoteFilter filter={filter} version={0}
                        onFilterChanged={this.onFilterChanged}
                        allowCreation={true} />
          </form>
          <Toaster error={this.state.error}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.handleClose()} color="primary">
            Annuler
          </Button>
          <Button onClick={this.handleSubmit} color="primary">
            Sauvegarder {this.state.saving ? <CircularProgress /> : ''}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default withRouter(NoteCreation);
