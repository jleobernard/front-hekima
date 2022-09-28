import React, {useState, useEffect} from "react";
import { useSelector, useDispatch } from 'react-redux';
import {
  selectFilter} from '../../store/features/notesSlice';
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog/Dialog";
import NoteFilter from "../filter/filter";

export const SearchFilter = ({onDone, open}) => {
  
  const globalFilter = useSelector(selectFilter)
  const [myFilter, setMyFilter] = useState({})

  useEffect(() => {
    setMyFilter(globalFilter)
  }, [globalFilter])

  function reinit() {
    setMyFilter({source:null, tags: [], q: ""})
    onDone({})
  }

  function onFilterChanged(event) {
    setMyFilter(event)
  }

  function closeFilter(save) {
    const _filter = save ? myFilter : {}
    onDone(_filter)
  }

  function handleSubmit() {
    onDone(myFilter)
  }

  return (
    <Dialog open={open}
            onClose={() => closeFilter(false)}
            fullScreen={true}
            aria-labelledby="search-filter-dialog">
      <DialogTitle id="search-filter-dialog">Rechercher</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} className="form">
          <NoteFilter filter={myFilter}
                      onFilterChanged={onFilterChanged}
                      allowCreation={false}
                      withFTS={true}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => closeFilter(false)} color="primary">
          Annuler
        </Button>
        <Button onClick={reinit} color="primary">
          Réinitialiser
        </Button>
        <Button onClick={() => closeFilter(true)} color="primary">
          Valider
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SearchFilter;
