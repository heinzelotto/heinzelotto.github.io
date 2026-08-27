import{n as u,u as h,dO as m,dP as p,dQ as v,aJ as x,dR as k,br as $,m as f,bs as g}from"./styles-DrJDwz0d.js";const F=x.en;function C({id:s,vocab:i}){var l;const e=u(o=>o.index.get(s)),r=h(o=>o.analysis.statements);if(!e||e.solved===null)return null;const t=e.spectator===!0,n=e.kind==="statement"&&e.authored===null&&!t?m(r).get(s)??null:null,a=n===null?null:Math.abs(p(n,e.solved)),d=t?"delivered conditional (refinement)":e.kind==="statement"?"marginal":"in-force rate",c=`${v(i??F,e.authored!==null?e.authored.toFixed(2):null,e.solved.toFixed(2),t)}
implied ${d} ${e.solved.toFixed(3)}`+(e.authored!==null?`
authored ${e.authored.toFixed(3)}, ${t?"gap":"tension"} ${((l=e.delta)==null?void 0:l.toFixed(3))??"—"}`:n!==null?`
authors’ check ${k(n)}, badge ${a.toFixed(3)}`+(n.lo===n.hi?"":" (zero inside the check interval)"):`
this line authors no number`)+(t?`
Folded line: the solve used its refinement instead; the gap is a report, not a solver tension.`:"")+`
${$}`;return f.jsx("span",{className:"chip chip--solved"+(t?" chip--spectator":""),style:{color:t?"var(--text-dim)":g(a??e.delta)},title:c,children:e.solved.toFixed(2)})}export{C as default};
