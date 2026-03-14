"use client";
import { useState, useEffect, useCallback, useMemo } from "react";

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
}
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

/* ── MARKETPLACE ── */
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
  <span style={{fontSize:8,padding:"2px 6px",borderRadius:4,background:`${color}20`,color,border:`1px solid ${color}40`,fontWeight:700,letterSpacing:0.4,whiteSpace:"nowrap"}}>{label}</span>
);
const Pill = ({children,color="#6b7280",active,onClick}:{children:React.ReactNode;color?:string;active?:boolean;onClick?:()=>void}) => (
  <button onClick={onClick} style={{fontSize:9,padding:"3px 9px",borderRadius:20,cursor:"pointer",background:active?`${color}20`:"rgba(255,255,255,0.03)",border:`1px solid ${active?color+"60":"rgba(255,255,255,0.08)"}`,color:active?color:"#4b5563",fontWeight:active?700:400,outline:"none"}}>{children}</button>
);
const StatBox = ({label,value,color="#f0e8d0"}:{label:string;value:string|number;color?:string}) => (
  <div style={{textAlign:"center",background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"7px 4px"}}>
    <div style={{fontSize:14,fontWeight:800,color}}>{value}</div>
    <div style={{fontSize:7,color:"#374151",letterSpacing:0.5,marginTop:1}}>{label}</div>
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

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ronin?.provider) {
      (window as any).ronin.provider.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) { setAddress(accounts[0]); }
        else { setAddress(null); setMode("disconnected"); setOwnedIds([]); setRealImages({}); }
      });
    }
  }, []);

  const connectRonin = async () => {
    setLoading(true); setError(null);
    try {
      const w = (window as any);
      if (w.ronin?.provider) {
        const accounts: string[] = await w.ronin.provider.request({ method: "eth_requestAccounts" });
        if (accounts?.[0]) {
          setAddress(accounts[0]);
          setMode("live");
          setOwnedIds(DEMO_OWNED_IDS); // seed immediately; real NFT list can replace this
          setLoading(false);
          // Fetch real card art in background — no blocking
          setImgLoading(true);
          const imgs = await fetchRoninCardImages(accounts[0]);
          setRealImages(imgs);
          setImgLoading(false);
          return;
        }
      } else {
        setError("Ronin Wallet extension not found. Install it from wallet.roninchain.com");
      }
    } catch(e: any) {
      setError(e.code === 4001 ? "Wallet connection rejected by user." : "Connection failed. Try again.");
    }
    setLoading(false);
  };

  const connectDemo = () => {
    setAddress("0xDEMO…0000"); setMode("demo");
    setOwnedIds(DEMO_OWNED_IDS); setError(null); setRealImages({});
  };

  const disconnect = () => {
    setAddress(null); setMode("disconnected"); setOwnedIds([]); setRealImages({});
  };

  return { address, mode, loading, imgLoading, error, ownedIds, setOwnedIds, realImages, connectRonin, connectDemo, disconnect };
}

