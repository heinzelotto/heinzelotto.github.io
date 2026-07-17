import{u as l,j as s}from"./index-D4NtXO6K.js";import{t as i}from"./tension-tint-DVf6BUK6.js";function h({id:o}){var t;const e=l(r=>r.index.get(o));if(!e||e.solved===null)return null;const n=`solved ${e.kind==="statement"?"marginal":"in-force rate"} ${e.solved.toFixed(3)}`+(e.authored!==null?`
authored ${e.authored.toFixed(3)} — tension ${((t=e.delta)==null?void 0:t.toFixed(3))??"—"}`:`
this line authors no number`)+`
Solved in-browser (experimental) — not an authored number, not part of the document.`;return s.jsx("span",{className:"chip chip--solved",style:{color:i(e.delta)},title:n,children:e.solved.toFixed(2)})}export{h as default};
