import "./video-thumbnail-list.scss"
import * as React from "react";
import {useState} from "react";
import DialogTitle from "@mui/material/DialogTitle/DialogTitle";
import DialogContent from "@mui/material/DialogContent/DialogContent";
import DialogActions from "@mui/material/DialogActions/DialogActions";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog/Dialog";
import VideoDetail from "./video-detail";
import {RELOAD_RESOURCE_DELAY, RELOAD_RESOURCE_MAX_RETRIES} from "../../utils/const";
import VideoThumbnail from "./video-thumbnail";

export default function VideoThumbnailList({title, videos}) {

  const [detailIndex, setDetailIndex] = useState(-1)
  const [errorsCount, setErrorsCount] = useState({});

  function handleImageError(err) {
    const image = err.currentTarget
    const u = new URL(image.src)
    const src = u.protocol + "//" + u.hostname + u.pathname
    let keepTrying = false;
    let newCounts = {...errorsCount}
    if(src in errorsCount) {
      if(errorsCount[src] < RELOAD_RESOURCE_MAX_RETRIES) {
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
        console.log("Tentative de recharger ", src, " pour la ", newCounts[src], "ème fois")
        image.src = src + "?k=" + Date.now()
      }, RELOAD_RESOURCE_DELAY)
    }
  }
  function renderThumbnail(videoMetadata, index) {
    let from = videoMetadata.from
    let to = videoMetadata.to
    return (<VideoThumbnail 
      name={videoMetadata.name}
      from={from} 
      to={to}
      key={videoMetadata.name + '_' + from + '_' + to}/>)
    /*
    return (
      <img className={"thumbnail" + (videos && videos.length === 1 ? ' alone' : '')} key={"thumbnail-" + index} alt={"Thumbnail of video " + videoMetadata.name +" from " + from + " to " + to +" seconds"}
        onError={err => handleImageError(err)}
        onClick={() => setDetailIndex(index)}
        src={"/kosubs/thumbnail/" + videoMetadata.name + "/" + from + "/" + to + ".jpg"} />
    )*/
  }
  function onChangeVideo(delta) {
    let newIndex = (detailIndex + delta)
    if(newIndex < 0) {
      newIndex = videos.length - 1
    } else if (newIndex >= videos.length) {
      newIndex = 0
    }
    setDetailIndex(newIndex)
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
        <Dialog open={detailIndex >= 0}
                onClose={() => setDetailIndex(-1)}
                fullScreen={true}
                aria-labelledby="video-detail-title">
          <DialogTitle id="video-detail-tiel">Vidéo</DialogTitle>
          <DialogContent>
            <VideoDetail video={videos[detailIndex]}
                         changeVideo={delta => onChangeVideo(delta)}
                         hasMoreVideos={videos.length > 1} 
                         key={detailIndex}/>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailIndex(-1)} color="primary">
              Fermer
            </Button>
          </DialogActions>
        </Dialog>
      </>
       :
      <></>
  )
}
