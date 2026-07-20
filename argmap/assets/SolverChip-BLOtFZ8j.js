import{u as i,j as a,t as l}from"./index-CqK36WFN.js";function c({id:n}){var o;const e=i(s=>s.index.get(n));if(!e||e.solved===null)return null;const t=e.spectator===!0,r=`solved ${t?"delivered conditional (refinement)":e.kind==="statement"?"marginal":"in-force rate"} ${e.solved.toFixed(3)}`+(e.authored!==null?`
authored ${e.authored.toFixed(3)} — ${t?"gap":"tension"} ${((o=e.delta)==null?void 0:o.toFixed(3))??"—"}`:`
this line authors no number`)+(t?`
Folded line: the solve used its refinement instead; the gap is a report, not a solver tension.`:"")+`
Solved in-browser (experimental) — not an authored number, not part of the document.`;return a.jsx("span",{className:"chip chip--solved"+(t?" chip--spectator":""),style:{color:t?"var(--text-dim)":l(e.delta)},title:r,children:e.solved.toFixed(2)})}export{c as default};
