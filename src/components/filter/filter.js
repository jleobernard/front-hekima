import React, {useEffect, useState} from 'react';
import "../../styles/forms.scss";
import { useSelector, useDispatch } from 'react-redux';
import {
  selectFilter} from '../../store/features/notesSlice';
import { SourcesSelector } from './sources-selector';
import { TagsSelector } from './tags-selector';
import { KeywordSelector } from './keyword-selector';


const NoteFilter = ({allowCreation, withFTS, onFilterChanged}) => {

  const [sources, setSources] = useState([])
  const [tags, setTags] = useState([])
  const [notTags, setNotTags] = useState([])
  const [q, setQ] = useState('')

  const filter = useSelector(selectFilter)

  useEffect(() => {
    setSources(filter.sources)
    setTags(filter.tags)
    setNotTags(filter.notTags)
    setQ(filter.q)
  }, [filter])

  useEffect(() => {
    onFilterChanged({sources, tags, notTags, q})
  }, [sources, tags, notTags, q])


  const types = [
    {type: 'Livre'},
    {type: 'MOOC'},
    {type: 'Journal'},
    {type: 'Cours'}
  ]
  return (
    <div className="flex-column">
      {withFTS ? <KeywordSelector onChange={q => setQ(q)} /> : <></>}
      <SourcesSelector allowCreation={allowCreation} onChange={sources => setSources(sources)} />
      <TagsSelector allowCreation={allowCreation} onChange={tags => setTags(tags)}/>
      <TagsSelector allowCreation={allowCreation} onChange={notTags => setNotTags(notTags)} title="Tags exclus"/>
    </div>
  )

}

export default NoteFilter;
