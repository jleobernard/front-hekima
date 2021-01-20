import * as React from "react";
import {get, patch, post} from "../../utils/http";
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
import debounce from 'lodash/debounce';
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/core/SvgIcon/SvgIcon";
import "./note-creation.scss"


class NoteCreation extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      valeur: "",
      sources: [],
      tags: [],
      tagsSuggestions: [],
      loadingSources: false,
      loadingTags: false,
      debouncedSource: null,
      debouncedTags: null,
      preview: null
    };
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.refreshSources = this.refreshSources.bind(this);
    this.selectSource = this.selectSource.bind(this);
    this.selectTags = this.selectTags.bind(this);
    this.refreshTags = this.refreshTags.bind(this);
    this.fileChanged = this.fileChanged.bind(this);
  }
  componentDidMount() {
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
  handleChange(fieldName, newValue) {
    const changes = {};
    changes[fieldName] = newValue;
    this.setState(changes);
    if(fieldName === "source") {

    }
  }
  handleKeyDown(event ) {
    if(event.key === 'Enter') {
      if(!(event.shiftKey || event.altKey)) {
        if(this.props.onSearch) {
          this.props.onSearch(this.state.searchInput);
        }
      }
    }
  }

  handleClose(save) {
    this.setState({creating: false});
    this.props.onDone('ma super note');
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
  fileChanged(event) {
    console.log("File changed " + event);
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
    reader.readAsDataURL(file.files[0]);
  }


  render() {
    const sources = this.state.sources || [];
    const tags = this.state.tagsSuggestions || [];
    return (
      <Dialog open={this.props.creating}
              onClose={this.handleClose.bind(this, false)}
              fullScreen={true}
              aria-labelledby="creation-dialog-title">
        <DialogTitle id="creation-dialog-title">Nouvelle note</DialogTitle>
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
            </FormControl>
            <FormControl>
              <TextField id='valeur' label="Note" required
                         multiline rows={3} rowsMax={10} variant="outlined"
                         onChange={(event, newValue) => this.handleChange( 'valeur', newValue)} />
            </FormControl>
            <FormControl>
              <Autocomplete
                id="source"
                loading={this.state.loadingSources}
                value={this.state.source}
                onChange={this.selectSource}
                onInputChange={(event) => this.refreshSources(event.target.value)}
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
                loading={this.state.loadingTags}
                value={this.state.tags}
                onChange={this.selectTags}
                onInputChange={(event) => this.refreshTags(event.target.value)}
                options={tags}
                getOptionLabel={tag => {
                  console.log(tag);
                  return tag.valeur
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.handleClose(false)} color="primary">
            Annuler
          </Button>
          <Button onClick={() => this.handleClose(true)} color="primary">
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default withRouter(NoteCreation);
