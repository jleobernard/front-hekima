import * as React from "react";
import Snackbar from '@mui/material/Snackbar';
import IconButton from "@mui/material/IconButton";
import CloseIcon from '@mui/icons-material/Close';
import {getNls} from "../utils/nls";
import Alert from '@mui/material/Alert';
import { useSelector, useDispatch } from 'react-redux';
import { selectLevel, selectMessage } from "../store/features/notificationsSlice";

function Toaster(props) {
  const [open, setOpen] = React.useState(false);
  const level = useSelector(selectLevel)
  const message = useSelector(selectMessage)

  React.useEffect(() => {
    setOpen(true)
  }, [props.error]);

  function getError(error) {
    let nlsError = error && error.code ? getNls(error.code, error.params) : getNls(error);
    const nlsed = nlsError || error;
    if(!nlsed || typeof(nlsed) !== 'string') {
      console.trace("Error while accessing " + error);
      return "";
    }
    return nlsed;
  }
  function handleClose() {
    setOpen(false)
  }
  return (
    message ?
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      open={open && message}
      autoHideDuration={4000}
      onClose={handleClose}>
        <Alert severity={level || "error"}>
          {getError(message)}
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Alert>
    </Snackbar> : ''
  );
}

export default Toaster;
