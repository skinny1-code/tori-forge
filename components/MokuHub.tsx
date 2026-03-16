"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

const WC_PROJECT_ID = "0e1e0b44-0fb6-43fc-a33d-d933c0692f79";
const RONIN_CHAIN = "eip155:2020";
let wcProvider: any = null;

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
const RARITY: Record<string, { mult: number; color: string; rank: number; gemFloor: number }> = {
  Basic:     { mult: 1.00, color: "#9ca3af", rank: 1, gemFloor: 80   },
  Rare:      { mult: 1.25, color: "#14b8a6", rank: 2, gemFloor: 320  },
  Epic:      { mult: 1.50, color: "#f59e0b", rank: 3, gemFloor: 900  },
  Legendary: { mult: 1.75, color: "#ef4444", rank: 4, gemFloor: 3800 },
};
const CLASS_C: Record<string, string> = {
  Attacker: "#ef4444", Defender: "#3b82f6", Support: "#22c55e", Specialist: "#a855f7",
};
const MOKI_CLASS_C: Record<string, string> = {
  Brawler: "#ef4444", Assassin: "#a855f7", Tank: "#3b82f6", Mage: "#f59e0b", Support: "#22c55e",
};

interface Champion {
  id: number; name: string; rarity: string; stars: number; class: string;
  score: number; elims: number; winRate: number; traits: string[]; icon: string; floorPrice: number;
}
const ALL_CHAMPIONS: Champion[] = [
  { id:1,  name:"BIN DIESEL",       rarity:"Rare",      stars:7, class:"Defender",   score:340.4, elims:0.8, winRate:53.4, traits:["Gold Fur","Hoodie"],           icon:"🪣", floorPrice:0.42 },
  { id:2,  name:"BEARISH",          rarity:"Basic",     stars:2, class:"Attacker",   score:210.0, elims:1.2, winRate:44.0, traits:["Kimono","Grumpy"],             icon:"🐻", floorPrice:0.08 },
  { id:3,  name:"FILTHY",           rarity:"Basic",     stars:5, class:"Support",    score:188.0, elims:0.4, winRate:48.5, traits:["Maid","Ice"],                  icon:"🧊", floorPrice:0.06 },
  { id:4,  name:"THANK U 4 PLAYIN", rarity:"Basic",     stars:8, class:"Attacker",   score:255.0, elims:1.5, winRate:51.0, traits:["Shadow","Glasses"],            icon:"🌑", floorPrice:0.09 },
  { id:5,  name:"BURNS WENIPEE",    rarity:"Basic",     stars:1, class:"Specialist", score:195.0, elims:0.9, winRate:42.0, traits:["Kimono","Rainbow"],            icon:"🌈", floorPrice:0.05 },
  { id:6,  name:"NOMAD",            rarity:"Rare",      stars:2, class:"Attacker",   score:310.0, elims:1.3, winRate:50.0, traits:["Military","Gold Fur"],         icon:"🎒", floorPrice:0.29 },
  { id:7,  name:"FORTUNE GOBBLER",  rarity:"Basic",     stars:3, class:"Support",    score:220.0, elims:0.3, winRate:46.0, traits:["Shadow","Tears"],              icon:"💸", floorPrice:0.07 },
  { id:8,  name:"BEARISH RARE",     rarity:"Rare",      stars:2, class:"Attacker",   score:318.0, elims:1.4, winRate:52.0, traits:["Kimono","Grumpy"],             icon:"🐻", floorPrice:0.34 },
  { id:9,  name:"GAMBIT",           rarity:"Rare",      stars:4, class:"Specialist", score:330.0, elims:1.1, winRate:54.0, traits:["Gold Fur","Shades"],           icon:"🃏", floorPrice:0.38 },
  { id:10, name:"ONIKI",            rarity:"Rare",      stars:1, class:"Defender",   score:298.0, elims:0.6, winRate:49.0, traits:["Horns","Dark"],               icon:"😈", floorPrice:0.28 },
  { id:11, name:"FIRE MOKI",        rarity:"Rare",      stars:1, class:"Attacker",   score:322.0, elims:1.6, winRate:52.5, traits:["Fire","Gold Fur"],            icon:"🔥", floorPrice:0.35 },
  { id:12, name:"RONINKU",          rarity:"Rare",      stars:2, class:"Specialist", score:315.0, elims:1.0, winRate:51.5, traits:["Samurai","Kimono"],           icon:"⚔️", floorPrice:0.31 },
  { id:13, name:"LIZZIEEE",         rarity:"Epic",      stars:4, class:"Support",    score:410.0, elims:0.5, winRate:58.0, traits:["Neon","Horns"],               icon:"🦎", floorPrice:1.10 },
  { id:14, name:"HANTAAOOOO",       rarity:"Basic",     stars:1, class:"Attacker",   score:198.0, elims:1.1, winRate:43.0, traits:["Banana","Sleepy"],            icon:"🍌", floorPrice:0.05 },
  { id:15, name:"RAICHU",           rarity:"Basic",     stars:1, class:"Specialist", score:205.0, elims:0.8, winRate:45.0, traits:["Electric","Cute"],            icon:"⚡", floorPrice:0.06 },
  { id:16, name:"BANANA MOGGER",    rarity:"Legendary", stars:9, class:"Attacker",   score:520.0, elims:2.1, winRate:64.0, traits:["Banana","Gold Fur","Cape"],   icon:"👑", floorPrice:4.20 },
  { id:17, name:"CRYSTAL",          rarity:"Epic",      stars:6, class:"Defender",   score:395.0, elims:0.7, winRate:57.0, traits:["Ice","Kimono"],               icon:"💎", floorPrice:0.88 },
  { id:18, name:"SHADOW RONIN",     rarity:"Epic",      stars:5, class:"Specialist", score:420.0, elims:1.4, winRate:59.0, traits:["Shadow","Samurai"],           icon:"🥷", floorPrice:0.95 },
  { id:19, name:"MOCHI",            rarity:"Basic",     stars:3, class:"Support",    score:180.0, elims:0.2, winRate:41.0, traits:["Cute","Maid"],                icon:"🍡", floorPrice:0.05 },
  { id:20, name:"STORMCLAW",        rarity:"Legendary", stars:8, class:"Attacker",   score:505.0, elims:1.9, winRate:62.0, traits:["Electric","Horns","Gold Fur"],icon:"⚡", floorPrice:3.80 },
];

const DEMO_OWNED_IDS = [1,2,3,4,5,6,7,8,9,12,16,18];

const SCHEME_CARDS = [
  { id:"s1",  name:"DRESS TO IMPRESS", traitBonus:"Kimono",   bonusPer:25, baseBonus:0,  classBonus:"",         classMult:0, icon:"👘", effect:"+25 pts per Kimono trait" },
  { id:"s2",  name:"GOLDEN SHOWER",    traitBonus:"Gold Fur", bonusPer:25, baseBonus:0,  classBonus:"",         classMult:0, icon:"✨", effect:"+25 pts per Gold Fur trait" },
  { id:"s3",  name:"FINAL BLOW",       traitBonus:"",         bonusPer:0,  baseBonus:200,classBonus:"",         classMult:0, icon:"💥", effect:"+200 pts on winning elim" },
  { id:"s4",  name:"FLEXING",          traitBonus:"",         bonusPer:0,  baseBonus:85, classBonus:"",         classMult:0, icon:"💪", effect:"+85 base score" },
  { id:"s5",  name:"SHADOW PROTOCOL",  traitBonus:"Shadow",   bonusPer:30, baseBonus:0,  classBonus:"",         classMult:0, icon:"👤", effect:"+30 pts per Shadow trait" },
  { id:"s6",  name:"SAMURAI SPIRIT",   traitBonus:"Samurai",  bonusPer:28, baseBonus:0,  classBonus:"",         classMult:0, icon:"⚔️", effect:"+28 pts per Samurai trait" },
  { id:"s7",  name:"BANANA REPUBLIC",  traitBonus:"Banana",   bonusPer:35, baseBonus:0,  classBonus:"",         classMult:0, icon:"🍌", effect:"+35 pts per Banana trait" },
  { id:"s8",  name:"ICE COLD",         traitBonus:"Ice",      bonusPer:22, baseBonus:20, classBonus:"",         classMult:0, icon:"❄️", effect:"+22 pts per Ice + 20 base" },
  { id:"s9",  name:"WARLORD",          traitBonus:"",         bonusPer:0,  baseBonus:0,  classBonus:"Attacker", classMult:0.15, icon:"⚔️", effect:"+15% score all Attackers" },
  { id:"s10", name:"IRON WALL",        traitBonus:"",         bonusPer:0,  baseBonus:0,  classBonus:"Defender", classMult:0.20, icon:"🛡️", effect:"+20% score all Defenders" },
];

const CONTESTS = [
  { id:"open",     name:"Open",        desc:"Any 4 Champions", icon:"🔓", restriction:"",         starCap:0,  color:"#22c55e" },
  { id:"onereach", name:"One-of-Each", desc:"1 per rarity",    icon:"🎯", restriction:"onereach", starCap:0,  color:"#f59e0b" },
  { id:"sc20",     name:"★ Cap 20",    desc:"Stars ≤ 20",       icon:"⭐", restriction:"starcap",  starCap:20, color:"#a855f7" },
  { id:"sc15",     name:"★ Cap 15",    desc:"Stars ≤ 15",       icon:"⭐", restriction:"starcap",  starCap:15, color:"#ec4899" },
];

/* ── REAL MOKI STATS (5 real stats from Moki Manager) ── */
const REAL_STATS = [
  { id:"spd", label:"Speed",     icon:"⚡", color:"#f59e0b", desc:"Movement on ground & air" },
  { id:"str", label:"Strength",  icon:"💪", color:"#ef4444", desc:"Speed while in Buff form" },
  { id:"def", label:"Defense",   icon:"🛡️", color:"#3b82f6", desc:"Wart riding speed + Buff transform time" },
  { id:"dex", label:"Dexterity", icon:"🎯", color:"#22c55e", desc:"Movement while carrying Gacha Ball" },
  { id:"frt", label:"Fortitude", icon:"❤️", color:"#a855f7", desc:"Respawn time + Gacha Ball deposit speed" },
];

const DURATIONS = [
  { id:"30m", label:"30 min", hours:0.5, staminaCost:5,  xpGain:8,   multiplier:0.5 },
  { id:"1h",  label:"1 hr",   hours:1,   staminaCost:10, xpGain:18,  multiplier:1.0 },
  { id:"2h",  label:"2 hrs",  hours:2,   staminaCost:18, xpGain:38,  multiplier:1.8 },
  { id:"4h",  label:"4 hrs",  hours:4,   staminaCost:30, xpGain:72,  multiplier:3.2 },
  { id:"8h",  label:"8 hrs",  hours:8,   staminaCost:50, xpGain:120, multiplier:5.5 },
];

const GYM_SNACKS = [
  { id:"mochi", name:"Lucky Mochi",   icon:"🍡", mxp:20, stam:10, effect:"Stamina + mXP",            cost:200 },
  { id:"yaki",  name:"Power Yaki",    icon:"🍢", mxp:35, stam:5,  effect:"Speeds up training + mXP", cost:350 },
  { id:"bun",   name:"Energy Bun",    icon:"🍞", mxp:70, stam:25, effect:"Big stamina boost + mXP",  cost:600 },
  { id:"tea",   name:"Focus Tea",     icon:"🍵", mxp:0,  stam:8,  effect:"+20% session efficiency",  cost:150 },
  { id:"wrap",  name:"Recovery Wrap", icon:"🩹", mxp:0,  stam:100,effect:"Full stamina restore",     cost:500 },
];

interface Moki {
  id: string; name: string; class: string; icon: string; level: number;
  xp: number; xpNext: number; spd: number; str: number; def: number; dex: number; frt: number;
  stamina: number; wins: number; losses: number; streak: number;
  training: { statId: string; durId: string; progress: number } | null;
  locked: boolean;
}
const INIT_MOKIS: Moki[] = [
  { id:"m1", name:"TANUKI PRIME", class:"Brawler",  icon:"🦝", level:14, xp:780,  xpNext:1000, spd:72, str:65, def:58, dex:60, frt:55, stamina:88, wins:34, losses:12, streak:5,  training:null, locked:false },
  { id:"m2", name:"VOID CAT",     class:"Assassin", icon:"🐈‍⬛",level:9,  xp:320,  xpNext:600,  spd:90, str:55, def:42, dex:82, frt:48, stamina:42, wins:21, losses:18, streak:2,  training:null, locked:true  },
  { id:"m3", name:"IRON MOKI",    class:"Tank",     icon:"🤖", level:22, xp:1450, xpNext:1800, spd:40, str:88, def:78, dex:52, frt:82, stamina:60, wins:52, losses:14, streak:8,  training:{ statId:"str", durId:"4h", progress:68 }, locked:false },
  { id:"m4", name:"SPARK GOBLIN", class:"Mage",     icon:"✨", level:6,  xp:140,  xpNext:400,  spd:78, str:45, def:30, dex:91, frt:35, stamina:20, wins:8,  losses:15, streak:0,  training:null, locked:false },
  { id:"m5", name:"ROGUE PANDA",  class:"Brawler",  icon:"🐼", level:11, xp:610,  xpNext:900,  spd:72, str:68, def:55, dex:60, frt:58, stamina:75, wins:28, losses:16, streak:3,  training:{ statId:"spd", durId:"2h", progress:35 }, locked:false },
  { id:"m6", name:"BRAWL BEAR",   class:"Brawler",  icon:"🐻", level:17, xp:1100, xpNext:1500, spd:55, str:80, def:72, dex:65, frt:70, stamina:95, wins:45, losses:10, streak:12, training:null, locked:false },
];

/* ── LINEUP PRESETS ── */
interface Preset {
  id: string; name: string; icon: string; contestId: string;
  schemeId: string; champIds: number[]; note: string; color: string;
  slot?: number; // 1-5 lineup slots
}
const LINEUP_SLOTS = [1,2,3,4,5];
const SLOT_COLORS = ["#ef4444","#3b82f6","#22c55e","#f59e0b","#a855f7"];
const SLOT_ICONS = ["🔴","🔵","🟢","🟡","🟣"];
const DEFAULT_PRESETS: Preset[] = [
  {
    id:"p1", name:"Banana Blitz", icon:"🍌", contestId:"open",
    schemeId:"s7", champIds:[16,14,2,6], note:"All-in on Banana scheme. BANANA MOGGER carries.",
    color:"#f59e0b",
  },
  {
    id:"p2", name:"Shadow Squad", icon:"👤", contestId:"open",
    schemeId:"s5", champIds:[18,4,7,1], note:"Shadow trait synergy + Defender anchor.",
    color:"#a855f7",
  },
  {
    id:"p3", name:"Warlord Rush", icon:"⚔️", contestId:"open",
    schemeId:"s9", champIds:[16,20,6,11], note:"+15% to all Attackers. Pure aggression.",
    color:"#ef4444",
  },
  {
    id:"p4", name:"Star Cap 15", icon:"⭐", contestId:"sc15",
    schemeId:"s4", champIds:[6,12,3,5], note:"Fits under 15-star cap. FLEXING base bonus.",
    color:"#ec4899",
  },
  {
    id:"p5", name:"One of Each", icon:"🎯", contestId:"onereach",
    schemeId:"s2", champIds:[2,8,13,16], note:"One per rarity + Gold Fur scheme bonus.",
    color:"#22c55e",
  },
];

const MARKET_FEE = 0.025; // 2.5% platform fee on all marketplace transactions

/* ── CONTEST SCHEDULE (Grand Arena Season 1) ── */
const CONTEST_SCHEDULE = [
  { id:"cs1", name:"Open Arena",    type:"open",     icon:"🔓", color:"#22c55e", deadlineHours:18, prizeRON:50000  },
  { id:"cs2", name:"One-of-Each",   type:"onereach", icon:"🎯", color:"#f59e0b", deadlineHours:42, prizeRON:25000  },
  { id:"cs3", name:"★ Cap 20",      type:"starcap",  icon:"⭐", color:"#a855f7", deadlineHours:66, prizeRON:15000  },
  { id:"cs4", name:"★ Cap 15",      type:"starcap",  icon:"⭐", color:"#ec4899", deadlineHours:90, prizeRON:10000  },
];

