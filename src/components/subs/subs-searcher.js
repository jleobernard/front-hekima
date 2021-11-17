import VideoList from "../medias/video-list";
import FormControl from "@material-ui/core/FormControl";
import {CircularProgress, InputAdornment, TextField} from "@material-ui/core";
import * as React from "react";
import {useEffect, useMemo, useState} from "react";
import {get} from "../../utils/http";
import {getKey} from "../../utils/keys";
import {debounce} from "lodash";
import {Autocomplete} from "@material-ui/lab";
import SearchIcon from "@material-ui/icons/Search";
import {SUBS_MIN_DOWNGRADABLE, SUBS_MIN_SIM_DEFAULT, SUBS_SIM_STEP} from "../../utils/const";
import Button from "@material-ui/core/Button";

export default function SubsSearcher({onVideoSelected, className}) {
  const [searchSubs, setSearchSubs] = useState('')
  const [autocompleting, setAutocompleting] = useState(false)
  const [subs, setSubs] = useState([])
  const [subsOptions, setSubsOptions] = useState([])
  const [searchingSubs, setSearchingSubs] = useState(false)
  const [open, setOpen] = useState(false)
  const [minSim, setMinSim] = useState(SUBS_MIN_SIM_DEFAULT)
  const [maxSim, setMaxSim] = useState(1.)
  const [canSeeDowngraded, setCanSeeDowngraded] = useState(false)
  const seed = Date.now()

  const debouncedAutocomplete = useMemo(() => debounce((q)  => {
    setAutocompleting(true)
    get('/api/kosubs:autocomplete', {q: q, seed: String(seed)}, false)
    .then(hints => {
      setSubsOptions(hints)
    }).finally(() => setAutocompleting(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, 500), []);

  useEffect(() => {
    debouncedAutocomplete('')
  }, [])
  useEffect(() => {
    if(searchSubs) {
      doSearchSubs(searchSubs)
    }
  }, [minSim, maxSim])

  function doSearchSubs(q) {
    setOpen(false)
    setSearchingSubs(true)
    get('/api/kosubs', {q, minSim, maxSim, exclMax: maxSim < 1})
    .then(results => {
      setSubs((results || []).map(r => ({...r, selected: false, key: getKey("subs")})))
      setCanSeeDowngraded((minSim - SUBS_SIM_STEP) >= SUBS_MIN_DOWNGRADABLE)
    })
    .finally(() => setSearchingSubs(false))
  }

  function onSubChanged(sub, idx) {
    if(sub.selected) {
      onVideoSelected(sub)
      const newSubs = [...subs]
      newSubs.splice(idx, 1)
      setSubs(newSubs)
    }
  }
  function inputSearchChanged(q) {
    if(q !== searchSubs) {
      setMinSim(SUBS_MIN_SIM_DEFAULT)
      setMaxSim(1)
      setSearchSubs(q)
      setCanSeeDowngraded(false)
      debouncedAutocomplete(q)
    }
  }

  function downgradeQuality() {
    setMaxSim(minSim)
    setMinSim(minSim - SUBS_SIM_STEP)
  }

  return (
    <div className={className + " subs-searcher"}>
      <FormControl fullWidth={true}>
        <Autocomplete id="search-subs"
          open={open}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          selectOnFocus={true} handleHomeEndKeys={true} freeSolo={true}
          loading={autocompleting}
          value={searchSubs}
          defaultValue=''
          onChange={(e) => doSearchSubs(e.target.value)}
          options={subsOptions}
          getOptionLabel={i => i || ''}
          getOptionSelected={(option, value) => option === value}
          renderInput={(params) => (
            <TextField {...params} label="Recherche sous-titres" InputProps={{
              ...params.InputProps,
              endAdornment: (
                searchSubs ? <>
                  <InputAdornment position="end">
                    {searchingSubs ? <CircularProgress /> : <SearchIcon onClick={() => doSearchSubs(searchSubs)}/>}
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </> : <></>
              )
            }}/>
          )}
          noOptionsText="Aucune suggestion"
          onInputChange={e => e ? inputSearchChanged(e.target.value) : null}
        />
        {canSeeDowngraded ? <Button className="with-margin-top with-margin-bottom downgraded-button" onClick={() => downgradeQuality()}>Voir des résultats moins bons</Button> : <></>}
      </FormControl>
      <VideoList key={"suggested-subs"} title={"Résultats"} videos={subs} editable={true} onChange={(sub, idx) => onSubChanged(sub, idx)}/>
    </div>
  )
}