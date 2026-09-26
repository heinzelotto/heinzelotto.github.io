import{o as F,u as x,b8 as O,ep as C,eq as E,n as g,er as T,es as b,et as N,eu as D,ev as R,ew as y,ex as _,ey as j,ez as B,eA as P,eB as w,eC as z,aQ as I,eD as U,eE as W,eF as q,eG as G,em as H}from"./styles-Dmz-CoyX.js";const M=I.en;function V({id:n,vocab:k}){var h,p,v,m;const e=F(s=>s.index.get(n)),$=x(s=>s.analysis.statements),t=x(s=>s.analysis.byId.get(n)),A=O(s=>s.overrides[n]),o=C(n),r=E(n);if(o!==null)return g.jsx("span",{className:"chip chip--solved chip--silent",title:o,children:"—"});if(!e||e.solved===null)return null;const i=(t==null?void 0:t.kind)==="evidence"&&t.strength?T(A,e.authored,t.strength.value,((h=t.strength.opposed)==null?void 0:h.value)??null,b(t.children)):null,c=(t==null?void 0:t.kind)==="evidence"&&i?N(D(t.trailingComment,i.strength,i.opposed)):(t==null?void 0:t.kind)==="statement"&&t.marginal?R(y(t.marginal.value,((p=t.marginal.opposed)==null?void 0:p.value)??null)):null,l=e.spectator===!0,a=e.kind==="statement"&&e.authored===null&&!l?_($).get(n)??null:null,u=a===null?null:Math.abs(j(a,e.solved)),S=l?B:e.kind==="statement"?"marginal":"in-force rate",d=((v=e.set)==null?void 0:v.shape)==="pair"?P(e.set):e.authored!==null?e.authored.toFixed(2):null,L=u??w(e),f=`${z(k??M,d,e.solved.toFixed(2),l)}
implied ${S} ${e.solved.toFixed(3)}`+(e.authored!==null?`
authored ${d}, ${e.set?U(e.solved,e.set):`tension ${((m=e.delta)==null?void 0:m.toFixed(3))??"—"}`}`:a!==null?`
authors’ check ${W(a)}, badge ${u.toFixed(3)}`+(a.lo===a.hi?"":" (zero inside the check interval)"):`
this line authors no number`)+(l?`
${q}`:"")+(c!==null?`
${c}`:"")+(r!==null?`
${r}`:"")+`
${G}`;return g.jsx("span",{className:"chip chip--solved"+(l?" chip--spectator":""),style:{color:H(L,"var(--text-dim-bench)")},title:f,children:e.solved.toFixed(2)})}export{V as default};
