import {NoteFilesDisplay} from "./note-files/note-files-display";
import VideoThumbnailList from "../medias/video-tumbnail-list";
import Typography from "@material-ui/core/Typography";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Chip from "@material-ui/core/Chip";
import React from "react";

export function NoteDetail({note}) {
  return (
    <div>
      <NoteFilesDisplay note={note}/>
      {note.subs && note.subs.length > 0 ? <VideoThumbnailList title="" videos={note.subs}/> : <></>}
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
    </div>
  )
}
