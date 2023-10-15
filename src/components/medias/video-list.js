import "./video-list.scss"
import * as React from "react";
import * as lodash from 'lodash';
import {useEffect, useState} from "react";
import {Chip, IconButton} from "@mui/material";
import {RELOAD_RESOURCE_DELAY, RELOAD_RESOURCE_MAX_RETRIES} from "../../utils/const";
import {Add, ArrowBack, ArrowForward, PlaylistAdd, Remove} from "@mui/icons-material";
import SubsText from "./subs-text";
import { getAccessToken } from "services/gcp-service";
import { clipVideo } from "services/video-service";

export default function VideoList({title, videos, editable, onChange, className, withTexts}) {

  const [errorsCount, setErrorsCount] = useState({});
  const [index, setIndex] = useState(0);
  const [browseIndex, setBrowseIndex] = useState([]);
  const [version, setVersion] = useState(0);
  const [groups, setGroups] = useState([])
  const [accessToken, setAccessToken] = useState('')
  const [videoSource, setVideoSource] = useState('');

  const bucketName = process.env.REACT_APP_VIDEOS_BUCKET_NAME
  const videosRootUrl = `https://${bucketName}.storage.googleapis.com/videos`


  useEffect(() => {
    if(videos && videos.length > 0) {
      const _groups = videos.reduce((previous, current) => {
        const group = previous[current.name] || {name: current.name, count: 0, selected: true};
        group.count += 1
        previous[current.name] = group
        return previous
      }, {});
      const newGroups = lodash.sortBy(Object.keys(_groups).map(k => _groups[k]), ["name"])
      if(groups.length > 0) {
        // We need to keep track of the selection
        groups.forEach(oldGroup => {
          const newGroup = _groups[oldGroup.name]
          if (newGroup) {
            newGroup.selected = oldGroup.selected
          }
        })
        // We need to stay on the same video
        setIndexToSameVideo(newGroups)
      }
      setGroups(newGroups)
    }
  }, [videos, version])

  useEffect(() => {
    setBrowseIndex(computeBrowseIndex(groups))
  }, [groups, videos])

  useEffect(() => {
    loadVideo()
  }, [index, browseIndex])

  useEffect(()  => {
    getAccessToken().then(token => setAccessToken(token))
  }, [])

  function handleTimeUpdate(event, from, to) {
    const videoElt = event.currentTarget
    const currentTime = videoElt.currentTime
    if(currentTime < from || currentTime > to) {
      videoElt.currentTime = from;
    }
  }


  function setIndexToSameVideo(newGroups, indexToKeep) {
    let tryIndex;
    if(indexToKeep === null || typeof(indexToKeep) === "undefined") {
      tryIndex = index
    } else {
      tryIndex = indexToKeep
    }
    const currentIndex = browseIndex[tryIndex]
    const newIndices = computeBrowseIndex(newGroups)
    let newIndex = newIndices.indexOf(currentIndex)
    if(newIndex < 0 && browseIndex.length > 1) {
      // We go back to the previous video
      if(tryIndex <= 0) {
        tryIndex = browseIndex.length - 1
      } else {
        tryIndex = tryIndex - 1
      }
      setIndexToSameVideo(newGroups, tryIndex)
    }  else {
      setIndex(newIndex > 0 ? newIndex : 0)
    }
  }

  function computeBrowseIndex(groups) {
    const selectedGroups = groups.filter(g => g.selected).map(g => g.name)
    const filteredAndSortedVideos = lodash.sortBy(
      videos.filter(v => selectedGroups.indexOf(v.name) >= 0)
      , ["name", "from", "to"])
    return filteredAndSortedVideos.map(v => videos.indexOf(v)).filter(idx => idx >= 0)
  }

  function loadVideo() {
    if(browseIndex && browseIndex.length > 0) {
      const md = videos[getRealIndex()]
      setTimeout(() => {
        const video = document.getElementById("video-" + md.key)
        if (video) {
          video.load()
        }
      }, 200)
    }
  }

  function valueChanged(md, fieldName, value) {
    md[fieldName] = value
    const element = document.getElementById("video-" + md.key)
    if(element) {
      element.load()
    }
    if(onChange) {
      onChange(md, getRealIndex())
    }
    if(fieldName === "to" || fieldName === "from") {
      setVersion(version + 1)
    }
    if('selected' === fieldName && value) {
      const realIndex = getRealIndex()
      const videoMetadata = (videos[realIndex])
      let from = Math.floor(videoMetadata.from)
      let to = Math.ceil(videoMetadata.to)
      clipVideo(videoMetadata.name, from, to)
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
        if(video) {
          video.load()
        }
      }, RELOAD_RESOURCE_DELAY)
    }
  }
  function getRealIndex() {
    let indexInBrowsableIndex;
    if(index >= browseIndex.length) {
      indexInBrowsableIndex =  browseIndex.length - 1
    } else if(index < 0) {
      indexInBrowsableIndex = 0;
    } else {
      indexInBrowsableIndex = index
    }
    return browseIndex[indexInBrowsableIndex]
  }

  function changeVideo(delta) {
    let newIndex = index + delta
    if(newIndex >= browseIndex.length) {
      newIndex = 0
    } else if(index < 0) {
      newIndex = browseIndex.length - 1;
    }
    setIndex(newIndex)
  }

  function toggleGroup(group) {
    const newGroups = groups.map(g => {
      if(g.name === group.name) {
        g.selected = !g.selected
      }
      return g
    })
    setIndexToSameVideo(newGroups)
    setGroups(newGroups);
  }

  function renderVideo() {
    if(!videos) {
      return (<></>)
    }
    const realIndex = getRealIndex()
    const videoMetadata = (videos[realIndex])
    if(!videoMetadata) {
      return (<></>)
    }
    let from = Math.floor(videoMetadata.from)
    let to = Math.ceil(videoMetadata.to)
    if(to - from < 2) {
      from = from -1
      to = to + 1
    }
    if(videoMetadata.from !== from ||
      videoMetadata.to !== to) {
      valueChanged(videoMetadata, 'from', from)
      valueChanged(videoMetadata, 'to', to)
      return (<></>)
    }
    return (
      <div className={"video " + (browseIndex && browseIndex.length === 1 ? 'alone' : '')}>
        <video controls preload="metadata"
          src={`${videosRootUrl}/${videoMetadata.name}/${videoMetadata.name}.mp4?access_token=${accessToken}#t=${from},${to}`}
          onError={err => handleVideoError(err)} 
          id={"video-" + videoMetadata.key}
          onTimeUpdate={e => handleTimeUpdate(e, from, to)}
        >
          <source src={videoSource} type="video/mp4" />
        </video>
        {editable ?
          <div className={"video-controls"}>
            <div className={"video-controls-line"}>
              <div className={"video-bound"}>
                <IconButton
                  onClick={() => valueChanged(videoMetadata, 'from', from - 1)}
                  className="icon"
                  size="large">
                  <Remove />
                </IconButton>
                <div className={"video-bound-value"}>{from}</div>
                <IconButton
                  onClick={() => valueChanged(videoMetadata, 'from', from + 1)}
                  className="icon"
                  size="large">
                  <Add />
                </IconButton>
              </div>
              {videoMetadata.selected ?
                <IconButton
                  aria-label="remove"
                  onClick={() => valueChanged(videoMetadata, 'selected', false)}
                  className="icon"
                  size="large">
                  <Remove />
                </IconButton>
                :
                <IconButton
                  aria-label="add"
                  onClick={() => valueChanged(videoMetadata, 'selected', true)}
                  className="icon"
                  size="large">
                  <PlaylistAdd />
                </IconButton>
              }
              <div className={"video-bound"}>
                <IconButton
                  onClick={() => valueChanged(videoMetadata, 'to', to - 1)}
                  className="icon"
                  size="large">
                  <Remove />
                </IconButton>
                <div className={"video-bound-value"}>{to}</div>
                <IconButton
                  onClick={() => valueChanged(videoMetadata, 'to', to + 1)}
                  className="icon"
                  size="large">
                  <Add />
                </IconButton>
              </div>
            </div>
            <div className={"video-name"}>
              {videoMetadata.name}
            </div>
            <div className={"video-controls-line"}>
              <IconButton
                aria-label="previous"
                onClick={() => changeVideo(-1)}
                className="icon"
                size="large">
                <ArrowBack />
              </IconButton>
              <Chip label={(index + 1) + ' / ' + browseIndex.length} />
              <IconButton
                aria-label="previous"
                onClick={() => changeVideo(+1)}
                className="icon"
                size="large">
                <ArrowForward />
              </IconButton>
            </div>
            <div className="video-groups">
              {groups.map(group => <Chip className={"video-group " + (group.selected ? "selected" : "")}
                                         index={`group-${group.name}`}
                                         label={`${group.name} (${group.count})`}
                                         onClick={() => toggleGroup(group)}/>)}
            </div>
          </div>
          :
        <></>}
        {withTexts ? <SubsText video={videoMetadata}/> : <></>}
      </div>
    );
  }

  return (
    browseIndex  && browseIndex.length > 0 ?
      <div className={(className || '') + " videos-container"}>
        <div className="title">{title}</div>
        { renderVideo() }
      </div> :
      <></>
  )
}
