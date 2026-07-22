import { useMemo, useState } from "react";
import { ChevronRight, Info, ShieldCheck, Star, X } from "lucide-react";
import Card from "./Card";

const META = {
  "bear call spread": { outlook:"Bearish", risk:"Defined", complexity:"Beginner–Intermediate", best:"You expect NIFTY to stay below resistance.", why:"Benefits from a bearish-to-neutral view while keeping maximum loss defined.", legs:"Sell a call near resistance and buy a higher-strike call for protection." },
  "bull put spread": { outlook:"Bullish", risk:"Defined", complexity:"Beginner–Intermediate", best:"You expect NIFTY to hold above support.", why:"Benefits from a bullish-to-neutral view while keeping maximum loss defined.", legs:"Sell a put near support and buy a lower-strike put for protection." },
  "iron condor": { outlook:"Neutral / Range", risk:"Defined", complexity:"Intermediate", best:"You expect price to remain between major support and resistance.", why:"Designed for range-bound markets where both support and resistance are expected to hold.", legs:"Combine a bull put spread below support with a bear call spread above resistance." },
  "credit spread": { outlook:"Directional", risk:"Defined", complexity:"Beginner–Intermediate", best:"You have a directional bias and want defined risk.", why:"A defined-risk premium-selling structure; choose the bullish or bearish version based on market bias.", legs:"Use a Bull Put Spread for bullish bias or Bear Call Spread for bearish bias." },
  "credit spreads": { outlook:"Directional", risk:"Defined", complexity:"Beginner–Intermediate", best:"You have a directional bias and want defined risk.", why:"A defined-risk premium-selling structure; choose the bullish or bearish version based on market bias.", legs:"Use a Bull Put Spread for bullish bias or Bear Call Spread for bearish bias." },
};

export default function StrategyEnvironment({ data, regime, entry }) {
  const [selected, setSelected] = useState(null);
  const strategies = data ?? {};
  const bias = getBias(regime);
  const ranked = useMemo(() => rankStrategies(strategies, bias), [strategies, bias.label]);
  const entryStatus = String(entry?.status ?? "WAIT").toUpperCase();

  return (
    <Card title="STRATEGY ENVIRONMENT" className="strategy-card">
      <div className={`strategy-bias ${bias.cls}`}><span>MARKET BIAS</span><strong>{bias.label}</strong></div>
      <span className="subheading">RECOMMENDED STRATEGIES</span>
      {ranked.length ? <div className="strategy-decision-list">
        {ranked.map((item, index) => <button key={item.name} className={`strategy-decision ${index === 0 ? "top-pick" : "alternative"}`} onClick={() => setSelected(item)}>
          <div className="strategy-decision-head"><span>{index === 0 && <Star size={12} fill="currentColor" />} {item.name}</span><strong>{item.score}% MATCH</strong></div>
          <div className="strategy-decision-tags"><span>{item.meta.outlook}</span><span>{item.meta.risk} risk</span><span>{item.meta.complexity}</span></div>
          <div className="strategy-decision-foot"><small>{index === 0 ? "TOP PICK" : "ALTERNATIVE"}</small><span>WHY THIS? <ChevronRight size={12}/></span></div>
        </button>)}
      </div> : <div className="strategy-empty">No strategy recommendations available.</div>}
      {ranked[0] && <div className="strategy-entry-link"><Info size={13}/><span><strong>{entryStatus.includes("READY") ? "READY" : entryStatus}</strong> for current conditions · Top pick: <b>{ranked[0].name}</b></span></div>}
      {selected && <StrategyDrawer item={selected} bias={bias} entry={entry} onClose={() => setSelected(null)} />}
    </Card>
  );
}

function StrategyDrawer({ item, bias, entry, onClose }) {
  const ready = String(entry?.status ?? "WAIT").toUpperCase();
  return <div className="strategy-modal-backdrop" onClick={onClose}><section className="strategy-drawer" onClick={e=>e.stopPropagation()}>
    <button className="strategy-drawer-close" onClick={onClose}><X size={18}/></button>
    <div className="strategy-drawer-kicker"><Star size={14}/> RECOMMENDED SETUP</div><h2>{item.name}</h2>
    <p className="strategy-drawer-summary">{item.meta.why}</p>
    <div className="strategy-detail-grid"><div><span>OUTLOOK</span><strong>{item.meta.outlook}</strong></div><div><span>RISK</span><strong>{item.meta.risk}</strong></div><div><span>COMPLEXITY</span><strong>{item.meta.complexity}</strong></div><div><span>SUITABILITY</span><strong>{item.score}% match</strong></div></div>
    <div className="strategy-explain"><h3>Why this strategy?</h3><p>Current market bias is <b>{bias.label}</b>. {item.meta.best}</p></div>
    <div className="strategy-explain"><h3>How it works</h3><p>{item.meta.legs}</p></div>
    <div className={`strategy-entry-callout ${ready.includes("READY") ? "ready" : ready.includes("WAIT") ? "wait" : "no-entry"}`}><ShieldCheck size={20}/><div><span>ENTRY STATUS</span><strong>{ready}</strong><small>{ready.includes("READY") ? "Current entry conditions are satisfied." : "Wait for the dashboard entry conditions before opening the setup."}</small></div></div>
    <p className="strategy-disclaimer">Strategy guidance is based on current dashboard signals. Exact strikes, premiums, breakeven, max profit and max loss should only be shown when reliable live option prices are available.</p>
  </section></div>;
}

function getBias(regime) {
  const direction = String(regime?.direction ?? regime?.final_regime ?? "NEUTRAL").toLowerCase();
  const score = Number(regime?.score ?? 50);
  if (direction.includes("bear")) return score <= 35 ? {label:"STRONG BEARISH",cls:"strong-bearish",side:"bear"}:{label:"MILD BEARISH",cls:"mild-bearish",side:"bear"};
  if (direction.includes("bull")) return score >= 65 ? {label:"STRONG BULLISH",cls:"strong-bullish",side:"bull"}:{label:"MILD BULLISH",cls:"mild-bullish",side:"bull"};
  return {label:"NEUTRAL",cls:"neutral-bias",side:"neutral"};
}

function rankStrategies(data, bias) {
  const preferred=[...new Set(Array.isArray(data?.preferred)?data.preferred:[])];
  const neutral=[...new Set(Array.isArray(data?.neutral)?data.neutral:[])].filter(x=>!preferred.includes(x));
  const all=[...preferred.map(name=>({name,base:78})),...neutral.map(name=>({name,base:62}))];
  return all.map(x=>{ const key=x.name.toLowerCase(); let bonus=0; if(bias.side==="bear"&&key.includes("bear call")) bonus=12; if(bias.side==="bull"&&key.includes("bull put")) bonus=12; if(bias.side==="neutral"&&key.includes("iron condor")) bonus=12; if(key.includes("credit")) bonus+=3; return {...x,score:Math.min(95,x.base+bonus),meta:META[key]??{outlook:"Market dependent",risk:"Defined by setup",complexity:"Intermediate",best:"The current market conditions match this strategy profile.",why:"This strategy is included by the dashboard recommendation engine for the current regime.",legs:"Review the option legs and risk limits before entry."}}}).sort((a,b)=>b.score-a.score);
}
