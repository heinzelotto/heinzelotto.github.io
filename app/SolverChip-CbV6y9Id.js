import{ac as l,bq as d,j as u,bm as c,br as m}from"./index-DHKZFJfF.js";import{m as p}from"./micro-pair-Dbqf27rG.js";const h=m.en;function f({id:n,vocab:i}){var o;const e=l(a=>a.index.get(n));if(!e||e.solved===null)return null;const t=e.spectator===!0,r=t?"delivered conditional (refinement)":e.kind==="statement"?"marginal":"in-force rate",s=`${p(i??h,e.authored!==null?e.authored.toFixed(2):null,e.solved.toFixed(2),t)}
implied ${r} ${e.solved.toFixed(3)}`+(e.authored!==null?`
authored ${e.authored.toFixed(3)}, ${t?"gap":"tension"} ${((o=e.delta)==null?void 0:o.toFixed(3))??"—"}`:`
this line authors no number`)+(t?`
Folded line: the solve used its refinement instead; the gap is a report, not a solver tension.`:"")+`
${d}`;return u.jsx("span",{className:"chip chip--solved"+(t?" chip--spectator":""),style:{color:t?"var(--text-dim)":c(e.delta)},title:s,children:e.solved.toFixed(2)})}export{f as default};
