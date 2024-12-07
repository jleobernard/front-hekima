import React, {useState} from "react";
import AbcIcon from '@mui/icons-material/Abc';
import TranslateIcon from '@mui/icons-material/Translate';
import { IconButton } from "@mui/material";
import './language-type-selector.scss'

const LanguageTypeSelector = ({type, onTypeChanged}) => {
    const [types, setTypes] = useState(type)
    function setLocal() {
        changeType('local')
    }
    function setForeign() {
        changeType('foreign')
    }
    function changeType(t) {
        const idx = types.indexOf(t);
        let newTypes;
        if(idx >= 0) {
            newTypes = types.filter((_t, i) => i !== idx)
        } else {
            newTypes = [...types, t]
        }
        setTypes(newTypes)
        if(onTypeChanged) {
            onTypeChanged(newTypes)
        }
    }
    function isSelected(t) {
        return types.indexOf(t) >= 0
    }
    return (<>
        <div className={`button-selector-marker ${isSelected('local')}`}>
            <IconButton aria-label="delete" key="local" onClick={setLocal}>
                <AbcIcon />
            </IconButton>
        </div>
        <div className={`button-selector-marker ${isSelected('foreign')}`}>
            <IconButton aria-label="delete" key="foreign" onClick={setForeign}>
                <TranslateIcon />
            </IconButton>
        </div>
        </>)
}

export default LanguageTypeSelector;