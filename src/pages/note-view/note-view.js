import React, {useEffect, useState} from 'react';
import {withRouter} from "react-router-dom";
import {get, httpDelete} from "../../utils/http";
import "./note-view.scss";
import "../../styles/layout.scss";
import Header from "../../components/header/Header";
import {useHistory} from "react-router-dom/cjs/react-router-dom";
import VideoThumbnailList from "../../components/medias/video-tumbnail-list";
import Typography from "@material-ui/core/Typography";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Chip from "@material-ui/core/Chip";
import Toaster from "../../components/Toaster";
import EditIcon from "@material-ui/icons/Edit";
import {NoteFilesDisplay} from "../../components/note/note-files/note-files-display";
import LoadingMask from "../../components/loading-mask/loading-mask";
import {ButtonGroup} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import {DeleteForever} from "@material-ui/icons";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import Dialog from "@material-ui/core/Dialog/Dialog";
import NoteCreation from "../../components/note-creation/note-creation";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";


const NoteView = ({match}) => {
    const history = useHistory()
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [editing, setEditing] = useState(false)
    const [note, setNote] = useState({})
    const [error, setError] = useState("");
    const [errorSev, setErrorSev] = useState("error");
    const [askDelete, setAskDelete] = useState(false);
    useEffect(() => {
        if (match.params.uri && note.uri !== match.params.uri) {
            load()
        }
    }, [note.uri]);

    function load() {
        const uri = match.params.uri
        setLoading(true)
        return get('/api/notes/' + uri)
            .then(note => {
                setNote(note)
                setEditing(false)
            })
            .catch(err => setError("Impossible de charger la note : " + err))
            .finally(() => setLoading(false))
    }

    function doDelete() {
        setDeleting(true)
        httpDelete('/api/notes/' + note.uri)
            .then(() => {
                setError("La note a bien été supprimée");
                setErrorSev("info")
                setTimeout(() => history.push('/notes'), 3000)
            }).catch(err => {
                setError('Erreur lors de la suppression de la note : ' + err)
                setErrorSev("error")
            })
            .finally(() => setDeleting(false));
    }

    function renderEdit() {
        return (<NoteCreation creating={false} note={note} onDone={load}/>)
    }

    function renderDisplay() {
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
                <ButtonGroup className="button-group centered with-margin-top spread bottom coloured">
                    <IconButton type='submit' color="primary"
                                onClick={() => history.push('/notes'+(note ? '#'+note.uri : ''))}>
                        <ArrowBackIcon/>
                    </IconButton>
                    <IconButton type='submit' color="secondary"
                                onClick={() => setAskDelete(true)}><DeleteForever/></IconButton>
                    <IconButton type='submit'
                                onClick={() => setEditing(true)}><EditIcon/></IconButton>
                </ButtonGroup>
            </div>
        )
    }

    function renderNote() {
        return (
            <div>
                {editing ? renderEdit(): renderDisplay()}
                <Dialog open={askDelete}
                        onClose={() => setAskDelete(false)}
                        fullScreen={false}
                        aria-labelledby="deletion-dialog-title">
                    <DialogTitle id="deletion-dialog-title">Suppression de la note</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Vous-vous vraiment supprimer cette note ?</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAskDelete(false)} color="primary">
                            Annuler
                        </Button>
                        <Button onClick={doDelete} color="primary">
                            Supprimer {deleting ? <CircularProgress/> : ''}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }

    return (
        <div className="app">
            <Header title="Note" goBack={false} withSearch={false}/>
            {note && note.uri ? renderNote() : <></>}
            <LoadingMask loading={loading}/>
            <Toaster error={error} severity={errorSev}/>
        </div>
    )
}

export default withRouter(NoteView);
