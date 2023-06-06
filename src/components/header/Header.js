import { AppBar, Box, IconButton, List, ListItem, ListItemText, SwipeableDrawer, Toolbar } from "@mui/material";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from '@mui/icons-material/Search';
import * as React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { upload } from "utils/http";
import SearchFilter from "../search-filter/search-filter";
import "./header.scss";

export const Header = ({filterChanged, title, withSearch, goBack }) => {
  const [menuOpened, setMenuOpened] = useState(false)
  const [openFilter, setOpenFilter] = useState(false)
  const [filter, setFilter] = useState({})
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

  function fileChanged(event) {
    const file = event.target.files[0]
    const formData = new FormData();
		formData.append('File', file);
    upload('/api/kosubs:upload', file)
    .then((response) => console.log("Done uploading..."))
    .catch((error) => {
      console.error('Error :', error);
    });
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
          size="large">
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
            <ListItem button key='upload' className="side-menu-item">
                <input type="file" id="uploaded-file" accept="video/*" onChange={fileChanged} />
            </ListItem>
          </List>
        </Box>
      </SwipeableDrawer>
      <SearchFilter open={openFilter} onDone={updateFilter}/>
    </AppBar>
  );
}

export default Header;
