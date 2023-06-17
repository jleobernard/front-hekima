import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'

import React from 'react';
import EditorMenuBar from 'components/rte/editor-menu-bar';
import './note-content.scss';

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
      Document, Paragraph, Text, TextStyle,// Color,
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      //TextStyle.configure({ types: [ListItem.name] }),
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
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
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