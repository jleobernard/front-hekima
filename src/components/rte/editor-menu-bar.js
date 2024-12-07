import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CodeIcon from '@mui/icons-material/Code';
import PaletteIcon from '@mui/icons-material/Palette';
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
import { notifyError, notifyInfo } from 'store/features/notificationsSlice';

const colourList = [
  {label: 'Verbe', code: 'red'},
  {label: 'Voc', code: 'blue'},
  {label: 'Adv', code: 'cyan', light: true},
  {label: 'Gram', code: 'green'},
  {label: 'Expr', code: 'purple'},
  {label: 'Prop', code: 'orange'},
]

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
    }).then(async response => {
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
                  'Content-Type': fileType,
                  'Cache-Control': 'private, max-age=31536000'
                },
                body: bytes
              }).then(async response => {
                if(response.ok) {
                  const imageUploadUrl = new URL(url)
                  const imageUrl = process.env.REACT_APP_GCS_IMAGE_ORIGIN + imageUploadUrl.pathname
                  notifyInfo('Image téléversée')
                  editor.chain().focus().setImage({ src: imageUrl }).run()
                } else {
                  notifyError('Erreur lors de l\'import dans GCS')
                  const gcsError = await response.text()
                  notifyError(`Erreur lors de l\'import dans GCS : ${gcsError}`)
                }
              }).catch(err => notifyError(`Impossible de lire le fichier ${err}`))
            });
            reader.readAsArrayBuffer(targetFile);
          } else {
            notifyError(`Impossible de signer l'import ${signResponse}`)
          }
        }).catch(err => notifyError(`Réponse non JSON ${err}`))
      } else {
        notifyError(`Impossible de signer l'import ${response}`)
      }
    }).catch(err => {
      notifyError(`Impossible de signer l'import ${err}`)
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
      <button type="button" onClick={() => toggleSecondaryBar('colour-list')}>
        <PaletteIcon fontSize='small' />
      </button>
    </>)
  }

  function renderHs() {
    return (
      <>
      {secondaryBar === 'h' ? <> 
        <button type="button" key='h1'
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        >
          H1
        </button>
        <button type="button" key='h2'
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        >
          H2
        </button>
        <button type="button" key='h3'
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
        >
          H3
        </button>
        <button type="button" key='h4'
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={editor.isActive('heading', { level: 4 }) ? 'is-active' : ''}
        >
          H4
        </button>
        <button type="button" key='h5'
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={editor.isActive('heading', { level: 5 }) ? 'is-active' : ''}
        >
          H5
        </button>
        <button type="button" key='h6'
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          className={editor.isActive('heading', { level: 6 }) ? 'is-active' : ''}
        >
          H6
        </button>
      </> : <></>}
      {renderColourList()}
      </>
    )
  }

  function renderColourList() {
    if(secondaryBar !== 'colour-list') {
      return <></>
    }
    return (<div className='colour-items'>{colourList.map(item => renderColourItem(item))}</div>)
  }
  function renderColourItem(item) {
    const eltWidth = `calc(100% / ${colourList.length})`
    let classNames = 'colour-item'
    if(item.light) {
      classNames += ' light'
    }
    return <button key={item.label} className={classNames}
                    style={{backgroundColor: item.code, width: eltWidth}}
                    onClick={e => {
                      e.preventDefault();
                      editor.chain().focus().setColor(item.code).run()
                    }}>{item.label}</button>
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
    <div className="editor-menu-bar">
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