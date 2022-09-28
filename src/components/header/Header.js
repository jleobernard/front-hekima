import * as React from "react";
import {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import {getLanguages, logout} from "../../utils/storage";
import {Link} from "react-router-dom";
import SearchIcon from '@material-ui/icons/Search';
import "./header.scss";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SearchFilter from "../search-filter/search-filter";
import MenuIcon from "@material-ui/icons/Menu";
import {AppBar, Box, IconButton, List, ListItem, ListItemText, SwipeableDrawer, Toolbar} from "@material-ui/core";

export const Header = ({onSearch, filterChanged, title, withSearch, goBack }) => {
  const [menuOpened, setMenuOpened] = useState(false)
  const [progress, setProgress] = useState(0)
  const [openFilter, setOpenFilter] = useState(false)
  const [filter, setFilter] = useState({})
  const [searchInput, setSearchInput] = useState('')
  const navigate = useNavigate();
  
  function doGoBack() {
    navigate(-1)
  }
  function goHome() {
    navigate("/notes")
  }
  function toggleDrawer(newState) {
    setMenuOpened(newState);
  }
  function startSearch() {
    setOpenFilter(true)
  }

  function updateFilter(newFilter) {
    setOpenFilter(false)
    setFilter(newFilter)
    filterChanged(newFilter)
  }
  return (
    <AppBar position="fixed">
      <Toolbar className="toolbar">
        <IconButton
          edge="start"
          className="with-margin-right"
          color="inherit"
          aria-label="open drawer"
          onClick={() => toggleDrawer(true)}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h5" className={"title " + (!title ? 'website-title-header' : '')} noWrap
          onClick={() => goHome()}>
          {title || 'Notes'}
        </Typography>
        {withSearch ? <SearchIcon onClick={startSearch}/>: ''}
        {goBack ? <div className="back-icon" onClick={doGoBack}><ArrowBackIcon /></div> : ''}
      </Toolbar>
      <SwipeableDrawer
        anchor='left'
        open={menuOpened}
        onClose={() => toggleDrawer(false)}
        onOpen={() => toggleDrawer(true)}
      >
        <Box role="presentation" className="side-menu">
          <List>
            <ListItem button key='notes'>
              <Link to={"/"}>
                <ListItemText primary={'Notes'} />
              </Link>
            </ListItem>
            <ListItem button key='quizz' className="side-menu-item">
              <Link to={"/quizz/init"}>
                <ListItemText primary={'Quizz'} />
              </Link>
            </ListItem>
          </List>
        </Box>
      </SwipeableDrawer>
      <SearchFilter open={openFilter} onDone={updateFilter}/>
    </AppBar>
  )
}

export default Header;
