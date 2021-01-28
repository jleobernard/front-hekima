import * as React from "react";
import {get, patch, post} from "../../utils/http";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Chip from "@material-ui/core/Chip";
import FormHelperText from "@material-ui/core/FormHelperText";
import "../../styles/forms.scss";
import * as lodash from 'lodash';
import debounce from 'lodash/debounce';
import Toaster from "../Toaster";


class NoteFilter extends React.Component {

  defaultState = {
    sources: [],
    tags: [],
    tagsSuggestions: [],
    loadingSources: false,
    loadingTags: false,
    debouncedSource: null,
    debouncedTags: null,
    version: 0
  };

  constructor(props) {
    super(props);
    console.log(props);
    this.state = lodash.cloneDeep(this.defaultState);
    this.state = {
      ...this.state,
      source: props.filter.source,
      tags: props.filter.tags,
    }
    this.refreshSources = this.refreshSources.bind(this);
    this.selectSource = this.selectSource.bind(this);
    this.selectTags = this.selectTags.bind(this);
    this.refreshTags = this.refreshTags.bind(this);
    this.refreshSources("");
    this.refreshTags("");
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.version !== this.props.version) {
      this.setState({
        source: this.props.filter.source,
        tags: this.props.filter.tags || []
      });
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

  selectSource(event, source) {
    if(this.state.debouncedSource) {
      this.state.debouncedSource.cancel();
    }
    this.setState({debouncedSource: null, source});
    this.props.onFilterChanged({source: source, tags: this.state.tags});
  }

  selectTags(event, tags) {
    if(this.state.debouncedTags) {
      this.state.debouncedTags.cancel();
    }
    this.setState({debouncedTags: null, tags});
    this.props.onFilterChanged({source: this.state.source, tags: tags});
  }


  render() {
    const sources = this.state.sources || [];
    const tags = this.state.tagsSuggestions || [];
    return (
      <div className="flex-column">
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
            renderInput={(params) => (
              <TextField {...params} label="Tag" variant="outlined" placeholder="Tags" />
            )}
          />
          {this.state.tags && this.state.tags.length > 0 ? <></> : <FormHelperText id={"source-helper"}>Sélectionnez un ou plusieurs tags</FormHelperText>}
        </FormControl>
        <Toaster error={this.state.error}/>
      </div>
    )
  }
}

export default NoteFilter;
