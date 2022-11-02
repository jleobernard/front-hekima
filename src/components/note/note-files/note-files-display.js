import {useState} from "react";
import {NoteFileFullscreen} from "./note-file-fullscreen";

export const NoteFilesDisplay = ({note}) => {

  const [openedFile, setOpenedFile] = useState(null)

  function closeFile() {
    setOpenedFile(null)
  }

  function openFile(file, event) {
    setOpenedFile(file)
    event.stopPropagation()
  }

  function renderFile(file) {
    return (<div className="note-image">
      {file.mime_type.startsWith('video') ? 
      <video key={file.file_id} src={"/api/notes/" + note.uri + "/files/" + file.file_id} onClick={(e) => openFile(file, e)}/>
      :
      <img key={file.file_id} src={"/api/notes/" + note.uri + "/files/" + file.file_id} alt={file.file_id} onClick={(e) => openFile(file, e)}/>}
    </div>)
  }

  if(note.files && note.files.length > 0) {
    return (<div className={"note-files " + (note.files.length === 1 ? "unique" : "multiple")}>
      {note.files.map(renderFile)}
      <NoteFileFullscreen note={note} file={openedFile} onClose={closeFile}/>
    </div>)
  } else {
    return (<></>)
  }
}
