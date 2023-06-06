import VideoList from "../medias/video-list";
import FormControl from "@mui/material/FormControl";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  InputAdornment,
  TextField
} from "@mui/material";
import * as React from "react";
import {useEffect, useMemo, useState} from "react";
import {get} from "../../utils/http";
import {getKey} from "../../utils/keys";
import {debounce} from "lodash";
import { Autocomplete } from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import {SUBS_MIN_DOWNGRADABLE, SUBS_MIN_SIM_DEFAULT, SUBS_SIM_STEP} from "../../utils/const";
import Button from "@mui/material/Button";

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
  const [searchMode, setSearchMode] = useState(false)
  const [exact, setExact] = useState(false)
  const seed = Date.now()

  const debouncedAutocomplete = useMemo(() => debounce((q)  => {
    setAutocompleting(true)
    get('/api/kosubs:autocomplete', {q: q, seed: String(seed)})
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
  }, [minSim, maxSim, exact])

  function doSearchSubs(q) {
    setOpen(false)
    setSearchingSubs(true)
    get('/api/kosubs', {q, exact, minSim, maxSim, exclMax: maxSim < 1})
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

  function renderDialog() {
    return (
      <Dialog open={searchMode}
              onClose={() => setSearchMode(false)}
              fullScreen={true}>
        <DialogContent>
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
                          isOptionEqualToValue={(option, value) => option === value}
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
            <Button className="with-margin-top with-margin-bottom exact-search-button" onClick={() => setExact(!exact)}>Recherche
              {exact ? ' floue' : ' exacte'}</Button>
          </FormControl>
          <VideoList key={"suggested-subs"} title={""} videos={subs} editable={true}
                     onChange={(sub, idx) => onSubChanged(sub, idx)} withTexts={true}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchMode(false)} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  function startSearchSubs() {
    setSearchSubs("")
    setSearchMode(true)
    setSubs([])
  }

  return (
    <div className={className + " subs-searcher"}>
      <Button onClick={() => startSearchSubs(true)} className="centered" variant="outlined">Rechercher des sous-sitres</Button>
      {renderDialog()}
    </div>
  )
}
