import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import {get} from "../../utils/http";
import {selectNotes,
   selectNotesLoading,
   saveNote,
   cancelNoteCreation,
   selectHasMoreNotes,
   selectFilter,
   selectRaz,
   launchSearch} from '../../store/features/notesSlice';
import "./notes.scss";
import "../../styles/layout.scss";
import Header from "../../components/header/Header";
import Toaster from "../../components/Toaster";
import List from '@material-ui/core/List';
import ListItem from "@material-ui/core/ListItem";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";
import Fab from "@material-ui/core/Fab";
import AddIcon from '@material-ui/icons/Add';
import NoteCreation from '../../components/note-creation/note-creation';
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import * as lodash from 'lodash';
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import gfm from 'remark-gfm'
import {NoteFilesDisplay} from "../../components/note/note-files/note-files-display";
import VideoThumbnailList from "../../components/medias/video-tumbnail-list";
import AddToHomeScreen from '@ideasio/add-to-homescreen-react';


function orDefault(count, defaultValue) {
  if(count) {
    return parseInt(count)
  }
  return defaultValue
}
function orDefaultString(str, defaultValue) {
  if(str) {
    return decodeURIComponent(str);
  }
  return defaultValue
}

const Notes = () =>  {

  const navigate = useNavigate();
  const location = useLocation()
  const [creating, setCreating] = useState(false)
  const [notification, setNotification] = useState(null)
  const [error, setError] = useState("")
  const notes = useSelector(selectNotes);
  const notesLoading = useSelector(selectNotesLoading)
  const hasMoreNotes = useSelector(selectHasMoreNotes)
  const filter = useSelector(selectFilter)
  const raz = useSelector(selectRaz)
  const dispatch = useDispatch();

  useEffect(() => {
    loadFilterFromURL().then(_filter => {
      const _filterForSearch = getFilter(filter)
      dispatch(launchSearch(_filterForSearch, false))
    })
  }, [])

  function filterChanged(newFilter) {
    const updatedFilter = {
      count: 20,
      offset: 0,
      ...newFilter
    }
    dispatch(launchSearch(updatedFilter, true))
    updateRouteParams(updatedFilter)
  }

  function loadFilterFromURL() {
    const promises = []
    const params = new URLSearchParams(location.search)
    const src = params.get('src')
    if(src) {
      promises.push(get(`/api/sources/${src}`))
    }
    const withTagsUri = (params.get('tags') || '').split(',');
    const withoutTagsUri = (params.get('notTags') || '').split(',');
    [...withTagsUri, ...withoutTagsUri]
    .filter(uri => !!uri)
    .forEach(uri => promises.push(get(`/api/tags/${uri}`)))
    const _filter = {
      ...filter,
      q: orDefaultString(params.get('q'), ''),
      count: orDefault(params.get('count'), 20),
      offset: orDefault(params.get('offset'), 0)
    }
    let promiseLoadAll;
    if(promises.length > 0) {
      promiseLoadAll = new Promise((resolve) => {
        Promise.all(promises).then(responses => {
          let beginTags;
          if(src) {
            _filter.source = responses[0]
            beginTags = 1
          } else {
            beginTags = 0
          }
          const fetchedTags = responses.slice(beginTags)
          _filter.tags = withTagsUri.map(wt => lodash.find(fetchedTags, t => t.uri === wt)).filter(u => !!u)
          _filter.notTags = withoutTagsUri.map(wt => lodash.find(fetchedTags, t => t.uri === wt)).filter(u => !!u)
          resolve(_filter)
        }).catch(() => resolve(_filter))
      })
    } else {
      promiseLoadAll = new Promise((resolve) => resolve(_filter))
    }
    return promiseLoadAll
  }

  function updateRouteParams(__filter) {
    const _filter = __filter || filter
    const src = _filter.source ? _filter.source.uri : ''
    const tags = (_filter.tags || []).map(t => t.uri).join(',')
    const notTags = (_filter.notTags || []).map(t => t.uri).join(',')
    const q = (_filter.q || '').trim()
    navigate(`/notes?count=${_filter.count}&offset=${_filter.offset}&src=${src}&tags=${tags}&notTags=${notTags}&q=${encodeURIComponent(q)}`)
  }

  function getFilter(__filter) {
    const _filter = {
      offset: raz ? 0 : __filter.offset,
      count: raz ? __filter.count + __filter.offset : __filter.count
    };
    if(__filter.source) {
      _filter.source = __filter.source.uri;
    }
    if(__filter.tags) {
      _filter.tags = lodash.map(__filter.tags, t => t.uri);
    }
    if(__filter.notTags) {
      _filter.notTags = lodash.map(__filter.notTags, t => t.uri);
    }
    if(__filter.q) {
      _filter.q = __filter.q
    }
    return _filter;
  }

  function startCreation() {
    setCreating(true)
  }

  function getListItem(note) {
    return <li>
      <Card className={"note-card"}>
        <NoteFilesDisplay note={note} />
        {note.subs  && note.subs.length > 0 ? <VideoThumbnailList title="" videos={note.subs} />: <></>}
        <CardContent onClick={() => navigateToNote(note)}>
          <Typography component="p" className={"note-text"} gutterBottom={true}>
            <ReactMarkdown remarkPlugins={[gfm]} rehypePlugins={[rehypeRaw]} children={note.valeur}/>
          </Typography>
          {note.source ? <Typography variant="body2" color="textSecondary" component="p" className={"note-from"}>
            in {note.source.titre} de {note.source.auteur}
          </Typography> : <></>}
          <List className="list-horizontal-display">
            {(note.tags || []).map(t => <ListItem key={t.uri}>
                <Chip
                label={t.valeur}
              />
            </ListItem>)}
          </List>
        </CardContent>
      </Card>
    </li>
  }

  function seekNote(noteUri) {
    if(noteUri) {
      setTimeout(() => {
        const elt = document.getElementById(noteUri);
        if(elt) {
          elt.scrollIntoView()
        } else {
          seekNote(noteUri)
        }
      }, 100)
    }
  }

  function onDone(note) {
    if(note) {
      dispatch(saveNote(note))
      setNotification('Note sauvegardée')
    } else {
      dispatch(cancelNoteCreation())
    }
  }

  function loadMore() {
    const newFilter = {
      ...filter,
      offset: filter.offset+20
    }
    dispatch(launchSearch(newFilter, false))
    updateRouteParams(newFilter)
  }

  function navigateToNote(note) {
    const _filter = filter || {}
    const src = _filter.source ? _filter.source.uri : ''
    const tags = (_filter.tags || []).map(t => t.uri).join(',')
    const notTags = (_filter.notTags || []).map(t => t.uri).join(',')
    navigate(`/notes/${note.uri}?count=${_filter.count}&offset=${_filter.offset}&src=${src}&tags=${tags}&notTags=${notTags}`)
    return undefined;
  }
  return (
    <div className="app">
      <AddToHomeScreen appId="com.leo.notes" />
      <Header title="Notes" goBack={false} withSearch={true} filterChanged={filterChanged}/>
      <List className="notes-list">
        <ListItem key="spinner-loading-first" className="centered-item">
          {notesLoading? <CircularProgress /> : ''}
        </ListItem>
        {notes.map(elt => <ListItem key={elt.uri} id={elt.uri}>{getListItem(elt)}</ListItem>)}
        {hasMoreNotes && !notesLoading ? <ListItem className="centered-item" key="load-more">
          <Button size="small" color="primary" onClick={() => loadMore()}>Voir plus</Button>
        </ListItem> : <></>}
        <ListItem key="spinner-loading" className="centered-item">
          {notesLoading? <CircularProgress /> : ''}
        </ListItem>
      </List>
      {creating ? <NoteCreation creating={creating} onDone={onDone}/> : <></>}
      <Toaster error={error}/>
      <Toaster error={notification} severity="info"/>
      <Fab color="primary" aria-label="add" className="fab" onClick={() => startCreation()}>
        <AddIcon />
      </Fab>
    </div>
  );
}

export default Notes;
