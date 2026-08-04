// noBoots challenge actively changes the build (see pickItems in rollEngine):
// boots are dropped and replaced with a 6th full item instead, so the build
// never looks "broken". ADC is exempt from it — losing boots hurts a kiting
// role too much.
//
// Every entry here must be independently completable regardless of which
// champion/role/spells actually got rolled (no "use your Flash for X" style
// challenges gated on a spell you might not have), and checked against the
// rest of the list for direct contradictions (e.g. a challenge that requires
// chatting before minute 5 can't coexist with a "ping only" early-game rule).
export const CHALLENGES = [
  {text:"Cannot buy boots this game — bare feet only", noBoots:true},
  {text:"Recall only when you have 1000+ gold banked"},
  {text:"Ward the enemy jungle before your own every single back"},
  {text:"No ability casts before 3 minutes — autos only"},
  {text:"Must full-clear a jungle quadrant at least once, any role"},
  {text:"Emote after every kill or assist, no exceptions"},
  {text:"Cannot use your second summoner spell all game"},
  {text:"Buy a Control Ward on every back, sell it if you must"},
  {text:"Must duel the first enemy who dives you, whatever the odds"},
  {text:"Roam bottom lane before 6 minutes no matter where you're assigned"},
  {text:"Type 'gg' in all chat the moment you hit level 6"},
  {text:"Only walk — no dashes, blinks, or movement-speed abilities used offensively"},
  {text:"Must ping 'Assist Me' at least 5 times before 10 minutes"},
  {text:"Proxy farm the wrong lane's wave at least once"},
  {text:"Cannot recall to base until 5 minutes have passed"},
  {text:"Every back, buy at least one consumable (potion, ward, elixir)"},
  {text:"Must build full tank items regardless of your champion", onlyTank:true, group:"buildArchetype"},
  {text:"Must build a full AP build regardless of your champion", onlyAP:true, group:"buildArchetype"},
  {text:"Must build a full AD build regardless of your champion", onlyAD:true, group:"buildArchetype"},
  {text:"No flash allowed for the entire game"},
  {text:"Must 1v1 the jungler at their red buff if you cross paths"},
  {text:"Only communicate via ping for the first 10 minutes"},
  {text:"Buy the cheapest item in the shop on your first back, on purpose"},
  {text:"Ping 'On My Way' before every Dragon or Baron your team starts"},
  {text:"Screenshot your build the moment your 3rd item completes, however bad it looks"},
  {text:"Must use your first summoner spell within 15 seconds of it coming off cooldown, every time"},
  {text:"Chat one deliberately unhinged 'strategy' to your team after minute 10"},
  {text:"Take the scenic route through your own jungle every time you recall back to lane"},
];
