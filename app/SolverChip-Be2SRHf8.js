import{o as O,u as x,b7 as C,en as E,eo as F,n as g,ep as T,eq as b,er as N,es as D,et as R,eu as y,ev as _,ew as P,ex as j,ey as B,ez as w,eA as z,aP as I,eB as U,eC as W,eD as q,eE as H,ek as M}from"./styles-CMOla6tx.js";const V=I.en;function J({id:n,vocab:k}){var h,p,v,m;const e=O(s=>s.index.get(n)),$=x(s=>s.analysis.statements),t=x(s=>s.analysis.byId.get(n)),A=C(s=>s.overrides[n]),o=E(n),r=F(n);if(o!==null)return g.jsx("span",{className:"chip chip--solved chip--silent",title:o,children:"—"});if(!e||e.solved===null)return null;const i=(t==null?void 0:t.kind)==="evidence"&&t.strength?T(A,e.authored,t.strength.value,((h=t.strength.opposed)==null?void 0:h.value)??null,b(t.children)):null,c=(t==null?void 0:t.kind)==="evidence"&&i?N(D(t.trailingComment,i.strength,i.opposed)):(t==null?void 0:t.kind)==="statement"&&t.marginal?R(y(t.marginal.value,((p=t.marginal.opposed)==null?void 0:p.value)??null)):null,l=e.spectator===!0,a=e.kind==="statement"&&e.authored===null&&!l?_($).get(n)??null:null,u=a===null?null:Math.abs(P(a,e.solved)),S=l?j:e.kind==="statement"?"marginal":"in-force rate",d=((v=e.set)==null?void 0:v.shape)==="pair"?B(e.set):e.authored!==null?e.authored.toFixed(2):null,L=u??w(e),f=`${z(k??V,d,e.solved.toFixed(2),l)}
implied ${S} ${e.solved.toFixed(3)}`+(e.authored!==null?`
authored ${d}, ${e.set?U(e.solved,e.set):`tension ${((m=e.delta)==null?void 0:m.toFixed(3))??"—"}`}`:a!==null?`
authors’ check ${W(a)}, badge ${u.toFixed(3)}`+(a.lo===a.hi?"":" (zero inside the check interval)"):`
this line authors no number`)+(l?`
${q}`:"")+(c!==null?`
${c}`:"")+(r!==null?`
${r}`:"")+`
${H}`;return g.jsx("span",{className:"chip chip--solved"+(l?" chip--spectator":""),style:{color:M(L,"var(--text-dim-bench)")},title:f,children:e.solved.toFixed(2)})}export{J as default};
