import { DeleteForever, RefreshOutlined } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import { ButtonGroup } from "@mui/material";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Dialog from "@mui/material/Dialog/Dialog";
import DialogActions from "@mui/material/DialogActions/DialogActions";
import DialogContent from "@mui/material/DialogContent/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle/DialogTitle";
import IconButton from "@mui/material/IconButton";
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { deleteNote, findNoteByUri, refreshNote } from 'services/note-services';
import Toaster from "../../components/Toaster";
import Header from "../../components/header/Header";
import LoadingMask from "../../components/loading-mask/loading-mask";
import NoteCreation from "../../components/note-creation/note-creation";
import { NoteDetail } from "../../components/note/note-detail";
import "../../styles/layout.scss";
import "./note-view.scss";
import { setRaz } from "store/features/notesSlice";
import { useDispatch } from 'react-redux';



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
    const dispatch = useDispatch()
    useEffect(() => {
        if (params.uri && note.uri !== params.uri) {
            load()
        }
    }, [note.uri]);

    function load() {
        const uri = params.uri
        setLoading(true)

        return findNoteByUri(uri)
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
        deleteNote(note.uri)
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
        dispatch(setRaz(true))
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

    async function refresh() {
        setLoading(true)
        await refreshNote(note);
        setLoading(false)
    }
/*
    async function refreshAll() {

        setLoading(true)
        await refreshAllNotes();
        setLoading(false)
    }*/

    function renderDisplay() {
        return (
            <div>
                <NoteDetail note={note} />
                <ButtonGroup className="button-group centered with-margin-top spread bottom coloured">
                    <IconButton type='submit' color="primary" onClick={() => goBack()} size="large">
                        <ArrowBackIcon/>
                    </IconButton>
                    <IconButton type='submit' color="primary" onClick={() => refresh()} size="large">
                        <RefreshOutlined/>
                    </IconButton>
                    <IconButton
                        type='submit'
                        color="secondary"
                        onClick={() => setAskDelete(true)}
                        size="large"><DeleteForever/></IconButton>
                    <IconButton type='submit' onClick={() => setEditing(true)} size="large"><EditIcon/></IconButton>
                </ButtonGroup>
            </div>
        );
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
