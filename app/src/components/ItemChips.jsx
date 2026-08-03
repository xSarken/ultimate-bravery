import IconImg from './IconImg.jsx';

export default function ItemChips({ items }){
  return items.map((it,i)=>(
    <span className={`chip ${it.isSupport?'support-item':''}`} key={i}>
      <IconImg src={it.url} alt={it.name} />
      {it.name}
    </span>
  ));
}
