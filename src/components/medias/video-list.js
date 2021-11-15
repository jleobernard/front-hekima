import "./video-list.scss"
import * as React from "react";
import {useState} from "react";
import {Checkbox, Input} from "@material-ui/core";
import {RELOAD_RESOURCE_DELAY, RELOAD_RESOURCE_MAX_RETRIES} from "../../utils/const";

export default function VideoList({title, videos, editable, onChange, className}) {

  const [errorsCount, setErrorsCount] = useState({});

  function valueChanged(md, fieldName, value, index) {
    md[fieldName] = value
    document.getElementById("video-" + md.key).load()
    if(onChange) {
      onChange(md, index)
    }
  }
  function handleVideoError(err) {
    const video = err.currentTarget
    const source = video.children[0]
    const src = source.src
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
        console.log("Tentative de recharger ", src, " pour la ", newCounts[src], " fois")
        video.load()
      }, RELOAD_RESOURCE_DELAY)
    }
  }
  function renderVideo(videoMetadata, index) {
    let from = Math.floor(videoMetadata.from)
    let to = Math.ceil(videoMetadata.to)
    if(to - from < 2) {
      from = from -1
      to = to + 1
    }
    let src;
    if(editable) {
      src = "/kosubs/" + videoMetadata.name + ".mp4#t=" + from +"," + to
    } else {
      src ="/kosubs/loop/" + videoMetadata.name + "/" + from + "/" + to + ".mp4"
    }
    return (
      <div className={"video " + (videos && videos.length === 1 ? 'alone' : '')} key={videoMetadata.key || index}>
        <video controls loop onError={err => handleVideoError(err)} id={"video-" + videoMetadata.key}>
          <source src={src} type="video/mp4" />
        </video>
        {editable ?
          <div className={"video-controls"}>
            <Input
              value={from} variant="outlined"
              onChange={e => valueChanged(videoMetadata, 'from', e.target.valueAsNumber, index)} type="number"
            />
            <Checkbox checked={videoMetadata.selected} onChange={e => valueChanged(videoMetadata, 'selected', e.target.checked, index)} />
            <Input
              value={to} variant="outlined"
              onChange={e => valueChanged(videoMetadata, 'to', e.target.valueAsNumber, index)} type="number"
            />
          </div>
          :
        <></>}
      </div>
    )
  }

  return (
    videos  && videos.length > 0 ?
      <div className={(className || '') + " videos-container"}>
        <div className="title">{title}</div>
        <div className="videos">
          {(videos || []).map((v, i) => renderVideo(v, i))}
        </div>
      </div> :
      <></>
  )
}
