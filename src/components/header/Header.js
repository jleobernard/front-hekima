import * as React from "react";
import Typography from "@material-ui/core/Typography";
import {getLanguages, logout} from "../../utils/storage";
import {Link, withRouter} from "react-router-dom";
import SearchIcon from '@material-ui/icons/Search';
import "./header.scss";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SearchFilter from "../search-filter/search-filter";
import MenuIcon from "@material-ui/icons/Menu";
import {AppBar, IconButton, List, ListItem, ListItemText, SwipeableDrawer, Toolbar} from "@material-ui/core";

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpened: false,
      progress: 0,
      openFilter: false,
      filter: {}
    };
    this.goBack = this.goBack.bind(this);
    this.goHome = this.goHome.bind(this);
    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.startSearch = this.startSearch.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
  }
  goBack() {
    this.props.history.goBack()
  }
  goHome() {
    this.props.history.push("/notes")
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
  toggleDrawer(newState) {
    this.setState({menuOpened: newState});
  }
  logout() {
    logout();
    this.props.history.push('/login');
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

  startSearch() {
    this.setState({
      openFilter: true
    })
  }

  updateFilter(newFilter) {
    this.setState({
      openFilter: false,
      filter: newFilter
    });
    this.props.filterChanged(newFilter)
  }

  render() {
    return (
      <AppBar position="fixed">
        <Toolbar className="toolbar">
          <IconButton
            edge="start"
            className="with-margin-right"
            color="inherit"
            aria-label="open drawer"
            onClick={() => this.toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" className={"title " + (!this.props.title ? 'website-title-header' : '')} noWrap
            onClick={() => this.goHome()}>
            {this.props.title || 'Notes'}
          </Typography>
          {this.props.withSearch ? <SearchIcon onClick={this.startSearch}/>: ''}
          {this.props.goBack ? <div className="back-icon" onClick={this.goBack}><ArrowBackIcon /></div> : ''}
        </Toolbar>
        <SwipeableDrawer
          anchor='left'
          open={this.state.menuOpened}
          onClose={() => this.toggleDrawer(false)}
          onOpen={() => this.toggleDrawer(true)}
        >
          <List>
            <ListItem button key='notes'>
              <Link to={"/"}>
                <ListItemText primary={'Notes'} />
              </Link>
            </ListItem>
            <ListItem button key='quizz'>
              <Link to={"/quizz/init"}>
                <ListItemText primary={'Quizz'} />
              </Link>
            </ListItem>
          </List>
        </SwipeableDrawer>
        <SearchFilter open={this.state.openFilter}
    filter={this.state.filter}
    onDone={this.updateFilter}/>
      </AppBar>
    )
  }
}

export default withRouter(Header);
