export const NoteFilesDisplay = ({note}) => {

  if(note.files && note.files.length > 0) {
    return (<div className={"note-files " + (note.files.length == 1 ? "unique" : "multiple")}>
      {note.files.map(file => (<div className="note-image">
        <img key={file.file_id} src={"/api/notes/" + note.uri + "/files/" + file.file_id} alt={note.file_id}/>
      </div>))}
    </div>)
  } else {
    return (<></>)
  }
}
