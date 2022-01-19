import "./subs-text.scss"
import * as React from "react";
import {useEffect, useState} from "react";
import {get} from "../../utils/http";

export default function SubsText({video}) {

  const [texts, setTexts] = useState([])

  useEffect(() => {
    if(video) {
      get(`/api/kosubs/${video.name}/texts`, {from: video.from, to: video.to}).then(setTexts);
    }
  }, [video, video.from, video.to])

  return (
    <div className="video-subs-texts">
      {texts.map((text, i) =>
        (<div className="video-subs-text" key={`subs-text-${i}`} id={`subs-text-${i}`}>{text.text}</div>)
      )}
    </div>
  )
}
