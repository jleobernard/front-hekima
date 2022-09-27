import * as React from "react";
import {useEffect, useMemo, useState} from "react";
import * as lodash from "lodash";
import {debounce} from "lodash";
import {get, post} from "../../utils/http";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Chip from "@material-ui/core/Chip";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import Dialog from "@material-ui/core/Dialog/Dialog";

export function SourcesSelector({className, onChange, allowCreation}) {
  const [loading, setLoading] = useState(false)
  const [creatingSource, setCreatingSource] = useState(false)
  const [q, setQ] = useState("")
  const [sources, setSources] = useState([])
  const [sourcesSuggestions, setSourcesSuggestions] = useState([])
  const [newSource, setNewSource] = useState({})
  const types = [
    {type: 'Livre'},
    {type: 'MOOC'},
    {type: 'Journal'},
    {type: 'Cours'}
  ]

  const debounceSearch = useMemo(() => debounce((q)  => {
    setLoading(true)
    get('/api/sources', {q})
    .then(sources => setSourcesSuggestions(sources))
    .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, 500), []);

  useEffect(() => {
    debounceSearch(q)
  },[q])

  function selectSources(event, sources) {
    const source = lodash.last(sources);
    if(source && source.inputValue) {
      const realSource = {...source}
      realSource.titre = source.inputValue
      source.titre = source.inputValue
      const newSource = lodash.cloneDeep(realSource)
      newSource.creating = true
      setNewSource(newSource)
    } else {
      setSources(sources)
      onChange(sources)
    }
  }

  function closeSourceCreation() {
    setNewSource({})
    setCreatingSource(false)
  }

  function doCreateNewSource() {
    if(!creatingSource) {
      setCreatingSource(true)
      post('/api/sources', newSource)
      .then(insertedSource => {
        closeSourceCreation()
        const newSources = [...sources]
        newSources.push(insertedSource)
        onChange(newSources);
      })
      .finally(() => setCreatingSource(false))
    }
  }

  return (
    <FormControl margin="normal" className={className}>
      <Autocomplete
        id="sources-selector"
        multiple
        loading={loading}
        value={sources}
        onChange={selectSources}
        onInputChange={(event) => event ? setQ(event.target.value) : null}
        options={sourcesSuggestions}
        getOptionLabel={source => {
          return source.titre || "";
        }}
        renderSources={(sourceValue, getSourceProps) =>
          sourceValue.map((option, index) => (
            <Chip
              label={option.titre}
              {...getSourceProps({ index })}
            />
          ))
        }
        filterOptions={(options, params) => {
          return allowCreation ?
            [...options, {titre: 'Ajouter ' + params.inputValue, inputValue: params.inputValue}] :
            options;
        }}
        renderInput={(params) => (
          <TextField {...params} label="Source" variant="outlined" placeholder="Sources" />
        )}
      />
      {sources && sources.length > 0 ? <></> : <FormHelperText id={"source-helper"}>Sélectionnez une ou plusieurs sources</FormHelperText>}
      <Dialog open={newSource && newSource.creating}
              onClose={closeSourceCreation}
              fullScreen={true}
              aria-labelledby="creation-source-dialog-title">
        <DialogTitle id="creation-dialog-title">Création d'une source</DialogTitle>
        <DialogContent>
          <form onSubmit={doCreateNewSource} className="form">
            <FormControl>
              <TextField id='new-source-titre' label="Titre" required value={newSource.titre}
                         variant="outlined" onChange={event => setNewSource({...newSource, titre: event.target.value})} />
            </FormControl>
            <FormControl>
              <TextField id='new-source-auteur' label="Auteur" required value={newSource.auteur}
                         variant="outlined" onChange={event => setNewSource({...newSource, auteur: event.target.value})} />
            </FormControl>
            <FormControl>
              <Autocomplete
                id="new-source-type"
                value={newSource.type}
                onChange={event => setNewSource({...newSource, type: event.target.value})}
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
              {newSource.type ? <></> : <FormHelperText id="new-source-helper">Sélectionnez un titre</FormHelperText>}
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSourceCreation} color="primary">
            Annuler
          </Button>
          <Button onClick={doCreateNewSource} color="primary">
            Sauvegarder {creatingSource ? <CircularProgress /> : ''}
          </Button>
        </DialogActions>
      </Dialog>
    </FormControl>
  )

}
