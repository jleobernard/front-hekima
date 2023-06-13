import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import React from 'react';
import EditorMenuBar from 'components/rte/editor-menu-bar';

const NoteContent = ({note, readOnly, onBlur}) => {
  function handleOnBlur(event) {
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
    extensions: [
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      TextStyle.configure({ types: [ListItem.name] }),
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
      }),
    ],
    content: getContent(note),
    editable: !readOnly
  })
  return <div>
    {readOnly ? <></> : <EditorMenuBar editor={editor}></EditorMenuBar>}
    <EditorContent editor={editor} readOnly={readOnly} onBlur={e => handleOnBlur(e)}/>
  </div>
}

export default NoteContent;