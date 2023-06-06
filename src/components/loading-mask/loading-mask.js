import * as React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import "./loading-mask.scss";

export default function LoadingMask({loading}) {
  return (
    loading ?
      <div className="loading-pane">
        <CircularProgress />
      </div> : <></>
  );
}

