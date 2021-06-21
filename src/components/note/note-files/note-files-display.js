import CloseIcon from '@material-ui/icons/Close';
import {IconButton} from "@material-ui/core";
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import {useState} from "react";

export const NoteFilesDisplay = ({note}) => {

  const [openedFile, setOpenedFile] = useState(null)

  function renderOpenedFile() {
    if(openedFile) {
      return (<div class="zoomed-picture">
        <img src={"/api/notes/" + note.uri + "/files/" + openedFile.file_id} alt={openedFile.file_id}/>
        <IconButton aria-label="zoom-picture-close" onClick={() => setOpenedFile(null)} className="note-image-zoom">
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
      <IconButton aria-label="zoom" onClick={() => setOpenedFile(file)} className="note-image-zoom">
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
