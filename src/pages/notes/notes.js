import React from 'react';
import {withRouter} from "react-router-dom";
import {get, patch, post} from "../../utils/http";
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
import {Link} from "react-router-dom";
import Chip from "@material-ui/core/Chip";
import Fab from "@material-ui/core/Fab";
import AddIcon from '@material-ui/icons/Add';
import NoteCreation from '../../components/note-creation/note-creation';

class Notes extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      notes: [],
      creating: false
    };
    this.startCreation = this.startCreation.bind(this);
    this.onDone = this.onDone.bind(this);
  }

  componentDidMount() {
    this.setState({loading: true});
    get('/api/hekimas', {})
    .then(notes => {
      this.setState({notes})
    }).finally(() => {
      this.setState({loading: false});
    })
  }
  startCreation() {
    this.setState({creating: true});
  }

  getListItem(note) {
    return <li>
      <Card className={"note-card"}>
        {note.hasFile ? <img className="note-image" src={"/api/hekimas/" + note.uri + "/file"} alt={note.valeur}/> : <></>}
        <CardContent>
          <Typography component="p" className={"note-text"} gutterBottom={true}>
            {note.valeur}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p" className={"note-from"}>
            in {note.source.titre} de {note.source.auteur}
          </Typography>
          <List className="list-horizontal-display">
            {note.tags.map(t => <ListItem key={t.uri}>
                <Chip
                label={t.valeur}
              />
            </ListItem>)}
          </List>
        </CardContent>
        <CardActions>
          <Button size="small" color="primary">Supprimer</Button>
          <Button size="small" color="primary" className="button-link"><Link to={'/notes/' + note.uri}>Ouvrir</Link></Button>
        </CardActions>
      </Card>
    </li>
  }

  onDone(note) {
    if(note) {
      // Refresh
    }
    this.setState({creating: false});
  }

  render() {
    const notes = this.state.notes;
    return (
      <div className="app">
        <Header title="Notes" goBack={false} withSearch={true}/>
        <List className="notes-list">{notes.map(elt => <ListItem key={elt.uri}>{this.getListItem(elt)}</ListItem>)}</List>
        <NoteCreation creating={this.state.creating} onDone={this.onDone}/>
        <Toaster error={this.state.error}/>
        <Fab color="primary" aria-label="add" className="fab" onClick={() => this.startCreation()}>
          <AddIcon />
        </Fab>
      </div>
    );
  }
}

export default withRouter(Notes);
