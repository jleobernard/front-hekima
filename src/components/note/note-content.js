import { EditorContent, useEditor } from '@tiptap/react'

import EditorMenuBar from 'components/rte/editor-menu-bar'
import React from 'react'
import './note-content.scss'
import { EXTENSIONS } from 'services/note-services'

const NoteContent = ({note, readOnly, onBlur}) => {
  function handleOnBlur() {
    if(onBlur) {
      onBlur(editor.getJSON())
    }
  }
  function getContent() {
    let content;
    if(note) {
      content = note.valueJson || note.valeur;
    } else {
      content = ''
    }
    return content;
  }

  const editor = useEditor({
    extensions: EXTENSIONS,
    content: getContent(),
    editable: !readOnly
  })
  return <div>
    {readOnly ? <></> : <EditorMenuBar editor={editor}></EditorMenuBar>}
    <EditorContent editor={editor} readOnly={readOnly} onBlur={e => handleOnBlur(e)}/>
  </div>
}

export default NoteContent;