import React from 'react';
import {Link, withRouter} from "react-router-dom";
import {get} from "../../utils/http";
import "./notes.scss";
import "../../styles/layout.scss";
import Header from "../../components/header/Header";
import Toaster from "../../components/Toaster";
import List from '@material-ui/core/List';
import ListItem from "@material-ui/core/ListItem";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
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


class Notes extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      notes: [],
      filter: {count: 20, offset: 0},
      creating: false,
      notification: null,
      deletingNote: null,
      deleting: false,
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
    this.refreshNotes(true)
  }

  filterChanged(newFilter) {
    const updated = {
      count: 20,
      offset: 0,
      ...newFilter
    }
    this.setState({filter: updated});
    this.refreshNotes(true, updated)
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
        <CardContent onClick={() => this.props.history.push('/notes/' + note.uri)}>
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
        <CardActions>
          <Button size="small" color="primary" onClick={() => this.askDeleteNote(note)}>Supprimer</Button>
          <Link to={"/notes/" + note.uri}><Button size="small" color="primary">Ouvrir</Button></Link>
        </CardActions>
      </Card>
    </li>
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const prevFilter = prevState.filter;
    const filter = this.state.filter;
    if(prevFilter && filter) {
      if(filter.offset > prevFilter.offset) {
        this.refreshNotes(false);
      } else if(filter.offset < prevFilter.offset) {
        this.refreshNotes(true);
      }
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
}

export default withRouter(Notes);
