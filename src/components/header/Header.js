import * as React from "react";
import Toolbar from "@material-ui/core/Toolbar";
import AppBar from '@material-ui/core/AppBar';
import Typography from "@material-ui/core/Typography";
import {getLanguages, logout} from "../../utils/storage";
import {withRouter} from "react-router-dom";
import SearchIcon from '@material-ui/icons/Search';
import "./header.scss";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SearchFilter from "../search-filter/search-filter";

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
    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.startSearch = this.startSearch.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
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
          <Typography variant="h5" className={"title " + (!this.props.title ? 'website-title-header' : '')} noWrap>
            {this.props.title || 'Notes'}
          </Typography>
          {this.props.withSearch ? <SearchIcon onClick={this.startSearch}/>: ''}
          {this.props.goBack ? <div className="back-icon" onClick={this.goBack}><ArrowBackIcon /></div> : ''}
        </Toolbar>
        <SearchFilter open={this.state.openFilter}
                      filter={this.state.filter}
                      onDone={this.updateFilter}></SearchFilter>
      </AppBar>
    )
  }
}

export default withRouter(Header);
