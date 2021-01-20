import React from 'react';
import {withRouter} from "react-router-dom";
import {get, patch, post} from "../../utils/http";
import "./notes.scss";
import Header from "../../components/header/Header";
import Toaster from "../../components/Toaster";
import List from '@material-ui/core/List';
import ListItem from "@material-ui/core/ListItem";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import {Link} from "react-router-dom";
import Chip from "@material-ui/core/Chip";


class Note extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      notes: []
    };
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

  render() {
    const note = this.state.note;
    return (
      <li>
        <Card className={"note-card"}>
          {note.hasFile ? <img className="note-image" src={"/api/hekimas/" + note.uri + "/file"} alt={note.valeur}/> : <></>}
          <CardContent>
            <Typography variant="body" component="p" className={"note-text"} gutterBottom={true}>
              {note.valeur}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p" className={"note-from"}>
              in {note.source.titre} de {note.source.auteur}
            </Typography>
            <List className="list-horizontal-display">
              {note.tags.map(t => <ListItem>
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
    );
  }
}

export default withRouter(Note);
