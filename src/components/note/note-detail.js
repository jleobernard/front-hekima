import {NoteFilesDisplay} from "./note-files/note-files-display";
import VideoThumbnailList from "../medias/video-tumbnail-list";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Chip from "@mui/material/Chip";
import React from "react";
import NoteContent from "./note-content";

export function NoteDetail({note}) {
  return (
    <div>
      <NoteFilesDisplay note={note}/>
      {note.subs && note.subs.length > 0 ? <VideoThumbnailList title="" videos={note.subs}></VideoThumbnailList> : <></>}
      <Typography component="div" className={"note-text"} gutterBottom={true}>
        <NoteContent note={note} readOnly={true}></NoteContent>
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
    </div>
  )
}
