import AddIcon from '@mui/icons-material/Add';
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Fab from "@mui/material/Fab";
import List from '@mui/material/List';
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import * as lodash from 'lodash';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/header/Header";
import VideoThumbnailList from "../../components/medias/video-tumbnail-list";
import NoteCreation from '../../components/note-creation/note-creation';
import { NoteFilesDisplay } from "../../components/note/note-files/note-files-display";
import { supabase } from '../../services/supabase-client';
import { notifyInfo } from '../../store/features/notificationsSlice';
import "../../styles/layout.scss";
import "./notes.scss";
import { notifyError } from '../../store/features/notificationsSlice';


import NoteContent from "components/note/note-content";
import { searchNotes } from 'services/note-services';


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
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false)
  const [hasMoreNotes, setHasMoreNotes] = useState(true)
  const [filter, setFilter] = useState({count: 20, offset: 0})
  const [creating, setCreating] = useState(false)
  const dispatch = useDispatch()
  const DEFAULT_NOTES_COUNT = 10;

  useEffect(() => {
    loadFilterFromURL().then(_filter => {
      const _filterForSearch = getFilter(_filter)
      launchSearch(_filterForSearch, true)
    })
  }, [])


  const launchSearch = async (filter, raz) => {
    setNotesLoading(true);
    setFilter(filter)
    try {
      let realFilter = {...filter}
      if(raz) {
        realFilter.count = filter.count + realFilter.offset
        realFilter.offset = 0
      }
      const fetchedNotes = await searchNotes(realFilter)
      setHasMoreNotes(fetchedNotes && fetchedNotes.length > 0)
      setNotes(raz ? fetchedNotes : [...notes, ...fetchedNotes])
    } catch(err) {
      dispatch(notifyError(err))
    } finally {
      setNotesLoading(false)
    }
  }

  function filterChanged(newFilter) {
    const updatedFilter = {
      count: DEFAULT_NOTES_COUNT,
      offset: 0,
      ...newFilter
    }
    updateRouteParams(filterToRawQuery(updatedFilter))
    launchSearch(richFilterToFilter(updatedFilter), true)
  }

  function loadFilterFromURL() {
    const promises = []
    const params = new URLSearchParams(location.search)
    const src = params.get('source')
    if(src) {
      promises.push(supabase.from("note_source").select().eq('uri', src))
    }
    const withTagsUri = (params.get('tags') || '').split(',');
    const withoutTagsUri = (params.get('notTags') || '').split(',');
    const allTagsUri = [...withTagsUri, ...withoutTagsUri].filter(uri => !!uri);
    if(allTagsUri.length > 0) {
      promises.push(supabase.from("tag").select().in('uri', allTagsUri))
    }
    const _filter = {
      ...filter,
      q: orDefaultString(params.get('q'), ''),
      count: orDefault(params.get('count'), DEFAULT_NOTES_COUNT),
      offset: orDefault(params.get('offset'), 0)
    }
    let promiseLoadAll;
    if(promises.length > 0) {
      promiseLoadAll = new Promise((resolve) => {
        Promise.all(promises).then(responses => {
          let beginTags;
          if(src) {
            _filter.source = responses[0].data[0]
            beginTags = 1
          } else {
            beginTags = 0
          }
          if(allTagsUri.length > 0) {
            const fetchedTags = responses[beginTags].data
            _filter.tags = withTagsUri.map(wt => lodash.find(fetchedTags, t => t.uri === wt)).filter(u => !!u)
            _filter.notTags = withoutTagsUri.map(wt => lodash.find(fetchedTags, t => t.uri === wt)).filter(u => !!u)
          }
          resolve(_filter)
        }).catch(() => resolve(_filter))
      })
    } else {
      promiseLoadAll = new Promise((resolve) => resolve(_filter))
    }
    return promiseLoadAll
  }

  function filterToRawQuery(filter) {
    const source = filter.source ? filter.source.uri : ''
    const tags = (filter.tags || []).map(t => t.uri).join(',')
    const notTags = (filter.notTags || []).map(t => t.uri).join(',')
    const q = (filter.q || '').trim()
    return {
      count: filter.count,
      offset:filter.offset,
      source,
      tags,
      notTags,
      q
    }
  }

  function richFilterToFilter(filter) {
    const source = filter.source ? filter.source.uri : ''
    const tags = (filter.tags || []).map(t => t.uri)
    const notTags = (filter.notTags || []).map(t => t.uri)
    const q = (filter.q || '').trim()
    return {
      count: filter.count,
      offset:filter.offset,
      source,
      tags,
      notTags,
      q
    }
  }

  function updateRouteParams(filter) {
    navigate(`/notes?count=${filter.count}&offset=${filter.offset}&source=${filter.source || ''}&tags=${filter.tags || ''}&notTags=${filter.notTags || ''}&q=${encodeURIComponent(filter.q)}`)
  }

  function getFilter(__filter) {
    const _filter = {
      offset: __filter.offset,
      count: __filter.count,
      q: __filter.q
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
    return _filter;
  }

  function startCreation() {
    setCreating(true)
  }

  function getListItem(note) {
    return <Card className={"note-card"}>
        <NoteFilesDisplay note={note} />
        {note.subs  && note.subs.length > 0 ? <VideoThumbnailList title="" videos={note.subs} />: <></>}
        <CardContent onClick={() => navigateToNote(note)}>
          <Typography component="div" className={"note-text"} gutterBottom={true}>
            <NoteContent note={note} readOnly={true}></NoteContent>
          </Typography>
          {note.source ? <Typography variant="body2" color="textSecondary" component="div" className={"note-from"}>
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

  function onDone(newNote) {
    if(newNote) {
      const newNotes = [...notes]
      const index = lodash.findIndex(newNotes, n => n.uri === newNote.uri);
      if(index >=0) {
        newNotes[index] = newNote;
      } else {
        newNotes.unshift(newNote);
      }
      setNotes(newNotes)
      dispatch(notifyInfo('Note sauvegardée'))
    }
    setCreating(false)
  }

  function loadMore() {
    const newFilter = {
      ...filter,
      offset: filter.offset + notes.length
    }
    updateRouteParams(newFilter)
    launchSearch(newFilter, false)
  }

  function navigateToNote(note) {
    const _filter = filter || {}
    const src = _filter.source ? _filter.source.uri : ''
    const tags = (_filter.tags || []).map(t => t.uri || t).join(',')
    const notTags = (_filter.notTags || []).map(t => t.uri || t).join(',')
    navigate(`/notes/${note.uri}?count=${_filter.count}&offset=${_filter.offset}&src=${src}&tags=${tags}&notTags=${notTags}`)
    return undefined;
  }
  return (
    <div className="app">
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
      <Fab color="primary" aria-label="add" className="fab" onClick={() => startCreation()}>
        <AddIcon />
      </Fab>
    </div>
  );
}

export default Notes;
