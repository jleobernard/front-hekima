import * as React from "react";
import {get, patch, post, upload} from "../../utils/http";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import {withRouter} from "react-router-dom";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Chip from "@material-ui/core/Chip";
import FormHelperText from "@material-ui/core/FormHelperText";
import "../../styles/forms.scss";
import * as lodash from 'lodash';
import debounce from 'lodash/debounce';
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/core/SvgIcon/SvgIcon";
import "./note-creation.scss"
import CircularProgress from "@material-ui/core/CircularProgress";
import Toaster from "../Toaster";


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
    error: null
  };

  constructor(props) {
    super(props);
    this.state = lodash.cloneDeep(this.defaultState);
    this.handleClose = this.handleClose.bind(this);
    this.valueChanged = this.valueChanged.bind(this);
    this.refreshSources = this.refreshSources.bind(this);
    this.selectSource = this.selectSource.bind(this);
    this.selectTags = this.selectTags.bind(this);
    this.refreshTags = this.refreshTags.bind(this);
    this.fileChanged = this.fileChanged.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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
        hasFile: note.hasFile
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

  refreshSources(q) {
    this.setState({loadingSources: true});
    if(this.state.debouncedSource) {
      this.state.debouncedSource.cancel();
    }
    let debounced = debounce(() => {
      get('/api/sources', {q}, false)
      .then(sources => this.setState({sources}))
      .finally(() => this.setState({loadingSources: false, debouncedSource: null}))
    }, 1000);
    debounced();
    this.setState({debouncedSource: debounced});
  }

  refreshTags(q) {
    this.setState({loadingTags: true});
    if(this.state.debouncedTags) {
      this.state.debouncedTags.cancel();
    }
    let debounced = debounce(() => {
      get('/api/tags', {q}, false)
      .then(tags => this.setState({tagsSuggestions: tags}))
      .finally(() => this.setState({loadingTags: false, debouncedTags: null}))
    }, 1000);
    debounced();
    this.setState({debouncedTags: debounced});

  }
  valueChanged(event) {
    this.setState({valeur: event.target.value});
  }

  handleClose(response) {
    this.setState(lodash.cloneDeep(this.defaultState));
    this.props.onDone(response);
  }

  selectSource(event, source) {
    if(this.state.debouncedSource) {
      this.state.debouncedSource.cancel();
    }
    this.setState({debouncedSource: null, source});
  }

  selectTags(event, tags) {
    if(this.state.debouncedTags) {
      this.state.debouncedTags.cancel();
    }
    this.setState({debouncedTags: null, tags});
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if(nextProps.creating) {
      this.refreshSources("");
      this.refreshTags("");
    }
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
    const sources = this.state.sources || [];
    const tags = this.state.tagsSuggestions || [];
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
            <FormControl>
              <Autocomplete
                id="source"
                loading={this.state.loadingSources}
                value={this.state.source}
                onChange={this.selectSource}
                onInputChange={(event) => event ? this.refreshSources(event.target.value) : null}
                options={sources}
                getOptionLabel={source => source.titre}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip
                      label={option.titre}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Source" variant="outlined" placeholder="Langues maternelles" />
                )}
              />
              {this.state.source ? <></> : <FormHelperText id={"source-helper"}>Sélectionnez la source</FormHelperText>}
            </FormControl>
            <FormControl>
              <Autocomplete
                id="tags"
                multiple
                loading={this.state.loadingTags}
                value={this.state.tags}
                onChange={this.selectTags}
                onInputChange={(event) => event ? this.refreshTags(event.target.value) : null}
                options={tags}
                getOptionLabel={tag => {
                  return tag.valeur || "";
                }}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip
                      label={option.valeur}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Tag" variant="outlined" placeholder="Tags" />
                )}
              />
              {this.state.tags && this.state.tags.length > 0 ? <></> : <FormHelperText id={"source-helper"}>Sélectionnez un ou plusieurs tags</FormHelperText>}
            </FormControl>
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
