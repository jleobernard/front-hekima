import {IconButton} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import {useEffect, useRef, useState} from "react";
import "./note-files.scss"
import {constant, findIndex, times} from "lodash";
import CloseIcon from "@material-ui/icons/Close";
import ZoomOutMapIcon from "@material-ui/icons/ZoomOutMap";

export const NoteFileFullscreen = ({note, file, onClose}) => {

  const [myIdx, setMyIdx] = useState(-1)
  const [openedFile, setOpenedFile] = useState(null)

  useEffect(() => {
    if(file) {
      const files = note.files
      const idx = findIndex(files, {file_id: file.file_id})
      if (idx >= 0) {
        const newIdx = Math.max(0, Math.min(files.length - 1, idx))
        if (myIdx !== newIdx) {
          setMyIdx(newIdx)
          openFile(files[newIdx])
        }
      } else {
        setOpenedFile(null)
        setMyIdx(-1)
      }
    } else {
      setMyIdx(-1)
      setOpenedFile(null)
    }
  },[file])

  function closeFile() {
    setOpenedFile(null)
    const elements = document.getElementsByTagName('body');
    for(let i = 0; i < elements.length;i++) {
      const elt = elements[i]
      elt.classList.remove("unscrollable")
    }
    onClose()
  }

  function openFile(file) {
    setOpenedFile(file)
    const elements = document.getElementsByTagName('body');
    for(let i = 0; i < elements.length;i++) {
      const elt = elements[i]
      elt.classList.add("unscrollable")
    }
  }

  function renderOpenedFile() {
    if(openedFile) {
      return (<div className="zoomed-picture" onClick={closeFile}>
        <img src={"/api/notes/" + note.uri + "/files/" + openedFile.file_id} alt={openedFile.file_id} onClick={e => e.stopPropagation()}/>
        <IconButton aria-label="zoom-picture-close" onClick={closeFile} className="icon">
          <CloseIcon />
        </IconButton>
      </div>)
    } else {
      return <></>
    }
  }

  return renderOpenedFile()
}