/* ── REAL MAVIS MARKET API ── */
const MAVIS_MARKET_BASE = "https://marketplace-api.skymavis.com/graphql";
async function fetchLiveFloorPrices(): Promise<Record<string, number>> {
  // Attempt to fetch live floor prices from Mavis Market
  // Falls back to hardcoded data on any error
  try {
    const res = await fetch(MAVIS_MARKET_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query { erc721Tokens(
          tokenAddress: "0x9e8ed4ff354bd11602255b3d8e1ed13a1bb26b4b"
          rangeCriteria: { from: 0, size: 20 }
          sort: { price: ASC }
        ) { results { name minPrice } } }`
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const prices: Record<string, number> = {};
    (data?.data?.erc721Tokens?.results || []).forEach((t: any) => {
      const champ = ALL_CHAMPIONS.find(c => t.name?.toUpperCase().includes(c.name));
      if (champ && t.minPrice) prices[champ.id] = parseFloat(t.minPrice) / 1e18;
    });
    return prices;
  } catch { return {}; }
}

/* ── PRICE ALERT ── */
interface PriceAlert {
  id: string; cardId: number; targetPrice: number; type: "below"|"above"; triggered: boolean; createdAt: string;
}

/* ── ROI CALCULATOR ── */
function calcROI(buyPrice: number, sellPrice: number, holdDays: number) {
  const grossProfit = sellPrice - buyPrice;
  const fee = sellPrice * MARKET_FEE;
  const netProfit = grossProfit - fee;
  const roi = buyPrice > 0 ? (netProfit / buyPrice) * 100 : 0;
  const dailyROI = holdDays > 0 ? roi / holdDays : 0;
  return { grossProfit, fee, netProfit, roi, dailyROI };
}

/* ── PERSISTENCE (Capacitor Preferences) ── */
async function persist(key: string, value: any) {
  try {
    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.set({ key, value: JSON.stringify(value) });
  } catch { /* web fallback */ try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
}
async function load<T>(key: string, fallback: T): Promise<T> {
  try {
    const { Preferences } = await import("@capacitor/preferences");
    const { value } = await Preferences.get({ key });
    if (value) return JSON.parse(value) as T;
  } catch { try { const v = localStorage.getItem(key); if (v) return JSON.parse(v) as T; } catch {} }
  return fallback;
}

/* ── SHARE LINEUP ── */
async function shareLineup(champs: Champion[], scheme: any, score: any, contestName: string) {
  const text = [
    `🏯 TORI FORGE — ${contestName} Lineup`,
    `📊 Projected Score: ${score.total} pts`,
    ``,
    champs.map((c,i) => `${i+1}. ${c.icon} ${c.name} (${c.rarity} · ★${c.stars})`).join("\n"),
    scheme ? `\n🃏 Scheme: ${scheme.name} (+${score.schemeBonus} pts)` : "",
    ``,
    `⚔️ Avg Win Rate: ${score.avgWin}%`,
    `📱 Built with Tori Forge`,
  ].filter(Boolean).join("\n");

  try {
    const { Share } = await import("@capacitor/share");
    await Share.share({ title: "My Grand Arena Lineup", text, dialogTitle: "Share Lineup" });
  } catch {
    // Fallback: copy to clipboard
    try { await navigator.clipboard.writeText(text); } catch {}
    alert("Lineup copied to clipboard!");
  }
}



const GEM_PACKS = [
  { id:"g1", gems:500,  ron:0.5,  label:"Starter",  icon:"💎", bonus:"",       color:"#9ca3af" },
  { id:"g2", gems:1200, ron:1.0,  label:"Solid",    icon:"💎", bonus:"+200",   color:"#14b8a6" },
  { id:"g3", gems:2800, ron:2.0,  label:"Pro",      icon:"💎", bonus:"+800",   color:"#f59e0b" },
  { id:"g4", gems:6000, ron:4.0,  label:"Elite",    icon:"💎", bonus:"+2000",  color:"#ef4444" },
];
const INIT_LISTINGS = [
  { id:"L1",  cardId:16, price:4.10, seller:"0x8a3f…d91", listedHrs:2,  rarity:"Legendary" },
  { id:"L2",  cardId:20, price:3.75, seller:"0x2b1c…a44", listedHrs:5,  rarity:"Legendary" },
  { id:"L3",  cardId:13, price:1.05, seller:"0x9f4e…c22", listedHrs:1,  rarity:"Epic"      },
  { id:"L4",  cardId:18, price:0.92, seller:"0x3a7b…f88", listedHrs:3,  rarity:"Epic"      },
  { id:"L5",  cardId:17, price:0.85, seller:"0x7d2a…b11", listedHrs:8,  rarity:"Epic"      },
  { id:"L6",  cardId:1,  price:0.40, seller:"0x1e9c…d33", listedHrs:12, rarity:"Rare"      },
  { id:"L7",  cardId:9,  price:0.36, seller:"0x5b4f…e77", listedHrs:6,  rarity:"Rare"      },
  { id:"L8",  cardId:11, price:0.33, seller:"0x4c8d…a99", listedHrs:24, rarity:"Rare"      },
  { id:"L9",  cardId:12, price:0.30, seller:"0xbb9c…f44", listedHrs:2,  rarity:"Rare"      },
  { id:"L10", cardId:4,  price:0.07, seller:"0x2a5c…f00", listedHrs:4,  rarity:"Basic"     },
  { id:"L11", cardId:7,  price:0.06, seller:"0xaa1b…e22", listedHrs:10, rarity:"Basic"     },
];
const genHistory = (base: number, n=14) => Array.from({length:n},()=>+(base*(0.85+Math.random()*0.35)).toFixed(2));

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
const shortAddr = (a: string) => a ? `${a.slice(0,6)}…${a.slice(-4)}` : "";
const calcScheme = (scheme: typeof SCHEME_CARDS[0] | null, champs: Champion[]) => {
  if (!scheme) return 0;
  let b = scheme.baseBonus || 0;
  if (scheme.traitBonus) b += champs.filter(c=>c.traits.includes(scheme.traitBonus)).length * scheme.bonusPer;
  if (scheme.classBonus) b += champs.filter(c=>c.class===scheme.classBonus).reduce((s,c)=>s+c.score*RARITY[c.rarity].mult,0)*scheme.classMult;
  return Math.round(b);
};
const scoreLineup = (champs: Champion[], scheme: typeof SCHEME_CARDS[0] | null) => {
  const cs = champs.reduce((s,c)=>s+c.score*RARITY[c.rarity].mult,0);
  const sb = calcScheme(scheme, champs);
  return { total:Math.round(cs+sb), champScore:Math.round(cs), schemeBonus:sb, avgWin:champs.length?+(champs.reduce((s,c)=>s+c.winRate,0)/champs.length).toFixed(1):0 };
};
const buildBest = (pool: Champion[], contest: typeof CONTESTS[0], scheme: typeof SCHEME_CARDS[0] | null) => {
  let best: Champion[] = [], bestS = -1;
  if (contest.restriction === "onereach") {
    const byR: Record<string, Champion[]> = {};
    for (const r of ["Basic","Rare","Epic","Legendary"]) byR[r]=pool.filter(c=>c.rarity===r).sort((a,b)=>b.score*RARITY[b.rarity].mult-a.score*RARITY[a.rarity].mult);
    if (!byR.Basic.length||!byR.Rare.length||!byR.Epic.length||!byR.Legendary.length) return [];
    for (const b of byR.Basic.slice(0,3)) for (const r of byR.Rare.slice(0,3)) for (const e of byR.Epic.slice(0,3)) for (const l of byR.Legendary.slice(0,3)) {
      const s=scoreLineup([b,r,e,l],scheme).total; if(s>bestS){bestS=s;best=[b,r,e,l];}
    }
  } else {
    const cap = contest.starCap;
    const sorted = [...pool].sort((a,b)=>b.score*RARITY[b.rarity].mult-a.score*RARITY[a.rarity].mult);
    let hand = sorted.slice(0,4);
    if (cap && hand.reduce((s,c)=>s+c.stars,0)>cap) hand=sorted.filter(c=>c.stars<=5).slice(0,4);
    bestS=scoreLineup(hand,scheme).total; best=hand;
    const rest=sorted.filter(c=>!hand.includes(c));
    for (let it=0;it<40;it++){let imp=false;for(let i=0;i<hand.length;i++)for(let j=0;j<rest.length;j++){const c=[...hand];c[i]=rest[j];if(cap&&c.reduce((s,x)=>s+x.stars,0)>cap)continue;const s=scoreLineup(c,scheme).total;if(s>bestS){bestS=s;best=c;imp=true;}}if(!imp)break;hand=best;}
  }
  return best;
};
const totalPower = (m: Moki) => Math.round((m.spd+m.str+m.def+m.dex+m.frt)/5);

/* ═══════════════════════════════════════════════════════════════
   SHARED UI ATOMS
═══════════════════════════════════════════════════════════════ */
const Badge = ({label,color="#9ca3af"}:{label:string;color?:string}) => (
  <span style={{fontSize:9,padding:"3px 8px",borderRadius:6,background:`${color}20`,color,border:`1px solid ${color}40`,fontWeight:700,letterSpacing:0.3,whiteSpace:"nowrap"}}>{label}</span>
);
const Pill = ({children,color="#6b7280",active,onClick}:{children:React.ReactNode;color?:string;active?:boolean;onClick?:()=>void}) => (
  <button onClick={onClick} style={{fontSize:10,padding:"5px 12px",borderRadius:20,cursor:"pointer",background:active?`${color}20`:"rgba(255,255,255,0.04)",border:`1.5px solid ${active?color+"70":"rgba(255,255,255,0.1)"}`,color:active?color:"#6b7280",fontWeight:active?700:400,outline:"none",minHeight:34}}>{children}</button>
);
const StatBox = ({label,value,color="#e8e0cc"}:{label:string;value:string|number;color?:string}) => (
  <div style={{textAlign:"center",background:"rgba(255,255,255,0.05)",borderRadius:10,padding:"10px 4px"}}>
    <div style={{fontSize:15,fontWeight:800,color}}>{value}</div>
    <div style={{fontSize:8,color:"#4b5563",letterSpacing:0.8,marginTop:2}}>{label}</div>
  </div>
);
const StaminaBar = ({val}:{val:number}) => {
  const pct=Math.min(100,val); const c=pct>65?"#22c55e":pct>35?"#f59e0b":"#ef4444";
  return (
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <div style={{flex:1,height:5,background:"rgba(255,255,255,0.07)",borderRadius:3,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",background:c,borderRadius:3,transition:"width 0.4s"}}/>
      </div>
      <span style={{fontSize:9,color:c,fontFamily:"monospace",minWidth:28}}>{val}%</span>
    </div>
  );
};
const XPBar = ({xp,xpNext}:{xp:number;xpNext:number}) => {
  const pct=Math.min(100,(xp/xpNext)*100);
  return (
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <div style={{flex:1,height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",background:"linear-gradient(90deg,#a855f7,#c084fc)",borderRadius:2}}/>
      </div>
      <span style={{fontSize:8,color:"#a855f7",fontFamily:"monospace",whiteSpace:"nowrap"}}>{xp}/{xpNext}</span>
    </div>
  );
};
const Sparkline = ({data,color="#22c55e",w=70,h=22}:{data:number[];color?:string;w?:number;h?:number}) => {
  if(!data||data.length<2)return null;
  const mn=Math.min(...data),mx=Math.max(...data),rng=mx-mn||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-mn)/rng)*h}`).join(" ");
  return (
    <svg width={w} height={h} style={{overflow:"visible"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={(data.length-1)/(data.length-1)*w} cy={h-((data[data.length-1]-mn)/rng)*h} r="2.5" fill={color}/>
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CARD ART — SVG procedural thumbnails + real Ronin image swap
   Each card gets a unique deterministic design based on its
   traits/rarity/class. Real NFT art replaces it after wallet connect.
═══════════════════════════════════════════════════════════════ */
const mkRng = (seed: number) => (n: number) =>
  (((((seed ^ (n * 1013904223)) * 1664525 + 1013904223) >>> 0) * 2891336453 + 12345) >>> 0) / 4294967295;

function CardArt({ card, size = 56, realImg, ctx = "card" }:
  { card: Champion; size?: number; realImg?: string; ctx?: string }) {
  const [err, setErr] = useState(false);
  if (realImg && !err) {
    return (
      <img src={realImg} alt={card.name} onError={() => setErr(true)}
        style={{ width: size, height: size, borderRadius: size * 0.14, objectFit: "cover", display: "block", flexShrink: 0 }} />
    );
  }
  const s = size;
  const rCol = RARITY[card.rarity]?.color || "#9ca3af";
  const cCol = CLASS_C[card.class] || "#9ca3af";
  const rng = mkRng(card.id * 2654435761);
  const uid = `${ctx}${card.id}`;
  const trait = card.traits[0] || "";
  const patternEls: React.ReactNode[] = [];

  if (card.traits.includes("Gold Fur")) {
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2 + rng(i) * 0.4; patternEls.push(<line key={`gf${i}`} x1={s/2} y1={s/2} x2={s/2+Math.cos(a)*s*0.8} y2={s/2+Math.sin(a)*s*0.8} stroke="#f59e0b" strokeWidth="0.8" opacity="0.22"/>); }
  }
  if (card.traits.includes("Shadow")) {
    for (let i = 0; i < 5; i++) { patternEls.push(<circle key={`sd${i}`} cx={rng(i*3)*s*0.8+s*0.1} cy={rng(i*3+1)*s*0.8+s*0.1} r={rng(i*3+2)*5+2} fill="#1a0a2e" opacity="0.55"/>); patternEls.push(<circle key={`sdg${i}`} cx={rng(i*3)*s*0.8+s*0.1} cy={rng(i*3+1)*s*0.8+s*0.1} r={rng(i*3+2)*5+2} fill="none" stroke="#7c3aed" strokeWidth="0.5" opacity="0.3"/>); }
  }
  if (card.traits.includes("Samurai")) {
    for (let i = 0; i < 4; i++) { const x = (i / 3.5) * s * 0.9; patternEls.push(<line key={`sm${i}`} x1={x} y1={0} x2={x+s*0.25} y2={s} stroke={cCol} strokeWidth="0.7" opacity="0.17"/>); }
    patternEls.push(<line key="smx" x1={0} y1={s*0.3} x2={s} y2={s*0.55} stroke={rCol} strokeWidth="0.8" opacity="0.2"/>);
  }
  if (card.traits.includes("Banana")) {
    for (let i = 0; i < 4; i++) { const bx=rng(i*4)*s*0.7+s*0.1, by=rng(i*4+1)*s*0.7+s*0.1, rot=rng(i+20)*60; patternEls.push(<ellipse key={`bn${i}`} cx={bx} cy={by} rx={rng(i*4+2)*9+4} ry={rng(i*4+3)*4+2} fill="#fde047" opacity="0.15" transform={`rotate(${rot},${bx},${by})`}/>); }
  }
  if (card.traits.includes("Ice")) {
    for (let i = 0; i < 4; i++) { const hx=rng(i*3)*s*0.75+s*0.12, hy=rng(i*3+1)*s*0.75+s*0.12, r=rng(i*3+2)*7+3; for (let j=0;j<6;j++){const a=(j/6)*Math.PI*2; patternEls.push(<line key={`ic${i}${j}`} x1={hx} y1={hy} x2={hx+Math.cos(a)*r} y2={hy+Math.sin(a)*r} stroke="#93c5fd" strokeWidth="0.6" opacity="0.27"/>);} }
  }
  if (card.traits.includes("Electric")) {
    for (let i = 0; i < 3; i++) { const sx=rng(i*5)*s*0.8+s*0.1; const pts=Array.from({length:5},(_,j)=>`${sx+(rng(i*20+j*4)*s*0.25-s*0.08)},${(j/4)*s}`).join(" "); patternEls.push(<polyline key={`el${i}`} points={pts} fill="none" stroke="#fde047" strokeWidth="0.9" opacity="0.28"/>); }
  }
  if (card.traits.includes("Kimono")) {
    for (let i = 0; i < 4; i++) { const y=(i/3.5)*s, cp=rng(i+30)*12-6; patternEls.push(<path key={`ki${i}`} d={`M 0,${y} Q ${s*0.25},${y+cp} ${s*0.5},${y} T ${s},${y}`} fill="none" stroke={cCol} strokeWidth="0.7" opacity="0.18"/>); }
  }
  if (card.traits.includes("Horns")) {
    for (let i=0;i<3;i++){const hx=(i/2)*s*0.8+s*0.1;patternEls.push(<polygon key={`hr${i}`} points={`${hx},${s*0.62} ${hx-s*0.055},${s*0.22} ${hx+s*0.055},${s*0.22}`} fill={rCol} opacity="0.18"/>);}
  }
  if (card.traits.includes("Fire")) {
    for (let i=0;i<3;i++){const fx=rng(i*7)*s*0.5+s*0.25;patternEls.push(<path key={`fi${i}`} d={`M ${fx},${s} Q ${fx+(rng(i+10)*14-7)},${s*0.6} ${fx+(rng(i+11)*8-4)},${s*0.3} Q ${fx-(rng(i+12)*10)},${s*0.55} ${fx},${s}`} fill="#f97316" opacity="0.18"/>);}
  }
  if (card.traits.includes("Neon")) {
    for (let i=0;i<7;i++){patternEls.push(<circle key={`ne${i}`} cx={rng(i*2)*s*0.8+s*0.1} cy={rng(i*2+1)*s*0.8+s*0.1} r={1.8} fill={cCol} opacity="0.65"/>);}
  }
  const cx=s*0.5, cy=s*0.46;
  const classShapes: Record<string, React.ReactNode> = {
    Attacker:   <polygon points={`${cx},${cy-s*0.23} ${cx+s*0.19},${cy+s*0.16} ${cx-s*0.19},${cy+s*0.16}`} fill={cCol} opacity="0.16"/>,
    Defender:   <path d={`M ${cx-s*0.18},${cy-s*0.19} L ${cx+s*0.18},${cy-s*0.19} L ${cx+s*0.2},${cy+s*0.05} Q ${cx},${cy+s*0.24} ${cx-s*0.2},${cy+s*0.05} Z`} fill={cCol} opacity="0.16"/>,
    Support:    <ellipse cx={cx} cy={cy} rx={s*0.19} ry={s*0.22} fill={cCol} opacity="0.16"/>,
    Specialist: <polygon points={`${cx},${cy-s*0.23} ${cx+s*0.19},${cy} ${cx},${cy+s*0.22} ${cx-s*0.19},${cy}`} fill={cCol} opacity="0.16"/>,
  };
  const starCount = Math.min(card.stars, 9);
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ borderRadius: s * 0.14, display: "block", flexShrink: 0, overflow: "hidden" }}>
      <defs>
        <radialGradient id={`rbg${uid}`} cx="50%" cy="28%" r="78%"><stop offset="0%" stopColor={rCol} stopOpacity="0.42"/><stop offset="100%" stopColor="#060410" stopOpacity="1"/></radialGradient>
        <radialGradient id={`cbg${uid}`} cx="50%" cy="100%" r="65%"><stop offset="0%" stopColor={cCol} stopOpacity="0.2"/><stop offset="100%" stopColor={cCol} stopOpacity="0"/></radialGradient>
        <radialGradient id={`eg${uid}`} cx="50%" cy="50%" r="50%"><stop offset="55%" stopColor={rCol} stopOpacity="0"/><stop offset="100%" stopColor={rCol} stopOpacity="0.45"/></radialGradient>
      </defs>
      <rect width={s} height={s} fill="#060410"/>
      <rect width={s} height={s} fill={`url(#rbg${uid})`}/>
      <rect width={s} height={s} fill={`url(#cbg${uid})`}/>
      {patternEls}
      {classShapes[card.class]}
      <text x={s/2} y={s*0.585} textAnchor="middle" dominantBaseline="middle" fontSize={s*0.40}>{card.icon}</text>
      <text x={s/2} y={s*0.9} textAnchor="middle" fontSize={s*0.092} fill={rCol} opacity="0.85" letterSpacing="0.5">{"★".repeat(Math.min(starCount,5))}</text>
      {starCount>5&&<text x={s/2} y={s*0.97} textAnchor="middle" fontSize={s*0.082} fill={rCol} opacity="0.7" letterSpacing="0.5">{"★".repeat(starCount-5)}</text>}
      <rect width={s} height={s} fill={`url(#eg${uid})`} rx={s*0.14}/>
      <rect width={s} height={s} fill="none" stroke={rCol} strokeWidth="1.5" strokeOpacity="0.55" rx={s*0.14}/>
    </svg>
  );
}

function MokiArt({ moki, size = 48 }: { moki: Moki; size?: number }) {
  const s = size;
  const cCol = MOKI_CLASS_C[moki.class] || "#9ca3af";
  const rng = mkRng(moki.id.charCodeAt(1) * 1234 + moki.level * 97);
  const uid = `mk${moki.id}`;
  const pwr = totalPower(moki);
  const barColor = pwr >= 75 ? "#22c55e" : pwr >= 55 ? "#f59e0b" : "#9ca3af";
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ borderRadius: s * 0.18, display: "block", flexShrink: 0, overflow: "hidden" }}>
      <defs>
        <radialGradient id={`mbg${uid}`} cx="50%" cy="30%" r="75%"><stop offset="0%" stopColor={cCol} stopOpacity="0.35"/><stop offset="100%" stopColor="#08060f" stopOpacity="1"/></radialGradient>
        <radialGradient id={`meg${uid}`} cx="50%" cy="50%" r="50%"><stop offset="60%" stopColor={cCol} stopOpacity="0"/><stop offset="100%" stopColor={cCol} stopOpacity="0.4"/></radialGradient>
      </defs>
      <rect width={s} height={s} fill="#08060f"/>
      <rect width={s} height={s} fill={`url(#mbg${uid})`}/>
      {[0,1,2].map(i=><line key={i} x1={rng(i)*s} y1={0} x2={rng(i+5)*s} y2={s} stroke={cCol} strokeWidth="0.5" opacity="0.1"/>)}
      <text x={s/2} y={s*0.59} textAnchor="middle" dominantBaseline="middle" fontSize={s*0.42}>{moki.icon}</text>
      <rect x={s*0.62} y={s*0.05} width={s*0.34} height={s*0.22} rx={s*0.06} fill="rgba(0,0,0,0.6)"/>
      <text x={s*0.79} y={s*0.175} textAnchor="middle" dominantBaseline="middle" fontSize={s*0.13} fill={cCol} fontWeight="bold">L{moki.level}</text>
      <rect x={s*0.08} y={s*0.88} width={s*0.84} height={s*0.072} rx={s*0.036} fill="rgba(0,0,0,0.5)"/>
      <rect x={s*0.08} y={s*0.88} width={s*0.84*(pwr/100)} height={s*0.072} rx={s*0.036} fill={barColor} opacity="0.85"/>
      <rect width={s} height={s} fill={`url(#meg${uid})`} rx={s*0.18}/>
      <rect width={s} height={s} fill="none" stroke={cCol} strokeWidth="1.2" strokeOpacity="0.45" rx={s*0.18}/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RONIN NFT IMAGE FETCH
   Grand Arena champion contract: 0x9e8ed4ff354bd11602255b3d8e1ed13a1bb26b4b
   Fetches real card art after wallet connects. Falls back silently.
═══════════════════════════════════════════════════════════════ */
const GA_CONTRACT = "0x9e8ed4ff354bd11602255b3d8e1ed13a1bb26b4b";

async function fetchRoninCardImages(address: string): Promise<Record<number, string>> {
  try {
    const url = `https://api.roninchain.com/ronin/tokens?contractAddresses[]=${GA_CONTRACT}&owner=${address}&limit=200`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const tokens: any[] = data.items || data.tokens || data.results || [];
    const images: Record<number, string> = {};
    for (const token of tokens) {
      const tokenName = (token.metadata?.name || token.name || "").toUpperCase().trim();
      const img = (token.metadata?.image || token.image || token.imageUrl || "").trim();
      if (!img) continue;
      let match = ALL_CHAMPIONS.find(c => tokenName === c.name);
      if (!match) match = ALL_CHAMPIONS.find(c => tokenName.includes(c.name));
      if (!match) match = ALL_CHAMPIONS.find(c => tokenName.includes(c.name.split(" ")[0]));
      if (match) images[match.id] = img;
    }
    return images;
  } catch (e) {
    console.warn("Ronin image fetch failed, using generated art:", e);
    return {};
  }
}

/* ═══════════════════════════════════════════════════════════════
   WALLET HOOK — Real Ronin (works on deployed domain)
═══════════════════════════════════════════════════════════════ */
function useWallet() {
  const [address,setAddress]=useState<string|null>(null);
  const [mode,setMode]=useState<"disconnected"|"live"|"demo">("disconnected");
  const [loading,setLoading]=useState(false);
  const [imgLoading,setImgLoading]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const [ownedIds,setOwnedIds]=useState<number[]>([]);
  const [realImages,setRealImages]=useState<Record<number,string>>({});
  const [wcUri,setWcUri]=useState<string|null>(null);
  const [showQR,setShowQR]=useState(false);

  const [importMethod,setImportMethod]=useState<"pk"|"seed">("pk");
  const [importInput,setImportInput]=useState("");
  const [importing,setImporting]=useState(false);

  const importWallet = async () => {
    if(!importInput.trim()){setError("Enter your private key or seed phrase.");return;}
    setImporting(true); setError(null);
    try {
      const { ethers } = await import("ethers");
      let w: any;
      const val = importInput.trim();
      if(importMethod==="seed"){
        // Seed phrase (12 or 24 words)
        w = ethers.Wallet.fromPhrase(val);
      } else {
        // Private key — add 0x if missing
        const pk = val.startsWith("0x") ? val : "0x" + val;
        w = new ethers.Wallet(pk);
      }
      const addr: string = w.address;
      // Persist encrypted address (not key) for session
      await persist("wallet_address", addr);
      await persist("wallet_mode", "imported");
      setAddress(addr); setMode("live");
      setOwnedIds(DEMO_OWNED_IDS); setImportInput("");
      setImporting(false);
      // Fetch real card art
      setImgLoading(true);
      const imgs = await fetchRoninCardImages(addr);
      setRealImages(imgs); setImgLoading(false);
    } catch(e: any) {
      const msg = e?.message || "";
      if(msg.includes("invalid mnemonic") || msg.includes("phrase")) setError("Invalid seed phrase. Check your words and try again.");
      else if(msg.includes("private key") || msg.includes("hex")) setError("Invalid private key format.");
      else setError("Import failed. Check your key or phrase.");
      setImporting(false);
    }
  };

  const connectDemo = () => {
    setAddress("0xDEMO…0000"); setMode("demo");
    setOwnedIds(DEMO_OWNED_IDS); setError(null); setRealImages({});
  };

  const disconnect = async () => {
    if (wcProvider) { try { await wcProvider.disconnect(); } catch {} wcProvider = null; }
    setAddress(null); setMode("disconnected"); setOwnedIds([]); setRealImages({}); setWcUri(null); setShowQR(false);
  };

  return { address, mode, loading:importing, imgLoading, error, ownedIds, setOwnedIds, realImages, showQR:false, wcUri:null, setShowQR:(_:boolean)=>{}, connectRonin:()=>{}, connectDemo, disconnect, importWallet, importMethod, setImportMethod, importInput, setImportInput, importing };
}


/* ═══════════════════════════════════════════════════════════════
   GRAND ARENA DEEP LINKS
   Opens the official site with context pre-loaded so the user
   just has to confirm — minimum taps to submit.
═══════════════════════════════════════════════════════════════ */

// Opens fantasy.grandarena.gg with the lineup encoded in the URL hash
// The user lands on the contest page with their cards visible
function openSubmitToGrandArena(champs: Champion[], scheme: any, contest: any) {
  const champIds = champs.map(c => c.id).join(",");
  const schemeId = scheme?.id || "";
  const contestId = contest?.id || "open";

  // Build a URL that links directly to the contest page
  // Grand Arena uses their web app — we deep link and pass context as params
  const params = new URLSearchParams({
    contest: contestId,
    cards: champIds,
    scheme: schemeId,
  });

  // Primary: try to open in Ronin browser (stays logged in)
  // Fallback: system browser
  const url = `https://fantasy.grandarena.gg/contests?${params.toString()}`;

  // Show a confirmation toast then open
  window.open(url, "_blank");
}

// Opens train.grandarena.gg on a specific Moki
function openTrainMoki(mokiName?: string) {
  const url = mokiName
    ? `https://train.grandarena.gg/?moki=${encodeURIComponent(mokiName)}`
    : "https://train.grandarena.gg/";
  window.open(url, "_blank");
}

// Opens Ronin Marketplace for a specific card
function openMarketplaceCard(cardName: string, contractAddress = "0x9e8ed4ff354bd11602255b3d8e1ed13a1bb26b4b") {
  const query = encodeURIComponent(cardName);
  const url = `https://marketplace.skymavis.com/collections/${contractAddress}?search=${query}`;
  window.open(url, "_blank");
}

// Opens the Grand Arena shop
function openGrandArenaShop() {
  window.open("https://fantasy.grandarena.gg/shop", "_blank");
}



