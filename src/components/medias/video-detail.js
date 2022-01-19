import "./video-detail.scss"
import * as React from "react";
import {FormControl, InputLabel, MenuItem, Select} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import {ArrowForward} from "@material-ui/icons";
import SubsText from "./subs-text";

export default function VideoDetail({video, hasMoreVideos, changeVideo}) {

  function setPlayback(playback) {
      if(video) {
        document.getElementById('video-detail').playbackRate = playback
      }
    }

  if(!video) {
    return <></>
  }
  const src ="/kosubs/loop/" + video.name + "/" + video.from + "/" + video.to + ".mp4"
  setTimeout(() => document.getElementById('video-detail').load(), 300)
  return (
    <div className="video-detail-container">
      <video controls loop className={"video-detail"} autoPlay={true} id="video-detail">
          <source src={src} type="video/mp4" />
      </video>
      <div className="controls">
        <FormControl fullWidth>
          <InputLabel id="playback-rate-label">Vitesse</InputLabel>
          <Select
            labelId="playback-rate-label"
            id="video-detail-playback-rate"
            label="Vitesse"
            autoWidth={true}
            className="centered"
            onChange={e => setPlayback(e.target.value)}>
            <MenuItem value={0.25}><sup>1</sup>/<sub>4</sub></MenuItem>
            <MenuItem value={0.5}><sup>1</sup>/<sub>2</sub></MenuItem>
            <MenuItem value={1} selected>1</MenuItem>
          </Select>
        </FormControl>
      </div>
      {hasMoreVideos ? <div className="navigation with-margin-top">
        <ArrowBackIcon className={hasMoreVideos ? '' : 'invisible'} onClick={() => changeVideo(-1)}/>
        <ArrowForward className={hasMoreVideos ? '' : 'invisible'} onClick={() => changeVideo(1)} />
      </div>: <></>}
      <SubsText video={video} />
    </div>
  )
}
