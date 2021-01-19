import * as React from "react";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import AppBar from '@material-ui/core/AppBar';
import MenuIcon from '@material-ui/icons/Menu';
import Typography from "@material-ui/core/Typography";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import InboxIcon from '@material-ui/icons/MoveToInbox';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import {getNls} from "../../utils/nls";
import {getLanguages, logout} from "../../utils/storage";
import {Link, withRouter} from "react-router-dom";
import SearchIcon from '@material-ui/icons/Search';
import { InputBase } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import TranslateIcon from '@material-ui/icons/Translate';
import "./header.scss";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import LinearProgress from "@material-ui/core/LinearProgress";
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import {get} from "../../utils/http";

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpened: false,
      searchInput: '',
      progress: 0
    };
    this.progressTheme = createMuiTheme({
      palette: {
        primary: blue,
      },
    });
    this.goBack = this.goBack.bind(this);
    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }
  goBack() {
    this.props.history.goBack();
  }
  handleKeyDown(event ) {
    if(event.key === 'Enter') {
      if(!(event.shiftKey || event.altKey)) {
        if(this.props.onSearch) {
          this.props.onSearch(this.state.searchInput);
        }
      }
    }
  }
  searchChanged(fieldName, event) {
    const changes = {};
    const value = event.target.value;
    changes[fieldName] = value;
    this.setState(changes);
  }
  toggleDrawer(newState) {
    this.setState({menuOpened: newState});
  }
  logout() {
    logout();
    this.props.history.push('/login');
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.language && typeof(this.props.credit) == "number" && this.props.credit !== prevProps.credit) {
      this.updateProgressBar(this.props.credit);
    } else if (!prevProps.language && this.props.withProgress && this.props.language) {
      get("/api/users/me/credits").then(response => {
        const textCredit = response.text;
        this.updateProgressBar(textCredit);
      });
    }
  }

  updateProgressBar(textCredit) {
    const languageModel = getLanguages().filter(l => l.code === this.props.language);
    let credit;
    if(languageModel && languageModel.length > 0 && languageModel[0].motherTongue) {
      credit = textCredit;
    } else {
      credit = 20 - textCredit;
    }
    this.setState({progress: credit * 5 /* = 100 / 20*/})
  }

  render() {
    return (
      <AppBar position="fixed">
        <Toolbar className="toolbar">
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => this.toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" className={"title " + (!this.props.title ? 'website-title-header' : '')} noWrap>
            {this.props.title || 'Notes'}
          </Typography>
          {this.props.withSearch ? <div className="header-search">
            <div className="search-icon">
              <SearchIcon />
            </div>
            <InputBase
              placeholder="Recherche"
              classes={{
                root: "input-root",
                input: "input-input",
              }}
              inputProps={{ 'aria-label': 'search' }}
              onKeyDown={this.handleKeyDown}
              onChange={this.searchChanged.bind(this, 'searchInput')}
            />
          </div>: ''}
          {this.props.goBack ? <div className="back-icon" onClick={this.goBack}><ArrowBackIcon /></div> : ''}
        </Toolbar>
        <Drawer anchor='left' open={this.state.menuOpened} onClose={() => this.toggleDrawer(false)}>
          <div role="presentation"
            onClick={() => this.toggleDrawer(false)}
            onKeyDown={() => this.toggleDrawer(false)}>
            <List>
              <ListItem button key="profile">
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText primary={<Link to="/profile">{getNls('header.profile')}</Link>} />
              </ListItem>
              <ListItem button key="inbox">
                <ListItemIcon><InboxIcon /></ListItemIcon>
                <ListItemText primary={getNls(['header', 'inbox'])} />
              </ListItem>
              <ListItem button key="logout" onClick={this.logout.bind(this)}>
                <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                <ListItemText primary={getNls(['header', 'logout'])} />
              </ListItem>
            </List>
          </div>
        </Drawer>
      </AppBar>
    )
  }
}

export default withRouter(Header);
