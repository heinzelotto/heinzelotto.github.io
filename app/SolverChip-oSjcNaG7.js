import{o as F,u as x,Q as L,e2 as O,e3 as f,e4 as S,e5 as T,e6 as C,e7 as E,e8 as N,e9 as R,ea as y,eb as D,bv as _,ec as P,aM as j,bx as z,ed as B,by as I,bz as M,n as W,bA as w}from"./styles-CerbxqUf.js";const H=j.en;function U({id:o,vocab:p}){var c,u,h,v,m;const e=F(n=>n.index.get(o)),g=x(n=>n.analysis.statements),t=x(n=>n.analysis.byId.get(o)),b=L(n=>n.overrides[o]);if(!e||e.solved===null)return null;const i=(t==null?void 0:t.kind)==="evidence"&&t.strength?O(b,e.authored,t.strength.value,((c=t.strength.opposed)==null?void 0:c.value)??null,f(t.children)):null,l=(t==null?void 0:t.kind)==="evidence"&&i?S(T(t.trailingComment,i.strength,i.opposed)):(t==null?void 0:t.kind)==="statement"&&t.marginal?C(E(t.marginal.value,((u=t.marginal.opposed)==null?void 0:u.value)??null)):null,s=e.spectator===!0,a=e.kind==="statement"&&e.authored===null&&!s?N(g).get(o)??null:null,r=a===null?null:Math.abs(R(a,e.solved)),$=s?y:e.kind==="statement"?"marginal":"in-force rate",d=((h=e.set)==null?void 0:h.shape)==="pair"?D(e.set):e.authored!==null?e.authored.toFixed(2):null,k=r??_(e),A=`${P(p??H,d,e.solved.toFixed(2),s)}
implied ${$} ${e.solved.toFixed(3)}`+(e.authored!==null?s?`
authored ${e.authored.toFixed(3)}, gap ${((v=e.delta)==null?void 0:v.toFixed(3))??"—"}`:`
authored ${d}, ${e.set?z(e.solved,e.set):`tension ${((m=e.delta)==null?void 0:m.toFixed(3))??"—"}`}`:a!==null?`
authors’ check ${B(a)}, badge ${r.toFixed(3)}`+(a.lo===a.hi?"":" (zero inside the check interval)"):`
this line authors no number`)+(s?`
${I}`:"")+(l!==null?`
${l}`:"")+`
${M}`;return W.jsx("span",{className:"chip chip--solved"+(s?" chip--spectator":""),style:{color:s?"var(--text-dim-bench)":w(k,"var(--text-dim-bench)")},title:A,children:e.solved.toFixed(2)})}export{U as default};
