import React, {useEffect, useState} from 'react';
import "../../styles/forms.scss";
import { SourcesSelector } from './sources-selector';
import { TagsSelector } from './tags-selector';
import { KeywordSelector } from './keyword-selector';


const NoteFilter = ({allowCreation, withFTS, onFilterChanged, filter}) => {
  const [sources, setSources] = useState([...(filter.sources || [])])
  const [tags, setTags] = useState([...(filter.tags || [])])
  const [notTags, setNotTags] = useState([...(filter.notTags || [])])
  const [q, setQ] = useState(filter.q)

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
