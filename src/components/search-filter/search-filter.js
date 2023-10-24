import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog/Dialog";
import DialogActions from "@mui/material/DialogActions/DialogActions";
import DialogContent from "@mui/material/DialogContent/DialogContent";
import DialogTitle from "@mui/material/DialogTitle/DialogTitle";
import React, { useState } from "react";
import NoteFilter from "../filter/filter";

export const SearchFilter = ({onDone, open}) => {
  const [myFilter, setMyFilter] = useState({})

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
