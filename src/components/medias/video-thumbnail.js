import { useEffect, useRef, useState } from "react";
import { getAccessToken } from "services/gcp-service";
import { deleteJob, getJob, getJobUriForVideoClipping } from "services/jobs-services";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";

export default function VideoThumbnail({name, from, to}) {
    const [url, setUrl] = useState('')
    const [listenerSet, setListenerSet] = useState(false)
    const [loading, setLoading] = useState(true)
    const videoRef = useRef(null);
    const bucketName = process.env.REACT_APP_VIDEOS_BUCKET_NAME
    const videosRootUrl = `https://${bucketName}.storage.googleapis.com/videos`
    useEffect(() => {
      async function fetchUrl(){
        const jobUri = getJobUriForVideoClipping(name, from, to)
        const job = await getJob(jobUri)
        if(job) {
          if (job.state === 'OK') {
            await deleteJob(jobUri)
            populateVideoUrl()
          } else {
            setLoading(false)
          }
        } else {
          populateVideoUrl()
        }
      }
      fetchUrl()
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

    async function populateVideoUrl() {
      const accessToken = await getAccessToken()
      setUrl(`${videosRootUrl}/${name}/${name}_${from}_${to}.mp4?access_token=${accessToken}`)
      setLoading(false)
    }
    function renderVideo() {
        return (
          loading ? <CircularProgress /> :
        <video ref={videoRef} src={url} controls id={name+'_'+from+'_'+to}
                preload="metadata" loop={true}>
            <source src={url} type="video/mp4" />
        </video>)
    }
    return url ? 
        renderVideo() :
        <></>
}