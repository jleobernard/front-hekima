import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CodeIcon from '@mui/icons-material/Code';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import RedoIcon from '@mui/icons-material/Redo';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import TableChartIcon from '@mui/icons-material/TableChart';
import TitleIcon from '@mui/icons-material/Title';
import UndoIcon from '@mui/icons-material/Undo';
import React, { useRef } from 'react';
import './editor-menu-bar.scss';

const EditorMenuBar = ({ editor }) => {
  const [secondaryBar, setSecondaryBar] = React.useState('')
  const refInputFile = useRef(null)
  
  function pictureChanged() {
    const file = document.getElementById('picture');
    const targetFile = file.files[0]
    if (!targetFile) {
      console.error("Sélectionnez un fichier");
      return;
    }
    const fileName = targetFile.name;
    const fileType = targetFile.type;
    fetch(process.env.REACT_APP_URL_SIGNER_URL,{
      method: "POST",
      redirect: 'manual',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({fileName, fileType})
    }).then(response => {
      if(response.ok) {
        response.json().then(signResponse => {
          const {status, url: urls} = signResponse
          if(status === 'ok' && urls && urls.length > 0) {
            const url = urls[0]
            const reader = new FileReader();
            reader.addEventListener("load", async (event) => {
              const bytes = event.target.result;
              fetch(url, {
                method: "PUT",
                redirect: 'manual',
                headers: {
                  'Content-Type': fileType
                },
                body: bytes
              }).then(response => {
                console.log(response)
                if(response.ok) {
                  const imageUploadUrl = new URL(url)
                  const imageUrl = process.env.REACT_APP_GCS_IMAGE_ORIGIN + imageUploadUrl.pathname
                  editor.chain().focus().setImage({ src: imageUrl }).run()
                } else {
                  console.error('Cannot upload to GCS')
                  const gcsError = response.text()
                  console.error(gcsError);
                }
              }).catch(err => console.error("cannot upload file", err))
            });
            reader.readAsArrayBuffer(targetFile);
          } else {
            console.error("ko from signer", signResponse)
          }
        }).catch(err => console.error("not json", err))
      } else {
        console.error("signed url response ko", response)
      }
    }).catch(err => {
      console.error("Cannot get signed url")
    })
  }
  
  function toggleSecondaryBar(mode) {
    if(secondaryBar === mode) {
      setSecondaryBar('')
    } else {
      setSecondaryBar(mode)
    }
  }


  if (!editor) {
    return null
  }

  function renderMainBar() {
    return (<>
    <button type="button"
        onClick={() => {editor.chain().focus().toggleBold().run(); setSecondaryBar('') }}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .toggleBold()
            .run()
        }
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        <FormatBoldIcon fontSize='small'/>
      </button>
      <button type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .toggleItalic()
            .run()
        }
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        <FormatItalicIcon fontSize='small' />
      </button>
      <button type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .toggleStrike()
            .run()
        }
        className={editor.isActive('strike') ? 'is-active' : ''}
      >
        <StrikethroughSIcon fontSize='small' />
      </button>
      <button type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .toggleCode()
            .run()
        }
        className={editor.isActive('code') ? 'is-active' : ''}
      >
        <CodeIcon fontSize='small' />
      </button>
      <button type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive('codeBlock') ? 'is-active' : ''}
      >
        <DeveloperModeIcon fontSize='small' />
      </button>
      <button type="button" onClick={() => toggleSecondaryBar('h')}><TitleIcon fontSize='small' /></button>
      <button type="button" onClick={() => toggleSecondaryBar('table')}><TableChartIcon fontSize='small' /></button>
      <button type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
      >
        <FormatListBulletedIcon fontSize='small' />
      </button>
      <button type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
      >
        <FormatListNumberedIcon fontSize='small' />
      </button>
      <button type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'is-active' : ''}
      >
        <FormatQuoteIcon fontSize='small' />
      </button>
      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <HorizontalRuleIcon  fontSize='small' />
      </button>
      <button type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .undo()
            .run()
        }
      >
        <UndoIcon  fontSize='small' />
      </button>
      <button type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .redo()
            .run()
        }
      >
      <RedoIcon  fontSize='small' />
      </button>
      <button type="button" onClick={() => refInputFile.current.click()}><AddPhotoAlternateIcon  fontSize='small'/></button>
      <input className='color-button'
        type="color"
        onInput={event => editor.chain().focus().setColor(event.target.value).run()}
        value={editor.getAttributes('textStyle').color}
      />
    </>)
  }

  function renderHs() {
    return (
      <>
      {secondaryBar === 'h' ? <> 
        <button type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        >
          H1
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        >
          H2
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
        >
          H3
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={editor.isActive('heading', { level: 4 }) ? 'is-active' : ''}
        >
          H4
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={editor.isActive('heading', { level: 5 }) ? 'is-active' : ''}
        >
          H5
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          className={editor.isActive('heading', { level: 6 }) ? 'is-active' : ''}
        >
          H6
        </button>
      </> : <></>}
      </>
    )
  }

  function renderTable() {
    return <>
    {secondaryBar === 'table' ? 
    <>
      <button type='button'
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
      >
        Nouveau tableau
      </button>
      <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()}>
        + colonne avant
      </button>
      <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()}>+ colonne après</button>
      <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()}>- colonne</button>
      <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()}>+ ligne avant</button>
      <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()}>+ ligne après</button>
      <button type="button" onClick={() => editor.chain().focus().deleteRow().run()}>- ligne</button>
      <button type="button" onClick={() => editor.chain().focus().deleteTable().run()}>- tableau</button>
      <button type="button" onClick={() => editor.chain().focus().mergeCells().run()}>Fusionner cellules</button>
      <button type="button" onClick={() => editor.chain().focus().splitCell().run()}>Séparer celulles</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeaderColumn().run()}>
        En-tête colonne
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
      En-tête ligne
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeaderCell().run()}>
      En-tête cellule
      </button>
      <button type="button" onClick={() => editor.chain().focus().mergeOrSplit().run()}>Fusionner/séparer</button>
      <button type="button" onClick={() => editor.chain().focus().fixTables().run()}>Réparer</button>
      <button type="button" onClick={() => editor.chain().focus().goToNextCell().run()}>Cellule suivante</button>
      <button type="button" onClick={() => editor.chain().focus().goToPreviousCell().run()}>
        Cellule précédente
      </button>
    </>
    : <></>}
    </>
  }

  function renderSecondaryBar() {

    return (
      <>
      {renderHs()}
      {renderTable()}
      </>
    )
  }

  return (
    <div>
      <div className="editor-button-bar main-editor-button-bar">
        {renderMainBar()}
      </div>
      {secondaryBar ? 
      <div className="editor-button-bar secondary-editor-button-bar">
        {renderSecondaryBar()}
      </div> : <></>}
      <input type="file" id="picture" accept="image/*,video/*" onChange={pictureChanged} hidden={true} ref={refInputFile}/>
      
    </div>
  )
}

export default EditorMenuBar;