// Champions whose real kit imposes extra skill-order restrictions beyond the
// standard rank-cap rule (verified against current League mechanics, Aug 2026):
// - forceFirst: the ability is auto-ranked at champion select, so the level-1
//   point is not a free choice (Azir always starts Arise! (W), Zeri always
//   starts Burst Fire! (Q)).
// - locked[key]=[prereqs]: `key` can't receive its first point until level 2+
//   AND (prereqs is empty, meaning simply "not at level 1", OR at least one
//   listed prereq ability already has a point). Shen's Spirit's Refuge (W)
//   requires Twilight Assault (Q); Zilean's Rewind (W) requires either Time
//   Bomb (Q) or Time Warp (E); Xayah's Bladecaller (E) requires either Double
//   Daggers (Q) or Deadly Plumage (W); Yuumi's You and Me! (W) is already
//   partially active at level 1 so it simply can't take the first point.
// This appears to be the complete/canonical list of such exceptions in the
// live game — if Riot adds more on future champions, extend this table
// following the same shape.
export const SKILL_ORDER_RULES = {
  Azir:   { forceFirst:'W' },
  Zeri:   { forceFirst:'Q' },
  Shen:   { locked:{ W:['Q'] } },
  Zilean: { locked:{ W:['Q','E'] } },
  Xayah:  { locked:{ E:['Q','W'] } },
  Yuumi:  { locked:{ W:[] } }
};
