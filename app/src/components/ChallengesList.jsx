export default function ChallengesList({ challenges }){
  return (
    <ul className="challenges">
      {challenges.map((c,i)=>(<li key={i}>{c.text}</li>))}
    </ul>
  );
}
