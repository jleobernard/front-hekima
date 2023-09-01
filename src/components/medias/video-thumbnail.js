import { useEffect, useRef, useState } from "react";

export default function VideoThumbnail({name, from, to}) {
    const [url, setUrl] = useState('')
    const [listenerSet, setListenerSet] = useState(false)
    const videoRef = useRef(null);
    useEffect(() => {
        fetch(process.env.REACT_APP_URL_SIGNER_URL,{
            method: "POST",
            redirect: 'manual',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                action: 'read-video',
                fileName: name
            })
          }).then(async response => {
            if(response.ok) {
              response.json().then(signResponse => {
                const {status, url: urls} = signResponse
                if(status === 'ok' && urls && urls.length > 0) {
                  setUrl(urls[0])
                }
              })
            }
        }).catch(err => console.error(err))
    }, [name])
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
    function renderVideo() {
        return (
        <video ref={videoRef} src={url} controls id={name+'_'+from+'_'+to}
                preload="metadata">
            <source src={url} type="video/webm" />
        </video>)
    }
    return url ? 
        renderVideo() :
        <></>
}