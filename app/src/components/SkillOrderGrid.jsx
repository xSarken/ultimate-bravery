const COLORS = {Q:'#5cc8ff', W:'#7fd858', E:'#ff9d4d', R:'#c990ff'};

export default function SkillOrderGrid({ skillOrder }){
  return (
    <>
      <div className="skill-grid">
        {skillOrder.order.map((l,i)=>{
          const c = COLORS[l];
          return (
            <span
              key={i}
              className="skill-cell"
              style={{background:`${c}22`, border:`1px solid ${c}77`, color:c}}
              title={`Level ${i+1}: ${l}`}
            >
              {l}<b>{i+1}</b>
            </span>
          );
        })}
      </div>
      <div className="skill-summary">
        Maxed in order: {skillOrder.maxedOrder.map((l,i)=>(
          <span key={l}>
            {i>0 && ' → '}
            <b style={{color:COLORS[l]}}>{l}</b>
          </span>
        ))} <span className="path-tag">(R at 6 / 11 / 16)</span>
      </div>
    </>
  );
}
