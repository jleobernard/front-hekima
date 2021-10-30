import "./video-detail.scss"
import * as React from "react";


export default function VideoDetail({video}) {
  const src ="/kosubs/loop/" + video.name + "/" + video.from + "/" + video.to + ".mp4"
    return (
      <video controls loop className={"video-detail"} autoPlay={true}>
          <source src={src} type="video/mp4" />
        </video>
  )
}
