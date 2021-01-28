import * as React from "react";
import {get, post, upload} from "../../utils/http";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import {withRouter} from "react-router-dom";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import "../../styles/forms.scss";
import * as lodash from 'lodash';
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/core/SvgIcon/SvgIcon";
import "./note-creation.scss"
import CircularProgress from "@material-ui/core/CircularProgress";
import Toaster from "../Toaster";
import NoteFilter from "../filter/filter";


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
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    const prevNoteUri = (prevProps.note || {}).uri;
    const currentNoteUri = (this.props.note || {}).uri;
    if(currentNoteUri !== prevNoteUri) {
      const note = (this.props.note || {tags: [], source: {}})
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

  handleSubmit() {
    if(!this.state.saving) {
      this.setState({saving: true, error: null});
      const request = {
        uri: (this.props.note || {}).uri,
        valeur: this.state.valeur,
        tags: lodash.map(this.state.tags, t => t.uri),
        source: this.state.source ? this.state.source.uri : null
      };
      post('/api/hekimas', request).then(saved => {
        if(this.state.imageFile) {
          upload('/api/hekimas/'+saved.uri+'/file', this.state.imageFile, false)
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
                  <img src={this.state.preview} />
                  <div className="close-icon">
                    <IconButton size="small" aria-label="close" color="inherit">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
                : <></>}
              {this.state.hasFile ?
                <div className="hekima-picture">
                  <img src={'/api/hekimas/' + this.state.noteUri + '/file'} />
                  <div className="close-icon">
                    <IconButton size="small" aria-label="close" color="inherit">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
                : <></>}
            </FormControl>
            <FormControl>
              <TextField id='valeur' label="Note" required value={this.state.valeur}
                         multiline rows={3} rowsMax={10} variant="outlined"
                         onChange={this.valueChanged} />
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
