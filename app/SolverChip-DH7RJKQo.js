import{w as l,j as d,Q as u}from"./index-Dd-kWj0v.js";import{m as c}from"./micro-pair-DOjW3m8r.js";const h={authored:"authored",solved:"solved"};function v({id:n,vocab:r}){var o;const e=l(a=>a.index.get(n));if(!e||e.solved===null)return null;const t=e.spectator===!0,i=t?"delivered conditional (refinement)":e.kind==="statement"?"marginal":"in-force rate",s=`${c(r??h,e.authored!==null?e.authored.toFixed(2):null,e.solved.toFixed(2),t)}
solved ${i} ${e.solved.toFixed(3)}`+(e.authored!==null?`
authored ${e.authored.toFixed(3)}, ${t?"gap":"tension"} ${((o=e.delta)==null?void 0:o.toFixed(3))??"—"}`:`
this line authors no number`)+(t?`
Folded line: the solve used its refinement instead; the gap is a report, not a solver tension.`:"")+`
Solved in-browser (experimental): not an authored number, not part of the document.`;return d.jsx("span",{className:"chip chip--solved"+(t?" chip--spectator":""),style:{color:t?"var(--text-dim)":u(e.delta)},title:s,children:e.solved.toFixed(2)})}export{v as default};
