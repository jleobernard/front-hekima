import "./video-list.scss"
import * as React from "react";
import {Checkbox, Input} from "@material-ui/core";

export default function VideoList({title, videos, editable, onChange}) {

  function valueChanged(md, fieldName, value) {
    md[fieldName] = value
    if(onChange) {
      onChange(md)
    }
  }
  function renderVideo(videoMetadata, index) {
    return (
      <div className="video" key={videoMetadata.key || index}>
        <video controls>
          <source src={"/kosubs/" + videoMetadata.name + "#t=" + Math.floor(videoMetadata.from) +"," + Math.ceil(videoMetadata.to)} type="video/mp4" />
        </video>
        {editable ?
          <div>
            <Input
              value={videoMetadata.from} variant="outlined"
              onChange={e => valueChanged(videoMetadata, 'from', e.target.valueAsNumber)} type="number"
            />
            <Checkbox checked={videoMetadata.selected} onChange={e => valueChanged(videoMetadata, 'selected', e.target.checked)} />
            <Input
              value={videoMetadata.to} variant="outlined"
              onChange={e => valueChanged(videoMetadata, 'to', e.target.valueAsNumber)} type="number"
            />
          </div>
          :
        <></>}
      </div>
    )
  }

  return (
    videos  && videos.length > 0 ?
      <div className="videos-container">
        <div className="title">{title}</div>
        <div className="videos">
          {(videos || []).map((v, i) => renderVideo(v, i))}
        </div>
      </div> :
      <></>
  )
}