/* ═══════════════════════════════════════════════════════════════
   SCREEN: HUB
═══════════════════════════════════════════════════════════════ */
function HubScreen({ wallet, totalMxp, gems }: { wallet: ReturnType<typeof useWallet>; totalMxp: number; gems: number }) {
  const { address, mode, loading, imgLoading, error, ownedIds, realImages, connectRonin, connectDemo, disconnect } = wallet;
  const connected = mode !== "disconnected";
  const collVal = ownedIds.reduce((s,id)=>{const c=ALL_CHAMPIONS.find(x=>x.id===id);return s+(c?c.floorPrice:0);},0).toFixed(2);

  return (
    <div style={{padding:"16px 0"}}>
      <div style={{background:"rgba(196,148,0,0.05)",border:"1px solid rgba(196,148,0,0.15)",borderRadius:14,padding:16,marginBottom:16}}>
        <div style={{fontSize:9,letterSpacing:4,color:"#c49400",marginBottom:10}}>WALLET</div>
        {!connected ? (
          <>
            <p style={{fontSize:12,color:"#6b7280",lineHeight:1.6,marginBottom:16}}>
              Connect your Ronin Wallet to load real card art + your collection, or use Demo Mode to explore.
            </p>
            {error && (
              <div style={{fontSize:10,color:"#f87171",background:"rgba(239,68,68,0.08)",padding:"8px 12px",borderRadius:6,marginBottom:10,lineHeight:1.5}}>
                ⚠ {error}
                {error.includes("not found") && (
                  <a href="https://wallet.roninchain.com" target="_blank" rel="noopener noreferrer"
                    style={{display:"block",marginTop:6,color:"#3b82f6",fontSize:9,textDecoration:"none"}}>
                    → Download Ronin Wallet
                  </a>
                )}
              </div>
            )}
            <button onClick={connectRonin} disabled={loading}
              style={{width:"100%",padding:13,background:"linear-gradient(135deg,#1e3a8a,#2563eb)",border:"1px solid #3b82f6",borderRadius:9,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:8,letterSpacing:0.5}}>
              {loading ? "Connecting…" : "🔗 Connect Ronin Wallet"}
            </button>
            <button onClick={connectDemo}
              style={{width:"100%",padding:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:"#6b7280",fontSize:11,cursor:"pointer"}}>
              ▷ Demo Mode (generated card art)
            </button>
            <div style={{marginTop:14,background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.15)",borderRadius:8,padding:10}}>
              <div style={{fontSize:9,color:"#3b82f6",fontWeight:700,marginBottom:5}}>ℹ CARD ART</div>
              <div style={{fontSize:9,color:"#4b5563",lineHeight:1.7}}>
                <strong style={{color:"#93c5fd"}}>Live wallet</strong> → real NFT art fetched from Ronin after connect.<br/>
                <strong style={{color:"#fbbf24"}}>Demo mode</strong> → procedurally generated art unique to each card.<br/>
                All card art updates across every screen automatically.
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <div style={{width:42,height:42,borderRadius:"50%",background:"linear-gradient(135deg,#c49400,#f59e0b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>👤</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:"#f0e8d0",fontFamily:"monospace"}}>{shortAddr(address!)}</div>
                <div style={{fontSize:9,color:mode==="live"?"#22c55e":"#f59e0b",marginTop:2}}>
                  ● {mode==="live" ? (imgLoading ? "Fetching card art from Ronin…" : "Ronin Mainnet Connected") : "Demo Mode"}
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
   SCREEN: LINEUP FORGE (with Presets)
═══════════════════════════════════════════════════════════════ */
function LineupScreen({ ownedIds, realImages }: { ownedIds: number[]; realImages: Record<number,string> }) {
  const [contest,setContest]=useState(CONTESTS[0]);
  const [scheme,setScheme]=useState<typeof SCHEME_CARDS[0]|null>(null);
  const [champs,setChamps]=useState<Champion[]>([]);
  const [showAll,setShowAll]=useState(ownedIds.length===0);
  const [sortBy,setSortBy]=useState("score");
  const [filterRarity,setFilterRarity]=useState("All");
  const [subTab,setSubTab]=useState<"build"|"presets">("build");
  const [presets,setPresets]=useState<Preset[]>(DEFAULT_PRESETS);
  const [saving,setSaving]=useState(false);
  const [saveName,setSaveName]=useState("");
  const [saveNote,setSaveNote]=useState("");

  const pool=useMemo(()=>showAll?ALL_CHAMPIONS:ALL_CHAMPIONS.filter(c=>ownedIds.includes(c.id)),[showAll,ownedIds]);
  const filtered=useMemo(()=>pool
    .filter(c=>filterRarity==="All"||c.rarity===filterRarity)
    .sort((a,b)=>sortBy==="score"?b.score*RARITY[b.rarity].mult-a.score*RARITY[a.rarity].mult:sortBy==="elims"?b.elims-a.elims:sortBy==="win"?b.winRate-a.winRate:b.stars-a.stars)
  ,[pool,filterRarity,sortBy]);

  const toggle=(c:Champion)=>setChamps(p=>p.find(x=>x.id===c.id)?p.filter(x=>x.id!==c.id):p.length>=4?p:[...p,c]);
  const score=scoreLineup(champs,scheme);
  const starTotal=champs.reduce((s,c)=>s+c.stars,0);
  const errors=useMemo(()=>{const e:string[]=[];if(champs.length<4)return e;if(contest.restriction==="onereach"){for(const r of["Basic","Rare","Epic","Legendary"])if(!champs.find(c=>c.rarity===r))e.push(`Missing ${r}`);}if(contest.restriction==="starcap"&&starTotal>contest.starCap)e.push(`Stars ${starTotal} > cap ${contest.starCap}`);return e;},[champs,contest,starTotal]);

  const loadPreset=(p:Preset)=>{
    const cont=CONTESTS.find(c=>c.id===p.contestId)||CONTESTS[0];
    const sch=SCHEME_CARDS.find(s=>s.id===p.schemeId)||null;
    const chs=p.champIds.map(id=>ALL_CHAMPIONS.find(c=>c.id===id)!).filter(Boolean);
    setContest(cont); setScheme(sch); setChamps(chs); setSubTab("build");
  };

  const savePreset=()=>{
    if(champs.length<4||!saveName.trim()){return;}
    const newP:Preset={
      id:`custom_${Date.now()}`, name:saveName.trim(), icon:"📌",
      contestId:contest.id, schemeId:scheme?.id||"", champIds:champs.map(c=>c.id),
      note:saveNote||`${champs.length} cards · ${score.total}pts`, color:"#c49400",
    };
    setPresets(p=>[...p,newP]); setSaving(false); setSaveName(""); setSaveNote("");
  };

  const deletePreset=(id:string)=>setPresets(p=>p.filter(x=>x.id!==id));

  return (
    <div style={{padding:"16px 0"}}>
      {/* Sub-nav */}
      <div style={{display:"flex",gap:4,marginBottom:14}}>
        <button onClick={()=>setSubTab("build")} style={{flex:1,padding:"9px 0",background:subTab==="build"?"rgba(196,148,0,0.15)":"rgba(255,255,255,0.03)",border:`1px solid ${subTab==="build"?"#c49400":"rgba(255,255,255,0.07)"}`,borderRadius:8,color:subTab==="build"?"#c49400":"#4b5563",fontSize:11,fontWeight:700,cursor:"pointer"}}>
          ⚔️ Build Lineup
        </button>
        <button onClick={()=>setSubTab("presets")} style={{flex:1,padding:"9px 0",background:subTab==="presets"?"rgba(196,148,0,0.15)":"rgba(255,255,255,0.03)",border:`1px solid ${subTab==="presets"?"#c49400":"rgba(255,255,255,0.07)"}`,borderRadius:8,color:subTab==="presets"?"#c49400":"#4b5563",fontSize:11,fontWeight:700,cursor:"pointer"}}>
          📋 Presets ({presets.length})
        </button>
      </div>

      {/* ── PRESETS TAB ── */}
      {subTab==="presets"&&(
        <div>
          <div style={{fontSize:9,color:"#4b5563",marginBottom:12,lineHeight:1.6}}>
            Save lineups you want to reuse. Load them in one tap before a contest.
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
            {presets.map(p=>{
              const cont=CONTESTS.find(c=>c.id===p.contestId);
              const sch=SCHEME_CARDS.find(s=>s.id===p.schemeId);
              const cards=p.champIds.map(id=>ALL_CHAMPIONS.find(c=>c.id===id)!).filter(Boolean);
              const sc=scoreLineup(cards,sch||null);
              const isCustom=p.id.startsWith("custom");
              return (
                <div key={p.id} style={{background:`${p.color}08`,border:`1.5px solid ${p.color}30`,borderRadius:13,padding:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <div style={{width:40,height:40,borderRadius:10,background:`${p.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,border:`1px solid ${p.color}35`,flexShrink:0}}>{p.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:800,color:p.color,marginBottom:3}}>{p.name}</div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        {cont&&<Badge label={cont.name} color={cont.color}/>}
                        {sch&&<Badge label={sch.name} color="#3b82f6"/>}
                        {isCustom&&<Badge label="Custom" color="#c49400"/>}
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:14,fontWeight:800,color:"#c49400"}}>{sc.total}</div>
                      <div style={{fontSize:7,color:"#374151"}}>PROJ PTS</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
                    {cards.map(c=>(
                      <div key={c.id} style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.05)",borderRadius:7,padding:"4px 7px"}}>
                        <CardArt card={c} size={32} realImg={realImages[c.id]} ctx={`pre${p.id}`}/>
                        <div>
                          <div style={{fontSize:8,fontWeight:700,color:"#f0e8d0",maxWidth:64,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{c.name}</div>
                          <div style={{fontSize:7,color:RARITY[c.rarity].color}}>{c.rarity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {p.note&&<div style={{fontSize:9,color:"#4b5563",marginBottom:10,fontStyle:"italic"}}>"{p.note}"</div>}
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>loadPreset(p)} style={{flex:1,padding:8,background:`${p.color}18`,border:`1px solid ${p.color}50`,borderRadius:7,color:p.color,fontSize:10,fontWeight:700,cursor:"pointer"}}>▶ LOAD</button>
                    {isCustom&&<button onClick={()=>deletePreset(p.id)} style={{padding:"8px 12px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:7,color:"#ef4444",fontSize:10,cursor:"pointer"}}>🗑</button>}
                  </div>
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
              {champs.length>=4&&(
                <button onClick={()=>setSaving(!saving)} style={{padding:"10px 12px",background:"rgba(196,148,0,0.12)",border:"1px solid rgba(196,148,0,0.3)",borderRadius:8,color:"#c49400",fontSize:10,fontWeight:700,cursor:"pointer"}}>💾 SAVE</button>
              )}
            </div>

            {/* Save preset form */}
            {saving&&(
              <div style={{marginTop:10,background:"rgba(0,0,0,0.3)",borderRadius:8,padding:10}}>
                <div style={{fontSize:9,color:"#c49400",letterSpacing:2,marginBottom:6}}>SAVE AS PRESET</div>
                <input value={saveName} onChange={e=>setSaveName(e.target.value)} placeholder="Preset name (required)" style={{width:"100%",padding:"7px 10px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#f0e8d0",fontSize:11,outline:"none",marginBottom:6,boxSizing:"border-box"}}/>
                <input value={saveNote} onChange={e=>setSaveNote(e.target.value)} placeholder="Notes (optional)" style={{width:"100%",padding:"7px 10px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#f0e8d0",fontSize:11,outline:"none",marginBottom:6,boxSizing:"border-box"}}/>
                <button onClick={savePreset} disabled={!saveName.trim()} style={{width:"100%",padding:8,background:saveName.trim()?"rgba(34,197,94,0.15)":"rgba(255,255,255,0.03)",border:`1px solid ${saveName.trim()?"rgba(34,197,94,0.4)":"rgba(255,255,255,0.07)"}`,borderRadius:6,color:saveName.trim()?"#22c55e":"#374151",fontSize:10,fontWeight:700,cursor:"pointer"}}>✓ SAVE PRESET</button>
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
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCREEN: GYM — Real 5-stat training
═══════════════════════════════════════════════════════════════ */
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
          <div style={{fontSize:9,color:"#4b5563",marginBottom:12}}>Tap a Moki to open the training assignment panel.</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {mokis.map(m=>(
              <div key={m.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:12,display:"flex",alignItems:"center",gap:10}}>
                <MokiArt moki={m} size={44}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#f0e8d0",marginBottom:3}}>{m.name}</div>
                  <StaminaBar val={m.stamina}/>
                </div>
                {m.training?(
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:9,color:"#22c55e",marginBottom:4}}>{REAL_STATS.find(s=>s.id===m.training!.statId)?.icon} Active</div>
                    <button onClick={()=>completeTraining(m.id)} style={{padding:"5px 10px",background:"rgba(34,197,94,0.12)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:6,color:"#22c55e",fontSize:9,cursor:"pointer"}}>✓ Done</button>
                  </div>
                ):(
                  <button onClick={()=>setAssignModal({mokiId:m.id})} disabled={m.stamina<5} style={{padding:"7px 12px",background:m.stamina>=5?"rgba(196,148,0,0.12)":"rgba(255,255,255,0.03)",border:`1px solid ${m.stamina>=5?"rgba(196,148,0,0.3)":"rgba(255,255,255,0.06)"}`,borderRadius:7,color:m.stamina>=5?"#c49400":"#374151",fontSize:10,fontWeight:700,cursor:m.stamina>=5?"pointer":"not-allowed"}}>TRAIN</button>
                )}
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
const MKT_TABS_LIST=[{id:"browse",icon:"🏪",label:"Browse"},{id:"sell",icon:"💰",label:"Sell"},{id:"watchlist",icon:"👁️",label:"Watch"},{id:"portfolio",icon:"📈",label:"Portfolio"}];

function MarketScreen({ ownedIds, wallet, gems, setGems, onAddOwned, realImages }: { ownedIds:number[]; wallet:ReturnType<typeof useWallet>; gems:number; setGems:React.Dispatch<React.SetStateAction<number>>; onAddOwned:(id:number)=>void; realImages:Record<number,string> }) {
  const [mtab,setMtab]=useState("browse");
  const [listings,setListings]=useState(INIT_LISTINGS);
  const [watchlist,setWatchlist]=useState<number[]>([]);
  const [myListings,setMyListings]=useState<typeof INIT_LISTINGS>([]);
  const [txHistory,setTxHistory]=useState([{id:"t1",type:"buy",cardId:12,price:0.31,when:"2d ago"},{id:"t2",type:"sell",cardId:5,price:0.06,when:"5d ago"}]);
  const [filter,setFilter]=useState({rarity:"All",sortBy:"price"});
  const [priceInput,setPriceInput]=useState("");
  const [sellCard,setSellCard]=useState<number|null>(null);
  const [buyConfirm,setBuyConfirm]=useState<(typeof INIT_LISTINGS[0] & {card:Champion})|null>(null);
  const [priceHistories]=useState(()=>Object.fromEntries(ALL_CHAMPIONS.map(c=>[c.id,genHistory(c.floorPrice)])));
  const [searchQ,setSearchQ]=useState("");
  const [notification,setNotification]=useState<{msg:string;color:string}|null>(null);

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
    if(gems<Math.round(listing.price*1000)){showNotif("Not enough Gems","#ef4444");return;}
    setListings(p=>p.filter(l=>l.id!==listing.id));
    setGems(p=>p-Math.round(listing.price*1000));
    onAddOwned(listing.cardId);
    setTxHistory(p=>[{id:`t${Date.now()}`,type:"buy",cardId:listing.cardId,price:listing.price,when:"just now"},...p]);
    setBuyConfirm(null);
    showNotif(`Bought ${listing.card?.name} for ${listing.price} RON`);
  };

  const listCard=(cardId:number,price:string)=>{
    if(!cardId||!price||isNaN(+price)){showNotif("Enter a valid price","#ef4444");return;}
    const card=ALL_CHAMPIONS.find(c=>c.id===cardId)!;
    const newL={id:`MY${Date.now()}`,cardId,price:+price,seller:shortAddr(wallet.address!)||"you",listedHrs:0,rarity:card?.rarity||"Basic",isOwn:true};
    setListings(p=>[newL,...p]);
    setMyListings(p=>[...p,newL]);
    setTxHistory(p=>[{id:`t${Date.now()}`,type:"list",cardId,price:+price,when:"just now"},...p]);
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
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              <StatBox label="PRICE (RON)" value={buyConfirm.price} color="#22c55e"/>
              <StatBox label="GEMS" value={Math.round(buyConfirm.price*1000)} color="#c49400"/>
            </div>
            <div style={{fontSize:10,color:"#4b5563",marginBottom:14}}>Balance after: {(gems-Math.round(buyConfirm.price*1000)).toLocaleString()} 💎</div>
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
   ROOT
═══════════════════════════════════════════════════════════════ */
const NAV = [
  { id:"hub",    icon:"🏠", label:"Hub"    },
  { id:"lineup", icon:"⚔️",  label:"Lineup" },
  { id:"gym",    icon:"💪", label:"Gym"    },
  { id:"arena",  icon:"🥊", label:"Arena"  },
  { id:"market", icon:"🛒", label:"Market" },
];

export default function MokuHub() {
  const [tab,setTab]=useState("hub");
  const [totalMxp,setTotalMxp]=useState(2953);
  const [gems,setGems]=useState(4200);
  const wallet=useWallet();

  const onMxpEarn=(n:number)=>setTotalMxp(p=>p+n);
  const onAddOwned=(id:number)=>{if(!wallet.ownedIds.includes(id))wallet.setOwnedIds(p=>[...p,id]);};

  return (
    <div style={{fontFamily:"'Courier New','Lucida Console',monospace",background:"#08070b",minHeight:"100vh",color:"#f0e8d0",maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column"}}>
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(196,148,0,0.3);border-radius:2px}input::placeholder{color:#374151}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* TOP BAR */}
      <div style={{padding:"14px 16px 0",borderBottom:"1px solid rgba(196,148,0,0.1)",background:"#08070b",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div>
            <div style={{fontSize:7,letterSpacing:5,color:"#c49400"}}>GRAND ARENA</div>
            <div style={{fontSize:19,fontWeight:900,letterSpacing:3,background:"linear-gradient(135deg,#f59e0b,#fde68a,#c49400)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1}}>TORI FORGE</div>
          </div>
          <div style={{textAlign:"right"}}>
            {wallet.mode!=="disconnected"&&<div style={{fontSize:9,color:"#4b5563",fontFamily:"monospace"}}>{shortAddr(wallet.address!)}</div>}
            <div style={{fontSize:11,fontWeight:700,color:"#a855f7"}}>{totalMxp.toLocaleString()} mXP</div>
            <div style={{fontSize:10,color:"#c49400"}}>{gems.toLocaleString()} 💎</div>
          </div>
        </div>
        <div style={{display:"flex"}}>
          {NAV.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"8px 2px",background:"none",border:"none",borderBottom:`2px solid ${tab===t.id?"#c49400":"transparent"}`,color:tab===t.id?"#c49400":"#374151",cursor:"pointer",textAlign:"center",transition:"all 0.15s"}}>
              <div style={{fontSize:14}}>{t.icon}</div>
              <div style={{fontSize:7,letterSpacing:0.5,marginTop:1,fontWeight:tab===t.id?700:400}}>{t.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{flex:1,padding:"0 16px",overflowY:"auto",paddingBottom:28}}>
        <div style={{animation:"fadeUp 0.2s ease"}}>
          {tab==="hub"    && <HubScreen    wallet={wallet} totalMxp={totalMxp} gems={gems}/>}
          {tab==="lineup" && <LineupScreen ownedIds={wallet.ownedIds} realImages={wallet.realImages}/>}
          {tab==="gym"    && <GymScreen    onMxpEarn={onMxpEarn} gems={gems} setGems={setGems}/>}
          {tab==="arena"  && <ArenaScreen  realImages={wallet.realImages}/>}
          {tab==="market" && <MarketScreen ownedIds={wallet.ownedIds} wallet={wallet} gems={gems} setGems={setGems} onAddOwned={onAddOwned} realImages={wallet.realImages}/>}
        </div>
      </div>
    </div>
  );
}
