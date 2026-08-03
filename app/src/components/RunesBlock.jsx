import IconImg from './IconImg.jsx';

export default function RunesBlock({ runes }){
  return (
    <div className="runes-line">
      <div className="rune-group">
        <div className="keystone-row">
          <IconImg src={runes.primaryTreeIcon} alt={runes.primaryName} />
          <IconImg src={runes.keystone.icon} alt={runes.keystone.name} />
          <span className="keystone">{runes.keystone.name}</span>
          <span className="path-tag">({runes.primaryName})</span>
        </div>
        <div className="minor-row">
          {runes.primaryMinors.map(m=>(
            <span className="minor-item" key={m.name}>
              <IconImg src={m.icon} alt={m.name} />
              {m.name}
            </span>
          ))}
        </div>
      </div>
      <div className="rune-group">
        <div className="tree-tag-row">
          <IconImg src={runes.secondaryTreeIcon} alt={runes.secondaryName} />
          <span className="path-tag">({runes.secondaryName})</span>
        </div>
        <div className="minor-row">
          {runes.secondaryMinors.map(m=>(
            <span className="minor-item" key={m.name}>
              <IconImg src={m.icon} alt={m.name} />
              {m.name}
            </span>
          ))}
        </div>
      </div>
      <div className="rune-group">
        <div className="minor-row shard-row">
          {runes.shards.map((s,i)=>(
            <span className="minor-item" key={s.name + i}>
              <IconImg src={s.icon} alt={s.name} />
              {s.name}
            </span>
          ))}
          <span className="path-tag">(Shards)</span>
        </div>
      </div>
    </div>
  );
}
