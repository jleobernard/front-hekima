import React from 'react';
import {withRouter} from "react-router-dom";
import {get, post} from "../../utils/http";
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


function orDefault(count, defaultValue) {
  if(count) {
    return parseInt(count)
  }
  return defaultValue
}

class Notes extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      notes: [],
      filter: {count: 20, offset: 0, initialized: false},
      creating: false,
      notification: null,
      loading: false,
      hasMoreNotes: true
    };
    this.startCreation = this.startCreation.bind(this);
    this.onDone = this.onDone.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.filterChanged = this.filterChanged.bind(this);
  }

  goToNote() {

  }

  componentDidMount() {
    this.setState({loading: true})
    //this.refreshNotes(true)
  }

  filterChanged(newFilter) {
    const updated = {
      count: 20,
      offset: 0,
      initialized: true,
      ...newFilter
    }
    this.setState({filter: updated});
    //this.refreshNotes(true, updated)
    this.updateRouteParams(updated)
  }

  updateRouteParams(newFilter) {
    const _filter = newFilter || this.state.filter
    const src = _filter.source ? _filter.source.uri : ''
    const tags = (_filter.tags || []).map(t => t.uri).join(',')
    this.props.history.push(`/notes?count=${_filter.count}&offset=${_filter.offset}&src=${src}&tags=${tags}`)
  }

  refreshNotes(override = false, filter = null) {
    const _filter = this.getFilter(filter || this.state.filter);
    this.setState({loading: true});
    get('/api/notes', _filter)
    .then(notes => {
      let newNotes;
      if(override) {
        newNotes = notes;
      } else {
        newNotes = this.state.notes.concat(notes);
      }
      this.setState({notes: newNotes, hasMoreNotes: notes && notes.length > 0})
    })
    .catch(err => this.setState({error : "Erreur à la récupération des notes : " + err}))
    .finally(() => {
      this.setState({loading: false});
    })
  }
  getFilter(filter) {
    const _filter = {
      offset: filter.offset,
      count: filter.count
    };
    if(filter.source) {
      _filter.source = filter.source.uri;
    }
    if(filter.tags) {
      _filter.tags = lodash.map(filter.tags, t => t.uri);
    }
    return _filter;
  }

  startCreation() {
    this.setState({creating: true});
  }


  showNotification(notification) {
    this.setState({notification});
    setTimeout(() => this.setState({notification: null}), 3000);
  }

  getListItem(note) {
    return <li>
      <Card className={"note-card"}>
        <NoteFilesDisplay note={note} />
        {note.subs  && note.subs.length > 0 ? <VideoThumbnailList title="" videos={note.subs} />: <></>}
        <CardContent onClick={() => this.navigateToNote(note)}>
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

  componentDidUpdate(prevProps, prevState, snapshot) {
    const prevFilter = prevState.filter;
    const filter = this.state.filter;
    if(!filter.initialized) {
      const promises = []
      const params = new URLSearchParams(this.props.history.location.search)
      const src = params.get('src')
      if(src) {
        promises.push(get('/api/sources/'+src))
      }
      (params.get('tags') || '').split(',').filter(uri => uri).forEach(uri => promises.push(get('/api/tags/'+uri)))
      const _filter = {
        ...filter,
        initialized: true,
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
            if(beginTags < promises.length - 1) {
              _filter.tags = responses.subarray(beginTags)
            }
            resolve()
          }).catch(err => resolve())
        })
      } else {
        promiseLoadAll = new Promise((resolve) => resolve())
      }
      promiseLoadAll.then(() => {
        const nbToLoad = _filter.offset + _filter.count
        if(nbToLoad > 0) {
          const _filterForSearch = this.getFilter(_filter)
          _filterForSearch.count = nbToLoad
          _filterForSearch.offset = 0
          get("/api/notes", _filterForSearch).then(notes => {
            this.setState({
              notes,
              hasMoreNotes: notes && notes.length > 0,
              filter: _filter,
              loading: false
            })
            this.seekNote(params.get('note'))
          })
        } else {
          this.setState({
            notes: [],
            hasMoreNotes: true,
            filter: _filter,
            loading: false
          })
        }
      }).catch(err => this.setState({loading: false}))
    } else if(prevFilter && filter && prevFilter.initialized && this.hasChanged(filter, prevFilter)) {
      if(filter.offset > prevFilter.offset) {
        this.refreshNotes(false);
      } else {
        this.refreshNotes(true);
      }
      this.updateRouteParams()
    }
  }
  hasChanged(filter, prevFilter) {
    return filter.offset !== prevFilter.offset ||
        filter.count !== prevFilter.count ||
        filter.source  !== prevFilter.source ||
        filter.tags  !== prevFilter.tags
  }

  seekNote(noteUri) {
    if(noteUri) {
      setTimeout(() => {
        const elt = document.getElementById(noteUri);
        if(elt) {
          elt.scrollIntoView()
        } else {
          this.seekNote(noteUri)
        }
      }, 100)
    }
  }

  onDone(note, closeAfterSaving) {
    if(note) {
      const newNotes = [...this.state.notes];
      const index = lodash.findIndex(newNotes, n => n.uri === note.uri);
      if(index >=0) {
        newNotes[index] = note;
      } else {
        newNotes.unshift(note);
      }
      this.setState({
        notification: 'Note sauvegardée',
        notes: newNotes
      });
    }
    this.setState({creating: false});
  }

  loadMore() {
    this.setState({filter: {
        ...this.state.filter,
        offset: this.state.filter.offset+20
      }})
  }

  render() {
    const notes = this.state.notes;
    return (
      <div className="app">
        <Header title="Notes" goBack={false} withSearch={true} filterChanged={this.filterChanged}/>
        <List className="notes-list">
          <ListItem key="spinner-loading-first" className="centered-item">
            {this.state.loading? <CircularProgress /> : ''}
          </ListItem>
          {notes.map(elt => <ListItem key={elt.uri} id={elt.uri}>{this.getListItem(elt)}</ListItem>)}
          {this.state.hasMoreNotes && !this.state.loading ? <ListItem className="centered-item" key="load-more">
            <Button size="small" color="primary" onClick={() => this.loadMore()}>Voir plus</Button>
          </ListItem> : <></>}
          <ListItem key="spinner-loading" className="centered-item">
            {this.state.loading? <CircularProgress /> : ''}
          </ListItem>
        </List>
        {this.state.creating ? <NoteCreation creating={this.state.creating} onDone={this.onDone}/> : <></>}
        <Toaster error={this.state.error}/>
        <Toaster error={this.state.notification} severity="info"/>
        <Fab color="primary" aria-label="add" className="fab" onClick={() => this.startCreation()}>
          <AddIcon />
        </Fab>
      </div>
    );
  }

  navigateToNote(note) {
    const _filter = this.state.filter || {}
    const src = _filter.source ? _filter.source.uri : ''
    const tags = (_filter.tags || []).map(t => t.uri).join(',')
    this.props.history.push(`/notes/${note.uri}?count=${_filter.count}&offset=${_filter.offset}&src=${src}&tags=${tags}`)
    return undefined;
  }
}

export default withRouter(Notes);
