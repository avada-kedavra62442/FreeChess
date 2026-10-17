import { Chess } from "chess.js";
import "./style.css";
const themes={red:["Red","#f16b65","#32191d"],green:["Green","#69d7a4","#102c24"],blue:["Blue","#7caeff","#14253e"],yellow:["Yellow","#f2c96b","#332b17"]};
const icons={wk:"♔",wq:"♕",wr:"♖",wb:"♗",wn:"♘",wp:"♙",bk:"♚",bq:"♛",br:"♜",bb:"♝",bn:"♞",bp:"♟"};
let house=localStorage.getItem("fc-theme")||"green",elo=+(new URLSearchParams(location.search).get("elo")||localStorage.getItem("fc-elo")||800),g=new Chess(),sel=null,targets=[],busy=false,last=null,flip=false;
const app=document.querySelector("#app"),onPlay=()=>location.pathname.replace(/\/$/,"")==="/play";
if(!themes[house])house="green";if(themes[new URLSearchParams(location.search).get("theme")])house=new URLSearchParams(location.search).get("theme");elo=Math.max(100,Math.min(3000,Math.round(elo/100)*100));
function paint(){document.documentElement.dataset.theme=house;document.documentElement.style.setProperty("--accent",themes[house][1]);document.documentElement.style.setProperty("--house-deep",themes[house][2]);}
function header(){return '<header class="topbar"><a class="brand" href="/"><b>♞</b><span>free<span>chess</span><small>PLAY YOUR WAY</small></span></a><nav><a href="/">Discover</a><a href="/play">Play chess</a></nav><button id="install" class="install-btn">↥ Install app</button></header>'}
function footer(){return '<footer class="footer"><span>♞ FREECHESS · THINK DEEPLY. PLAY KINDLY.</span><span>Free forever · Your games stay on this device.</span></footer>'}
let deferredPrompt=null;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;});function install(){document.querySelector("#install").onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;}else if(/iphone|ipad|ipod/i.test(navigator.userAgent)){alert("In Safari, tap Share, then Add to Home Screen.");}else{alert("Use your browser's Install app option when available.");}};}
function home(){paint();app.innerHTML=header()+'<main class="page-wrap home"><section class="hero"><div><div class="eyebrow">● YOUR BOARD. YOUR RULES.</div><h1>Find your<br><em>next move.</em></h1><p>A little strategy. A little focus. A chess partner that meets you where you are — from first pawn to grandmaster ambition.</p><div class="hero-actions"><a class="primary-btn" href="#themes">Choose a theme ↗</a><a class="text-link" href="/play">Jump into a game →</a></div><div class="trust-row">◈ 30 strength levels　 ◈ 4 dark themes　 ◈ 100% private</div></div><div class="hero-art"><div class="art-ring"></div><div class="floating-piece">♛</div><div class="floating-knight">♞</div><div class="art-caption">THE QUIET ART OF<br><b>THINKING AHEAD.</b></div></div></section><section id="themes" class="section"><div class="section-heading"><div><div class="eyebrow">01 / PICK YOUR COLOURS</div><h2>Four themes. <em>One board.</em></h2></div><p>Four dark, calm color themes made for focus. Pick the atmosphere that gets you in the zone.</p></div><div class="theme-grid" id="themeGrid"></div></section><section class="section"><div class="section-heading"><div><div class="eyebrow">02 / SET THE CHALLENGE</div><h2>Your pace. <em>Your opponent.</em></h2></div><p>Choose a target rating from 100 to 3000. Every 100 points, a new step in the journey.</p></div><div class="glass strength-panel"><div class="strength-main"><div><span class="eyebrow">BOT TARGET ELO</span><div id="eloValue" class="elo-value">'+elo.toLocaleString()+'</div><small id="eloDesc">A thoughtful sparring partner</small></div><input id="eloRange" type="range" min="100" max="3000" step="100" value="'+elo+'"><div class="range-labels"><span>100 · Beginner</span><span>1500 · Club</span><span>3000 · Elite</span></div></div><div class="elo-presets">'+[300,600,900,1200,1500,2000,2500,3000].map(n=>'<button data-elo="'+n+'">'+n+'</button>').join("")+'</div><div class="strength-bottom"><span>● '+themes[house][0]+' theme selected</span><button class="primary-btn" id="start">Enter the board →</button></div></div></section><section class="manifesto"><span>“</span><p>The goal isn\'t to play a perfect game.<br><em>It\'s to play a more thoughtful one.</em></p><small>NO ACCOUNTS. NO ADS. JUST CHESS.</small></section></main>'+footer();install();document.querySelector("#themeGrid").innerHTML=Object.entries(themes).map(([k,v])=>'<button class="theme-card '+(house===k?'chosen':'')+'" data-house="'+k+'" style="--card-accent:'+v[1]+';--card-deep:'+v[2]+'"><span class="theme-symbol">'+({red:"✦",green:"◇",blue:"✧",yellow:"☼"}[k])+'</span><span class="theme-label">DARK THEME</span><strong>'+v[0]+'</strong><span>'+({red:"Warm, bold, and focused.",green:"Calm, balanced, and natural.",blue:"Cool, clear, and composed.",yellow:"Soft, warm, and optimistic."}[k])+'</span><i class="theme-check">'+(house===k?"✓":"↗")+'</i></button>').join("");document.querySelectorAll("[data-house]").forEach(b=>b.onclick=()=>{house=b.dataset.house;localStorage.setItem("fc-theme",house);home();document.querySelector("#themes").scrollIntoView({behavior:"smooth"});});const range=document.querySelector("#eloRange");range.oninput=()=>{elo=+range.value;localStorage.setItem("fc-elo",elo);updateElo();};document.querySelectorAll("[data-elo]").forEach(b=>b.onclick=()=>{elo=+b.dataset.elo;range.value=elo;localStorage.setItem("fc-elo",elo);updateElo();});document.querySelector("#start").onclick=()=>location.href="/play?elo="+elo+"&theme="+house;}
function updateElo(){document.querySelector("#eloValue").textContent=elo.toLocaleString();document.querySelector("#eloDesc").textContent=elo<500?"A gentle first opponent":elo<1000?"A thoughtful sparring partner":elo<1600?"A steady club challenge":elo<2200?"A sharp tactical mind":elo<2800?"An uncompromising strategist":"Elite-level target";document.querySelectorAll("[data-elo]").forEach(b=>b.classList.toggle("chosen",+b.dataset.elo===elo));}
function play(){paint();g=new Chess();sel=null;targets=[];last=null;busy=false;flip=false;app.innerHTML=header()+'<main class="page-wrap play-wrap"><div class="play-heading"><div><a class="back-link" href="/">← Back to your sanctuary</a><div class="eyebrow">THE BOARD IS YOURS</div><h1>Make it <em>count.</em></h1><p>A quiet mind sees the whole board.</p></div><div class="game-controls"><label>BOT TARGET ELO<select id="gameElo">'+Array.from({length:30},(_,i)=>(i+1)*100).map(n=>'<option value="'+n+'" '+(n===elo?'selected':'')+'>'+n+' Elo</option>').join("")+'</select></label><button class="icon-btn" id="flip">⇅</button><button class="icon-btn" id="new">↻</button></div></div><div class="game-layout"><section class="board-column"><div class="player-strip"><b class="avatar">♞</b><div><strong>FreeChess Bot</strong><small>'+themes[house][0]+' · '+elo+' target Elo</small></div><span class="elo-pill">'+elo+'</span></div><div class="board-frame"><div class="board" id="board" role="grid" aria-label="Chess board"></div></div><div class="player-strip"><b class="avatar you">♙</b><div><strong>You</strong><small>White pieces · Your move</small></div><span class="turn-pill" id="turn">YOUR TURN</span></div><div class="board-foot">● GAME RUNS LOCALLY <span>Tap a piece, then a square</span></div></section><aside class="game-sidebar"><div class="glass status-card"><div class="eyebrow">● LIVE MATCH</div><h3 id="status">Your move.</h3><p id="detail">Select a piece to see its legal moves.</p><hr><div class="match-stat"><span>DIFFICULTY</span><b>'+elo+' ELO</b></div><div class="match-stat"><span>YOUR COLOUR</span><b>White ♙</b></div><div class="match-stat"><span>THEME</span><b>'+themes[house][0]+'</b></div><button class="primary-btn full-btn" id="restart">New game ↻</button></div><div class="glass moves-card"><div class="moves-header"><div class="eyebrow">THE STORY SO FAR<h3>Move history</h3></div><button class="undo-btn" id="undo">↶ Undo</button></div><div id="moves" class="move-list"></div></div><div class="privacy-note">◇ <div><b>Your game stays yours.</b><p>No account, no tracking, no cloud save.</p></div></div></aside></div></main>'+footer();install();document.querySelector("#gameElo").onchange=e=>{elo=+e.target.value;localStorage.setItem("fc-elo",elo);play();};document.querySelector("#flip").onclick=()=>{flip=!flip;draw();};document.querySelector("#new").onclick=reset;document.querySelector("#restart").onclick=reset;document.querySelector("#undo").onclick=undo;draw();moves();status();}
function reset(){g=new Chess();sel=null;targets=[];last=null;busy=false;draw();moves();status();}
function draw(){const el=document.querySelector("#board");if(!el)return;const board=g.board(),rs=flip?[0,1,2,3,4,5,6,7]:[7,6,5,4,3,2,1,0],fs=flip?[7,6,5,4,3,2,1,0]:[0,1,2,3,4,5,6,7];el.innerHTML=rs.map(r=>fs.map(f=>{const p=board[r][f],sq="abcdefgh"[f]+(r+1),legal=targets.some(m=>m.to===sq);return '<button class="square '+((r+f)%2?'light':'dark')+' '+(sel===sq?'selected ':'')+(legal?'legal ':'')+(legal&&p?'capture ':'')+(last&&(last.from===sq||last.to===sq)?'last-move':'')+'" data-sq="'+sq+'">'+(f===fs[0]?'<i class="rank">'+(r+1)+'</i>':'')+(r===rs[rs.length-1]?'<i class="file">'+"abcdefgh"[f]+'</i>':'')+(p?'<span class="piece '+(p.color==="w"?'white-piece':'black-piece')+'">'+icons[p.color+p.type]+'</span>':'')+(legal&&!p?'<i class="move-dot"></i>':'')+'</button>';}).join("")).join("");el.querySelectorAll("[data-sq]").forEach(b=>b.onclick=()=>square(b.dataset.sq));}
function square(sq){if(busy||g.isGameOver()||g.turn()!=="w")return;const p=g.get(sq);if(sel&&targets.some(m=>m.to===sq)){const m=g.move({from:sel,to:sq,promotion:"q"});if(m){last={from:m.from,to:m.to};sel=null;targets=[];busy=true;draw();moves();status();setTimeout(botMove,80);return;}}if(p&&p.color==="w"){sel=sq;targets=g.moves({square:sq,verbose:true});}else{sel=null;targets=[];}draw();}
const val={p:100,n:320,b:330,r:500,q:900,k:20000};
function evaluate(){let s=0;g.board().forEach((row,r)=>row.forEach((p,f)=>{if(!p)return;const sign=p.color==="w"?1:-1,adv=p.color==="w"?r:7-r,center=Math.abs(3.5-r)+Math.abs(3.5-f);s+=sign*(val[p.type]+(p.type==="p"?adv*7:0)+(p.type==="n"?(7-center)*6:p.type==="b"?(7-center)*3:0));}));return s;}
function moveOrder(moves){
  return moves.sort((a,b)=>{
    const score=m=>((m.captured?10*val[m.captured]-val[m.piece]:0)+(m.promotion?800+val[m.promotion]:0)+(m.san&&m.san.includes("+")?35:0)+(m.san&&m.san.includes("#")?100000:0));
    return score(b)-score(a);
  });
}
function search(d,a,b,max,ctx){
  if(++ctx.nodes>ctx.limit)throw new Error("search-limit");
  if(g.isCheckmate())return max?-100000-d:100000+d;
  if(g.isDraw())return 0;
  if(d<=0)return quiescence(a,b,max,ctx,0);
  const alphaStart=a,betaStart=b;
  const key=g.fen()+"|"+d+"|"+(max?"m":"n"),cached=ctx.tt.get(key);
  if(cached){
    if(cached.flag==="exact")return cached.score;
    if(cached.flag==="lower")a=Math.max(a,cached.score);
    else if(cached.flag==="upper")b=Math.min(b,cached.score);
    if(a>=b)return cached.score;
  }
  const ms=moveOrder(g.moves({verbose:true}));let best=max?-Infinity:Infinity;
  for(const m of ms){
    g.move(m);let v;try{v=search(d-1,a,b,!max,ctx);}finally{g.undo();}
    if(max){best=Math.max(best,v);a=Math.max(a,best);}else{best=Math.min(best,v);b=Math.min(b,best);}
    if(b<=a)break;
  }
  if(ctx.tt.size<50000){
    const flag=best<=alphaStart?"upper":best>=betaStart?"lower":"exact";
    ctx.tt.set(key,{score:best,flag});
  }
  return best;
}
function quiescence(a,b,max,ctx,ply){
  if(++ctx.nodes>ctx.limit)throw new Error("search-limit");
  if(g.isCheckmate())return max?-100000:100000;
  if(g.isDraw())return 0;
  const inCheck=g.isCheck(),stand=evaluate();
  if(ply>=4)return stand;
  let best=stand;
  if(!inCheck){
    if(max){if(stand>=b)return b;a=Math.max(a,stand);}
    else{if(stand<=a)return a;b=Math.min(b,stand);}
  }else best=max?-Infinity:Infinity;
  const candidates=moveOrder(g.moves({verbose:true}).filter(m=>inCheck||m.captured||m.promotion));
  for(const m of candidates){
    g.move(m);let v;try{v=quiescence(a,b,!max,ctx,ply+1);}finally{g.undo();}
    if(max){best=Math.max(best,v);a=Math.max(a,best);}else{best=Math.min(best,v);b=Math.min(b,best);}
    if(b<=a)break;
  }
  return best;
}
function choose(){
  const all=g.moves({verbose:true});
  if(all.length<2)return all[0];
  const ctx={nodes:0,limit:elo<500?2500:elo<1000?9000:elo<1800?22000:elo<2500?40000:65000,tt:new Map()};
  let ranked=all.map(m=>({m,s:0}));
  const maxDepth=elo<400?1:elo<1000?2:elo<2000?3:4;
  for(let depth=1;depth<=maxDepth;depth++){
    try{
      const next=[];let beta=Infinity;
      for(const item of ranked){
        g.move(item.m);
        let score;try{score=search(depth-1,-Infinity,beta,g.turn()==="w",ctx);}finally{g.undo();}
        next.push({m:item.m,s:score});
        if(score<beta)beta=score;
      }
      next.sort((a,b)=>a.s-b.s);ranked=next;
    }catch(e){break;}
    if(ctx.nodes>=ctx.limit)break;
  }
  const noise=elo<200?.65:elo<400?.35:elo<700?.16:elo<1000?.08:elo<1500?.035:elo<2200?.012:.001;
  return ranked[Math.floor(Math.random()*Math.max(1,Math.ceil(ranked.length*noise)))].m;
}
function botMove(){
  if(!busy||g.isGameOver())return;
  try{
    const m=choose();
    if(m){const d=g.move({from:m.from,to:m.to,promotion:m.promotion||"q"});last={from:d.from,to:d.to};}
  }catch(err){
    console.error("FreeChess bot move failed:",err);
    const fallback=g.moves({verbose:true})[0];
    if(fallback){const d=g.move({from:fallback.from,to:fallback.to,promotion:fallback.promotion||"q"});last={from:d.from,to:d.to};}
  }finally{
    busy=false;sel=null;targets=[];draw();moves();status();
  }
}
function moves(){const el=document.querySelector("#moves");if(!el)return;const a=g.history();el.innerHTML=a.length?Array.from({length:Math.ceil(a.length/2)},(_,i)=>'<div class="move-row"><span>'+(i+1)+'.</span><b>'+a[i*2]+'</b><b>'+(a[i*2+1]||'·')+'</b></div>').join(""):'<p class="empty-moves">Your first move is waiting.</p>';}
function undo(){if(busy||!g.history().length)return;g.undo();if(g.turn()==="b"&&g.history().length)g.undo();last=null;sel=null;targets=[];draw();moves();status();}
function status(){const s=document.querySelector("#status"),d=document.querySelector("#detail"),t=document.querySelector("#turn");if(!s)return;s.textContent=g.isCheckmate()?(g.turn()==="w"?"Checkmate — bot wins.":"Checkmate — you win!"):g.isStalemate()?"Draw by stalemate.":g.isDraw()?"Game drawn.":busy?"Bot is thinking…":g.isCheck()?"Check!":"Your move.";d.textContent=g.isGameOver()?"Start a new game whenever you're ready.":busy?"Finding a move for this position.":g.isCheck()?"Your king is under attack.":"Select a piece to see its legal moves.";t.textContent=g.isGameOver()?"GAME OVER":busy?"BOT THINKING":"YOUR TURN";}
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));window.addEventListener("popstate",()=>onPlay()?play():home());if(onPlay())play();else home();