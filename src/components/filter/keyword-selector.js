import * as React from "react";
import { useState} from "react";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";


export function KeywordSelector({onChange}) {
  const [keyword, setKeyword] = useState('')
  

  function selectQ(event) {
    const newKeyword = event.target.value
    setKeyword(newKeyword)
    onChange(newKeyword)
  }

  return (
    <FormControl margin="normal">
      <TextField id="q" label="Recherche" variant="outlined" value={keyword} onChange={(event) => selectQ(event)}/>
    </FormControl>
  )

}
