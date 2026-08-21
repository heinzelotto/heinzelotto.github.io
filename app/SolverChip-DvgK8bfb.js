import{u as l,bH as d,bI as u,j as c,bD as h,bJ as p}from"./index-Bnrgwg2p.js";const m=p.en;function x({id:n,vocab:i}){var o;const e=l(a=>a.index.get(n));if(!e||e.solved===null)return null;const t=e.spectator===!0,s=t?"delivered conditional (refinement)":e.kind==="statement"?"marginal":"in-force rate",r=`${d(i??m,e.authored!==null?e.authored.toFixed(2):null,e.solved.toFixed(2),t)}
implied ${s} ${e.solved.toFixed(3)}`+(e.authored!==null?`
authored ${e.authored.toFixed(3)}, ${t?"gap":"tension"} ${((o=e.delta)==null?void 0:o.toFixed(3))??"—"}`:`
this line authors no number`)+(t?`
Folded line: the solve used its refinement instead; the gap is a report, not a solver tension.`:"")+`
${u}`;return c.jsx("span",{className:"chip chip--solved"+(t?" chip--spectator":""),style:{color:t?"var(--text-dim)":h(e.delta)},title:r,children:e.solved.toFixed(2)})}export{x as default};
