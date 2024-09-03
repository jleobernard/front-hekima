import "./subs-text.scss"
import * as React from "react";
import {useEffect, useState} from "react";
import { getSubs } from "services/ksubs-service";

export default function SubsText({video}) {

  const [texts, setTexts] = useState([])

  useEffect(() => {
    if(video) {
      getSubs(video.name, video.from, video.to).then(setTexts);
    }
  }, [video, video.from, video.to])

  return (
    <div className="video-subs-texts">
      {texts.map((text, i) =>
        (<div className="video-subs-text" key={`subs-text-${i}`} id={`subs-text-${i}`}>{text}</div>)
      )}
    </div>
  )
}
