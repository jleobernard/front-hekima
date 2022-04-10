import React, {useEffect, useState} from 'react';
import {get, httpDelete} from "../../utils/http";
import "./note-view.scss";
import "../../styles/layout.scss";
import Header from "../../components/header/Header";
import Toaster from "../../components/Toaster";
import EditIcon from "@material-ui/icons/Edit";
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
import {NoteDetail} from "../../components/note/note-detail";
import {useLocation, useNavigate, useParams} from "react-router-dom";


const NoteView = () => {
    const params = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [editing, setEditing] = useState(false)
    const [note, setNote] = useState({})
    const [error, setError] = useState("");
    const [errorSev, setErrorSev] = useState("error");
    const [askDelete, setAskDelete] = useState(false);
    useEffect(() => {
        if (params.uri && note.uri !== params.uri) {
            load()
        }
    }, [note.uri]);

    function load() {
        const uri = params.uri
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
        setAskDelete(false)
        httpDelete('/api/notes/' + note.uri)
            .then(() => {
                setError("La note a bien été supprimée");
                setErrorSev("info")
                setTimeout(() => navigate('/notes'), 1000)
            }).catch(err => {
                setError('Erreur lors de la suppression de la note : ' + err)
                setErrorSev("error")
            })
            .finally(() => setDeleting(false));
    }

    function renderEdit() {
        return (<NoteCreation creating={false} note={note} onDone={load}/>)
    }

    function goBack() {
        const fields = ['src', 'tags', 'offset', 'count']
        const urlParams = new URLSearchParams(location.search)
        const _params = fields.filter(f => urlParams.get(f))
            .map(f => `${f}=${urlParams.get(f)}`);
        if(note && note.uri) {
            _params.push(`note=${note.uri}`)
        }
        const getParams = _params.length > 0 ? '?' + _params.join('&') : '';
        navigate('/notes'+getParams)
    }

    function renderDisplay() {
        return (
            <div>
                <NoteDetail note={note} />
                <ButtonGroup className="button-group centered with-margin-top spread bottom coloured">
                    <IconButton type='submit' color="primary"
                                onClick={() => goBack()}>
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

export default NoteView;
