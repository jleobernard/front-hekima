import * as React from "react";
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from '@material-ui/icons/Close';
import {getNls} from "../utils/nls";
import Alert from "@material-ui/lab/Alert";

function Toaster(props) {
  const [open, setOpen] = React.useState(false);
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
    props.error ?
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      open={open && props.error}
      autoHideDuration={4000}
      onClose={handleClose}>
        <Alert severity={props.severity || "error"}>
          {getError(props.error)}
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Alert>
    </Snackbar> : ''
  );
}

export default Toaster;