function QRModal({ uri, onClose }: { uri: string; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    import("qrcode").then(QRCode => {
      QRCode.toDataURL(uri, { width: 240, margin: 2, color: { dark: "#000000", light: "#ffffff" } })
        .then(url => { if (!cancelled) setQrDataUrl(url); })
        .catch(() => {});
    });
    return () => { cancelled = true; };
  }, [uri]);

  // Deep link to open Ronin Wallet directly
  const openRoninWallet = () => {
    window.location.href = `roninwallet://wc?uri=${encodeURIComponent(uri)}`;
    // Fallback after 1.5s
    setTimeout(() => {
      window.location.href = `https://wallet.roninchain.com/wc?uri=${encodeURIComponent(uri)}`;
    }, 1500);
  };

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0d1117",border:"1px solid rgba(59,130,246,0.4)",borderRadius:20,padding:24,width:"100%",maxWidth:320,textAlign:"center"}}>
        <div style={{fontSize:9,letterSpacing:3,color:"#3b82f6",marginBottom:4}}>WALLETCONNECT</div>
        <div style={{fontSize:13,fontWeight:700,color:"#f0e8d0",marginBottom:16}}>Scan with Ronin Wallet</div>

        {/* QR Code */}
        <div style={{background:"#fff",borderRadius:12,padding:8,display:"inline-block",marginBottom:16}}>
          {qrDataUrl
            ? <img src={qrDataUrl} alt="WalletConnect QR" style={{width:220,height:220,display:"block"}}/>
            : <div style={{width:220,height:220,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#374151"}}>Generating QR…</div>
          }
        </div>

        <div style={{fontSize:9,color:"#4b5563",marginBottom:14,lineHeight:1.6}}>
          Open <strong style={{color:"#3b82f6"}}>Ronin Wallet</strong> → tap the scan icon → scan this code
        </div>

        {/* Direct deep link button */}
        <button onClick={openRoninWallet} style={{width:"100%",padding:12,background:"linear-gradient(135deg,#1e3a8a,#2563eb)",border:"1px solid #3b82f6",borderRadius:10,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",marginBottom:8}}>
          📱 Open Ronin Wallet App
        </button>

        <button onClick={onClose} style={{width:"100%",padding:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:"#6b7280",fontSize:11,cursor:"pointer"}}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ── CONTEST TIMER ── */
function ContestTimer() {
  const [now,setNow]=useState(Date.now());
  useEffect(()=>{ const t=setInterval(()=>setNow(Date.now()),1000); return ()=>clearInterval(t); },[]);

  return (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:9,letterSpacing:3,color:"#374151",marginBottom:8}}>CONTEST DEADLINES</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {CONTEST_SCHEDULE.map(c=>{
          const msLeft = c.deadlineHours * 3600 * 1000 - (now % (c.deadlineHours * 3600 * 1000));
          const h = Math.floor(msLeft/3600000);
          const m = Math.floor((msLeft%3600000)/60000);
          const s = Math.floor((msLeft%60000)/1000);
          const pct = 100 - (msLeft/(c.deadlineHours*3600*1000))*100;
          const urgent = h < 2;
          return (
            <div key={c.id} style={{background:`${c.color}08`,border:`1px solid ${c.color}25`,borderRadius:10,padding:"10px 12px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:14}}>{c.icon}</span>
                  <div>
                    <div style={{fontSize:10,fontWeight:700,color:c.color}}>{c.name}</div>
                    <div style={{fontSize:8,color:"#374151"}}>🏆 {c.prizeRON.toLocaleString()} RON prize pool</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:13,fontWeight:800,color:urgent?"#ef4444":c.color,fontFamily:"monospace"}}>
                    {String(h).padStart(2,"0")}:{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}
                  </div>
                  <div style={{fontSize:7,color:"#374151"}}>{urgent?"⚠ CLOSING SOON":"UNTIL CLOSE"}</div>
                </div>
              </div>
              <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"}}>
                <div style={{width:`${pct}%`,height:"100%",background:urgent?"#ef4444":c.color,borderRadius:2,transition:"width 1s linear"}}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── mXP TRACKER ── */
function MxpTracker({ totalMxp }: { totalMxp: number }) {
  const MXP_WEEKLY_MAX = 168;
  const MXP_PASSIVE_PER_HR = 1;
  const mxpThisWeek = totalMxp % MXP_WEEKLY_MAX;
  const pct = (mxpThisWeek / MXP_WEEKLY_MAX) * 100;
  const hrsToMax = MXP_WEEKLY_MAX - mxpThisWeek;
  const snackROI = [
    { name:"Lucky Mochi", mxp:20, cost:200, ratio:(20/200).toFixed(3) },
    { name:"Power Yaki",  mxp:35, cost:350, ratio:(35/350).toFixed(3) },
    { name:"Energy Bun",  mxp:70, cost:600, ratio:(70/600).toFixed(3) },
  ];
  return (
    <div style={{background:"rgba(168,85,247,0.06)",border:"1px solid rgba(168,85,247,0.15)",borderRadius:12,padding:12,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:9,letterSpacing:3,color:"#a855f7"}}>WEEKLY mXP</div>
        <div style={{fontSize:10,fontWeight:700,color:"#a855f7"}}>{mxpThisWeek} / {MXP_WEEKLY_MAX}</div>
      </div>
      <div style={{height:8,background:"rgba(255,255,255,0.06)",borderRadius:4,overflow:"hidden",marginBottom:8}}>
        <div style={{width:`${pct}%`,height:"100%",background:"linear-gradient(90deg,#7c3aed,#a855f7,#c084fc)",borderRadius:4,transition:"width 0.5s"}}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
        <div style={{textAlign:"center",background:"rgba(255,255,255,0.04)",borderRadius:7,padding:"6px 4px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#a855f7"}}>{hrsToMax}h</div>
          <div style={{fontSize:7,color:"#374151"}}>TO MAX</div>
        </div>
        <div style={{textAlign:"center",background:"rgba(255,255,255,0.04)",borderRadius:7,padding:"6px 4px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#22c55e"}}>{MXP_PASSIVE_PER_HR}/hr</div>
          <div style={{fontSize:7,color:"#374151"}}>PASSIVE</div>
        </div>
        <div style={{textAlign:"center",background:"rgba(255,255,255,0.04)",borderRadius:7,padding:"6px 4px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#c49400"}}>{totalMxp.toLocaleString()}</div>
          <div style={{fontSize:7,color:"#374151"}}>TOTAL</div>
        </div>
      </div>
      <div style={{fontSize:8,color:"#374151",marginBottom:4,letterSpacing:1}}>SNACK ROI (mXP per 💎)</div>
      <div style={{display:"flex",gap:5}}>
        {snackROI.map(s=>(
          <div key={s.name} style={{flex:1,background:"rgba(255,255,255,0.03)",borderRadius:6,padding:"4px 5px",textAlign:"center"}}>
            <div style={{fontSize:9,fontWeight:700,color:"#f59e0b"}}>{s.ratio}</div>
            <div style={{fontSize:7,color:"#374151",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{s.name.split(" ")[0]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCREEN: HUB
═══════════════════════════════════════════════════════════════ */
function HubScreen({ wallet, totalMxp, gems }: { wallet: ReturnType<typeof useWallet>; totalMxp: number; gems: number }) {
  const { address, mode, importing, imgLoading, error, ownedIds, realImages, connectDemo, disconnect, importWallet, importMethod, setImportMethod, importInput, setImportInput } = wallet;
  const connected = mode !== "disconnected";
  const collVal = ownedIds.reduce((s,id)=>{const c=ALL_CHAMPIONS.find(x=>x.id===id);return s+(c?c.floorPrice:0);},0).toFixed(2);

  return (
    <div style={{padding:"16px 0"}}>
      {/* Grand Arena Quick Launch */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:9,letterSpacing:3,color:"#374151",marginBottom:8}}>GRAND ARENA</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <button onClick={()=>window.open("https://fantasy.grandarena.gg","_blank")}
            style={{padding:"12px 8px",background:"linear-gradient(135deg,#1e3a8a,#2563eb)",border:"1px solid #3b82f6",borderRadius:10,color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",textAlign:"center"}}>
            <div style={{fontSize:18,marginBottom:4}}>⚔️</div>
            <div>Contest</div>
          </button>
          <button onClick={()=>openTrainMoki()}
            style={{padding:"12px 8px",background:"linear-gradient(135deg,#166534,#16a34a)",border:"1px solid #22c55e",borderRadius:10,color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",textAlign:"center"}}>
            <div style={{fontSize:18,marginBottom:4}}>🏋️</div>
            <div>Training</div>
          </button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <button onClick={()=>window.open("https://marketplace.skymavis.com/collections/0x9e8ed4ff354bd11602255b3d8e1ed13a1bb26b4b","_blank")}
            style={{padding:"10px 8px",background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:9,color:"#22c55e",fontSize:10,fontWeight:700,cursor:"pointer",textAlign:"center"}}>
            <span style={{fontSize:14}}>🛒</span> Ronin Market
          </button>
          <button onClick={()=>openGrandArenaShop()}
            style={{padding:"10px 8px",background:"rgba(196,148,0,0.08)",border:"1px solid rgba(196,148,0,0.2)",borderRadius:9,color:"#c49400",fontSize:10,fontWeight:700,cursor:"pointer",textAlign:"center"}}>
            <span style={{fontSize:14}}>🎴</span> Card Shop
          </button>
        </div>
        <div style={{fontSize:8,color:"#374151",textAlign:"center",marginTop:6}}>Opens official Grand Arena in browser ↗</div>
      </div>

      {/* Contest Timers */}
      <ContestTimer/>

      {/* mXP Tracker */}
      <MxpTracker totalMxp={totalMxp}/>

      <div style={{background:"rgba(196,148,0,0.05)",border:"1px solid rgba(196,148,0,0.15)",borderRadius:14,padding:16,marginBottom:16}}>
        <div style={{fontSize:9,letterSpacing:4,color:"#c49400",marginBottom:10}}>WALLET</div>
        {!connected ? (
          <>
            {error && (
              <div style={{fontSize:10,color:"#f87171",background:"rgba(239,68,68,0.08)",padding:"8px 12px",borderRadius:6,marginBottom:10,lineHeight:1.5}}>⚠ {error}</div>
            )}
            {/* Method toggle */}
            <div style={{display:"flex",gap:4,marginBottom:12}}>
              <button onClick={()=>setImportMethod("pk")} style={{flex:1,padding:"8px 0",background:importMethod==="pk"?"rgba(196,148,0,0.18)":"rgba(255,255,255,0.03)",border:`1px solid ${importMethod==="pk"?"#c49400":"rgba(255,255,255,0.08)"}`,borderRadius:8,color:importMethod==="pk"?"#c49400":"#4b5563",fontSize:11,fontWeight:700,cursor:"pointer"}}>🔑 Private Key</button>
              <button onClick={()=>setImportMethod("seed")} style={{flex:1,padding:"8px 0",background:importMethod==="seed"?"rgba(196,148,0,0.18)":"rgba(255,255,255,0.03)",border:`1px solid ${importMethod==="seed"?"#c49400":"rgba(255,255,255,0.08)"}`,borderRadius:8,color:importMethod==="seed"?"#c49400":"#4b5563",fontSize:11,fontWeight:700,cursor:"pointer"}}>📝 Seed Phrase</button>
            </div>
            <textarea
              value={importInput}
              onChange={e=>setImportInput(e.target.value)}
              placeholder={importMethod==="pk"?"Enter private key (0x…)":"Enter 12 or 24 word seed phrase…"}
              rows={importMethod==="seed"?3:2}
              style={{width:"100%",padding:"10px 12px",background:"rgba(0,0,0,0.4)",border:"1px solid rgba(196,148,0,0.2)",borderRadius:8,color:"#f0e8d0",fontSize:11,outline:"none",resize:"none",marginBottom:8,boxSizing:"border-box",fontFamily:"monospace",lineHeight:1.5}}
            />
            <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:7,padding:"7px 10px",marginBottom:10}}>
              <div style={{fontSize:9,color:"#f87171",fontWeight:700,marginBottom:2}}>⚠ NEVER share your key or seed phrase</div>
              <div style={{fontSize:8,color:"#6b7280",lineHeight:1.5}}>Your key never leaves this app. It is used only to derive your Ronin address locally.</div>
            </div>
            <button onClick={importWallet} disabled={importing||!importInput.trim()}
              style={{width:"100%",padding:13,background:importing?"rgba(255,255,255,0.05)":"linear-gradient(135deg,#92400e,#b45309)",border:"1px solid #c49400",borderRadius:9,color:"#fde68a",fontSize:13,fontWeight:700,cursor:importing?"not-allowed":"pointer",marginBottom:8,letterSpacing:0.5}}>
              {importing ? "Importing…" : "🔑 Import Wallet"}
            </button>
            <button onClick={connectDemo}
              style={{width:"100%",padding:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:"#6b7280",fontSize:11,cursor:"pointer"}}>
              ▷ Demo Mode (no wallet needed)
            </button>
          </>
        ) : (
          <>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <div style={{width:42,height:42,borderRadius:"50%",background:"linear-gradient(135deg,#c49400,#f59e0b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>👤</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:"#f0e8d0",fontFamily:"monospace"}}>{shortAddr(address!)}</div>
                <div style={{fontSize:9,color:mode==="live"?"#22c55e":"#f59e0b",marginTop:2}}>
                  ● {mode==="live" ? (imgLoading ? "Fetching card art…" : "Imported Wallet") : "Demo Mode"}
                </div>
              </div>
              <button onClick={disconnect} style={{fontSize:9,padding:"4px 10px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:6,color:"#ef4444",cursor:"pointer"}}>Disconnect</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:8}}>
              <StatBox label="CARDS" value={ownedIds.length} color="#c49400"/>
              <StatBox label="RON VAL" value={`~${collVal}`} color="#22c55e"/>
              <StatBox label="mXP" value={totalMxp.toLocaleString()} color="#a855f7"/>
              <StatBox label="GEMS 💎" value={gems.toLocaleString()} color="#3b82f6"/>
            </div>
          </>
        )}
      </div>

      {connected && (
        <>
          <div style={{fontSize:9,letterSpacing:3,color:"#374151",marginBottom:10}}>
            YOUR COLLECTION ({ownedIds.length})
            {imgLoading && <span style={{marginLeft:8,color:"#f59e0b",fontWeight:700}}>↻ Loading art…</span>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {ownedIds.map(id=>{
              const c=ALL_CHAMPIONS.find(x=>x.id===id); if(!c)return null;
              return (
                <div key={id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:10}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                    <CardArt card={c} size={48} realImg={realImages[c.id]} ctx="hub"/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:9,fontWeight:700,color:"#f0e8d0",marginBottom:3,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{c.name}</div>
                      <Badge label={c.rarity} color={RARITY[c.rarity].color}/>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,fontSize:10}}>
                    <span style={{color:"#c49400"}}>📊{Math.round(c.score*RARITY[c.rarity].mult)}</span>
                    <span style={{color:"#22c55e"}}>{c.winRate}%W</span>
                    <span style={{color:"#14b8a6"}}>~{c.floorPrice}R</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   SCREEN: LINEUP FORGE (5-slot lineup manager)
═══════════════════════════════════════════════════════════════ */
function LineupScreen({ ownedIds, realImages }: { ownedIds: number[]; realImages: Record<number,string> }) {
  const [contest,setContest]=useState(CONTESTS[0]);
  const [scheme,setScheme]=useState<typeof SCHEME_CARDS[0]|null>(null);
  const [champs,setChamps]=useState<Champion[]>([]);
  const [showAll,setShowAll]=useState(ownedIds.length===0);
  const [sortBy,setSortBy]=useState("score");
  const [filterRarity,setFilterRarity]=useState("All");
  const [subTab,setSubTab]=useState<"build"|"slots"|"analyze">("slots");
  const [slots,setSlots]=useState<(Preset|null)[]>([null,null,null,null,null]);
  const [activeSlot,setActiveSlot]=useState<number|null>(null);
  const [savingSlot,setSavingSlot]=useState<number|null>(null);
  const [slotName,setSlotName]=useState("");
  const [sharing,setSharing]=useState(false);

  // Load persisted slots on mount
  useEffect(()=>{ load("lineup_slots",[null,null,null,null,null]).then(s=>{ if(s) setSlots(s); }); },[]);

  // Persist slots on change
  useEffect(()=>{ persist("lineup_slots",slots); },[slots]);

  const pool=useMemo(()=>showAll?ALL_CHAMPIONS:ALL_CHAMPIONS.filter(c=>ownedIds.includes(c.id)),[showAll,ownedIds]);
  const filtered=useMemo(()=>pool
    .filter(c=>filterRarity==="All"||c.rarity===filterRarity)
    .sort((a,b)=>sortBy==="score"?b.score*RARITY[b.rarity].mult-a.score*RARITY[a.rarity].mult:sortBy==="elims"?b.elims-a.elims:sortBy==="win"?b.winRate-a.winRate:b.stars-a.stars)
  ,[pool,filterRarity,sortBy]);

  const toggle=(c:Champion)=>setChamps(p=>p.find(x=>x.id===c.id)?p.filter(x=>x.id!==c.id):p.length>=4?p:[...p,c]);
  const score=scoreLineup(champs,scheme);
  const starTotal=champs.reduce((s,c)=>s+c.stars,0);
  const errors=useMemo(()=>{const e:string[]=[];if(champs.length<4)return e;if(contest.restriction==="onereach"){for(const r of["Basic","Rare","Epic","Legendary"])if(!champs.find(c=>c.rarity===r))e.push(`Missing ${r}`);}if(contest.restriction==="starcap"&&starTotal>contest.starCap)e.push(`Stars ${starTotal} > cap ${contest.starCap}`);return e;},[champs,contest,starTotal]);

  const loadSlot=(p:Preset)=>{
    const cont=CONTESTS.find(c=>c.id===p.contestId)||CONTESTS[0];
    const sch=SCHEME_CARDS.find(s=>s.id===p.schemeId)||null;
    const chs=p.champIds.map(id=>ALL_CHAMPIONS.find(c=>c.id===id)!).filter(Boolean);
    setContest(cont); setScheme(sch); setChamps(chs); setSubTab("build");
  };

  const saveToSlot=(slotIdx:number)=>{
    if(champs.length<4)return;
    const name=slotName.trim()||`Lineup ${slotIdx+1}`;
    const newP:Preset={
      id:`slot_${slotIdx}_${Date.now()}`, name, icon:SLOT_ICONS[slotIdx],
      contestId:contest.id, schemeId:scheme?.id||"", champIds:champs.map(c=>c.id),
      note:`${contest.name} · ${score.total}pts`, color:SLOT_COLORS[slotIdx], slot:slotIdx+1,
    };
    setSlots(p=>{const n=[...p];n[slotIdx]=newP;return n;});
    setSavingSlot(null); setSlotName(""); setActiveSlot(slotIdx); setSubTab("slots");
  };

  const clearSlot=(idx:number)=>setSlots(p=>{const n=[...p];n[idx]=null;return n;});

  return (
    <div style={{padding:"16px 0"}}>
      {/* Sub-nav */}
      <div style={{display:"flex",gap:4,marginBottom:14}}>
        <button onClick={()=>setSubTab("slots")} style={{flex:1,padding:"9px 0",background:subTab==="slots"?"rgba(196,148,0,0.15)":"rgba(255,255,255,0.03)",border:`1px solid ${subTab==="slots"?"#c49400":"rgba(255,255,255,0.07)"}`,borderRadius:8,color:subTab==="slots"?"#c49400":"#4b5563",fontSize:10,fontWeight:700,cursor:"pointer"}}>
          📋 Lineups
        </button>
        <button onClick={()=>setSubTab("build")} style={{flex:1,padding:"9px 0",background:subTab==="build"?"rgba(196,148,0,0.15)":"rgba(255,255,255,0.03)",border:`1px solid ${subTab==="build"?"#c49400":"rgba(255,255,255,0.07)"}`,borderRadius:8,color:subTab==="build"?"#c49400":"#4b5563",fontSize:10,fontWeight:700,cursor:"pointer"}}>
          ⚔️ Build
        </button>
        <button onClick={()=>setSubTab("analyze")} style={{flex:1,padding:"9px 0",background:subTab==="analyze"?"rgba(196,148,0,0.15)":"rgba(255,255,255,0.03)",border:`1px solid ${subTab==="analyze"?"#c49400":"rgba(255,255,255,0.07)"}`,borderRadius:8,color:subTab==="analyze"?"#c49400":"#4b5563",fontSize:10,fontWeight:700,cursor:"pointer"}}>
          🔬 Analyze
        </button>
      </div>

      {/* ── 5-SLOT LINEUPS TAB ── */}
      {subTab==="slots"&&(
        <div>
          <div style={{fontSize:9,color:"#4b5563",marginBottom:12,lineHeight:1.6}}>
            5 lineup slots — one for each contest you want to run. Build a lineup then save it to a slot.
          </div>

          {/* Contest filter pills */}
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:14}}>
            {CONTESTS.map(c=>(
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:4,background:`${c.color}12`,border:`1px solid ${c.color}30`,borderRadius:20,padding:"3px 10px"}}>
                <span style={{fontSize:10}}>{c.icon}</span>
                <span style={{fontSize:8,color:c.color,fontWeight:700}}>{c.name}</span>
              </div>
            ))}
          </div>

          {/* 5 slots */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {LINEUP_SLOTS.map((_, idx)=>{
              const p=slots[idx];
              const col=SLOT_COLORS[idx];
              const isActive=activeSlot===idx;
              if(p){
                const cont=CONTESTS.find(c=>c.id===p.contestId);
                const sch=SCHEME_CARDS.find(s=>s.id===p.schemeId);
                const cards=p.champIds.map(id=>ALL_CHAMPIONS.find(c=>c.id===id)!).filter(Boolean);
                const sc=scoreLineup(cards,sch||null);
                return (
                  <div key={idx} style={{background:`${col}08`,border:`2px solid ${isActive?col:col+"30"}`,borderRadius:13,padding:14}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <div style={{width:36,height:36,borderRadius:9,background:`${col}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,border:`1px solid ${col}40`,flexShrink:0}}>{p.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:800,color:col,marginBottom:3}}>{p.name}</div>
                        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                          {cont&&<Badge label={cont.name} color={cont.color}/>}
                          {sch&&<Badge label={sch.name} color="#3b82f6"/>}
                          <Badge label={`SLOT ${idx+1}`} color={col}/>
                        </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:16,fontWeight:900,color:col}}>{sc.total}</div>
                        <div style={{fontSize:7,color:"#374151"}}>PTS</div>
                      </div>
                    </div>
                    {/* Card thumbnails */}
                    <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
                      {cards.map(c=>(
                        <div key={c.id} style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.05)",borderRadius:7,padding:"4px 7px"}}>
                          <CardArt card={c} size={32} realImg={realImages[c.id]} ctx={`slot${idx}${c.id}`}/>
                          <div>
                            <div style={{fontSize:8,fontWeight:700,color:"#f0e8d0",maxWidth:60,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{c.name}</div>
                            <div style={{fontSize:7,color:RARITY[c.rarity].color}}>{c.rarity}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>loadSlot(p)} style={{flex:1,padding:8,background:`${col}18`,border:`1px solid ${col}50`,borderRadius:7,color:col,fontSize:10,fontWeight:700,cursor:"pointer"}}>▶ LOAD & EDIT</button>
                      <button onClick={()=>clearSlot(idx)} style={{padding:"8px 12px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:7,color:"#ef4444",fontSize:10,cursor:"pointer"}}>🗑</button>
                    </div>
                  </div>
                );
              }
              // Empty slot
              return (
                <div key={idx} style={{border:`2px dashed ${col}25`,borderRadius:13,padding:14,display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:9,background:`${col}10`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,border:`1px dashed ${col}30`,flexShrink:0,color:col}}>{idx+1}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,color:`${col}80`,fontWeight:700}}>Slot {idx+1} — Empty</div>
                    <div style={{fontSize:9,color:"#374151"}}>Build a lineup then save it here</div>
                  </div>
                  <button onClick={()=>{setSubTab("build");setSavingSlot(idx);}} style={{padding:"8px 12px",background:`${col}15`,border:`1px solid ${col}40`,borderRadius:7,color:col,fontSize:10,fontWeight:700,cursor:"pointer"}}>+ ADD</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── BUILD TAB ── */}
      {subTab==="build"&&(
        <>
          {/* Contest */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#374151",marginBottom:7}}>CONTEST FORMAT</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {CONTESTS.map(c=><Pill key={c.id} color={c.color} active={contest.id===c.id} onClick={()=>{setContest(c);setChamps([]);}}>{c.icon} {c.name}</Pill>)}
            </div>
            <div style={{marginTop:5,fontSize:10,color:"#374151"}}><span style={{color:contest.color}}>▶ </span>{contest.desc}</div>
          </div>

          {/* Builder */}
          <div style={{background:"rgba(196,148,0,0.04)",border:"1px solid rgba(196,148,0,0.12)",borderRadius:12,padding:14,marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:9,letterSpacing:3,color:"#c49400"}}>LINEUP ({champs.length}/4)</span>
              {contest.restriction==="starcap"&&<span style={{fontSize:9,color:starTotal>(contest.starCap||0)?"#ef4444":"#22c55e"}}>★{starTotal}/{contest.starCap}</span>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:12}}>
              {[0,1,2,3].map(i=>{const c=champs[i];return c?(
                <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:9,padding:9,position:"relative"}}>
                  <button onClick={()=>setChamps(p=>p.filter(x=>x.id!==c.id))} style={{position:"absolute",top:4,right:4,background:"rgba(239,68,68,0.15)",border:"none",color:"#ef4444",borderRadius:"50%",width:14,height:14,fontSize:8,cursor:"pointer",zIndex:1}}>✕</button>
                  <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
                    <CardArt card={c} size={40} realImg={realImages[c.id]} ctx={`slot${i}`}/>
                    <div style={{flex:1,minWidth:0}}><div style={{fontSize:9,fontWeight:700,color:"#f0e8d0",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",marginBottom:2}}>{c.name}</div><Badge label={c.rarity} color={RARITY[c.rarity].color}/></div>
                  </div>
                  <div style={{display:"flex",gap:6,fontSize:9}}><span style={{color:"#c49400"}}>📊{Math.round(c.score*RARITY[c.rarity].mult)}</span><span style={{color:"#22c55e"}}>{c.winRate}%</span><span style={{color:"#9ca3af"}}>★{c.stars}</span></div>
                </div>
              ):(
                <div key={i} style={{border:"1.5px dashed rgba(196,148,0,0.12)",borderRadius:9,height:72,display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(196,148,0,0.2)",fontSize:9}}>CHAMP {i+1}</div>
              );})}
            </div>

            {/* Scheme */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:9,letterSpacing:3,color:"#374151",marginBottom:6}}>SCHEME CARD</div>
              {SCHEME_CARDS.map(s=>{
                const b=calcScheme(s,champs); const active=scheme?.id===s.id;
                return (
                  <button key={s.id} onClick={()=>setScheme(active?null:s)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"7px 10px",borderRadius:7,background:active?"rgba(59,130,246,0.12)":"rgba(255,255,255,0.02)",border:`1px solid ${active?"#3b82f6":"rgba(255,255,255,0.06)"}`,cursor:"pointer",marginBottom:4,textAlign:"left"}}>
                    <span style={{fontSize:13}}>{s.icon}</span>
                    <div style={{flex:1}}><div style={{fontSize:9,fontWeight:700,color:active?"#93c5fd":"#9ca3af"}}>{s.name}</div><div style={{fontSize:8,color:"#374151"}}>{s.effect}</div></div>
                    {champs.length>0&&<span style={{fontSize:10,fontWeight:700,color:b>0?"#22c55e":"#374151",minWidth:24}}>{b>0?`+${b}`:"—"}</span>}
                    {active&&<span style={{fontSize:8,color:"#3b82f6",fontWeight:700}}>✓</span>}
                  </button>
                );
              })}
            </div>

            {champs.length>0&&(
              <div style={{background:"rgba(196,148,0,0.07)",borderRadius:8,padding:10,marginBottom:10}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6}}>
                  <StatBox label="TOTAL" value={score.total} color="#c49400"/>
                  <StatBox label="CHAMPS" value={score.champScore} color="#f0e8d0"/>
                  <StatBox label="SCHEME" value={score.schemeBonus||"—"} color="#3b82f6"/>
                  <StatBox label="WIN%" value={`${score.avgWin}%`} color="#22c55e"/>
                </div>
              </div>
            )}
            {errors.map((e,i)=><div key={i} style={{fontSize:9,color:"#f87171",background:"rgba(239,68,68,0.08)",borderRadius:5,padding:"3px 7px",marginBottom:3}}>⚠ {e}</div>)}

            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setChamps(buildBest(pool,contest,scheme))} style={{flex:1,padding:10,background:"linear-gradient(135deg,#92400e,#b45309)",border:"1px solid #c49400",borderRadius:8,color:"#fde68a",fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:1}}>⚡ AUTO-BUILD</button>
            </div>

            {/* Save to slot */}
            {champs.length>=4&&(
              <div style={{marginTop:10}}>
                <div style={{fontSize:9,color:"#c49400",letterSpacing:2,marginBottom:8}}>SAVE TO SLOT</div>
                <input value={slotName} onChange={e=>setSlotName(e.target.value)} placeholder="Lineup name (optional)" style={{width:"100%",padding:"7px 10px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#f0e8d0",fontSize:11,outline:"none",marginBottom:8,boxSizing:"border-box"}}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:5}}>
                  {LINEUP_SLOTS.map((_,idx)=>{
                    const taken=!!slots[idx];
                    const col=SLOT_COLORS[idx];
                    return (
                      <button key={idx} onClick={()=>saveToSlot(idx)} style={{padding:"8px 4px",background:taken?`${col}08`:`${col}18`,border:`1.5px solid ${col}${taken?"30":"60"}`,borderRadius:7,color:taken?`${col}60`:col,fontSize:9,fontWeight:700,cursor:"pointer",textAlign:"center"}}>
                        <div style={{fontSize:14}}>{SLOT_ICONS[idx]}</div>
                        <div>{idx+1}{taken?" ↺":""}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Pool */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
            <span style={{fontSize:9,letterSpacing:3,color:"#374151"}}>POOL ({filtered.length})</span>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {ownedIds.length>0&&<Pill color={showAll?"#9ca3af":"#c49400"} active={!showAll} onClick={()=>setShowAll(!showAll)}>{showAll?"All":"Mine"}</Pill>}
              {["score","elims","win","stars"].map(s=><Pill key={s} color="#6b7280" active={sortBy===s} onClick={()=>setSortBy(s)}>{s}</Pill>)}
            </div>
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
            {["All","Basic","Rare","Epic","Legendary"].map(r=><Pill key={r} color={RARITY[r]?.color||"#c49400"} active={filterRarity===r} onClick={()=>setFilterRarity(r)}>{r}</Pill>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,maxHeight:500,overflowY:"auto"}}>
            {filtered.map(c=>{
              const sel=!!champs.find(x=>x.id===c.id);
              return (
                <div key={c.id} onClick={()=>toggle(c)} style={{background:sel?"rgba(196,148,0,0.1)":"rgba(255,255,255,0.03)",border:`1.5px solid ${sel?"#c49400":"rgba(255,255,255,0.06)"}`,borderRadius:10,padding:10,cursor:"pointer",position:"relative"}}>
                  {sel&&<div style={{position:"absolute",top:5,right:5,width:14,height:14,background:"#c49400",borderRadius:"50%",fontSize:8,display:"flex",alignItems:"center",justifyContent:"center",zIndex:1}}>✓</div>}
                  <div style={{display:"flex",justifyContent:"center",marginBottom:6}}>
                    <CardArt card={c} size={68} realImg={realImages[c.id]} ctx="pool"/>
                  </div>
                  <div style={{fontSize:9,fontWeight:800,color:"#f0e8d0",textAlign:"center",marginBottom:4,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{c.name}</div>
                  <div style={{display:"flex",gap:3,marginBottom:5,justifyContent:"center",flexWrap:"wrap"}}><Badge label={c.rarity} color={RARITY[c.rarity].color}/><Badge label={c.class} color={CLASS_C[c.class]}/></div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:3}}>
                    {[{l:"SCORE",v:Math.round(c.score*RARITY[c.rarity].mult),cl:"#c49400"},{l:"ELIMS",v:c.elims,cl:"#ef4444"},{l:"WIN%",v:`${c.winRate}%`,cl:"#22c55e"}].map(x=>(
                      <div key={x.l} style={{textAlign:"center",background:"rgba(255,255,255,0.04)",borderRadius:4,padding:"3px 0"}}>
                        <div style={{fontSize:10,fontWeight:700,color:x.cl}}>{x.v}</div>
                        <div style={{fontSize:7,color:"#374151"}}>{x.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── ANALYZE TAB ── */}
      {subTab==="analyze"&&(()=>{
        const pool2 = ownedIds.length>0 ? ALL_CHAMPIONS.filter(c=>ownedIds.includes(c.id)) : ALL_CHAMPIONS;
        // Trait coverage
        const traitCounts: Record<string,number> = {};
        pool2.forEach(c=>c.traits.forEach(t=>{ traitCounts[t]=(traitCounts[t]||0)+1; }));
        const sortedTraits = Object.entries(traitCounts).sort((a,b)=>b[1]-a[1]);

        // Best scheme for your collection
        const schemeScores = SCHEME_CARDS.map(s=>{
          const bonus = pool2.reduce((sum,c)=>{
            let b=0;
            if(s.traitBonus && c.traits.includes(s.traitBonus)) b+=s.bonusPer;
            if(s.classBonus && c.class===s.classBonus) b+=Math.round(c.score*RARITY[c.rarity].mult*s.classMult);
            return sum+b;
          },s.baseBonus||0);
          return { scheme:s, bonus };
        }).sort((a,b)=>b.bonus-a.bonus);

        // Top 5 by contest
        const topByContest = CONTESTS.map(con=>{
          const best = buildBest(pool2, con, schemeScores[0]?.scheme||null);
          const sc = scoreLineup(best, schemeScores[0]?.scheme||null);
          return { contest:con, champs:best, score:sc };
        });

        return (
          <div>
            {/* Best scheme */}
            <div style={{background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.15)",borderRadius:12,padding:12,marginBottom:12}}>
              <div style={{fontSize:9,letterSpacing:3,color:"#3b82f6",marginBottom:8}}>BEST SCHEMES FOR YOUR COLLECTION</div>
              {schemeScores.slice(0,5).map((s,i)=>(
                <div key={s.scheme.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:i<4?"1px solid rgba(255,255,255,0.04)":"none"}}>
                  <span style={{fontSize:14}}>{s.scheme.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,fontWeight:700,color:"#f0e8d0"}}>{s.scheme.name}</div>
                    <div style={{fontSize:8,color:"#4b5563"}}>{s.scheme.effect}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#22c55e"}}>+{s.bonus}</div>
                    <div style={{fontSize:7,color:"#374151"}}>MAX BONUS</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trait coverage */}
            <div style={{background:"rgba(196,148,0,0.05)",border:"1px solid rgba(196,148,0,0.12)",borderRadius:12,padding:12,marginBottom:12}}>
              <div style={{fontSize:9,letterSpacing:3,color:"#c49400",marginBottom:8}}>TRAIT COVERAGE ({pool2.length} cards)</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {sortedTraits.map(([trait,count])=>(
                  <div key={trait} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"3px 10px",display:"flex",alignItems:"center",gap:4}}>
                    <span style={{fontSize:9,color:"#f0e8d0",fontWeight:700}}>{trait}</span>
                    <span style={{fontSize:8,color:"#c49400"}}>×{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimal lineups by contest */}
            <div style={{fontSize:9,letterSpacing:3,color:"#374151",marginBottom:8}}>OPTIMAL LINEUP PER CONTEST</div>
            {topByContest.map(({contest:con,champs:bestChamps,score:sc})=>(
              <div key={con.id} style={{background:`${con.color}06`,border:`1px solid ${con.color}20`,borderRadius:10,padding:10,marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <span style={{fontSize:12}}>{con.icon}</span>
                    <span style={{fontSize:10,fontWeight:700,color:con.color}}>{con.name}</span>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:800,color:con.color}}>{sc.total}</div>
                    <div style={{fontSize:7,color:"#374151"}}>PTS</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {bestChamps.map(c=>(
                    <div key={c.id} style={{display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.04)",borderRadius:6,padding:"3px 6px"}}>
                      <CardArt card={c} size={24} realImg={realImages[c.id]} ctx={`an${con.id}`}/>
                      <span style={{fontSize:8,color:"#f0e8d0"}}>{c.name.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Action buttons — shown when lineup is built */}
      {subTab==="build" && champs.length>=4 && (
        <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:8}}>
          {/* PRIMARY: Submit to Grand Arena */}
          <button
            onClick={()=>openSubmitToGrandArena(champs,scheme,contest)}
            style={{width:"100%",padding:14,background:"linear-gradient(135deg,#1e3a8a,#2563eb)",border:"1px solid #3b82f6",borderRadius:10,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",letterSpacing:0.5,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <span style={{fontSize:18}}>⚔️</span>
            <span>SUBMIT TO GRAND ARENA</span>
            <span style={{fontSize:10,opacity:0.7}}>↗</span>
          </button>
          <div style={{fontSize:9,color:"#374151",textAlign:"center",lineHeight:1.5}}>
            Opens <strong style={{color:"#60a5fa"}}>fantasy.grandarena.gg</strong> with your lineup pre-loaded.<br/>
            Log in with Ronin Wallet on that page and confirm your submission.
          </div>
          {/* Share */}
          <button
            onClick={async()=>{setSharing(true);await shareLineup(champs,scheme,score,contest.name);setSharing(false);}}
            disabled={sharing}
            style={{width:"100%",padding:11,background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:9,color:"#22c55e",fontSize:11,fontWeight:700,cursor:"pointer"}}>
            {sharing?"Sharing…":"📤 Share Lineup"}
          </button>
        </div>
      )}

      {/* Slots — show submit buttons on filled slots */}
      {subTab==="slots" && slots.some(s=>s!==null) && (
        <div style={{marginTop:14,background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.15)",borderRadius:10,padding:12}}>
          <div style={{fontSize:9,color:"#3b82f6",fontWeight:700,marginBottom:8}}>QUICK SUBMIT</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {slots.map((slot,idx)=>{ if(!slot)return null;
              const cont=CONTESTS.find(c=>c.id===slot.contestId);
              const cards=slot.champIds.map(id=>ALL_CHAMPIONS.find(c=>c.id===id)!).filter(Boolean);
              const sch=SCHEME_CARDS.find(s=>s.id===slot.schemeId)||null;
              return(
                <div key={idx} style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:16}}>{slot.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,fontWeight:700,color:SLOT_COLORS[idx]}}>{slot.name}</div>
                    <div style={{fontSize:8,color:"#374151"}}>{cont?.name} · {scoreLineup(cards,sch).total} pts</div>
                  </div>
                  <button
                    onClick={()=>openSubmitToGrandArena(cards,sch,cont||CONTESTS[0])}
                    style={{padding:"7px 14px",background:"rgba(59,130,246,0.15)",border:"1px solid rgba(59,130,246,0.4)",borderRadius:7,color:"#3b82f6",fontSize:10,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                    Submit ↗
                  </button>
                </div>
              );
            })}
          </div>
          <div style={{fontSize:8,color:"#374151",marginTop:8,lineHeight:1.5}}>
            Opens Grand Arena in browser. Sign in with Ronin Wallet to confirm.
          </div>
        </div>
      )}
    </div>
  );
}

const GYM_TABS_LIST = [
  {id:"roster",icon:"🦝",label:"Roster"},
  {id:"train",icon:"💪",label:"Train"},
  {id:"shop",icon:"🛒",label:"Shop"},
  {id:"records",icon:"📊",label:"Records"},
];

function GymScreen({ onMxpEarn, gems, setGems }: { onMxpEarn:(n:number)=>void; gems:number; setGems:React.Dispatch<React.SetStateAction<number>> }) {
  const [gtab,setGtab]=useState("roster");
  const [mokis,setMokis]=useState<Moki[]>(INIT_MOKIS);
  const [selected,setSelected]=useState<string|null>(null);
  const [snackInv,setSnackInv]=useState<Record<string,number>>({mochi:3,yaki:2,bun:1,tea:4,wrap:1});
  const [gymLog,setGymLog]=useState([
    {msg:"IRON MOKI started STR training (4hr)",color:"#ef4444",time:"2h ago"},
    {msg:"ROGUE PANDA started SPD training (2hr)",color:"#f59e0b",time:"45m ago"},
  ]);
  const [assignModal,setAssignModal]=useState<{mokiId:string;statId?:string;durId?:string}|null>(null);

  const addLog=useCallback((msg:string,color="#22c55e")=>setGymLog(p=>[{msg,color,time:"just now"},...p.slice(0,14)]),[]);

  const assignTraining=(mokiId:string,statId:string,durId:string)=>{
    const dur=DURATIONS.find(d=>d.id===durId);
    const moki=mokis.find(m=>m.id===mokiId);
    if(!moki||!dur)return;
    if(moki.stamina<dur.staminaCost){addLog(`${moki.name}: not enough stamina!`,"#ef4444");return;}
    const stat=REAL_STATS.find(s=>s.id===statId);
    setMokis(p=>p.map(m=>m.id===mokiId?{...m,training:{statId,durId,progress:0},stamina:Math.max(0,m.stamina-dur.staminaCost)}:m));
    addLog(`${moki.name} → ${stat?.label||statId} training (${dur.label})`,stat?.color||"#22c55e");
    setAssignModal(null);
  };

  const completeTraining=(mokiId:string)=>{
    const moki=mokis.find(m=>m.id===mokiId); if(!moki?.training)return;
    const dur=DURATIONS.find(d=>d.id===moki.training!.durId);
    const statId=moki.training!.statId;
    const xpGain=Math.round((dur?.xpGain||18));
    const statGain=Math.round(3*(dur?.multiplier||1));
    const newXp=moki.xp+xpGain; const lvlUp=newXp>=moki.xpNext;
    setMokis(p=>p.map(m=>m.id===mokiId?{
      ...m,
      [statId]:Math.min(100,(m as any)[statId]+statGain),
      xp:lvlUp?newXp-m.xpNext:newXp,
      xpNext:lvlUp?m.xpNext+400:m.xpNext,
      level:lvlUp?m.level+1:m.level,
      streak:m.streak+1,
      training:null,
    }:m));
    onMxpEarn(xpGain);
    const stat=REAL_STATS.find(s=>s.id===statId);
    addLog(`${moki.name} finished ${stat?.label}! +${statGain} ${statId.toUpperCase()} +${xpGain}mXP`,stat?.color||"#22c55e");
  };

  const useSnack=(mokiId:string,snackId:string)=>{
    if(!(snackInv[snackId]>0)){addLog("Out of stock!","#ef4444");return;}
    const snack=GYM_SNACKS.find(s=>s.id===snackId);
    const moki=mokis.find(m=>m.id===mokiId);
    if(!moki||!snack)return;
    setMokis(p=>p.map(m=>m.id===mokiId?{...m,stamina:snackId==="wrap"?100:Math.min(100,m.stamina+snack.stam)}:m));
    setSnackInv(p=>({...p,[snackId]:p[snackId]-1}));
    if(snack.mxp)onMxpEarn(snack.mxp);
    addLog(`${moki.name} ate ${snack.name}!`,"#f59e0b");
  };

  const buySnack=(snackId:string)=>{
    const snack=GYM_SNACKS.find(s=>s.id===snackId);
    if(!snack||gems<snack.cost){addLog("Not enough Gems!","#ef4444");return;}
    setGems(p=>p-snack.cost);
    setSnackInv(p=>({...p,[snackId]:(p[snackId]||0)+1}));
    addLog(`Purchased ${snack.name}`,"#22c55e");
  };

  const toggleLock=(mokiId:string)=>{
    const m=mokis.find(x=>x.id===mokiId);
    setMokis(p=>p.map(x=>x.id===mokiId?{...x,locked:!x.locked}:x));
    addLog(m?.locked?`${m?.name} unlocked`:`${m?.name} locked (+50mXP/wk)`,"#a855f7");
  };

  return (
    <div style={{padding:"16px 0"}}>
      {/* Info banner — real game context */}
      <div style={{background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.15)",borderRadius:10,padding:10,marginBottom:14}}>
        <div style={{fontSize:9,color:"#3b82f6",fontWeight:700,marginBottom:4}}>ℹ REAL MOKI TRAINING (mirrors Moki Manager)</div>
        <div style={{fontSize:9,color:"#4b5563",lineHeight:1.7}}>
          <strong style={{color:"#60a5fa"}}>SPD</strong> → ground/air movement · <strong style={{color:"#f87171"}}>STR</strong> → Buff form speed · <strong style={{color:"#93c5fd"}}>DEF</strong> → Wart riding + Buff transform · <strong style={{color:"#86efac"}}>DEX</strong> → carrying Gacha Ball · <strong style={{color:"#c4b5fd"}}>FRT</strong> → respawn time
          <br/>No cooldowns between sessions. Snacks speed up training or give mXP.
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{display:"flex",marginBottom:14,background:"rgba(255,255,255,0.02)",borderRadius:10,padding:2,gap:2}}>
        {GYM_TABS_LIST.map(t=>(
          <button key={t.id} onClick={()=>setGtab(t.id)} style={{flex:1,padding:"6px 2px",background:gtab===t.id?"rgba(196,148,0,0.15)":"none",border:"none",borderRadius:8,color:gtab===t.id?"#c49400":"#374151",cursor:"pointer"}}>
            <div style={{fontSize:13}}>{t.icon}</div>
            <div style={{fontSize:7,letterSpacing:0.5,marginTop:1,fontWeight:gtab===t.id?700:400}}>{t.label}</div>
          </button>
        ))}
      </div>

      {/* Active training badges */}
      {mokis.filter(m=>m.training).length>0&&(
        <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
          {mokis.filter(m=>m.training).map(m=>{
            const stat=REAL_STATS.find(s=>s.id===m.training!.statId);
            return (
              <div key={m.id} style={{display:"flex",alignItems:"center",gap:5,background:`${stat?.color||"#c49400"}15`,border:`1px solid ${stat?.color||"#c49400"}40`,borderRadius:20,padding:"4px 10px"}}>
                <MokiArt moki={m} size={22}/>
                <span style={{fontSize:8,color:stat?.color||"#c49400",fontWeight:700}}>{m.name.split(" ")[0]}</span>
                <span style={{fontSize:7,color:"#6b7280"}}>▶{stat?.icon}</span>
                <div style={{width:26,height:26,position:"relative",flexShrink:0}}>
                  <svg width={26} height={26} style={{transform:"rotate(-90deg)"}}>
                    <circle cx={13} cy={13} r={10} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5"/>
                    <circle cx={13} cy={13} r={10} fill="none" stroke={stat?.color||"#c49400"} strokeWidth="2.5" strokeDasharray={62.8} strokeDashoffset={62.8*(1-m.training!.progress/100)} strokeLinecap="round"/>
                  </svg>
                  <span style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:7,color:stat?.color||"#c49400",fontWeight:700}}>{m.training!.progress}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ROSTER */}
      {gtab==="roster"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {mokis.map(m=>{
            const isSel=selected===m.id;
            const wr=m.wins+m.losses>0?Math.round(m.wins/(m.wins+m.losses)*100):0;
            const avgStat=totalPower(m);
            return (
              <div key={m.id} onClick={()=>setSelected(isSel?null:m.id)} style={{background:isSel?"rgba(196,148,0,0.08)":"rgba(255,255,255,0.03)",border:`1.5px solid ${isSel?"#c49400":"rgba(255,255,255,0.07)"}`,borderRadius:12,padding:12,cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <div style={{position:"relative"}}>
                    <MokiArt moki={m} size={52}/>
                    {m.training&&<div style={{position:"absolute",bottom:-2,right:-2,width:14,height:14,background:"#22c55e",borderRadius:"50%",border:"2px solid #070510",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8}}>⚡</div>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:3,flexWrap:"wrap"}}>
                      <span style={{fontSize:12,fontWeight:800,color:"#f0e8d0"}}>{m.name}</span>
                      {m.locked&&<Badge label="🔒" color="#f59e0b"/>}
                      {m.training&&<Badge label={`▶${REAL_STATS.find(s=>s.id===m.training!.statId)?.label}`} color="#22c55e"/>}
                    </div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      <Badge label={m.class} color={MOKI_CLASS_C[m.class]||"#9ca3af"}/>
                      <Badge label={`LVL${m.level}`} color="#a855f7"/>
                      {m.streak>0&&<span style={{fontSize:9,color:"#f59e0b"}}>🔥×{m.streak}</span>}
                    </div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:18,fontWeight:800,color:"#c49400"}}>{avgStat}</div>
                    <div style={{fontSize:7,color:"#374151"}}>AVG</div>
                  </div>
                </div>
                <div style={{marginBottom:5}}><div style={{fontSize:8,color:"#374151",marginBottom:2}}>STAMINA</div><StaminaBar val={m.stamina}/></div>
                <XPBar xp={m.xp} xpNext={m.xpNext}/>
                {/* Stat bars */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 12px",marginTop:8}}>
                  {REAL_STATS.map(s=>(
                    <div key={s.id}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:1}}><span style={{fontSize:8,color:s.color}}>{s.icon}{s.label}</span><span style={{fontSize:8,color:"#4b5563"}}>{(m as any)[s.id]}</span></div>
                      <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"}}><div style={{width:`${(m as any)[s.id]}%`,height:"100%",background:s.color,borderRadius:2}}/></div>
                    </div>
                  ))}
                </div>
                {isSel&&(
                  <div onClick={e=>e.stopPropagation()} style={{marginTop:12,borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:12}}>
                    <div style={{fontSize:9,color:"#4b5563",marginBottom:8}}>{m.wins}W · {m.losses}L · {wr}% WR</div>
                    <div style={{display:"flex",gap:6,marginBottom:8}}>
                      {!m.training&&<button onClick={()=>setAssignModal({mokiId:m.id})} style={{flex:1,padding:8,background:"rgba(196,148,0,0.12)",border:"1px solid rgba(196,148,0,0.3)",borderRadius:7,color:"#c49400",fontSize:10,fontWeight:700,cursor:"pointer"}}>▶ START TRAINING</button>}
                      <button onClick={()=>toggleLock(m.id)} style={{flex:1,padding:8,background:m.locked?"rgba(239,68,68,0.1)":"rgba(245,158,11,0.1)",border:`1px solid ${m.locked?"rgba(239,68,68,0.25)":"rgba(245,158,11,0.25)"}`,borderRadius:7,color:m.locked?"#ef4444":"#f59e0b",fontSize:9,fontWeight:700,cursor:"pointer"}}>{m.locked?"🔓 Unlock":"🔒 Lock +50mXP"}</button>
                    </div>
                    <div style={{fontSize:9,color:"#374151",letterSpacing:2,marginBottom:6}}>QUICK FEED</div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {GYM_SNACKS.map(s=>(
                        <button key={s.id} onClick={()=>useSnack(m.id,s.id)} disabled={!snackInv[s.id]} style={{padding:"5px 8px",background:snackInv[s.id]?"rgba(245,158,11,0.1)":"rgba(255,255,255,0.02)",border:`1px solid ${snackInv[s.id]?"rgba(245,158,11,0.25)":"rgba(255,255,255,0.05)"}`,borderRadius:6,color:snackInv[s.id]?"#f59e0b":"#374151",fontSize:11,cursor:snackInv[s.id]?"pointer":"not-allowed",display:"flex",alignItems:"center",gap:3}}>
                          {s.icon}<span style={{fontSize:8}}>×{snackInv[s.id]||0}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {m.training&&(
                  <div style={{marginTop:8,display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"6px 10px"}}>
                    <div style={{fontSize:8,color:"#6b7280",flex:1}}>{REAL_STATS.find(s=>s.id===m.training!.statId)?.label} · {DURATIONS.find(d=>d.id===m.training!.durId)?.label}</div>
                    <button onClick={e=>{e.stopPropagation();completeTraining(m.id);}} style={{padding:"4px 10px",background:"rgba(34,197,94,0.15)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:6,color:"#22c55e",fontSize:9,fontWeight:700,cursor:"pointer"}}>FINISH</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TRAIN — Assign training to a moki */}
      {gtab==="train"&&(
        <div>
          {/* Grand Arena Training Link */}
          <button
            onClick={()=>openTrainMoki()}
            style={{width:"100%",padding:12,background:"linear-gradient(135deg,#1e3a8a,#2563eb)",border:"1px solid #3b82f6",borderRadius:10,color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <span style={{fontSize:16}}>🏋️</span>
            <span>TRAIN ON GRAND ARENA</span>
            <span style={{fontSize:10,opacity:0.7}}>↗</span>
          </button>
          <div style={{fontSize:9,color:"#374151",textAlign:"center",marginBottom:12,lineHeight:1.5}}>
            Opens <strong style={{color:"#60a5fa"}}>train.grandarena.gg</strong> — real training that updates your Moki stats on-chain.
          </div>
          <div style={{fontSize:9,letterSpacing:2,color:"#374151",marginBottom:8}}>IN-APP TRACKER</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {mokis.map(m=>(
              <div key={m.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:12,display:"flex",alignItems:"center",gap:10}}>
                <MokiArt moki={m} size={44}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#f0e8d0",marginBottom:3}}>{m.name}</div>
                  <StaminaBar val={m.stamina}/>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                  <button onClick={()=>openTrainMoki(m.name)} style={{padding:"4px 8px",background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:5,color:"#3b82f6",fontSize:8,fontWeight:700,cursor:"pointer"}}>Train ↗</button>
                  {m.training?(
                    <button onClick={()=>completeTraining(m.id)} style={{padding:"4px 8px",background:"rgba(34,197,94,0.12)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:5,color:"#22c55e",fontSize:8,cursor:"pointer"}}>✓ Done</button>
                  ):(
                    <button onClick={()=>setAssignModal({mokiId:m.id})} disabled={m.stamina<5} style={{padding:"4px 8px",background:m.stamina>=5?"rgba(196,148,0,0.12)":"rgba(255,255,255,0.03)",border:`1px solid ${m.stamina>=5?"rgba(196,148,0,0.3)":"rgba(255,255,255,0.06)"}`,borderRadius:5,color:m.stamina>=5?"#c49400":"#374151",fontSize:8,fontWeight:700,cursor:m.stamina>=5?"pointer":"not-allowed"}}>Log</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SHOP */}
      {gtab==="shop"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
            <span style={{fontSize:9,letterSpacing:3,color:"#374151"}}>SNACK SHOP</span>
            <span style={{fontSize:12,fontWeight:700,color:"#c49400"}}>{gems.toLocaleString()} 💎</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {GYM_SNACKS.map(s=>(
              <div key={s.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:11,padding:12,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:42,height:42,background:"rgba(245,158,11,0.1)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,border:"1px solid rgba(245,158,11,0.2)"}}>{s.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#f0e8d0",marginBottom:2}}>{s.name}</div>
                  <div style={{fontSize:9,color:"#4b5563",marginBottom:4}}>{s.effect}</div>
                  <div style={{display:"flex",gap:5}}>
                    {s.mxp>0&&<span style={{fontSize:8,color:"#a855f7",background:"rgba(168,85,247,0.12)",padding:"1px 5px",borderRadius:4}}>+{s.mxp}mXP</span>}
                    {s.stam>0&&<span style={{fontSize:8,color:"#22c55e",background:"rgba(34,197,94,0.12)",padding:"1px 5px",borderRadius:4}}>+{s.stam}STA</span>}
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:13,fontWeight:800,color:"#c49400"}}>{s.cost}</div>
                  <div style={{fontSize:7,color:"#374151",marginBottom:6}}>GEMS</div>
                  <div style={{display:"flex",gap:4,alignItems:"center",justifyContent:"flex-end"}}>
                    <span style={{fontSize:9,color:snackInv[s.id]?"#f59e0b":"#374151"}}>×{snackInv[s.id]||0}</span>
                    <button onClick={()=>buySnack(s.id)} disabled={gems<s.cost} style={{padding:"4px 10px",background:gems>=s.cost?"rgba(196,148,0,0.15)":"rgba(255,255,255,0.03)",border:`1px solid ${gems>=s.cost?"rgba(196,148,0,0.4)":"rgba(255,255,255,0.06)"}`,borderRadius:6,color:gems>=s.cost?"#c49400":"#374151",fontSize:9,fontWeight:700,cursor:gems>=s.cost?"pointer":"not-allowed"}}>BUY</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECORDS */}
      {gtab==="records"&&(
        <div>
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:12,marginBottom:14}}>
            <div style={{fontSize:9,color:"#c49400",letterSpacing:2,marginBottom:10}}>POWER RANKING</div>
            {[...mokis].sort((a,b)=>totalPower(b)-totalPower(a)).map((m,i)=>(
              <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<mokis.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
                <div style={{width:20,fontSize:11,fontWeight:800,color:i===0?"#f59e0b":i===1?"#9ca3af":i===2?"#cd7f32":"#374151",textAlign:"center"}}>{i===0?"👑":i===1?"🥈":i===2?"🥉":`#${i+1}`}</div>
                <MokiArt moki={m} size={36}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#f0e8d0"}}>{m.name}</div>
                  <div style={{fontSize:8,color:"#4b5563"}}>SPD{m.spd} STR{m.str} DEF{m.def} DEX{m.dex} FRT{m.frt}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:14,fontWeight:800,color:"#c49400"}}>{totalPower(m)}</div>
                  <div style={{fontSize:8,color:"#4b5563"}}>{m.wins}W/{m.losses}L</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,padding:12}}>
            <div style={{fontSize:9,color:"#374151",letterSpacing:2,marginBottom:8}}>ACTIVITY LOG</div>
            {gymLog.map((l,i)=>(
              <div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:i<gymLog.length-1?"1px solid rgba(255,255,255,0.03)":"none"}}>
                <span style={{fontSize:9,color:"#374151",whiteSpace:"nowrap",minWidth:48}}>{l.time}</span>
                <span style={{fontSize:9,color:l.color}}>▸ {l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ASSIGN MODAL */}
      {assignModal&&(()=>{
        const moki=mokis.find(m=>m.id===assignModal.mokiId); if(!moki)return null;
        return (
          <div onClick={()=>setAssignModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100,padding:16}}>
            <div onClick={e=>e.stopPropagation()} style={{background:"#0d1117",border:"1px solid rgba(196,148,0,0.25)",borderRadius:16,padding:18,width:"100%",maxWidth:480,maxHeight:"85vh",overflowY:"auto"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                <MokiArt moki={moki} size={52}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:800,color:"#f0e8d0"}}>{moki.name}</div>
                  <div style={{fontSize:9,color:"#6b7280"}}>Stamina: {moki.stamina}%</div>
                </div>
                <button onClick={()=>setAssignModal(null)} style={{background:"none",border:"none",color:"#4b5563",fontSize:18,cursor:"pointer"}}>✕</button>
              </div>
              <div style={{fontSize:9,letterSpacing:2,color:"#374151",marginBottom:8}}>SELECT STAT TO TRAIN</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
                {REAL_STATS.map(s=>{
                  const isSel=assignModal.statId===s.id;
                  return (
                    <button key={s.id} onClick={()=>setAssignModal(p=>({...p!,statId:s.id}))} style={{flex:1,minWidth:80,padding:"10px 6px",background:isSel?`${s.color}20`:"rgba(255,255,255,0.03)",border:`1px solid ${isSel?s.color:"rgba(255,255,255,0.07)"}`,borderRadius:9,color:isSel?s.color:"#6b7280",cursor:"pointer",textAlign:"center"}}>
                      <div style={{fontSize:16,marginBottom:3}}>{s.icon}</div>
                      <div style={{fontSize:9,fontWeight:isSel?700:400}}>{s.label}</div>
                      <div style={{fontSize:8,color:"#374151",marginTop:2}}>{(moki as any)[s.id]}/100</div>
                    </button>
                  );
                })}
              </div>
              {assignModal.statId&&(()=>{
                const stat=REAL_STATS.find(s=>s.id===assignModal.statId)!;
                return (
                  <>
                    <div style={{fontSize:9,color:stat.color,marginBottom:10,lineHeight:1.5}}>
                      {stat.icon} <strong>{stat.label}</strong>: {stat.desc}
                    </div>
                    <div style={{fontSize:9,letterSpacing:2,color:"#374151",marginBottom:8}}>SELECT DURATION</div>
                    <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:14}}>
                      {DURATIONS.map(d=>{
                        const isSel=assignModal.durId===d.id;
                        const ok=moki.stamina>=d.staminaCost;
                        const statGain=Math.round(3*d.multiplier);
                        return (
                          <button key={d.id} onClick={()=>ok&&setAssignModal(p=>({...p!,durId:d.id}))} disabled={!ok} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",background:isSel?"rgba(196,148,0,0.12)":"rgba(255,255,255,0.03)",border:`1px solid ${isSel?"#c49400":"rgba(255,255,255,0.07)"}`,borderRadius:8,cursor:ok?"pointer":"not-allowed",opacity:ok?1:0.4}}>
                            <div style={{flex:1,textAlign:"left"}}>
                              <div style={{fontSize:10,fontWeight:700,color:isSel?"#c49400":"#d1d5db"}}>{d.label}</div>
                              <div style={{fontSize:8,color:"#4b5563"}}>+{statGain} {stat.label.toUpperCase()}</div>
                            </div>
                            <div style={{textAlign:"right"}}><div style={{fontSize:9,color:"#ef4444"}}>-{d.staminaCost}STA</div><div style={{fontSize:9,color:"#a855f7"}}>+{d.xpGain}mXP</div></div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
              <button
                onClick={()=>assignModal.statId&&assignModal.durId&&assignTraining(assignModal.mokiId,assignModal.statId,assignModal.durId)}
                disabled={!assignModal.statId||!assignModal.durId}
                style={{width:"100%",padding:12,background:assignModal.statId&&assignModal.durId?"linear-gradient(135deg,#92400e,#b45309)":"rgba(255,255,255,0.03)",border:`1px solid ${assignModal.statId&&assignModal.durId?"#c49400":"rgba(255,255,255,0.07)"}`,borderRadius:9,color:assignModal.statId&&assignModal.durId?"#fde68a":"#374151",fontSize:12,fontWeight:700,cursor:assignModal.statId&&assignModal.durId?"pointer":"not-allowed",letterSpacing:1}}>
                ▶ BEGIN TRAINING SESSION
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCREEN: MARKETPLACE
═══════════════════════════════════════════════════════════════ */
const MKT_TABS_LIST=[{id:"browse",icon:"🏪",label:"Browse"},{id:"sell",icon:"💰",label:"Sell"},{id:"watchlist",icon:"👁️",label:"Watch"},{id:"roi",icon:"📊",label:"ROI"},{id:"portfolio",icon:"📈",label:"Portfolio"}];

function MarketScreen({ ownedIds, wallet, gems, setGems, onAddOwned, realImages, onTx }: { ownedIds:number[]; wallet:ReturnType<typeof useWallet>; gems:number; setGems:React.Dispatch<React.SetStateAction<number>>; onAddOwned:(id:number)=>void; realImages:Record<number,string>; onTx:(tx:TxRecord)=>void }) {
  const [mtab,setMtab]=useState("browse");
  const [listings,setListings]=useState(INIT_LISTINGS);
  const [watchlist,setWatchlist]=useState<number[]>([]);
  const [myListings,setMyListings]=useState<typeof INIT_LISTINGS>([]);
  const [filter,setFilter]=useState({rarity:"All",sortBy:"price"});
  const [priceInput,setPriceInput]=useState("");
  const [sellCard,setSellCard]=useState<number|null>(null);
  const [buyConfirm,setBuyConfirm]=useState<(typeof INIT_LISTINGS[0] & {card:Champion})|null>(null);
  const [priceHistories]=useState(()=>Object.fromEntries(ALL_CHAMPIONS.map(c=>[c.id,genHistory(c.floorPrice)])));
  const [searchQ,setSearchQ]=useState("");
  const [notification,setNotification]=useState<{msg:string;color:string}|null>(null);
  const [priceAlerts,setPriceAlerts]=useState<PriceAlert[]>([]);
  const [alertCardId,setAlertCardId]=useState<number|null>(null);
  const [alertTarget,setAlertTarget]=useState("");
  const [alertType,setAlertType]=useState<"below"|"above">("below");
  const [roiBuyPrice,setRoiBuyPrice]=useState("");
  const [roiSellPrice,setRoiSellPrice]=useState("");
  const [roiDays,setRoiDays]=useState("30");
  const [roiCardId,setRoiCardId]=useState<number|null>(null);
  const [livePrices,setLivePrices]=useState<Record<string,number>>({});
  const [liveLoading,setLiveLoading]=useState(false);

  // Load persisted state
  useEffect(()=>{
    load("watchlist",[]).then(w=>{ if(w?.length) setWatchlist(w); });
    load("price_alerts",[]).then(a=>{ if(a?.length) setPriceAlerts(a); });
  },[]);

  // Persist watchlist + alerts
  useEffect(()=>{ persist("watchlist",watchlist); },[watchlist]);
  useEffect(()=>{ persist("price_alerts",priceAlerts); },[priceAlerts]);

  // Try to fetch live prices
  useEffect(()=>{
    if(mtab==="browse"){
      setLiveLoading(true);
      fetchLiveFloorPrices().then(p=>{ setLivePrices(p); setLiveLoading(false); });
    }
  },[mtab]);

  // Check price alerts against current listings
  useEffect(()=>{
    priceAlerts.filter(a=>!a.triggered).forEach(alert=>{
      const cheapest = listings.filter(l=>l.cardId===alert.cardId).sort((a,b)=>a.price-b.price)[0];
      if(!cheapest) return;
      const triggered = alert.type==="below" ? cheapest.price <= alert.targetPrice : cheapest.price >= alert.targetPrice;
      if(triggered){
        const card = ALL_CHAMPIONS.find(c=>c.id===alert.cardId);
        showNotif(`🔔 ${card?.name} ${alert.type==="below"?"dropped to":"hit"} ${cheapest.price} RON!`,"#f59e0b");
        setPriceAlerts(p=>p.map(a=>a.id===alert.id?{...a,triggered:true}:a));
      }
    });
  },[listings,priceAlerts]);

  const showNotif=(msg:string,color="#22c55e")=>{setNotification({msg,color});setTimeout(()=>setNotification(null),2800);};

  const filteredListings=useMemo(()=>listings
    .map(l=>({...l,card:ALL_CHAMPIONS.find(c=>c.id===l.cardId)!}))
    .filter(l=>l.card)
    .filter(l=>filter.rarity==="All"||l.rarity===filter.rarity)
    .filter(l=>!searchQ||l.card.name.toLowerCase().includes(searchQ.toLowerCase()))
    .sort((a,b)=>filter.sortBy==="price"?a.price-b.price:filter.sortBy==="priceDesc"?b.price-a.price:RARITY[b.rarity].rank-RARITY[a.rarity].rank)
  ,[listings,filter,searchQ]);

  const floorByRarity=useMemo(()=>{
    const f:Record<string,string>={};
    for(const r of["Basic","Rare","Epic","Legendary"]){const ls=listings.filter(l=>l.rarity===r).map(l=>l.price);f[r]=ls.length?Math.min(...ls).toFixed(2):"—";}
    return f;
  },[listings]);

  const confirmBuy=(listing:typeof buyConfirm)=>{
    if(!listing)return;
    if(!wallet.mode||wallet.mode==="disconnected"){showNotif("Connect wallet to buy","#ef4444");return;}
    const fee=Math.round(listing.price*MARKET_FEE*1000);
    const total=Math.round(listing.price*1000)+fee;
    if(gems<total){showNotif("Not enough Gems","#ef4444");return;}
    setListings(p=>p.filter(l=>l.id!==listing.id));
    setGems(p=>p-total);
    onAddOwned(listing.cardId);
    const ts=new Date().toLocaleTimeString();
    onTx({id:`t${Date.now()}`,type:"buy",cardId:listing.cardId,price:listing.price,fee:listing.price*MARKET_FEE,when:"just now",ts});
    setBuyConfirm(null);
    showNotif(`Bought ${listing.card?.name} for ${listing.price} RON (+${(listing.price*MARKET_FEE).toFixed(3)} fee)`);
  };

  const listCard=(cardId:number,price:string)=>{
    if(!cardId||!price||isNaN(+price)){showNotif("Enter a valid price","#ef4444");return;}
    const card=ALL_CHAMPIONS.find(c=>c.id===cardId)!;
    const newL={id:`MY${Date.now()}`,cardId,price:+price,seller:shortAddr(wallet.address!)||"you",listedHrs:0,rarity:card?.rarity||"Basic",isOwn:true};
    setListings(p=>[newL,...p]);
    setMyListings(p=>[...p,newL]);
    const fee=+price*MARKET_FEE;
    onTx({id:`t${Date.now()}`,type:"list",cardId,price:+price,fee,when:"just now",ts:new Date().toLocaleTimeString()});
    setSellCard(null); setPriceInput("");
    showNotif(`Listed ${card?.name} for ${price} RON`,"#c49400");
  };

  const portfolioValue=ownedIds.reduce((s,id)=>{const c=ALL_CHAMPIONS.find(x=>x.id===id);return s+(c?c.floorPrice:0);},0);

  return (
    <div style={{padding:"16px 0"}}>
      {notification&&(
        <div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",zIndex:200,background:"#0d1117",border:`1px solid ${notification.color}`,borderRadius:10,padding:"9px 18px",fontSize:11,color:notification.color,fontWeight:700,boxShadow:"0 4px 24px rgba(0,0,0,0.5)",whiteSpace:"nowrap"}}>{notification.msg}</div>
      )}
      <div style={{display:"flex",marginBottom:14,background:"rgba(255,255,255,0.02)",borderRadius:10,padding:2,gap:2}}>
        {MKT_TABS_LIST.map(t=>(
          <button key={t.id} onClick={()=>setMtab(t.id)} style={{flex:1,padding:"6px 2px",background:mtab===t.id?"rgba(34,197,94,0.12)":"none",border:"none",borderRadius:8,color:mtab===t.id?"#22c55e":"#374151",cursor:"pointer"}}>
            <div style={{fontSize:13}}>{t.icon}</div>
            <div style={{fontSize:7,marginTop:1,fontWeight:mtab===t.id?700:400}}>{t.label}</div>
          </button>
        ))}
      </div>

      {mtab==="browse"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:14}}>
            {["Basic","Rare","Epic","Legendary"].map(r=>(
              <div key={r} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${RARITY[r].color}30`,borderRadius:9,padding:"7px 4px",textAlign:"center"}}>
                <div style={{fontSize:11,fontWeight:700,color:RARITY[r].color}}>{floorByRarity[r]}</div>
                <div style={{fontSize:7,color:"#374151"}}>FLOOR</div>
                <div style={{fontSize:7,color:"#4b5563"}}>{r.slice(0,4).toUpperCase()}</div>
              </div>
            ))}
          </div>
          <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search cards…" style={{width:"100%",padding:"8px 12px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:"#f0e8d0",fontSize:11,outline:"none",marginBottom:8,boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
            {["All","Basic","Rare","Epic","Legendary"].map(r=><Pill key={r} color={RARITY[r]?.color||"#22c55e"} active={filter.rarity===r} onClick={()=>setFilter(f=>({...f,rarity:r}))}>{r}</Pill>)}
            <div style={{marginLeft:"auto",display:"flex",gap:3}}>
              {[{v:"price",l:"↑"},{v:"priceDesc",l:"↓"},{v:"rarity",l:"Rar"}].map(s=><Pill key={s.v} color="#6b7280" active={filter.sortBy===s.v} onClick={()=>setFilter(f=>({...f,sortBy:s.v}))}>{s.l}</Pill>)}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {filteredListings.map(l=>{
              const owned=ownedIds.includes(l.card.id);
              const watched=watchlist.includes(l.card.id);
              const hist=priceHistories[l.card.id];
              return (
                <div key={l.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                    <CardArt card={l.card} size={52} realImg={realImages[l.card.id]} ctx="mktbrowse"/>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3,flexWrap:"wrap"}}>
                        <span style={{fontSize:11,fontWeight:700,color:"#f0e8d0"}}>{l.card.name}</span>
                        <Badge label={l.rarity} color={RARITY[l.rarity].color}/>
                        {owned&&<Badge label="OWNED" color="#22c55e"/>}
                      </div>
                      <div style={{display:"flex",gap:8,fontSize:9,color:"#4b5563"}}>
                        <span>📊{Math.round(l.card.score*RARITY[l.card.rarity].mult)}</span>
                        <span>{l.card.winRate}%W</span>
                        <span>{l.seller}</span>
                      </div>
                    </div>
                    <div style={{textAlign:"right",minWidth:60}}>
                      <div style={{fontSize:16,fontWeight:800,color:"#22c55e"}}>{l.price}</div>
                      <div style={{fontSize:8,color:"#374151",marginBottom:4}}>RON</div>
                      <div style={{display:"flex",gap:4,justifyContent:"flex-end"}}>
                        <button onClick={()=>setWatchlist(p=>p.includes(l.card.id)?p.filter(x=>x!==l.card.id):[...p,l.card.id])} style={{padding:"4px 7px",background:watched?"rgba(245,158,11,0.15)":"rgba(255,255,255,0.04)",border:`1px solid ${watched?"rgba(245,158,11,0.4)":"rgba(255,255,255,0.08)"}`,borderRadius:5,color:watched?"#f59e0b":"#4b5563",fontSize:10,cursor:"pointer"}}>{watched?"👁️":"👁"}</button>
                        <button onClick={()=>openMarketplaceCard(l.card.name)} style={{padding:"4px 7px",background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.25)",borderRadius:5,color:"#3b82f6",fontSize:9,cursor:"pointer"}}>↗</button>
                        <button onClick={()=>setBuyConfirm(l as any)} disabled={owned} style={{padding:"4px 10px",background:owned?"rgba(255,255,255,0.02)":"rgba(34,197,94,0.12)",border:`1px solid ${owned?"rgba(255,255,255,0.06)":"rgba(34,197,94,0.3)"}`,borderRadius:5,color:owned?"#374151":"#22c55e",fontSize:9,fontWeight:700,cursor:owned?"not-allowed":"pointer"}}>{owned?"OWNED":"BUY"}</button>
                      </div>
                    </div>
                  </div>
                  {hist&&<div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:8,color:"#374151"}}>14d</span><Sparkline data={hist} color={RARITY[l.rarity].color}/></div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {mtab==="sell"&&(
        <div>
          {!wallet.address?<div style={{textAlign:"center",padding:24,color:"#374151",fontSize:12}}>Connect wallet to list cards.</div>:(
            <>
              <div style={{fontSize:9,letterSpacing:3,color:"#374151",marginBottom:8}}>YOUR COLLECTION</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:14,maxHeight:280,overflowY:"auto"}}>
                {ownedIds.map(id=>{const c=ALL_CHAMPIONS.find(x=>x.id===id);if(!c)return null;const isSel=sellCard===id;return(
                  <div key={id} onClick={()=>setSellCard(isSel?null:id)} style={{background:isSel?"rgba(34,197,94,0.1)":"rgba(255,255,255,0.03)",border:`1.5px solid ${isSel?"#22c55e":"rgba(255,255,255,0.07)"}`,borderRadius:10,padding:10,cursor:"pointer"}}>
                    <div style={{display:"flex",justifyContent:"center",marginBottom:5}}><CardArt card={c} size={52} realImg={realImages[c.id]} ctx="mktsell"/></div>
                    <div style={{fontSize:9,fontWeight:700,color:"#f0e8d0",textAlign:"center",marginBottom:3,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{c.name}</div>
                    <div style={{display:"flex",justifyContent:"center",marginBottom:3}}><Badge label={c.rarity} color={RARITY[c.rarity].color}/></div>
                    <div style={{fontSize:9,color:"#22c55e",textAlign:"center"}}>Floor: {c.floorPrice} RON</div>
                  </div>
                );})}
              </div>
              {sellCard&&(()=>{const c=ALL_CHAMPIONS.find(x=>x.id===sellCard);return(
                <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:14}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#f0e8d0",marginBottom:8}}>List: {c?.name}</div>
                  <input type="number" step="0.01" min="0.01" value={priceInput} onChange={e=>setPriceInput(e.target.value)} placeholder={`Floor: ${c?.floorPrice} RON`} style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#f0e8d0",fontSize:13,outline:"none",marginBottom:10,boxSizing:"border-box"}}/>
                  <button onClick={()=>listCard(sellCard,priceInput)} style={{width:"100%",padding:11,background:"linear-gradient(135deg,#065f46,#059669)",border:"1px solid #10b981",borderRadius:8,color:"#d1fae5",fontSize:12,fontWeight:700,cursor:"pointer"}}>📋 LIST FOR SALE</button>
                </div>
              );})()}
              {myListings.length>0&&(
                <div style={{marginTop:14}}>
                  <div style={{fontSize:9,letterSpacing:3,color:"#374151",marginBottom:8}}>YOUR LISTINGS</div>
                  {myListings.map(l=>{const c=ALL_CHAMPIONS.find(x=>x.id===l.cardId);return(
                    <div key={l.id} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:10,marginBottom:8}}>
                      <CardArt card={c!} size={40} realImg={realImages[c!.id]} ctx="mktmylst"/>
                      <div style={{flex:1}}><div style={{fontSize:10,fontWeight:700,color:"#f0e8d0"}}>{c?.name}</div><div style={{fontSize:9,color:"#4b5563"}}>Just listed</div></div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:13,fontWeight:800,color:"#22c55e"}}>{l.price} RON</div>
                        <button onClick={()=>{setListings(p=>p.filter(x=>x.id!==l.id));setMyListings(p=>p.filter(x=>x.id!==l.id));showNotif("Listing cancelled","#f59e0b");}} style={{fontSize:8,padding:"2px 7px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:4,color:"#ef4444",cursor:"pointer",marginTop:3}}>Cancel</button>
                      </div>
                    </div>
                  );})}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {mtab==="watchlist"&&(
        <div>
          <div style={{fontSize:9,letterSpacing:3,color:"#374151",marginBottom:12}}>WATCHLIST ({watchlist.length})</div>
          {watchlist.length===0 ? (
            <div style={{textAlign:"center",padding:32,color:"#374151",fontSize:12}}>No cards watched.<br/>Tap 👁 on any listing to track it.</div>
          ) : (
            <div>
              {watchlist.map(cardId=>{
                const c=ALL_CHAMPIONS.find(x=>x.id===cardId); if(!c)return null;
                const hist=priceHistories[cardId];
                const cheap=listings.filter(l=>l.cardId===cardId).sort((a,b)=>a.price-b.price)[0];
                return (
                  <div key={cardId} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:12,marginBottom:8}}>
                    <CardArt card={c} size={48} realImg={realImages[c.id]} ctx="mktwatch"/>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:4}}>
                        <span style={{fontSize:11,fontWeight:700,color:"#f0e8d0"}}>{c.name}</span>
                        <Badge label={c.rarity} color={RARITY[c.rarity].color}/>
                      </div>
                      {hist&&<Sparkline data={hist} color={RARITY[c.rarity].color}/>}
                    </div>
                    <div style={{textAlign:"right"}}>
                      {cheap ? <div style={{fontSize:14,fontWeight:800,color:"#22c55e",marginBottom:4}}>{cheap.price} RON</div> : <div style={{fontSize:10,color:"#374151",marginBottom:4}}>No listings</div>}
                      <button onClick={()=>setWatchlist(p=>p.filter(x=>x!==cardId))} style={{fontSize:8,padding:"2px 7px",background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:4,color:"#f59e0b",cursor:"pointer"}}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {mtab==="roi"&&(
        <div>
          {/* ROI Calculator */}
          <div style={{background:"rgba(196,148,0,0.05)",border:"1px solid rgba(196,148,0,0.15)",borderRadius:12,padding:14,marginBottom:14}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#c49400",marginBottom:12}}>ROI CALCULATOR</div>
            <div style={{marginBottom:8}}>
              <div style={{fontSize:9,color:"#374151",marginBottom:4}}>CARD (optional)</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                {ALL_CHAMPIONS.slice(0,8).map(c=>(
                  <button key={c.id} onClick={()=>{setRoiCardId(c.id);setRoiBuyPrice(c.floorPrice.toString());}} style={{padding:"3px 8px",background:roiCardId===c.id?"rgba(196,148,0,0.2)":"rgba(255,255,255,0.03)",border:`1px solid ${roiCardId===c.id?"#c49400":"rgba(255,255,255,0.08)"}`,borderRadius:6,color:roiCardId===c.id?"#c49400":"#6b7280",fontSize:8,cursor:"pointer"}}>
                    {c.icon} {c.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
              <div>
                <div style={{fontSize:8,color:"#374151",marginBottom:3}}>BUY PRICE (RON)</div>
                <input type="number" value={roiBuyPrice} onChange={e=>setRoiBuyPrice(e.target.value)} placeholder="0.00" style={{width:"100%",padding:"8px 10px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,color:"#f0e8d0",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div>
                <div style={{fontSize:8,color:"#374151",marginBottom:3}}>SELL PRICE (RON)</div>
                <input type="number" value={roiSellPrice} onChange={e=>setRoiSellPrice(e.target.value)} placeholder="0.00" style={{width:"100%",padding:"8px 10px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,color:"#f0e8d0",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div>
                <div style={{fontSize:8,color:"#374151",marginBottom:3}}>HOLD (days)</div>
                <input type="number" value={roiDays} onChange={e=>setRoiDays(e.target.value)} placeholder="30" style={{width:"100%",padding:"8px 10px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,color:"#f0e8d0",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
              </div>
            </div>
            {roiBuyPrice&&roiSellPrice&&(()=>{
              const r = calcROI(+roiBuyPrice, +roiSellPrice, +roiDays||30);
              const positive = r.netProfit >= 0;
              return (
                <div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:12}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                    <div style={{textAlign:"center",background:"rgba(255,255,255,0.04)",borderRadius:8,padding:10}}>
                      <div style={{fontSize:18,fontWeight:900,color:positive?"#22c55e":"#ef4444"}}>{r.roi.toFixed(1)}%</div>
                      <div style={{fontSize:8,color:"#374151"}}>TOTAL ROI</div>
                    </div>
                    <div style={{textAlign:"center",background:"rgba(255,255,255,0.04)",borderRadius:8,padding:10}}>
                      <div style={{fontSize:18,fontWeight:900,color:positive?"#22c55e":"#ef4444"}}>{r.dailyROI.toFixed(2)}%</div>
                      <div style={{fontSize:8,color:"#374151"}}>DAILY ROI</div>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    {[
                      {l:"Gross profit",v:`${r.grossProfit>=0?"+":""}${r.grossProfit.toFixed(3)} RON`,c:r.grossProfit>=0?"#f0e8d0":"#ef4444"},
                      {l:"Platform fee (2.5%)",v:`-${r.fee.toFixed(3)} RON`,c:"#f59e0b"},
                      {l:"Net profit",v:`${r.netProfit>=0?"+":""}${r.netProfit.toFixed(3)} RON`,c:positive?"#22c55e":"#ef4444"},
                    ].map(x=>(
                      <div key={x.l} style={{display:"flex",justifyContent:"space-between",fontSize:10}}>
                        <span style={{color:"#6b7280"}}>{x.l}</span>
                        <span style={{fontWeight:700,color:x.c}}>{x.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Price Alerts */}
          <div style={{background:"rgba(245,158,11,0.05)",border:"1px solid rgba(245,158,11,0.15)",borderRadius:12,padding:14}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#f59e0b",marginBottom:12}}>PRICE ALERTS</div>

            {/* Add alert form */}
            <div style={{marginBottom:12}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
                <select value={alertCardId||""} onChange={e=>setAlertCardId(+e.target.value||null)} style={{padding:"7px 10px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,color:alertCardId?"#f0e8d0":"#4b5563",fontSize:10,outline:"none"}}>
                  <option value="">Select card…</option>
                  {ALL_CHAMPIONS.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
                <select value={alertType} onChange={e=>setAlertType(e.target.value as any)} style={{padding:"7px 10px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,color:"#f0e8d0",fontSize:10,outline:"none"}}>
                  <option value="below">Drops below</option>
                  <option value="above">Rises above</option>
                </select>
              </div>
              <div style={{display:"flex",gap:6}}>
                <input type="number" value={alertTarget} onChange={e=>setAlertTarget(e.target.value)} placeholder="Target price (RON)" style={{flex:1,padding:"8px 10px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,color:"#f0e8d0",fontSize:11,outline:"none"}}/>
                <button onClick={()=>{
                  if(!alertCardId||!alertTarget)return;
                  const newA:PriceAlert={id:`a${Date.now()}`,cardId:alertCardId,targetPrice:+alertTarget,type:alertType,triggered:false,createdAt:new Date().toLocaleTimeString()};
                  setPriceAlerts(p=>[...p,newA]);setAlertCardId(null);setAlertTarget("");
                }} style={{padding:"8px 14px",background:"rgba(245,158,11,0.15)",border:"1px solid rgba(245,158,11,0.4)",borderRadius:7,color:"#f59e0b",fontSize:10,fontWeight:700,cursor:"pointer"}}>+ ADD</button>
              </div>
            </div>

            {priceAlerts.length===0?(
              <div style={{textAlign:"center",padding:16,color:"#374151",fontSize:11}}>No alerts set.<br/>Add one above to track price moves.</div>
            ):(
              priceAlerts.map(alert=>{
                const card=ALL_CHAMPIONS.find(c=>c.id===alert.cardId);
                return(
                  <div key={alert.id} style={{display:"flex",alignItems:"center",gap:8,background:alert.triggered?"rgba(34,197,94,0.08)":"rgba(255,255,255,0.03)",border:`1px solid ${alert.triggered?"rgba(34,197,94,0.3)":"rgba(255,255,255,0.07)"}`,borderRadius:9,padding:10,marginBottom:6}}>
                    <span style={{fontSize:18}}>{card?.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:10,fontWeight:700,color:alert.triggered?"#22c55e":"#f0e8d0"}}>{card?.name}</div>
                      <div style={{fontSize:8,color:"#6b7280"}}>{alert.type==="below"?"↓ Below":"↑ Above"} {alert.targetPrice} RON · {alert.createdAt}</div>
                    </div>
                    <div style={{display:"flex",gap:4,alignItems:"center"}}>
                      {alert.triggered&&<Badge label="TRIGGERED" color="#22c55e"/>}
                      <button onClick={()=>setPriceAlerts(p=>p.filter(a=>a.id!==alert.id))} style={{padding:"3px 8px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:5,color:"#ef4444",fontSize:9,cursor:"pointer"}}>✕</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {mtab==="portfolio"&&(
        <div>
          <div style={{background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.15)",borderRadius:14,padding:16,marginBottom:14}}>
            <div style={{fontSize:9,letterSpacing:4,color:"#22c55e",marginBottom:6}}>PORTFOLIO VALUE</div>
            <div style={{fontSize:28,fontWeight:900,color:"#22c55e"}}>{portfolioValue.toFixed(2)} RON</div>
            <div style={{fontSize:10,color:"#4b5563"}}>{ownedIds.length} cards</div>
          </div>
          {ownedIds.map(id=>{const c=ALL_CHAMPIONS.find(x=>x.id===id);if(!c)return null;const hist=priceHistories[id];return(
            <div key={id} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:10,marginBottom:6}}>
              <CardArt card={c} size={44} realImg={realImages[c.id]} ctx="mktport"/>
              <div style={{flex:1}}><div style={{fontSize:10,fontWeight:700,color:"#f0e8d0"}}>{c.name}</div><Badge label={c.rarity} color={RARITY[c.rarity].color}/></div>
              {hist&&<Sparkline data={hist} color={RARITY[c.rarity].color} w={60} h={20}/>}
              <div style={{textAlign:"right",minWidth:50}}><div style={{fontSize:12,fontWeight:700,color:"#22c55e"}}>{c.floorPrice}</div><div style={{fontSize:7,color:"#374151"}}>RON</div></div>
            </div>
          );})}
        </div>
      )}

      {buyConfirm&&(
        <div onClick={()=>setBuyConfirm(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#0d1117",border:"1px solid rgba(34,197,94,0.3)",borderRadius:16,padding:22,width:"100%",maxWidth:340}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#22c55e",marginBottom:12}}>CONFIRM PURCHASE</div>
            <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:14}}>
              <CardArt card={buyConfirm.card} size={64} realImg={realImages[buyConfirm.card.id]} ctx="mktconfirm"/>
              <div><div style={{fontSize:14,fontWeight:800,color:"#f0e8d0",marginBottom:4}}>{buyConfirm.card?.name}</div><Badge label={buyConfirm.rarity} color={RARITY[buyConfirm.rarity].color}/></div>
            </div>
            {/* Fee breakdown */}
            <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,padding:10,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:10,color:"#6b7280"}}>Card price</span>
                <span style={{fontSize:10,color:"#f0e8d0"}}>{buyConfirm.price} RON ({Math.round(buyConfirm.price*1000)} 💎)</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:10,color:"#f59e0b"}}>Platform fee (2.5%)</span>
                <span style={{fontSize:10,color:"#f59e0b"}}>+{(buyConfirm.price*MARKET_FEE).toFixed(3)} RON ({Math.round(buyConfirm.price*MARKET_FEE*1000)} 💎)</span>
              </div>
              <div style={{borderTop:"1px solid rgba(255,255,255,0.07)",paddingTop:5,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:11,fontWeight:700,color:"#22c55e"}}>Total</span>
                <span style={{fontSize:11,fontWeight:700,color:"#22c55e"}}>{(buyConfirm.price*(1+MARKET_FEE)).toFixed(3)} RON ({Math.round(buyConfirm.price*(1+MARKET_FEE)*1000)} 💎)</span>
              </div>
            </div>
            <div style={{fontSize:10,color:"#4b5563",marginBottom:14}}>Balance after: {(gems-Math.round(buyConfirm.price*(1+MARKET_FEE)*1000)).toLocaleString()} 💎</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setBuyConfirm(null)} style={{flex:1,padding:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:"#6b7280",fontSize:11,cursor:"pointer"}}>Cancel</button>
              <button onClick={()=>confirmBuy(buyConfirm)} style={{flex:2,padding:10,background:"linear-gradient(135deg,#065f46,#059669)",border:"1px solid #10b981",borderRadius:8,color:"#d1fae5",fontSize:12,fontWeight:700,cursor:"pointer"}}>✓ CONFIRM</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCREEN: ARENA
═══════════════════════════════════════════════════════════════ */
function ArenaScreen({ realImages }: { realImages: Record<number,string> }) {
  const [teamA,setTeamA]=useState<Champion[]>([]);
  const [teamB,setTeamB]=useState<Champion[]>([]);
  const [pickSide,setPickSide]=useState<"A"|"B">("A");
  const [battleLog,setBattleLog]=useState<string[]>([]);
  const [winner,setWinner]=useState<string|null>(null);

  const inTeam=(c:Champion)=>teamA.find(x=>x.id===c.id)?"A":teamB.find(x=>x.id===c.id)?"B":null;
  const togglePick=(c:Champion)=>{const setter=pickSide==="A"?setTeamA:setTeamB;const team=pickSide==="A"?teamA:teamB;setter(p=>p.find(x=>x.id===c.id)?p.filter(x=>x.id!==c.id):p.length>=3?p:[...p,c]);};

  const simulate=()=>{
    if(!teamA.length||!teamB.length)return;
    const lines:string[]=[]; let hpA=teamA.reduce((s,c)=>s+c.score*RARITY[c.rarity].mult,0),hpB=teamB.reduce((s,c)=>s+c.score*RARITY[c.rarity].mult,0);
    const atkA=hpA*0.18+teamA.reduce((s,c)=>s+c.elims,0)*12;
    const atkB=hpB*0.18+teamB.reduce((s,c)=>s+c.elims,0)*12;
    lines.push(`⚔️ TEAM A (${Math.round(hpA)}pts) vs TEAM B (${Math.round(hpB)}pts)`);
    lines.push(`─────────────────`);
    for(let r=1;r<=8&&hpA>0&&hpB>0;r++){const dB=+(atkA*(0.8+Math.random()*0.4)).toFixed(0),dA=+(atkB*(0.8+Math.random()*0.4)).toFixed(0);hpA=Math.max(0,hpA-dA);hpB=Math.max(0,hpB-dB);lines.push(`R${r}: A→${dB}dmg  B→${dA}dmg  (A:${hpA.toFixed(0)} B:${hpB.toFixed(0)})`);}
    const w=hpA>hpB?"A":"B";lines.push(`─────────────────`);lines.push(`🏆 TEAM ${w} WINS`);
    setBattleLog(lines);setWinner(w);
  };

  return (
    <div style={{padding:"16px 0"}}>
      <div style={{fontSize:9,color:"#4b5563",marginBottom:14}}>Test your lineups before committing to a real contest.</div>
      {winner&&(
        <div style={{textAlign:"center",padding:16,background:winner==="A"?"rgba(239,68,68,0.1)":"rgba(59,130,246,0.1)",border:`1px solid ${winner==="A"?"rgba(239,68,68,0.3)":"rgba(59,130,246,0.3)"}`,borderRadius:12,marginBottom:14}}>
          <div style={{fontSize:26,marginBottom:4}}>🏆</div>
          <div style={{fontSize:18,fontWeight:900,color:winner==="A"?"#ef4444":"#3b82f6"}}>TEAM {winner} WINS</div>
          <button onClick={()=>{setTeamA([]);setTeamB([]);setBattleLog([]);setWinner(null);setPickSide("A");}} style={{marginTop:8,padding:"6px 14px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#6b7280",fontSize:10,cursor:"pointer"}}>↺ Reset</button>
        </div>
      )}
      {battleLog.length>0&&(
        <div style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:12,marginBottom:14}}>
          {battleLog.map((l,i)=><div key={i} style={{fontSize:9,color:l.includes("WINS")||l.includes("⚔️")?"#c49400":l.startsWith("─")?"#1f2937":"#4b5563",padding:"2px 0",fontFamily:"monospace"}}>{l}</div>)}
        </div>
      )}
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        {(["A","B"] as const).map(side=>{const color=side==="A"?"#ef4444":"#3b82f6";const team=side==="A"?teamA:teamB;return(
          <button key={side} onClick={()=>setPickSide(side)} style={{flex:1,padding:9,background:pickSide===side?`${color}15`:"rgba(255,255,255,0.03)",border:`1px solid ${pickSide===side?color:"rgba(255,255,255,0.07)"}`,borderRadius:8,color:pickSide===side?color:"#4b5563",fontSize:11,fontWeight:700,cursor:"pointer"}}>
            {side==="A"?"🔴":"🔵"} TEAM {side} ({team.length}/3)
          </button>
        );})}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,maxHeight:400,overflowY:"auto",marginBottom:12}}>
        {ALL_CHAMPIONS.map(c=>{const side=inTeam(c);return(
          <div key={c.id} onClick={()=>!side&&togglePick(c)} style={{background:side==="A"?"rgba(239,68,68,0.1)":side==="B"?"rgba(59,130,246,0.1)":"rgba(255,255,255,0.03)",border:`1px solid ${side==="A"?"#ef4444":side==="B"?"#3b82f6":"rgba(255,255,255,0.07)"}`,borderRadius:9,padding:9,cursor:side?"default":"pointer"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:5,position:"relative"}}>
              <CardArt card={c} size={56} realImg={realImages[c.id]} ctx="arena"/>
              {side&&<div style={{position:"absolute",top:-2,right:-2,width:16,height:16,borderRadius:"50%",background:side==="A"?"#ef4444":"#3b82f6",border:"2px solid #08070b",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8}}>{side==="A"?"A":"B"}</div>}
            </div>
            <div style={{fontSize:8,fontWeight:700,color:"#f0e8d0",textAlign:"center",marginBottom:3,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{c.name}</div>
            <div style={{display:"flex",justifyContent:"center",marginBottom:3}}><Badge label={c.rarity} color={RARITY[c.rarity].color}/></div>
            <div style={{display:"flex",gap:6,fontSize:9,justifyContent:"center"}}><span style={{color:"#c49400"}}>{Math.round(c.score*RARITY[c.rarity].mult)}</span><span style={{color:"#22c55e"}}>{c.winRate}%</span></div>
          </div>
        );})}
      </div>
      <button onClick={simulate} disabled={!teamA.length||!teamB.length} style={{width:"100%",padding:12,background:"linear-gradient(135deg,#7f1d1d,#b91c1c)",border:"1px solid #ef4444",borderRadius:8,color:"#fecaca",fontSize:13,fontWeight:700,cursor:"pointer",opacity:!teamA.length||!teamB.length?0.4:1,letterSpacing:1}}>
        ⚔️ SIMULATE BATTLE
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WALLET SCREEN — Account, Balances, Buy Gems, History
═══════════════════════════════════════════════════════════════ */
interface TxRecord {
  id: string; type: string; cardId?: number; price: number;
  fee?: number; when: string; ts: string; gemAmount?: number;
}

function WalletScreen({ wallet, gems, setGems, ownedIds, txLog, setTxLog }:
  { wallet: ReturnType<typeof useWallet>; gems: number; setGems: React.Dispatch<React.SetStateAction<number>>; ownedIds: number[]; txLog: TxRecord[]; setTxLog: React.Dispatch<React.SetStateAction<TxRecord[]>> }) {

  const [wtab,setWtab]=useState("account");
  const [localWallet,setLocalWallet]=useState<{address:string;privateKey:string}|null>(null);
  const [generating,setGenerating]=useState(false);
  const [showKey,setShowKey]=useState(false);
  const [copied,setCopied]=useState(false);
  const [buyNotif,setBuyNotif]=useState<string|null>(null);

  const WTABS=[
    {id:"account",icon:"👤",label:"Account"},
    {id:"balances",icon:"💰",label:"Balances"},
    {id:"buy",icon:"💎",label:"Buy Gems"},
    {id:"history",icon:"📋",label:"History"},
  ];

  const portfolioVal=ownedIds.reduce((s,id)=>{const c=ALL_CHAMPIONS.find(x=>x.id===id);return s+(c?c.floorPrice:0);},0);

  const generateLocalWallet=async()=>{
    setGenerating(true);
    try {
      const { ethers } = await import("ethers");
      const w = ethers.Wallet.createRandom();
      setLocalWallet({ address: w.address, privateKey: w.privateKey });
    } catch(e) {
      // fallback: generate pseudo-random keypair
      const bytes = new Uint8Array(32);
      crypto.getRandomValues(bytes);
      const hex = Array.from(bytes).map(b=>b.toString(16).padStart(2,"0")).join("");
      const addr = "0x" + hex.slice(0,40);
      setLocalWallet({ address: addr, privateKey: "0x" + hex });
    }
    setGenerating(false);
  };

  const copyAddr=(addr:string)=>{
    navigator.clipboard?.writeText(addr).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false),1800);
  };

  const buyGems=(pack:typeof GEM_PACKS[0])=>{
    setGems(p=>p+pack.gems);
    const tx:TxRecord={id:`gem_${Date.now()}`,type:"gems",price:pack.ron,fee:0,when:"just now",ts:new Date().toLocaleTimeString(),gemAmount:pack.gems};
    setTxLog(p=>[tx,...p]);
    setBuyNotif(`+${pack.gems.toLocaleString()} 💎 added!`);
    setTimeout(()=>setBuyNotif(null),2500);
  };

  const activeAddr = wallet.address || localWallet?.address;

  return (
    <div style={{padding:"16px 0"}}>
      {buyNotif&&<div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",zIndex:200,background:"#0d1117",border:"1px solid #c49400",borderRadius:10,padding:"9px 18px",fontSize:12,color:"#c49400",fontWeight:700,boxShadow:"0 4px 24px rgba(0,0,0,0.5)",whiteSpace:"nowrap"}}>{buyNotif}</div>}

      {/* Sub-tabs */}
      <div style={{display:"flex",marginBottom:14,background:"rgba(255,255,255,0.02)",borderRadius:10,padding:2,gap:2}}>
        {WTABS.map(t=>(
          <button key={t.id} onClick={()=>setWtab(t.id)} style={{flex:1,padding:"6px 2px",background:wtab===t.id?"rgba(196,148,0,0.15)":"none",border:"none",borderRadius:8,color:wtab===t.id?"#c49400":"#374151",cursor:"pointer"}}>
            <div style={{fontSize:13}}>{t.icon}</div>
            <div style={{fontSize:7,marginTop:1,fontWeight:wtab===t.id?700:400}}>{t.label}</div>
          </button>
        ))}
      </div>

      {/* ACCOUNT */}
      {wtab==="account"&&(
        <div>
          {/* Import / Connected section */}
          <div style={{background:"rgba(196,148,0,0.05)",border:"1px solid rgba(196,148,0,0.15)",borderRadius:14,padding:16,marginBottom:14}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#c49400",marginBottom:10}}>RONIN WALLET</div>
            {wallet.mode==="disconnected"?(
              <>
                {wallet.error&&<div style={{fontSize:10,color:"#f87171",background:"rgba(239,68,68,0.08)",padding:"8px 10px",borderRadius:6,marginBottom:10}}>{wallet.error}</div>}
                <div style={{display:"flex",gap:4,marginBottom:10}}>
                  <button onClick={()=>wallet.setImportMethod("pk")} style={{flex:1,padding:"7px 0",background:wallet.importMethod==="pk"?"rgba(196,148,0,0.18)":"rgba(255,255,255,0.03)",border:`1px solid ${wallet.importMethod==="pk"?"#c49400":"rgba(255,255,255,0.08)"}`,borderRadius:7,color:wallet.importMethod==="pk"?"#c49400":"#4b5563",fontSize:10,fontWeight:700,cursor:"pointer"}}>🔑 Private Key</button>
                  <button onClick={()=>wallet.setImportMethod("seed")} style={{flex:1,padding:"7px 0",background:wallet.importMethod==="seed"?"rgba(196,148,0,0.18)":"rgba(255,255,255,0.03)",border:`1px solid ${wallet.importMethod==="seed"?"#c49400":"rgba(255,255,255,0.08)"}`,borderRadius:7,color:wallet.importMethod==="seed"?"#c49400":"#4b5563",fontSize:10,fontWeight:700,cursor:"pointer"}}>📝 Seed Phrase</button>
                </div>
                <textarea
                  value={wallet.importInput}
                  onChange={e=>wallet.setImportInput(e.target.value)}
                  placeholder={wallet.importMethod==="pk"?"Enter private key (0x…)":"Enter 12 or 24 word seed phrase…"}
                  rows={wallet.importMethod==="seed"?3:2}
                  style={{width:"100%",padding:"10px 12px",background:"rgba(0,0,0,0.4)",border:"1px solid rgba(196,148,0,0.2)",borderRadius:8,color:"#f0e8d0",fontSize:11,outline:"none",resize:"none",marginBottom:8,boxSizing:"border-box",fontFamily:"monospace"}}
                />
                <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:7,padding:"7px 10px",marginBottom:10,fontSize:8,color:"#f87171",lineHeight:1.5}}>
                  ⚠ Your key never leaves this device. Used only to derive your Ronin address locally.
                </div>
                <button onClick={wallet.importWallet} disabled={wallet.importing||!wallet.importInput.trim()} style={{width:"100%",padding:12,background:"linear-gradient(135deg,#92400e,#b45309)",border:"1px solid #c49400",borderRadius:9,color:"#fde68a",fontSize:12,fontWeight:700,cursor:"pointer",marginBottom:8}}>
                  {wallet.importing?"Importing…":"🔑 Import Wallet"}
                </button>
                <button onClick={wallet.connectDemo} style={{width:"100%",padding:9,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,color:"#6b7280",fontSize:11,cursor:"pointer"}}>▷ Demo Mode</button>
              </>
            ):(
              <div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#c49400,#f59e0b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🔑</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#f0e8d0",fontFamily:"monospace"}}>{shortAddr(wallet.address!)}</div>
                    <div style={{fontSize:9,color:wallet.mode==="live"?"#22c55e":"#f59e0b"}}>● {wallet.mode==="live"?"Imported Wallet":"Demo Mode"}</div>
                  </div>
                  <button onClick={()=>copyAddr(wallet.address!)} style={{padding:"4px 10px",background:"rgba(196,148,0,0.1)",border:"1px solid rgba(196,148,0,0.3)",borderRadius:6,color:"#c49400",fontSize:9,cursor:"pointer"}}>{copied?"✓":"Copy"}</button>
                </div>
                <button onClick={wallet.disconnect} style={{width:"100%",padding:8,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:7,color:"#ef4444",fontSize:10,cursor:"pointer"}}>Disconnect</button>
              </div>
            )}
          </div>

          {/* Generate new wallet */}
          <div style={{background:"rgba(34,197,94,0.05)",border:"1px solid rgba(34,197,94,0.15)",borderRadius:14,padding:16}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#22c55e",marginBottom:10}}>GENERATE NEW WALLET</div>
            {!localWallet?(
              <>
                <p style={{fontSize:11,color:"#6b7280",marginBottom:12,lineHeight:1.6}}>No wallet yet? Generate one — save the private key shown below.</p>
                <button onClick={generateLocalWallet} disabled={generating} style={{width:"100%",padding:12,background:"rgba(34,197,94,0.15)",border:"1px solid rgba(34,197,94,0.4)",borderRadius:9,color:"#22c55e",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  {generating?"Generating…":"⚡ Generate New Wallet"}
                </button>
              </>
            ):(
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <div style={{flex:1,fontFamily:"monospace",fontSize:10,color:"#f0e8d0"}}>{shortAddr(localWallet.address)}</div>
                  <button onClick={()=>copyAddr(localWallet.address)} style={{padding:"3px 8px",background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:5,color:"#22c55e",fontSize:8,cursor:"pointer"}}>{copied?"✓":"Copy"}</button>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                  <span style={{fontSize:9,color:"#374151"}}>PRIVATE KEY</span>
                  <button onClick={()=>setShowKey(p=>!p)} style={{fontSize:8,padding:"2px 7px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:4,color:"#ef4444",cursor:"pointer"}}>{showKey?"Hide":"Reveal"}</button>
                </div>
                {showKey?(
                  <div style={{background:"rgba(0,0,0,0.5)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:6,padding:8,fontFamily:"monospace",fontSize:8,color:"#f87171",wordBreak:"break-all",lineHeight:1.6,marginBottom:8}}>{localWallet.privateKey}</div>
                ):(
                  <div style={{background:"rgba(0,0,0,0.3)",borderRadius:6,padding:8,fontSize:9,color:"#374151",marginBottom:8}}>••••••••••••••••••••••••••••••••</div>
                )}
                <div style={{fontSize:8,color:"#f59e0b",background:"rgba(245,158,11,0.08)",padding:7,borderRadius:6}}>⚠ Screenshot this key now. It cannot be recovered later.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BALANCES */}
      {wtab==="balances"&&(
        <div>
          <div style={{background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.15)",borderRadius:14,padding:16,marginBottom:14}}>
            <div style={{fontSize:9,letterSpacing:4,color:"#22c55e",marginBottom:14}}>BALANCES</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:12,textAlign:"center"}}>
                <div style={{fontSize:9,color:"#374151",marginBottom:4}}>GEMS 💎</div>
                <div style={{fontSize:22,fontWeight:900,color:"#c49400"}}>{gems.toLocaleString()}</div>
                <div style={{fontSize:8,color:"#4b5563"}}>≈ {(gems/1000).toFixed(3)} RON</div>
              </div>
              <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:12,textAlign:"center"}}>
                <div style={{fontSize:9,color:"#374151",marginBottom:4}}>PORTFOLIO</div>
                <div style={{fontSize:22,fontWeight:900,color:"#22c55e"}}>{portfolioVal.toFixed(2)}</div>
                <div style={{fontSize:8,color:"#4b5563"}}>RON · {ownedIds.length} cards</div>
              </div>
            </div>
            <div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:12}}>
              <div style={{fontSize:9,color:"#374151",marginBottom:8,letterSpacing:2}}>TOTAL NET WORTH</div>
              <div style={{fontSize:26,fontWeight:900,color:"#f0e8d0"}}>{(portfolioVal+(gems/1000)).toFixed(3)} RON</div>
              {activeAddr&&<div style={{fontSize:9,color:"#4b5563",marginTop:4,fontFamily:"monospace"}}>{shortAddr(activeAddr)}</div>}
            </div>
          </div>

          {/* Holdings breakdown */}
          <div style={{fontSize:9,letterSpacing:3,color:"#374151",marginBottom:10}}>HOLDINGS ({ownedIds.length} cards)</div>
          {ownedIds.map(id=>{
            const c=ALL_CHAMPIONS.find(x=>x.id===id); if(!c)return null;
            return(
              <div key={id} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:9,padding:10,marginBottom:6}}>
                <span style={{fontSize:18}}>{c.icon}</span>
                <div style={{flex:1}}><div style={{fontSize:10,fontWeight:700,color:"#f0e8d0"}}>{c.name}</div><Badge label={c.rarity} color={RARITY[c.rarity].color}/></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:12,fontWeight:700,color:"#22c55e"}}>{c.floorPrice} RON</div></div>
              </div>
            );
          })}
        </div>
      )}

      {/* BUY GEMS */}
      {wtab==="buy"&&(
        <div>
          <div style={{fontSize:9,color:"#4b5563",marginBottom:14,lineHeight:1.6}}>
            Buy gem packs to use in the marketplace. 1000 💎 = 1 RON equivalent purchasing power.
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {GEM_PACKS.map(pack=>(
              <div key={pack.id} style={{background:`${pack.color}08`,border:`1.5px solid ${pack.color}30`,borderRadius:13,padding:16,display:"flex",alignItems:"center",gap:12}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <span style={{fontSize:22}}>💎</span>
                    <div>
                      <div style={{fontSize:14,fontWeight:800,color:pack.color}}>{pack.gems.toLocaleString()} Gems</div>
                      <div style={{fontSize:9,color:"#4b5563"}}>{pack.label}{pack.bonus?` · ${pack.bonus} bonus`:""}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <Badge label={`${pack.ron} RON`} color={pack.color}/>
                    {pack.bonus&&<Badge label={pack.bonus} color="#22c55e"/>}
                  </div>
                </div>
                <button onClick={()=>buyGems(pack)} style={{padding:"12px 16px",background:`${pack.color}20`,border:`1.5px solid ${pack.color}60`,borderRadius:9,color:pack.color,fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0}}>
                  BUY
                </button>
              </div>
            ))}
          </div>
          <div style={{marginTop:14,background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.15)",borderRadius:8,padding:10}}>
            <div style={{fontSize:9,color:"#3b82f6",fontWeight:700,marginBottom:4}}>ℹ DEMO MODE</div>
            <div style={{fontSize:9,color:"#4b5563",lineHeight:1.6}}>Gems are simulated for now. Real RON payments will be processed via WalletConnect in a future update.</div>
          </div>
        </div>
      )}

      {/* HISTORY */}
      {wtab==="history"&&(
        <div>
          <div style={{fontSize:9,letterSpacing:3,color:"#374151",marginBottom:10}}>TRANSACTION HISTORY ({txLog.length})</div>
          {txLog.length===0?(
            <div style={{textAlign:"center",padding:32,color:"#374151",fontSize:11}}>No transactions yet.<br/>Buy or list cards to see history here.</div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {txLog.map(tx=>{
                const card=tx.cardId?ALL_CHAMPIONS.find(c=>c.id===tx.cardId):null;
                const typeColor=tx.type==="buy"?"#22c55e":tx.type==="sell"?"#f59e0b":tx.type==="gems"?"#c49400":"#3b82f6";
                const typeIcon=tx.type==="buy"?"📥":tx.type==="sell"?"📤":tx.type==="gems"?"💎":"📋";
                return(
                  <div key={tx.id} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${typeColor}20`,borderRadius:10,padding:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:16}}>{typeIcon}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:10,fontWeight:700,color:"#f0e8d0"}}>
                          {tx.type==="gems"?`Bought ${tx.gemAmount?.toLocaleString()} 💎`:card?card.name:"Unknown Card"}
                        </div>
                        <div style={{fontSize:8,color:"#4b5563"}}>{tx.ts} · {tx.when}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:11,fontWeight:700,color:typeColor}}>{tx.type==="buy"?"-":"+"}${tx.price.toFixed(3)} RON</div>
                        {tx.fee&&tx.fee>0&&<div style={{fontSize:8,color:"#f59e0b"}}>fee: {tx.fee.toFixed(3)}</div>}
                      </div>
                    </div>
                    {card&&<div style={{marginTop:5,display:"flex",gap:4}}><Badge label={tx.type.toUpperCase()} color={typeColor}/><Badge label={card.rarity} color={RARITY[card.rarity].color}/></div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   SCREEN: WATCH — Live battles + history via in-app browser
═══════════════════════════════════════════════════════════════ */

// Opens URL in Capacitor in-app browser (feels native, stays logged in)
async function openInAppBrowser(url: string) {
  try {
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url, presentationStyle: "fullscreen", toolbarColor: "#070610" });
  } catch {
    window.open(url, "_blank");
  }
}

// Simulated battle result for demo mode
interface BattleResult {
  id: string; when: string; duration: string;
  teamA: { mokis: string[]; score: number; won: boolean };
  teamB: { mokis: string[]; score: number; won: boolean };
  winType: "Gacha"|"Combat"|"Wart";
  myMokis: string[];
}

const DEMO_BATTLES: BattleResult[] = [
  { id:"b1", when:"2 min ago",  duration:"4m 12s", teamA:{mokis:["🦝","🤖","🐻"],score:8,won:true},  teamB:{mokis:["🐈‍⬛","✨","🐼"],score:3,won:false}, winType:"Gacha",  myMokis:["🦝","🤖","🐻"] },
  { id:"b2", when:"18 min ago", duration:"5m 44s", teamA:{mokis:["🐈‍⬛","🦝","🐼"],score:2,won:false}, teamB:{mokis:["🤖","🐻","✨"],score:10,won:true}, winType:"Combat", myMokis:["🦝","🐼"] },
  { id:"b3", when:"34 min ago", duration:"6m 01s", teamA:{mokis:["🤖","🐻","✨"],score:7,won:true},  teamB:{mokis:["🦝","🐼","🐈‍⬛"],score:2,won:false}, winType:"Wart",   myMokis:["🤖","🐻","✨"] },
  { id:"b4", when:"1h ago",     duration:"3m 58s", teamA:{mokis:["🦝","✨","🐈‍⬛"],score:10,won:true}, teamB:{mokis:["🐻","🤖","🐼"],score:1,won:false}, winType:"Gacha",  myMokis:["🦝","✨"] },
  { id:"b5", when:"2h ago",     duration:"7m 22s", teamA:{mokis:["🐻","🐼","🦝"],score:5,won:false}, teamB:{mokis:["🤖","🐈‍⬛","✨"],score:10,won:true}, winType:"Combat", myMokis:["🐻","🐼","🦝"] },
  { id:"b6", when:"3h ago",     duration:"4m 47s", teamA:{mokis:["🤖","🦝","✨"],score:10,won:true}, teamB:{mokis:["🐻","🐼","🐈‍⬛"],score:4,won:false}, winType:"Gacha",  myMokis:["🤖","🦝","✨"] },
];

function WatchScreen({ walletAddress }: { walletAddress: string|null }) {
  const [wtab, setWtab] = useState<"live"|"history"|"leaderboard">("live");
  const [simRunning, setSimRunning] = useState(false);
  const [simLog, setSimLog] = useState<string[]>([]);
  const [simResult, setSimResult] = useState<{winner:string;type:string}|null>(null);
  const [ticker, setTicker] = useState(0);

  // Tick every second for "live" feel
  useEffect(()=>{
    const t = setInterval(()=>setTicker(p=>p+1), 1000);
    return ()=>clearInterval(t);
  },[]);

  const WIN_TYPE_COLOR: Record<string,string> = { Gacha:"#c49400", Combat:"#ef4444", Wart:"#3b82f6" };
  const WIN_TYPE_ICON: Record<string,string> = { Gacha:"🎾", Combat:"⚔️", Wart:"🐢" };

  // Run a simulated battle in real-time
  const runSim = async () => {
    setSimRunning(true);
    setSimLog([]);
    setSimResult(null);

    const myTeam = ["TANUKI PRIME 🦝","IRON MOKI 🤖","BRAWL BEAR 🐻"];
    const oppTeam = ["VOID CAT 🐈‍⬛","SPARK GOBLIN ✨","ROGUE PANDA 🐼"];
    const winTypes = ["Gacha","Combat","Wart"] as const;
    const winType = winTypes[Math.floor(Math.random()*3)];
    const myWin = Math.random() > 0.4;

    const events = [
      `🏟️ Match started — ${myTeam.join(" vs ")}`,
      `🎾 Gacha Ball spawned at center`,
      `⚡ ${myTeam[0]} dashes for the ball`,
      `💥 ${oppTeam[1]} transforms into Buff form!`,
      `🎾 ${myTeam[0]} secured Gacha Ball #1`,
      `⚔️ ${myTeam[1]} eliminates ${oppTeam[0]}!`,
      `🔄 ${oppTeam[0]} respawning...`,
      `🎾 ${myTeam[2]} scores Gacha Ball #2`,
      `🐢 Wart tug-of-war begins!`,
      `💪 ${myTeam[1]} entering Buff form`,
      `⚡ ${oppTeam[2]} grabs 3 balls in a row!`,
      `🎾 Score: Your team ${myWin?8:4} — Opponents ${myWin?4:8}`,
      `${myWin?"🏆 YOUR TEAM WINS":"💀 OPPONENTS WIN"} via ${winType}!`,
    ];

    for (let i=0; i<events.length; i++) {
      await new Promise(r=>setTimeout(r,600));
      setSimLog(p=>[...p, events[i]]);
    }

    setSimResult({ winner: myWin?"Your Team":"Opponents", type:winType });
    setSimRunning(false);
  };

  // Calculate W/L from demo battles
  const myBattles = DEMO_BATTLES;
  const wins = myBattles.filter(b=>b.teamA.won && b.myMokis.length>0 && b.teamA.mokis.some(m=>b.myMokis.includes(m))).length;
  const losses = myBattles.length - wins;
  const winRate = Math.round((wins/myBattles.length)*100);

  return (
    <div style={{padding:"16px 0"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div>
          <div style={{fontSize:9,letterSpacing:3,color:"#374151"}}>MOKI MAYHEM</div>
          <div style={{fontSize:18,fontWeight:900,color:"#f0e8d0"}}>Battle Center</div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 6px #22c55e"}}/>
          <span style={{fontSize:9,color:"#22c55e",fontWeight:700}}>24/7 LIVE</span>
        </div>
      </div>

      {/* Watch live on Grand Arena button */}
      <button
        onClick={()=>openInAppBrowser("https://fantasy.grandarena.gg/battles")}
        style={{width:"100%",padding:14,background:"linear-gradient(135deg,#1e3a8a,#2563eb)",border:"1px solid #3b82f6",borderRadius:12,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
        <span style={{fontSize:20}}>📺</span>
        <div style={{textAlign:"left"}}>
          <div>WATCH LIVE ON GRAND ARENA</div>
          <div style={{fontSize:9,opacity:0.7,fontWeight:400}}>Opens official battle viewer in-app</div>
        </div>
      </button>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
        <button onClick={()=>openInAppBrowser(`https://train.grandarena.gg/${walletAddress||""}`)}
          style={{padding:"10px 8px",background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:9,color:"#22c55e",fontSize:10,fontWeight:700,cursor:"pointer",textAlign:"center"}}>
          <div style={{fontSize:16,marginBottom:2}}>🏋️</div>
          My Moki Stats ↗
        </button>
        <button onClick={()=>openInAppBrowser("https://fantasy.grandarena.gg/leaderboard")}
          style={{padding:"10px 8px",background:"rgba(196,148,0,0.08)",border:"1px solid rgba(196,148,0,0.2)",borderRadius:9,color:"#c49400",fontSize:10,fontWeight:700,cursor:"pointer",textAlign:"center"}}>
          <div style={{fontSize:16,marginBottom:2}}>🏆</div>
          Leaderboard ↗
        </button>
      </div>

      {/* Sub-tabs */}
      <div style={{display:"flex",gap:4,marginBottom:14,background:"rgba(255,255,255,0.02)",borderRadius:10,padding:2}}>
        {([["live","⚡","Live Sim"],["history","📋","History"],["leaderboard","🏆","My Stats"]] as const).map(([id,icon,label])=>(
          <button key={id} onClick={()=>setWtab(id)} style={{flex:1,padding:"7px 2px",background:wtab===id?"rgba(196,148,0,0.15)":"none",border:"none",borderRadius:8,color:wtab===id?"#c49400":"#374151",cursor:"pointer"}}>
            <div style={{fontSize:12}}>{icon}</div>
            <div style={{fontSize:7,marginTop:1,fontWeight:wtab===id?700:400}}>{label}</div>
          </button>
        ))}
      </div>

      {/* LIVE SIM TAB */}
      {wtab==="live"&&(
        <div>
          <div style={{fontSize:9,color:"#4b5563",marginBottom:12,lineHeight:1.6}}>
            Run a real-time battle simulation using your Moki stats. See how your team performs round-by-round.
          </div>

          {/* Stats bar */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
            {[{l:"WIN RATE",v:`${winRate}%`,c:"#22c55e"},{l:"WINS",v:wins,c:"#22c55e"},{l:"LOSSES",v:losses,c:"#ef4444"}].map(x=>(
              <div key={x.l} style={{background:"rgba(255,255,255,0.04)",borderRadius:9,padding:"10px 6px",textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:900,color:x.c}}>{x.v}</div>
                <div style={{fontSize:7,color:"#374151",marginTop:2}}>{x.l}</div>
              </div>
            ))}
          </div>

          {/* Battle log */}
          <div style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:12,marginBottom:12,minHeight:200,maxHeight:280,overflowY:"auto"}}>
            {simLog.length===0&&!simRunning&&(
              <div style={{textAlign:"center",padding:32,color:"#374151",fontSize:11}}>
                Tap SIMULATE to watch a battle play out live
              </div>
            )}
            {simLog.map((line,i)=>(
              <div key={i} style={{fontSize:10,color:line.includes("WINS")?"#c49400":line.includes("YOUR")?"#22c55e":line.includes("OPPONENTS WIN")?"#ef4444":"#6b7280",padding:"3px 0",fontFamily:"monospace",lineHeight:1.6,borderBottom:i<simLog.length-1?"1px solid rgba(255,255,255,0.03)":"none"}}>
                {line}
              </div>
            ))}
            {simRunning&&(
              <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0"}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:"#22c55e",animation:"pulse 1s infinite"}}/>
                <span style={{fontSize:9,color:"#22c55e"}}>Battle in progress…</span>
              </div>
            )}
          </div>

          {simResult&&(
            <div style={{background:simResult.winner==="Your Team"?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)",border:`1px solid ${simResult.winner==="Your Team"?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)"}`,borderRadius:10,padding:12,textAlign:"center",marginBottom:12}}>
              <div style={{fontSize:24,marginBottom:4}}>{simResult.winner==="Your Team"?"🏆":"💀"}</div>
              <div style={{fontSize:16,fontWeight:900,color:simResult.winner==="Your Team"?"#22c55e":"#ef4444"}}>{simResult.winner.toUpperCase()} WIN</div>
              <div style={{fontSize:10,color:"#6b7280",marginTop:4}}>via {WIN_TYPE_ICON[simResult.type]} {simResult.type}</div>
            </div>
          )}

          <button onClick={runSim} disabled={simRunning}
            style={{width:"100%",padding:13,background:simRunning?"rgba(255,255,255,0.04)":"linear-gradient(135deg,#7f1d1d,#b91c1c)",border:`1px solid ${simRunning?"rgba(255,255,255,0.1)":"#ef4444"}`,borderRadius:10,color:simRunning?"#374151":"#fecaca",fontSize:13,fontWeight:800,cursor:simRunning?"not-allowed":"pointer",letterSpacing:1}}>
            {simRunning?"⚡ Simulating…":"⚔️ SIMULATE BATTLE"}
          </button>
        </div>
      )}

      {/* HISTORY TAB */}
      {wtab==="history"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:9,letterSpacing:3,color:"#374151"}}>RECENT BATTLES</span>
            <button onClick={()=>openInAppBrowser("https://fantasy.grandarena.gg/battles/history")}
              style={{fontSize:9,padding:"3px 10px",background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:6,color:"#3b82f6",cursor:"pointer"}}>Full history ↗</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {myBattles.map((b,i)=>{
              const myTeamWon = b.teamA.mokis.some(m=>b.myMokis.includes(m)) ? b.teamA.won : b.teamB.won;
              return(
                <div key={b.id} style={{background:myTeamWon?"rgba(34,197,94,0.06)":"rgba(239,68,68,0.06)",border:`1px solid ${myTeamWon?"rgba(34,197,94,0.2)":"rgba(239,68,68,0.2)"}`,borderRadius:12,padding:12}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:18}}>{myTeamWon?"🏆":"💀"}</span>
                      <div>
                        <div style={{fontSize:11,fontWeight:700,color:myTeamWon?"#22c55e":"#ef4444"}}>{myTeamWon?"VICTORY":"DEFEAT"}</div>
                        <div style={{fontSize:8,color:"#374151"}}>{b.when} · {b.duration}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:4,background:`${WIN_TYPE_COLOR[b.winType]}15`,border:`1px solid ${WIN_TYPE_COLOR[b.winType]}30`,borderRadius:20,padding:"3px 10px"}}>
                      <span style={{fontSize:10}}>{WIN_TYPE_ICON[b.winType]}</span>
                      <span style={{fontSize:8,color:WIN_TYPE_COLOR[b.winType],fontWeight:700}}>{b.winType}</span>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center"}}>
                    <div style={{background:"rgba(34,197,94,0.08)",borderRadius:8,padding:"6px 8px"}}>
                      <div style={{fontSize:8,color:"#374151",marginBottom:3}}>TEAM A</div>
                      <div style={{fontSize:16}}>{b.teamA.mokis.join(" ")}</div>
                      <div style={{fontSize:11,fontWeight:800,color:"#22c55e",marginTop:2}}>{b.teamA.score} pts</div>
                    </div>
                    <div style={{fontSize:11,fontWeight:900,color:"#374151"}}>VS</div>
                    <div style={{background:"rgba(239,68,68,0.08)",borderRadius:8,padding:"6px 8px",textAlign:"right"}}>
                      <div style={{fontSize:8,color:"#374151",marginBottom:3}}>TEAM B</div>
                      <div style={{fontSize:16}}>{b.teamB.mokis.join(" ")}</div>
                      <div style={{fontSize:11,fontWeight:800,color:"#ef4444",marginTop:2}}>{b.teamB.score} pts</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MY STATS TAB */}
      {wtab==="leaderboard"&&(
        <div>
          {/* Overall stats */}
          <div style={{background:"rgba(196,148,0,0.06)",border:"1px solid rgba(196,148,0,0.15)",borderRadius:12,padding:14,marginBottom:14}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#c49400",marginBottom:12}}>MY PERFORMANCE</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:12}}>
              {[{l:"WIN RATE",v:`${winRate}%`,c:"#22c55e"},{l:"WINS",v:wins,c:"#22c55e"},{l:"LOSSES",v:losses,c:"#ef4444"},{l:"STREAK",v:"5🔥",c:"#f59e0b"}].map(x=>(
                <div key={x.l} style={{textAlign:"center",background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"8px 4px"}}>
                  <div style={{fontSize:14,fontWeight:900,color:x.c}}>{x.v}</div>
                  <div style={{fontSize:7,color:"#374151",marginTop:2}}>{x.l}</div>
                </div>
              ))}
            </div>
            {/* Win type breakdown */}
            <div style={{fontSize:9,color:"#374151",marginBottom:6,letterSpacing:1}}>WIN TYPE BREAKDOWN</div>
            {(["Gacha","Combat","Wart"] as const).map(type=>{
              const count = myBattles.filter(b=>{
                const myTeamWon = b.teamA.mokis.some(m=>b.myMokis.includes(m)) ? b.teamA.won : b.teamB.won;
                return myTeamWon && b.winType===type;
              }).length;
              const pct = Math.round((count/wins)*100)||0;
              return(
                <div key={type} style={{marginBottom:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                    <span style={{fontSize:9,color:WIN_TYPE_COLOR[type]}}>{WIN_TYPE_ICON[type]} {type}</span>
                    <span style={{fontSize:9,color:WIN_TYPE_COLOR[type],fontWeight:700}}>{count} wins ({pct}%)</span>
                  </div>
                  <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
                    <div style={{width:`${pct}%`,height:"100%",background:WIN_TYPE_COLOR[type],borderRadius:3}}/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Per-Moki stats */}
          <div style={{fontSize:9,letterSpacing:3,color:"#374151",marginBottom:8}}>PER-MOKI STATS</div>
          {INIT_MOKIS.map(m=>{
            const appearances = myBattles.filter(b=>b.myMokis.includes(m.icon)).length;
            const mokiWins = myBattles.filter(b=>{
              const myTeamWon = b.teamA.mokis.some(mk=>b.myMokis.includes(mk)) ? b.teamA.won : b.teamB.won;
              return b.myMokis.includes(m.icon) && myTeamWon;
            }).length;
            const mokiWR = appearances > 0 ? Math.round((mokiWins/appearances)*100) : 0;
            return(
              <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:10,marginBottom:6}}>
                <MokiArt moki={m} size={40}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#f0e8d0"}}>{m.name}</div>
                  <div style={{fontSize:8,color:"#4b5563"}}>{appearances} battles</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:14,fontWeight:800,color:mokiWR>=50?"#22c55e":"#ef4444"}}>{mokiWR}%</div>
                  <div style={{fontSize:7,color:"#374151"}}>WIN RATE</div>
                </div>
                <button onClick={()=>openInAppBrowser(`https://train.grandarena.gg/?moki=${encodeURIComponent(m.name)}`)}
                  style={{padding:"5px 8px",background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:6,color:"#3b82f6",fontSize:8,cursor:"pointer"}}>View ↗</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT — Android-optimized UI
═══════════════════════════════════════════════════════════════ */
const NAV = [
  { id:"hub",    icon:"🏠", label:"Hub"    },
  { id:"lineup", icon:"⚔️",  label:"Lineup" },
  { id:"gym",    icon:"💪", label:"Gym"    },
  { id:"watch",  icon:"📺", label:"Watch"  },
  { id:"arena",  icon:"🥊", label:"Arena"  },
  { id:"wallet", icon:"👛", label:"Wallet" },
  { id:"market", icon:"🛒", label:"Market" },
];

// Android global styles injected once
const GLOBAL_STYLES = `
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body { overscroll-behavior: none; }
  ::-webkit-scrollbar { display: none; }
  input, textarea { -webkit-appearance: none; appearance: none; }
  input::placeholder { color: #374151; }

  /* Ripple effect for all tappable elements */
  .ripple {
    position: relative; overflow: hidden;
  }
  .ripple::after {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%);
    opacity: 0; transition: opacity 0.35s;
    pointer-events: none;
  }
  .ripple:active::after { opacity: 1; transition: opacity 0s; }

  /* Bottom nav active pill */
  .nav-btn { transition: color 0.15s; }
  .nav-btn.active { color: #c49400 !important; }
  .nav-btn .nav-dot {
    width: 4px; height: 4px; border-radius: 50%;
    background: #c49400; margin: 2px auto 0;
    transform: scale(0); transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
  }
  .nav-btn.active .nav-dot { transform: scale(1); }
  .nav-btn .nav-icon { transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1); }
  .nav-btn.active .nav-icon { transform: translateY(-2px) scale(1.12); }

  /* Screen transition */
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .screen { animation: slideUp 0.22s cubic-bezier(0.22,1,0.36,1) both; }

  /* Card hover/active states */
  .card-tap { transition: transform 0.1s, box-shadow 0.1s; }
  .card-tap:active { transform: scale(0.97); }

  /* Input focus */
  input:focus { outline: none; border-color: rgba(196,148,0,0.5) !important; box-shadow: 0 0 0 2px rgba(196,148,0,0.15); }

  /* Better scrollbar for desktop preview */
  @media (min-width: 480px) {
    ::-webkit-scrollbar { display: block; width: 3px; height: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(196,148,0,0.3); border-radius: 2px; }
  }
`;

export default function MokuHub() {
  const [tab,setTab]=useState("hub");
  const [prevTab,setPrevTab]=useState("hub");
  const [totalMxp,setTotalMxp]=useState(2953);
  const [gems,setGems]=useState(4200);
  const [statusBarH,setStatusBarH]=useState(28); // fallback 28px
  const [txLog,setTxLog]=useState<TxRecord[]>([
    {id:"t0",type:"buy",cardId:12,price:0.31,fee:0.008,when:"2d ago",ts:"10:24 AM"},
    {id:"t1",type:"sell",cardId:5,price:0.06,fee:0.002,when:"5d ago",ts:"3:11 PM"},
  ]);
  const wallet=useWallet();

  // Load persisted state
  useEffect(()=>{
    load("gems",4200).then(g=>setGems(g));
    load("tx_log",[]).then(t=>{ if(Array.isArray(t)&&t.length) setTxLog(t); });
    load("total_mxp",2953).then(m=>setTotalMxp(m));
  },[]);
  useEffect(()=>{ persist("gems",gems); },[gems]);
  useEffect(()=>{ persist("tx_log",txLog.slice(0,50)); },[txLog]);
  useEffect(()=>{ persist("total_mxp",totalMxp); },[totalMxp]);

  // Fix status bar on mount — Capacitor plugin approach
  useEffect(()=>{
    const fixStatusBar = async () => {
      try {
        const { StatusBar } = await import("@capacitor/status-bar");
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setBackgroundColor({ color: "#070610" });
        const info = await StatusBar.getInfo();
        if (info.visible) setStatusBarH(28);
      } catch {
        // Not in Capacitor / plugin not available — use CSS fallback
      }
    };
    fixStatusBar();
  },[]);

  const onMxpEarn=(n:number)=>setTotalMxp(p=>p+n);
  const onAddOwned=(id:number)=>{if(!wallet.ownedIds.includes(id))wallet.setOwnedIds(p=>[...p,id]);};
  const onTx=(tx:TxRecord)=>setTxLog(p=>[tx,...p]);

  const switchTab=(id:string)=>{ setPrevTab(tab); setTab(id); };

  return (
    <div style={{
      fontFamily:"-apple-system,'SF Pro Display','Segoe UI',system-ui,sans-serif",
      background:"#070610",
      height:"100dvh",
      color:"#e8e0cc",
      maxWidth:480,
      margin:"0 auto",
      display:"flex",
      flexDirection:"column",
      position:"relative",
      overflow:"hidden",
    }}>
      <style>{GLOBAL_STYLES}</style>

      {/* WalletConnect QR Modal */}
      {wallet.showQR && wallet.wcUri && (
        <QRModal uri={wallet.wcUri} onClose={()=>wallet.setShowQR(false)}/>
      )}

      {/* STATUS BAR SPACER — pushes content below system status bar */}
      <div style={{height:statusBarH,background:"#070610",flexShrink:0}}/>

      {/* TOP HEADER */}
      <div style={{
        padding:"8px 18px 0",
        background:"#070610",
        flexShrink:0,
        position:"relative",
      }}>
        {/* Subtle top glow */}
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"60%",height:1,background:"linear-gradient(90deg,transparent,rgba(196,148,0,0.4),transparent)"}}/>

        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingBottom:10}}>
          {/* Logo */}
          <div>
            <div style={{fontSize:8,letterSpacing:5,color:"rgba(196,148,0,0.6)",fontWeight:600,marginBottom:1}}>GRAND ARENA</div>
            <div style={{
              fontSize:22,fontWeight:900,letterSpacing:2,lineHeight:1,
              background:"linear-gradient(135deg,#f59e0b 0%,#fde68a 45%,#c49400 100%)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            }}>TORI FORGE</div>
          </div>

          {/* Stats chips */}
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {wallet.mode!=="disconnected"&&(
              <div style={{background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:20,padding:"3px 10px",display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:"#22c55e"}}/>
                <span style={{fontSize:9,color:"#22c55e",fontWeight:600,fontFamily:"monospace"}}>{shortAddr(wallet.address!)}</span>
              </div>
            )}
            <div style={{display:"flex",gap:5}}>
              <div style={{background:"rgba(168,85,247,0.1)",border:"1px solid rgba(168,85,247,0.2)",borderRadius:16,padding:"4px 10px"}}>
                <span style={{fontSize:11,fontWeight:700,color:"#a855f7"}}>{totalMxp.toLocaleString()}</span>
                <span style={{fontSize:8,color:"rgba(168,85,247,0.6)",marginLeft:2}}>mXP</span>
              </div>
              <div style={{background:"rgba(196,148,0,0.1)",border:"1px solid rgba(196,148,0,0.2)",borderRadius:16,padding:"4px 10px"}}>
                <span style={{fontSize:11,fontWeight:700,color:"#c49400"}}>{gems.toLocaleString()}</span>
                <span style={{fontSize:9,marginLeft:2}}>💎</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom border */}
        <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(196,148,0,0.15),transparent)",marginLeft:-18,marginRight:-18}}/>
      </div>

      {/* CONTENT AREA — scrollable */}
      <div style={{flex:1,overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch"} as any}>
        <div key={tab} className="screen" style={{padding:"12px 16px",paddingBottom:16,minHeight:"100%"}}>
          {tab==="hub"    && <HubScreen    wallet={wallet} totalMxp={totalMxp} gems={gems}/>}
          {tab==="lineup" && <LineupScreen ownedIds={wallet.ownedIds} realImages={wallet.realImages}/>}
          {tab==="gym"    && <GymScreen    onMxpEarn={onMxpEarn} gems={gems} setGems={setGems}/>}
          {tab==="watch"  && <WatchScreen  walletAddress={wallet.address}/>}
          {tab==="arena"  && <ArenaScreen  realImages={wallet.realImages}/>}
          {tab==="wallet" && <WalletScreen wallet={wallet} gems={gems} setGems={setGems} ownedIds={wallet.ownedIds} txLog={txLog} setTxLog={setTxLog}/>}
          {tab==="market" && <MarketScreen ownedIds={wallet.ownedIds} wallet={wallet} gems={gems} setGems={setGems} onAddOwned={onAddOwned} realImages={wallet.realImages} onTx={onTx}/>}
        </div>
      </div>

      {/* BOTTOM NAV — Android style */}
      <div style={{
        flexShrink:0,
        background:"#0c0b14",
        borderTop:"1px solid rgba(255,255,255,0.06)",
        paddingBottom:"env(safe-area-inset-bottom, 8px)",
        boxShadow:"0 -8px 32px rgba(0,0,0,0.6)",
      }}>
        <div style={{display:"flex",padding:"4px 0"}}>
          {NAV.map(t=>(
            <button
              key={t.id}
              onClick={()=>switchTab(t.id)}
              className={`nav-btn ripple ${tab===t.id?"active":""}`}
              style={{
                flex:1,
                padding:"8px 4px 6px",
                background:"none",
                border:"none",
                color:tab===t.id?"#c49400":"#4b5563",
                cursor:"pointer",
                textAlign:"center",
                minHeight:56,
                display:"flex",
                flexDirection:"column",
                alignItems:"center",
                justifyContent:"center",
                gap:1,
                position:"relative",
              }}
            >
              {/* Active background pill */}
              {tab===t.id&&(
                <div style={{
                  position:"absolute",
                  top:6,
                  left:"50%",
                  transform:"translateX(-50%)",
                  width:48,
                  height:28,
                  background:"rgba(196,148,0,0.12)",
                  borderRadius:14,
                }}/>
              )}
              <span className="nav-icon" style={{fontSize:18,position:"relative",zIndex:1}}>{t.icon}</span>
              <span style={{fontSize:9,fontWeight:tab===t.id?700:400,letterSpacing:0.3,position:"relative",zIndex:1}}>{t.label}</span>
              <span className="nav-dot"/>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
