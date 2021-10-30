import "./video-thumbnail-list.scss"
import * as React from "react";
import {useState} from "react";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog/Dialog";
import VideoDetail from "./video-detail";

export default function VideoThumbnailList({title, videos}) {

  const [detail, setDetail] = useState({})
  const [errorsCount, setErrorsCount] = useState({});

  function handleImageError(err) {
    const image = err.currentTarget
    const u = new URL(image.src)
    const src = u.protocol + "//" + u.hostname + u.pathname
    let keepTrying = false;
    let newCounts = {...errorsCount}
    if(src in errorsCount) {
      if(errorsCount[src] < 10) {
        newCounts[src] = newCounts[src] + 1
        keepTrying = true
      }
    } else {
      keepTrying = true
      newCounts[src] = 1
    }
    if(keepTrying) {
      setErrorsCount(newCounts)
      setTimeout(() => {
        console.log("Tentative de recharger ", src, " pour la ", newCounts[src], " fois")
        image.src = src + "?k=" + Date.now()
      }, 1000)
    }
  }
  function showVideo(videoMetadata) {
    setDetail(videoMetadata)
  }
  function renderThumbnail(videoMetadata, index) {
    let from = videoMetadata.from
    let to = videoMetadata.to
    return (
      <img className="thumbnail" key={"thumbnail-" + index} alt={"Thumbnail of video " + videoMetadata.name +" from " + from + " to " + to +" seconds"}
        onError={err => handleImageError(err)}
        onClick={() => showVideo(videoMetadata)}
        src={"/kosubs/thumbnail/" + videoMetadata.name + "/" + from + "/" + to + ".jpg"} />
    )
  }

  return (
    videos  && videos.length > 0 ?
      <>
        <div className="thumbnails-container">
          <div className="title">{title}</div>
          <div className="thumbnails">
            {(videos || []).map((v, i) => renderThumbnail(v, i))}
          </div>
        </div>
        <Dialog open={detail && detail.name}
                onClose={() => setDetail({})}
                fullScreen={true}
                aria-labelledby="video-detail-title">
          <DialogTitle id="video-detail-tiel">Vidéo</DialogTitle>
          <DialogContent>
            <VideoDetail video={detail} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetail({})} color="primary">
              Fermer
            </Button>
          </DialogActions>
        </Dialog>
      </>
       :
      <></>
  )
}
