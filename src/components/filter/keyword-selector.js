import * as React from "react";
import {useEffect, useMemo, useState} from "react";
import * as lodash from "lodash";
import {debounce} from "lodash";
import {get, post} from "../../utils/http";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Chip from "@material-ui/core/Chip";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";


export function KeywordSelector({onChange}) {
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [keyword, setKeyword] = useState('')
  const [suggestions, setSuggestions] = useState([])
  
  const debounceSearch = useMemo(() => debounce((q)  => {
    setLoading(true)
    const realQ = getLastWord(q);
    get('/api/notes:autocomplete-index', {q: realQ})
        .then(words => setSuggestions(words))
        .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, 500), []);

  useEffect(() => {
    debounceSearch(q)
  },[q])

  function selectQ(event, newValue) {
    const alreadySet = getAllButLastWord(q)
    alreadySet.push(newValue)
    const newKeyword = alreadySet.join(' ')
    setSuggestions([])
    setKeyword(newKeyword)
    onChange(newKeyword)
  }

  function getAllButLastWord(sentence) {
    let all
    if(sentence) {
      all = sentence.trim().split(/\s+/)
      all.pop()
    } else {
      all = []
    }
    return all;
  }

  function getLastWord(q) {
    let lastWord = ''
    if(q) {
      lastWord = lodash.last(q.trim().split(/\s+/))
    }
    return lastWord;
  }

  return (
    <FormControl margin="normal">
        <Autocomplete
          id="q"
          loading={loading}
          value={keyword}
          onChange={selectQ}
          onInputChange={(event) => event ? setQ(event.target.value) : null}
          options={suggestions}
          getOptionLabel={label => label}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => (
              <Chip
                label={option}
                {...getTagProps({ index })}
              />
            ))
          }
          filterOptions={(options) => options }
          renderInput={(params) => (
            <TextField {...params} label="Mot-clef" variant="outlined" placeholder="Mot-clef" />
          )}
        />
      </FormControl>
  )

}
