import "./video-list.scss"
import * as React from "react";
import {useEffect, useState} from "react";
import {Chip, IconButton, Input} from "@material-ui/core";
import {RELOAD_RESOURCE_DELAY, RELOAD_RESOURCE_MAX_RETRIES} from "../../utils/const";
import {Add, ArrowBack, ArrowForward, PlaylistAdd, Remove} from "@material-ui/icons";

export default function VideoList({title, videos, editable, onChange, className}) {

  const [errorsCount, setErrorsCount] = useState({});
  const [index, setIndex] = useState(0);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if(videos && videos.length > 0) {
      const md = videos[getRealIndex()]
      setTimeout(() => {
        const video = document.getElementById("video-" + md.key)
        if (video) {
          video.load()
        }
      }, 200)
    }
  }, [index, videos, version])

  function valueChanged(md, fieldName, value) {
    md[fieldName] = value
    document.getElementById("video-" + md.key).load()
    if(onChange) {
      onChange(md, index)
    }
    if(fieldName === "to" || fieldName === "from") {
      setVersion(version + 1)
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
        //console.log("Tentative de recharger ", src, " pour la ", newCounts[src], " fois")
        video.load()
      }, RELOAD_RESOURCE_DELAY)
    }
  }
  function getRealIndex() {
    if(index >= videos.length) {
      return  videos.length - 1
    } else if(index < 0) {
      return 0;
    }
    return index
  }

  function changeVideo(delta) {
    let newIndex = index + delta
    if(newIndex >= videos.length) {
      newIndex = 0
    } else if(index < 0) {
      newIndex = videos.length - 1;
    }
    setIndex(newIndex)
  }

  function renderVideo() {
    if(!videos) {
      return (<></>)
    }
    const realIndex = getRealIndex()
    const videoMetadata = (videos[realIndex])
    console.log(videoMetadata)
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
      <div className={"video " + (videos && videos.length === 1 ? 'alone' : '')}>
        <video controls loop onError={err => handleVideoError(err)} id={"video-" + videoMetadata.key}>
          <source src={src} type="video/mp4" />
        </video>
        {editable ?
          <div className={"video-controls"}>
            <div className={"video-controls-line"}>
              <div className={"video-bound"}>
                <IconButton onClick={() => valueChanged(videoMetadata, 'from', from - 1)} className="icon">
                  <Remove />
                </IconButton>
                <div className={"video-bound-value"}>{from}</div>
                <IconButton onClick={() => valueChanged(videoMetadata, 'from', from + 1)} className="icon">
                  <Add />
                </IconButton>
              </div>
              {videoMetadata.selected ?
                <IconButton aria-label="remove" onClick={() => valueChanged(videoMetadata, 'selected', false)} className="icon">
                  <Remove />
                </IconButton>
                :
                <IconButton aria-label="add" onClick={() => valueChanged(videoMetadata, 'selected', true)} className="icon">
                  <PlaylistAdd />
                </IconButton>
              }
              <div className={"video-bound"}>
                <IconButton onClick={() => valueChanged(videoMetadata, 'to', to - 1)} className="icon">
                  <Remove />
                </IconButton>
                <div className={"video-bound-value"}>{to}</div>
                <IconButton onClick={() => valueChanged(videoMetadata, 'to', to + 1)} className="icon">
                  <Add />
                </IconButton>
              </div>
            </div>
            <div className={"video-controls-line"}>
              <IconButton aria-label="previous"
                          onClick={() => changeVideo(-1)}
                          className="icon">
                <ArrowBack />
              </IconButton>
              <Chip label={(index + 1) + ' / ' + videos.length} />
              <IconButton aria-label="previous"
                          onClick={() => changeVideo(+1)}
                          className="icon">
                <ArrowForward />
              </IconButton>
            </div>
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
        { renderVideo() }
      </div> :
      <></>
  )
}
