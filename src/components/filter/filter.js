import * as React from "react";
import {get, post} from "../../utils/http";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Chip from "@material-ui/core/Chip";
import FormHelperText from "@material-ui/core/FormHelperText";
import "../../styles/forms.scss";
import * as lodash from 'lodash';
import debounce from 'lodash/debounce';
import Toaster from "../Toaster";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import Dialog from "@material-ui/core/Dialog/Dialog";


class NoteFilter extends React.Component {

  defaultState = {
    sources: [],
    tags: [],
    q: "",
    qSuggestions: [],
    tagsSuggestions: [],
    loadingSources: false,
    loadingQ: false,
    loadingTags: false,
    creatingSource: false,
    debouncedSource: null,
    debouncedTags: null,
    debouncedQ: null,
    newSource: {creating: false},
    createSourceError: null,
    version: 0
  };

  constructor(props) {
    super(props);
    this.state = lodash.cloneDeep(this.defaultState);
    this.state = {
      ...this.state,
      source: props.filter.source,
      tags: props.filter.tags,
      q: props.filter.q || ''
    }
    this.selectQ = this.selectQ.bind(this);
    this.refreshQ = this.refreshQ.bind(this);
    this.refreshSources = this.refreshSources.bind(this);
    this.selectSource = this.selectSource.bind(this);
    this.selectTags = this.selectTags.bind(this);
    this.refreshTags = this.refreshTags.bind(this);
    this.closeSourceCreation = this.closeSourceCreation.bind(this);
    this.newSourceFieldChanged = this.newSourceFieldChanged.bind(this);
    this.refreshSources("");
    this.refreshTags("");
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.version !== this.props.version) {
      this.setState({
        source: this.props.filter.source,
        tags: this.props.filter.tags || [],
        q: this.props.filter.q
      });
    }
  }

  refreshQ(q) {
    const realQ = this.getLastWord(q);
    if(realQ) {
      this.setState({loadingQ: true});
      if (this.state.debouncedQ) {
        this.state.debouncedQ.cancel();
      }
      let debounced = debounce(() => {
        get('/api/notes:autocomplete-index', {q: realQ}, false)
        .then(words => this.setState({qSuggestions: words}))
        .finally(() => this.setState({loadingQ: false, debouncedQ: null}))
      }, 500);
      debounced();
      this.setState({debouncedQ: debounced});
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

  selectQ(event, newValue) {
    event.preventDefault()
    event.stopPropagation()
    if(this.state.debouncedQ) {
      this.state.debouncedQ.cancel();
    }
    if(newValue) {
      /*const alreadySet = this.getAllButLastWord(this.state.q)
      alreadySet.push(newValue)*/
      const newQ = `${this.state.q ? this.state.q + ' ' : ''}${newValue} `
      this.setState({debouncedQ: null, q: newQ})
      this.props.onFilterChanged({source: this.state.source, tags: this.state.tags, q: newQ})
    }
  }
  selectSource(event, source) {
    if(this.state.debouncedSource) {
      this.state.debouncedSource.cancel();
    }
    if(source.inputValue) {
      const realSource = {...source}
      realSource.titre = source.inputValue
      source.titre = source.inputValue
      const newSource = lodash.cloneDeep(realSource)
      newSource.creating = true
      this.setState({newSource})
    } else {
      this.setState({debouncedSource: null, source});
      this.props.onFilterChanged({source: source, tags: this.state.tags, q: this.state.q});
    }
  }

  closeSourceCreation(save) {
    if(save) {
      this.setState({creatingSource: true})
      post('/api/sources', this.state.newSource, false)
      .then(insertedSource => {
        this.setState({
          newSource: {creating: false},
          source: insertedSource
        })
        this.props.onFilterChanged({source: insertedSource, tags: this.state.tags, q: this.state.q});
      })
      .finally(() => this.setState({creatingSource: false}))
    } else {
      this.setState({newSource: {creating: false}});
    }
  }
  newSourceFieldChanged(typeName, typeValue) {
    const _plop = {...this.state.newSource};
    _plop[typeName] = typeValue
    this.setState({newSource: _plop});
  }

  selectTags(event, tags) {
    if(this.state.debouncedTags) {
      this.state.debouncedTags.cancel();
    }
    const lastElement = lodash.last(tags);
    if(lastElement.inputValue) {
      const realTags = [...tags];
      lastElement.valeur = lastElement.inputValue;
      this.setState({loadingTags: true});
      post('/api/tags', {valeur: lastElement.valeur}, false)
      .then(insertedTag => {
        realTags[realTags.length - 1] = insertedTag;
        this.setState({tags: realTags});
        this.props.onFilterChanged({source: this.state.source, tags: realTags, q: this.state.q});
      })
      .finally(() => this.setState({loadingTags: false}))
    } else {
      this.setState({debouncedTags: null, tags});
      this.props.onFilterChanged({source: this.state.source, tags: tags, q: this.state.q});
    }
  }


  render() {
    const qs = this.state.qSuggestions || [];
    const sources = this.state.sources || [];
    const tags = this.state.tagsSuggestions || [];
    const allowCreations = this.props.allowCreation;
    const types = [
      {type: 'Livre'},
      {type: 'MOOC'},
      {type: 'Journal'},
      {type: 'Cours'}
    ]
    return (
      <div className="flex-column">
        {this.props.withFTS ? <FormControl margin="normal">
          <Autocomplete
            id="q"
            loading={this.state.loadingQ}
            value={this.state.q}
            onChange={this.selectQ}
            onInputChange={(event) => event ? this.refreshQ(event.target.value) : null}
            options={qs}
            getOptionLabel={q => q}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip
                  label={option}
                  {...getTagProps({ index })}
                />
              ))
            }
            filterOptions={(options, params) => options }
            renderInput={(params) => (
              <TextField {...params} label="Mot-clef" variant="outlined" placeholder="Mot-clef" />
            )}
          />
        </FormControl> : <></>}
        <FormControl margin="normal">
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
            filterOptions={(options, params) => {
              return allowCreations ?
                [...options, {titre: 'Ajouter ' + params.inputValue, inputValue: params.inputValue}] :
                options;
            }}
            renderInput={(params) => (
              <TextField {...params} label="Source" variant="outlined" placeholder="Source" />
            )}
          />
          {this.state.source ? <></> : <FormHelperText id={"source-helper"}>Sélectionnez la source</FormHelperText>}
        </FormControl>
        <FormControl margin="normal">
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
            filterOptions={(options, params) => {
              return allowCreations ?
                [...options, {valeur: 'Ajouter ' + params.inputValue, inputValue: params.inputValue}] :
                options;
            }}
            renderInput={(params) => (
              <TextField {...params} label="Tag" variant="outlined" placeholder="Tags" />
            )}
          />
          {this.state.tags && this.state.tags.length > 0 ? <></> : <FormHelperText id={"source-helper"}>Sélectionnez un ou plusieurs tags</FormHelperText>}
        </FormControl>
        <Dialog open={this.state.newSource.creating}
                onClose={() => this.closeSourceCreation(false)}
                fullScreen={true}
                aria-labelledby="creation-source-dialog-title">
          <DialogTitle id="creation-dialog-title">Création d'une source</DialogTitle>
          <DialogContent>
            <form onSubmit={this.handleSubmit} className="form">
              <FormControl>
                <TextField id='new-source-titre' label="Titre" required value={this.state.newSource.titre}
                           variant="outlined" onChange={event => this.newSourceFieldChanged('titre', event.target.value)} />
              </FormControl>
              <FormControl>
                <TextField id='new-source-auteur' label="Auteur" required value={this.state.newSource.auteur}
                           variant="outlined" onChange={event => this.newSourceFieldChanged('auteur', event.target.value)} />
              </FormControl>
              <FormControl>
                <Autocomplete
                  id="new-source-type"
                  value={this.state.newSource.type}
                  onChange={event => this.newSourceFieldChanged('type', event.target.textContent)}
                  options={types}
                  getOptionLabel={tag => {
                    return tag.type || "";
                  }}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                      <Chip
                        label={option.type}
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Type" variant="outlined" placeholder="Type" />
                  )}
                />
                {this.state.newSource.type ? <></> : <FormHelperText id="new-source-helper">Sélectionnez un titre</FormHelperText>}
              </FormControl>
            </form>
            <Toaster error={this.state.createSourceError}/>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.closeSourceCreation(false)} color="primary">
              Annuler
            </Button>
            <Button onClick={() => this.closeSourceCreation(true)} color="primary">
              Sauvegarder {this.state.creatingSource ? <CircularProgress /> : ''}
            </Button>
          </DialogActions>
        </Dialog>
        <Toaster error={this.state.error}/>
      </div>
    )
  }

  getAllButLastWord(q) {
    let all = []
    if(q) {
      const words = q.trim().split(/\s+/).pop()
      if(words.length > 0) {
        all = words.subarray(0, words.length - 1)
      }
    }
    return all;
  }

  getLastWord(q) {
    let lastWord = ''
    if(q) {
      lastWord = lodash.last(q.trim().split(/\s+/))
    }
    return lastWord;
  }
}

export default NoteFilter;
