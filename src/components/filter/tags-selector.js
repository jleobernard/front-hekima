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

export function TagsSelector({className, onChange, allowCreation, title}) {
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState("")
  const [tags, setTags] = useState([])
  const [tagsSuggestions, setTagsSuggestions] = useState([])


  const debounceSearch = useMemo(() => debounce((q)  => {
    setLoading(true)
    get('/api/tags', {q})
    .then(tags => setTagsSuggestions(tags))
    .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, 500), []);

  useEffect(() => {
    debounceSearch(q)
  },[q])

  function selectTags(event, tags) {
    const lastElement = lodash.last(tags);
    if(lastElement && lastElement.inputValue) {
      const realTags = [...tags];
      lastElement.valeur = lastElement.inputValue;
      setLoading(true);
      post('/api/tags', {valeur: lastElement.valeur})
      .then(insertedTag => {
        realTags[realTags.length - 1] = insertedTag;
        setTags(realTags);
        onChange(realTags);
      })
      .finally(() => setLoading(false))
    } else {
      setTags(tags)
      onChange(tags)
    }
  }

  return (
    <FormControl margin="normal" className={className}>
      <Autocomplete
        id="tags-selector"
        multiple
        loading={loading}
        value={tags}
        onChange={selectTags}
        onInputChange={(event) => event ? setQ(event.target.value) : null}
        options={tagsSuggestions}
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
          return allowCreation ?
            [...options, {valeur: 'Ajouter ' + params.inputValue, inputValue: params.inputValue}] :
            options;
        }}
        renderInput={(params) => (
          <TextField {...params} label={title || "Tags"} variant="outlined" placeholder={title || "Tags"} />
        )}
      />
      {tags && tags.length > 0 ? <></> : <FormHelperText id={"source-helper"}>Sélectionnez un ou plusieurs tags</FormHelperText>}
    </FormControl>
  )

}
