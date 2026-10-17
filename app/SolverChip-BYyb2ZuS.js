import{z as f,u as m,a as C,eu as E,ev as O,q as x,ew as T,ex as N,ey as b,ez as D,eA as R,eB as y,eC as _,eD as j,eE as z,eF as B,eG as I,eH as P,aL as w,eI as G,eJ as H,eK as U,eL as W,er as q}from"./styles-GTAm8I87.js";const J=w.en;function M({id:a,vocab:g}){var d,h,p,v;const e=f(n=>n.index.get(a)),k=m(n=>n.analysis.statements),t=m(n=>n.analysis.byId.get(a)),L=C(n=>n.overrides[a]),o=E(a),r=O(a);if(o!==null)return x.jsx("span",{className:"chip chip--solved chip--silent",title:o,children:"—"});if(!e||e.solved===null)return null;const i=(t==null?void 0:t.kind)==="evidence"&&t.strength?T(L,e.authored,t.strength.value,((d=t.strength.opposed)==null?void 0:d.value)??null,N(t.children)):null,c=(t==null?void 0:t.kind)==="evidence"&&i?b(D(t.trailingComment,i.strength,i.opposed)):(t==null?void 0:t.kind)==="statement"&&t.marginal?R(y(t.marginal.value,((h=t.marginal.opposed)==null?void 0:h.value)??null)):null,l=e.spectator===!0,s=e.kind==="statement"&&e.authored===null&&!l?_(k).get(a)??null:null,$=s===null?null:Math.abs(j(s,e.solved)),A=l?z:e.kind==="statement"?"marginal":"in-force rate",u=((p=e.set)==null?void 0:p.shape)==="pair"?B(e.set):e.authored!==null?e.authored.toFixed(2):null,S=I(e,s),F=`${P(g??J,u,e.solved.toFixed(2),l)}
implied ${A} ${e.solved.toFixed(3)}`+(e.authored!==null?`
authored ${u}, ${e.set?G(e.solved,e.set):`tension ${((v=e.delta)==null?void 0:v.toFixed(3))??"—"}`}`:s!==null?`
authors’ check ${H(s)}, badge ${$.toFixed(3)}`+(s.lo===s.hi?"":" (zero inside the check interval)"):`
this reasoning link authors no number`)+(l?`
${U}`:"")+(c!==null?`
${c}`:"")+(r!==null?`
${r}`:"")+`
${W}`;return x.jsx("span",{className:"chip chip--solved"+(l?" chip--spectator":""),style:{color:q(S,"var(--text-dim-bench)")},title:F,children:e.solved.toFixed(2)})}export{M as default};
