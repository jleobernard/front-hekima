import CloseIcon from '@material-ui/icons/Close';
import {IconButton} from "@material-ui/core";
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import {useState} from "react";

export const NoteFilesDisplay = ({note}) => {

  const [openedFile, setOpenedFile] = useState(null)

  function closeFile() {
    setOpenedFile(null)
    const elements = document.getElementsByTagName('body');
    for(let i = 0; i < elements.length;i++) {
      const elt = elements[i]
      elt.classList.remove("unscrollable")
    }
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
      return (<div className="zoomed-picture">
        <img src={"/api/notes/" + note.uri + "/files/" + openedFile.file_id} alt={openedFile.file_id}/>
        <IconButton aria-label="zoom-picture-close" onClick={closeFile} className="note-image-zoom">
          <CloseIcon />
        </IconButton>
      </div>)
    } else {
      return <></>
    }
  }

  function renderFile(file) {
    return (<div className="note-image">
      <img key={file.file_id} src={"/api/notes/" + note.uri + "/files/" + file.file_id} alt={file.file_id}/>
      <IconButton aria-label="zoom" onClick={() => openFile(file)} className="note-image-zoom">
        <ZoomOutMapIcon />
      </IconButton>
    </div>)
  }

  if(note.files && note.files.length > 0) {
    return (<div className={"note-files " + (note.files.length == 1 ? "unique" : "multiple")}>
      {note.files.map(renderFile)}
      {renderOpenedFile()}
    </div>)
  } else {
    return (<></>)
  }
}
