import {IconButton} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import {useEffect, useRef, useState} from "react";
import "./note-files.scss"
import {constant, times} from "lodash";
import {Delete} from "@material-ui/icons";

export const NoteFilesEdit = ({note, onChange, editable}) => {

  const [previews, setPreviews] = useState(times(note && note.files ? note.files.length : 0, constant({})))
  const [modifyingImageIdx, setModifyingImageIdx] = useState(-1)
  const [deleted, setDeleted] = useState({})
  const refInputFile = useRef(null)

  useEffect(() => {
    setPreviews(times(note && note.files ? note.files.length : 0, constant({})))
  }, [note])

  function fileChanged() {
    const file = document.getElementById('recipe-picture');
    if (!file) {
      console.error("Sélectionnez un fichier");
    }
    const reader = new FileReader()
    reader.onloadend = result => {
      const copy = [...previews]
      if(modifyingImageIdx >= previews.length) {
        copy.push({fileId: null, data: "", key: "new-" + Date.now()});
      } else {
        previews[modifyingImageIdx].data = ""
        previews[modifyingImageIdx].key = copy.file_id
      }
      copy[modifyingImageIdx].data = result.target.result;
      setPreviews(copy)
    };
    reader.onerror = (err) => console.error(err)
    reader.onabort = (err) => console.error(err)
    const imageFile = file.files[0]
    reader.readAsDataURL(imageFile)
    onChange(modifyingImageIdx, imageFile)
  }

  function openFileDialog(idx) {
    setModifyingImageIdx(idx)
    refInputFile.current.click()
  }

  function deleteImage(idx) {
    const copy = {...deleted}
    copy[idx] = true
    setDeleted(copy)
    onChange(idx, null)
  }

  function renderImage(idx) {
    const preview = previews[idx]
    if(preview && preview.data) {
      const isVideo = preview.data.startsWith('data:video/')
      if(isVideo) {
        return (
          <div className={"note-image " + (deleted[idx] ? "deleted" : "")} key={preview.key}>
            <video src={preview.data}
               alt={"en construction"}/>
            <IconButton className="top-right-icon" aria-label="delete-image" onClick={() => deleteImage(idx)}>
              <Delete />
            </IconButton>
          </div>
        )
      } else {
        return (
          <div className={"note-image " + (deleted[idx] ? "deleted" : "")} key={preview.key}>
            <img src={preview.data}
               alt={"en construction"}/>
            <IconButton className="top-right-icon" aria-label="delete-image" onClick={() => deleteImage(idx)}>
              <Delete />
            </IconButton>
          </div>
        )
      }
    } else if(note && note.files && note.files.length > idx){
      const file = note.files[idx]
      return (
        <div className={"note-image " + (deleted[idx] ? "deleted" : "")} key={file.file_id}>
          <img src={"/api/notes/" + note.uri + "/files/" + file.file_id}
               alt={file.file_id}/>
          <IconButton className="top-right-icon" aria-label="delete-image" onClick={() => deleteImage(idx)}>
            <Delete />
          </IconButton>
        </div>
      )
    } else {
      return (<div key={Date.now()}></div>)
    }
  }
  return (
    <>
      <div className={"note-files " + ((!note || !note.files || note.files.length === 0) ? "empty" : "")}>
        {previews.map((_, idx) => renderImage(idx))}
        <div className="note-image placeholder" key="placeholder">
          <IconButton aria-label="select" onClick={() => openFileDialog(previews.length)}>
            <AddIcon />
          </IconButton>
        </div>
      </div>
      <input type="file" id="recipe-picture" accept="image/*,video/*" onChange={fileChanged} hidden={true} ref={refInputFile}/>
    </>)
}
