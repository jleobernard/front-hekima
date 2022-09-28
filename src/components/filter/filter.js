import React, {useEffect, useState} from 'react';
import "../../styles/forms.scss";
import { SourcesSelector } from './sources-selector';
import { TagsSelector } from './tags-selector';
import { KeywordSelector } from './keyword-selector';


const NoteFilter = ({allowCreation, onFilterChanged, filter}) => {
  const [source, setSource] = useState(filter.source)
  const [tags, setTags] = useState([...(filter.tags || [])])
  const [notTags, setNotTags] = useState([...(filter.notTags || [])])
  const [q, setQ] = useState(filter.q)

  useEffect(() => {
    onFilterChanged({source, tags, notTags, q})
  }, [source, tags, notTags, q])

  return (
    <div className="flex-column">
      <KeywordSelector onChange={q => setQ(q)} />
      <SourcesSelector allowCreation={allowCreation} onChange={source => setSource(source)} sources={source} multiple={false}/>
      <TagsSelector allowCreation={allowCreation} onChange={tags => setTags(tags)} tags={tags}/>
      <TagsSelector allowCreation={allowCreation} onChange={notTags => setNotTags(notTags)} title="Tags exclus" tags={notTags}/>
    </div>
  )

}

export default NoteFilter;
