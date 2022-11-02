import * as React from "react";
import { useState} from "react";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";


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
