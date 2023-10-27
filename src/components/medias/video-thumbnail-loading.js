import { RefreshOutlined } from "@mui/icons-material";
import { CircularProgress, IconButton } from "@mui/material";
import './video-thumbnail-state.scss'
import { clipVideo } from "services/video-service";

export default function VideoThumbnailLoading({name, from, to, onreload}) {
  async function reloadVideo() {
     await clipVideo(name, from, to)
     onreload()
  }
  return (<div className="video-thumbnail-state video-thumbnail-ko">
    <CircularProgress />
    <div className="reason">Traitement...</div>
    <IconButton
          component="span"
          onClick={() => reloadVideo()}
          size="large">
          <RefreshOutlined/>
        </IconButton>
  </div>);
}