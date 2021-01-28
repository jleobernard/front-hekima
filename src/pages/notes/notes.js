import React from 'react';
import {withRouter} from "react-router-dom";
import {get, httpDelete} from "../../utils/http";
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
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import Dialog from "@material-ui/core/Dialog/Dialog";
import DialogContentText from "@material-ui/core/DialogContentText";
import * as lodash from 'lodash';

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
      hasMoreNotes: true,
      noteDetail: null
    };
    this.startCreation = this.startCreation.bind(this);
    this.onDone = this.onDone.bind(this);
    this.askDeleteNote = this.askDeleteNote.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.openNote = this.openNote.bind(this);
    this.closeNote = this.closeNote.bind(this);
    this.closeDeleteNote = this.closeDeleteNote.bind(this);
    this.filterChanged = this.filterChanged.bind(this);
  }

  componentDidMount() {
    this.setState({loading: true});
    this.refreshNotes(true);
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

  openNote(note) {
    this.setState({noteDetail: note});
  }

  closeNote(note) {
    this.setState({noteDetail: null});
  }

  refreshNotes(override = false, filter = null) {
    const _filter = this.getFilter(filter || this.state.filter);
    this.setState({loading: true});
    get('/api/hekimas', _filter)
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
  askDeleteNote(note) {
    this.setState({deletingNote: note});
  }
  closeDeleteNote(doDelete) {
    if(doDelete) {
      if(!this.state.deleting) {
        this.setState({deleting: true, error: null});
        httpDelete('/api/hekimas/' + this.state.deletingNote.uri)
        .then(() => {
          this.showNotification("La note " + this.state.deletingNote.valeur + " a bien été supprimée");
          const notes = this.state.notes.filter(n => n.uri !== this.state.deletingNote.uri);
          this.setState({deletingNote: null, notes});
        }).catch(err => this.setState({error: 'Erreur lors de la suppression de la note : ' + err}))
        .finally(() => this.setState({deleting: false}));
      }
    } else {
      this.setState({deletingNote: null});
    }
  }

  showNotification(notification) {
    this.setState({notification});
    setTimeout(() => this.setState({notification: null}), 3000);
  }

  getListItem(note) {
    return <li>
      <Card className={"note-card"}>
        {note.hasFile ? <img className="note-image" src={"/api/hekimas/" + note.uri + "/file"} alt={note.valeur}/> : <></>}
        <CardContent>
          <Typography component="p" className={"note-text"} gutterBottom={true}>
            {note.valeur}
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
          <Button size="small" color="primary" onClick={() => this.openNote(note)}>Ouvrir</Button>
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

  onDone(note) {
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
    this.setState({creating: false, noteDetail: null});
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
          {notes.map(elt => <ListItem key={elt.uri}>{this.getListItem(elt)}</ListItem>)}
          {this.state.hasMoreNotes && !this.state.loading ? <ListItem className="centered-item" key="load-more">
            <Button size="small" color="primary" onClick={() => this.loadMore()}>Voir plus</Button>
          </ListItem> : <></>}
          <ListItem key="spinner-loading" className="centered-item">
            {this.state.loading? <CircularProgress /> : ''}
          </ListItem>
        </List>
        <NoteCreation creating={this.state.creating} note={this.state.noteDetail} onDone={this.onDone}/>
        <Dialog open={!!this.state.deletingNote}
                onClose={this.closeDeleteNote}
                fullScreen={true}
                aria-labelledby="creation-dialog-title">
          <DialogTitle id="creation-dialog-title">Suppression de la note</DialogTitle>
          <DialogContent>
            <DialogContentText>Vous-vous vraiment supprimer la note {(this.state.deletingNote || {}).valeur} ?</DialogContentText>
            <Toaster error={this.state.error}/>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.closeDeleteNote(false)} color="primary">
              Annuler
            </Button>
            <Button onClick={() => this.closeDeleteNote(true)} color="primary">
              Supprimer {this.state.deleting ? <CircularProgress /> : ''}
            </Button>
          </DialogActions>
        </Dialog>
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
