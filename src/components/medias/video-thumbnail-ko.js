import { RefreshOutlined } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import './video-thumbnail-state.scss'
import { clipVideo } from "services/video-service";

export default function VideoThumbnailKO({name, from, to, onreload}) {
  async function reloadVideo() {
     await clipVideo(name, from, to)
     onreload()
  }
    return (<div className="video-thumbnail-state video-thumbnail-ko">
      <div className="reason">Erreur</div>
      <IconButton
            component="span"
            onClick={() => reloadVideo()}
            size="large">
            <RefreshOutlined/>
          </IconButton>
    </div>);
}