// Static art (no fetch): every image is a direct <img src> against Data
// Dragon, Riot's public asset CDN. If Riot ever changes an icon's ID, the
// onerror handler on the <img> just swaps it for a colored monogram —
// nothing ever breaks.
export const DD_VER = "16.15.1"; // any valid past patch works forever — ddragon never deletes old version folders
export function ddItem(id){ return `https://ddragon.leagueoflegends.com/cdn/${DD_VER}/img/item/${id}.png`; }
export function ddSpell(file){ return `https://ddragon.leagueoflegends.com/cdn/${DD_VER}/img/spell/${file}.png`; }
export function ddChampionLoading(champId){ return `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champId}_0.jpg`; }
// Splash art is the native-landscape, high-res (~1215x717) promo image Riot
// actually composes for widescreen display — unlike the "loading" image
// above (a portrait crop meant for the vertical client loading screen),
// this is the right source for a wide banner and shows faces/poses properly
// without an awkward crop.
// skinNum 0 is always the base skin; any higher number is an alternate skin
// if the champion has one — no way to know a champion's skin count without
// fetching per-champion metadata, so callers doing decorative/best-effort
// art (e.g. the background) just try a number and let onerror fall back.
export function ddChampionSplash(champId, skinNum=0){ return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champId}_${skinNum}.jpg`; }

const RUNE_BASE = "https://ddragon.leagueoflegends.com/cdn/img/";
function rIcon(rel){ return RUNE_BASE + rel; }

// Every icon path below was verified directly against Data Dragon's runesReforged.json
// (non-versioned path — these never move even across patches).
// `rows` holds the real 3 minor-rune rows per tree (verified against a live
// runesReforged.json pull) — a real rune page picks exactly ONE minor per row
// for your primary tree (3 total) and 2 minors from 2 DIFFERENT rows for your
// secondary tree; see pickRunes() in rollEngine.js. The previous flat list
// here was stale (missing whole rows, and included at least one removed rune
// — "Overheal" — while missing current ones like Legend: Haste/Bloodline,
// Last Stand, Zombie Ward, Ghost Poro, Second Wind, Bone Plating, etc.).
export const RUNE_TREES = {
  Precision:{
    color:"#C8AA6E", treeIcon: rIcon("perk-images/Styles/7201_Precision.png"),
    keystones:[
      {name:"Press the Attack", icon:rIcon("perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png")},
      {name:"Lethal Tempo", icon:rIcon("perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png")},
      {name:"Fleet Footwork", icon:rIcon("perk-images/Styles/Precision/FleetFootwork/FleetFootwork.png")},
      {name:"Conqueror", icon:rIcon("perk-images/Styles/Precision/Conqueror/Conqueror.png")}
    ],
    rows:[
      [
        {name:"Absorb Life", icon:rIcon("perk-images/Styles/Precision/AbsorbLife/AbsorbLife.png")},
        {name:"Triumph", icon:rIcon("perk-images/Styles/Precision/Triumph.png")},
        {name:"Presence of Mind", icon:rIcon("perk-images/Styles/Precision/PresenceOfMind/PresenceOfMind.png")}
      ],
      [
        {name:"Legend: Alacrity", icon:rIcon("perk-images/Styles/Precision/LegendAlacrity/LegendAlacrity.png")},
        {name:"Legend: Haste", icon:rIcon("perk-images/Styles/Precision/LegendHaste/LegendHaste.png")},
        {name:"Legend: Bloodline", icon:rIcon("perk-images/Styles/Precision/LegendBloodline/LegendBloodline.png")}
      ],
      [
        {name:"Coup de Grace", icon:rIcon("perk-images/Styles/Precision/CoupDeGrace/CoupDeGrace.png")},
        {name:"Cut Down", icon:rIcon("perk-images/Styles/Precision/CutDown/CutDown.png")},
        {name:"Last Stand", icon:rIcon("perk-images/Styles/Sorcery/LastStand/LastStand.png")}
      ]
    ]
  },
  Domination:{
    color:"#e05a4e", treeIcon: rIcon("perk-images/Styles/7200_Domination.png"),
    keystones:[
      {name:"Electrocute", icon:rIcon("perk-images/Styles/Domination/Electrocute/Electrocute.png")},
      {name:"Dark Harvest", icon:rIcon("perk-images/Styles/Domination/DarkHarvest/DarkHarvest.png")},
      {name:"Hail of Blades", icon:rIcon("perk-images/Styles/Domination/HailOfBlades/HailOfBlades.png")}
    ],
    rows:[
      [
        {name:"Cheap Shot", icon:rIcon("perk-images/Styles/Domination/CheapShot/CheapShot.png")},
        {name:"Taste of Blood", icon:rIcon("perk-images/Styles/Domination/TasteOfBlood/GreenTerror_TasteOfBlood.png")},
        {name:"Sudden Impact", icon:rIcon("perk-images/Styles/Domination/SuddenImpact/SuddenImpact.png")}
      ],
      [
        {name:"Sixth Sense", icon:rIcon("perk-images/Styles/Domination/SixthSense/SixthSense.png")},
        {name:"Grisly Mementos", icon:rIcon("perk-images/Styles/Domination/GrislyMementos/GrislyMementos.png")},
        {name:"Deep Ward", icon:rIcon("perk-images/Styles/Domination/DeepWard/DeepWard.png")}
      ],
      [
        {name:"Treasure Hunter", icon:rIcon("perk-images/Styles/Domination/TreasureHunter/TreasureHunter.png")},
        {name:"Relentless Hunter", icon:rIcon("perk-images/Styles/Domination/RelentlessHunter/RelentlessHunter.png")},
        {name:"Ultimate Hunter", icon:rIcon("perk-images/Styles/Domination/UltimateHunter/UltimateHunter.png")}
      ]
    ]
  },
  Sorcery:{
    color:"#8fb8ff", treeIcon: rIcon("perk-images/Styles/7202_Sorcery.png"),
    keystones:[
      {name:"Summon Aery", icon:rIcon("perk-images/Styles/Sorcery/SummonAery/SummonAery.png")},
      {name:"Arcane Comet", icon:rIcon("perk-images/Styles/Sorcery/ArcaneComet/ArcaneComet.png")},
      {name:"Stormraider's Surge", icon:rIcon("perk-images/Styles/Sorcery/PhaseRush/StormraidersSurgeRuneIcon2.png")},
      {name:"Deathfire Touch", icon:rIcon("perk-images/Styles/Sorcery/DeathfireTouch/DEATHFIRE_TOUCH_KEYSTONE.png")}
    ],
    rows:[
      [
        {name:"Axiom Arcanist", icon:rIcon("perk-images/Styles/Sorcery/NullifyingOrb/Axiom_Arcanist.png")},
        {name:"Manaflow Band", icon:rIcon("perk-images/Styles/Sorcery/ManaflowBand/ManaflowBand.png")},
        {name:"Nimbus Cloak", icon:rIcon("perk-images/Styles/Sorcery/NimbusCloak/6361.png")}
      ],
      [
        {name:"Transcendence", icon:rIcon("perk-images/Styles/Sorcery/Transcendence/Transcendence.png")},
        {name:"Celerity", icon:rIcon("perk-images/Styles/Sorcery/Celerity/CelerityTemp.png")},
        {name:"Absolute Focus", icon:rIcon("perk-images/Styles/Sorcery/AbsoluteFocus/AbsoluteFocus.png")}
      ],
      [
        {name:"Scorch", icon:rIcon("perk-images/Styles/Sorcery/Scorch/Scorch.png")},
        {name:"Waterwalking", icon:rIcon("perk-images/Styles/Sorcery/Waterwalking/Waterwalking.png")},
        {name:"Gathering Storm", icon:rIcon("perk-images/Styles/Sorcery/GatheringStorm/GatheringStorm.png")}
      ]
    ]
  },
  Resolve:{
    color:"#6fcf87", treeIcon: rIcon("perk-images/Styles/7204_Resolve.png"),
    keystones:[
      {name:"Grasp of the Undying", icon:rIcon("perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png")},
      {name:"Aftershock", icon:rIcon("perk-images/Styles/Resolve/VeteranAftershock/VeteranAftershock.png")},
      {name:"Guardian", icon:rIcon("perk-images/Styles/Resolve/Guardian/Guardian.png")}
    ],
    rows:[
      [
        {name:"Demolish", icon:rIcon("perk-images/Styles/Resolve/Demolish/Demolish.png")},
        {name:"Font of Life", icon:rIcon("perk-images/Styles/Resolve/FontOfLife/FontOfLife.png")},
        {name:"Shield Bash", icon:rIcon("perk-images/Styles/Resolve/MirrorShell/MirrorShell.png")}
      ],
      [
        {name:"Conditioning", icon:rIcon("perk-images/Styles/Resolve/Conditioning/Conditioning.png")},
        {name:"Second Wind", icon:rIcon("perk-images/Styles/Resolve/SecondWind/SecondWind.png")},
        {name:"Bone Plating", icon:rIcon("perk-images/Styles/Resolve/BonePlating/BonePlating.png")}
      ],
      [
        {name:"Overgrowth", icon:rIcon("perk-images/Styles/Resolve/Overgrowth/Overgrowth.png")},
        {name:"Revitalize", icon:rIcon("perk-images/Styles/Resolve/Revitalize/Revitalize.png")},
        {name:"Unflinching", icon:rIcon("perk-images/Styles/Sorcery/Unflinching/Unflinching.png")}
      ]
    ]
  },
  Inspiration:{
    color:"#5ce0d8", treeIcon: rIcon("perk-images/Styles/7203_Whimsy.png"),
    keystones:[
      {name:"Glacial Augment", icon:rIcon("perk-images/Styles/Inspiration/GlacialAugment/GlacialAugment.png")},
      {name:"Unsealed Spellbook", icon:rIcon("perk-images/Styles/Inspiration/UnsealedSpellbook/UnsealedSpellbook.png")},
      {name:"First Strike", icon:rIcon("perk-images/Styles/Inspiration/FirstStrike/FirstStrike.png")}
    ],
    rows:[
      [
        {name:"Hextech Flashtraption", icon:rIcon("perk-images/Styles/Inspiration/HextechFlashtraption/HextechFlashtraption.png")},
        {name:"Magical Footwear", icon:rIcon("perk-images/Styles/Inspiration/MagicalFootwear/MagicalFootwear.png")},
        {name:"Cash Back", icon:rIcon("perk-images/Styles/Inspiration/CashBack/CashBack2.png")}
      ],
      [
        {name:"Triple Tonic", icon:rIcon("perk-images/Styles/Inspiration/PerfectTiming/AlchemistCabinet.png")},
        {name:"Time Warp Tonic", icon:rIcon("perk-images/Styles/Inspiration/TimeWarpTonic/TimeWarpTonic.png")},
        {name:"Biscuit Delivery", icon:rIcon("perk-images/Styles/Inspiration/BiscuitDelivery/BiscuitDelivery.png")}
      ],
      [
        {name:"Cosmic Insight", icon:rIcon("perk-images/Styles/Inspiration/CosmicInsight/CosmicInsight.png")},
        {name:"Approach Velocity", icon:rIcon("perk-images/Styles/Resolve/ApproachVelocity/ApproachVelocity.png")},
        {name:"Jack Of All Trades", icon:rIcon("perk-images/Styles/Inspiration/JackOfAllTrades/JackofAllTrades2.png")}
      ]
    ]
  }
};

function statIcon(file){ return rIcon("perk-images/StatMods/" + file); }

// The 3 Stat Shard rows (offense/flex/defense) — a separate system from the
// 5 tree-based runes above, but still part of every real rune page. Values
// verified directly against the live League wiki (names/values do shift
// between seasons, e.g. this is NOT an Armor/MR row like older rune pages
// had — the current flex row is Adaptive Force / Movement Speed / Health).
export const STAT_SHARDS = {
  offense: [
    {name:"Adaptive Force", icon: statIcon("StatModsAdaptiveForceIcon.png")},
    {name:"Attack Speed", icon: statIcon("StatModsAttackSpeedIcon.png")},
    {name:"Ability Haste", icon: statIcon("StatModsCDRScalingIcon.png")}
  ],
  flex: [
    {name:"Adaptive Force", icon: statIcon("StatModsAdaptiveForceIcon.png")},
    {name:"Movement Speed", icon: statIcon("StatModsMovementSpeedIcon.png")},
    {name:"Health", icon: statIcon("StatModsHealthScalingIcon.png")}
  ],
  defense: [
    {name:"Health", icon: statIcon("StatModsHealthPlusIcon.png")},
    {name:"Tenacity and Slow Resist", icon: statIcon("StatModsTenacityIcon.png")},
    {name:"Health", icon: statIcon("StatModsHealthScalingIcon.png")}
  ]
};

// Curated pool of long-standing items with verified stable numeric IDs (renders real icons)
export const ITEM_POOL = [
  {name:"Infinity Edge", id:3031, ad:true}, {name:"Rabadon's Deathcap", id:3089, ap:true}, {name:"Trinity Force", id:3078, ad:true},
  {name:"Sunfire Aegis", id:3068, tank:true}, {name:"Guinsoo's Rageblade", id:3124, ad:true}, {name:"Blade of the Ruined King", id:3153, ad:true},
  {name:"Nashor's Tooth", id:3115, ap:true}, {name:"Manamune", id:3004, ad:true}, {name:"Youmuu's Ghostblade", id:3142, ad:true},
  {name:"Void Staff", id:3135, ap:true}, {name:"Zhonya's Hourglass", id:3157, ap:true}, {name:"Banshee's Veil", id:3102, tank:true, ap:true},
  {name:"Spirit Visage", id:3065, tank:true}, {name:"Thornmail", id:3075, tank:true}, {name:"Randuin's Omen", id:3143, tank:true},
  {name:"Frozen Heart", id:3110, tank:true}, {name:"Locket of the Iron Solari", id:3190, tank:true}, {name:"Redemption", id:3107, ap:true},
  {name:"Bloodthirster", id:3072, ad:true}, {name:"Statikk Shiv", id:3087, ad:true}, {name:"Runaan's Hurricane", id:3085, ad:true},
  {name:"Rapid Firecannon", id:3094, ad:true}, {name:"Essence Reaver", id:3508, ad:true}, {name:"Sterak's Gage", id:3053, tank:true, ad:true},
  {name:"Black Cleaver", id:3071, ad:true}, {name:"Morellonomicon", id:3165, ap:true}, {name:"Mikael's Blessing", id:3222, ap:true}
].map(it => ({...it, url: ddItem(it.id)}));

export const BOOT_POOL = [
  {name:"Berserker's Greaves", id:3006}, {name:"Plated Steelcaps", id:3047}, {name:"Mercury's Treads", id:3111},
  {name:"Sorcerer's Shoes", id:3020}, {name:"Ionian Boots of Lucidity", id:3158}, {name:"Boots of Swiftness", id:3009}
].map(it => ({...it, url: ddItem(it.id)}));

// Support role always gets one of these guaranteed in their build. These are
// the actual 5 legendary choices the support-quest item (World Atlas ->
// Runic Compass -> Bounty of Worlds) upgrades into once the quest completes
// — not just "a support-flavored item" — verified against a live item.json
// pull. IDs confirmed identical across old and current DD_VER, so this pinned
// version is safe.
export const SUPPORT_ITEMS = [
  {name:"Bloodsong", id:3877},
  {name:"Celestial Opposition", id:3869},
  {name:"Dream Maker", id:3870},
  {name:"Solstice Sleigh", id:3876},
  {name:"Zaz'Zak's Realmspike", id:3871},
].map(it => ({...it, url: ddItem(it.id)}));

export const SPELL_ICONS = {
  Flash: ddSpell("SummonerFlash"), Ignite: ddSpell("SummonerDot"), Teleport: ddSpell("SummonerTeleport"),
  Exhaust: ddSpell("SummonerExhaust"), Heal: ddSpell("SummonerHeal"), Barrier: ddSpell("SummonerBarrier"),
  Cleanse: ddSpell("SummonerBoost"), Ghost: ddSpell("SummonerHaste"), Smite: ddSpell("SummonerSmite")
};
export const SPELLS_NON_JUNGLE = ["Flash","Ignite","Teleport","Exhaust","Heal","Barrier","Cleanse","Ghost"];
export const SMITE = "Smite";
