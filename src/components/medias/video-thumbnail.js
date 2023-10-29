import { useEffect, useRef, useState } from "react";
import { deleteJob, getJob, getJobUriForVideoClipping } from "services/jobs-services";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import VideoThumbnailKO from "./video-thumbnail-ko";
import VideoThumbnailLoading from "./video-thumbnail-loading";

export default function VideoThumbnail({name, from, to}) {
    const [url, setUrl] = useState('')
    const [listenerSet, setListenerSet] = useState(false)
    const [loading, setLoading] = useState(true)
    const [state, setState] = useState('NA')
    const videoRef = useRef(null);
    const videosRootUrl = process.env.REACT_APP_VIDEOS_DOWNLOADER_SERVICE_URL
    useEffect(() => {
      loadComponent()
    }, [name, from, to])
    useEffect(() => {
        if(videoRef === null) {

        } else if(listenerSet){
            console.log('Setting video handler for ', name, from, to)
            setListenerSet(true)
            const video = videoRef.current;
            const handleTimeUpdate = () => {
                if (video.currentTime < from || video.currentTime >= to) {
                  video.currentTime = from; // Jump back to the loop start point
                }
              };
              video.addEventListener('timeupdate', handleTimeUpdate);
          
              return () => {
                video.removeEventListener('timeupdate', handleTimeUpdate);
              };
        }
    }, [videoRef])

    async function loadComponent() {
      const jobUri = getJobUriForVideoClipping(name, from, to)
      const job = await getJob(jobUri)
      setState(job ? job.state : 'NA')
      if(job) {
        if (job.state === 'OK') {
          await deleteJob(jobUri)
          populateVideoUrl()
          setLoading(false)
          setState('OK')
        } else {
          setLoading(false)
        }
      } else {
        populateVideoUrl()
        setState('OK')
        setLoading(false)
      }
    }

    async function populateVideoUrl() {
      setUrl(`${videosRootUrl}/${name}_${from}_${to}.mp4`)
    }
    function renderVideo() {
        return (
          loading ? <CircularProgress /> :
        <video ref={videoRef} src={url} controls id={name+'_'+from+'_'+to}
                preload="metadata" loop={true}>
            <source src={url} type="video/mp4" />
        </video>)
    }

    let content;
    switch(state) {
      case 'LOADING':
      case 'SENT':
        content = <VideoThumbnailLoading name={name} from={from} to={to} reload={() => loadComponent()}/>
        break;
      case 'OK':
        content = renderVideo()
        break;
      case 'KO':
        content = <VideoThumbnailKO name={name} from={from} to={to} reload={() => loadComponent()}/>
        break;
      case 'NA':
      default:
        content = <></>
    }
    return content;
}