import { Chess } from "chess.js";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const THEMES = { red:["Red","#e0525d"], green:["Green","#5fd0a1"], blue:["Blue","#80a9ff"], yellow:["Yellow","#f0c45e"] };
const PIECES = { wk:"♔",wq:"♕",wr:"♖",wb:"♗",wn:"♘",wp:"♙",bk:"♚",bq:"♛",br:"♜",bb:"♝",bn:"♞",bp:"♟" };
const lessons = [
 {title:"The board & piece movement",level:"FOUNDATIONS",minutes:5,body:"Learn how every piece moves before trying to calculate combinations. The knight is the only piece that jumps; every other piece needs a clear path.",question:"Which piece can jump over other pieces?",choices:["Bishop","Knight","Rook"],answer:1,why:"The knight moves in an L-shape and can jump over occupied squares."},
 {title:"King safety comes first",level:"FOUNDATIONS",minutes:7,body:"Before every move, ask: is my king safe? Castling often tucks the king away and connects your rooks. Never make a move that leaves your king in check.",question:"What must be true for castling to be legal?",choices:["The king is not in check and the path is clear and safe","Your queen has been captured","You must be ahead in material"],answer:0,why:"Castling has strict king, rook, path, and attack-square requirements."},
 {title:"Loose pieces drop off",level:"TACTICS",minutes:8,body:"An undefended piece can become a target. Before moving, scan every opponent capture and ask whether your piece is defended. After your opponent moves, look for newly undefended pieces.",question:"What should you check before leaving a piece on a square?",choices:["Whether it looks active","Whether it can be captured and whether it is defended","Only whether it attacks the queen"],answer:1,why:"Threats and defenders matter more than appearance."},
 {title:"Checks, captures, threats",level:"TACTICS",minutes:10,body:"At each turn, examine forcing moves in this order: checks, captures, and direct threats. Calculate the opponent's strongest reply instead of stopping at your own idea.",question:"Which candidate moves should you inspect first?",choices:["Quiet pawn moves","Checks, captures, and threats","Moves toward the edge"],answer:1,why:"Forcing moves limit the opponent's replies and are easier to calculate."},
 {title:"Calculate to a stable position",level:"CALCULATION",minutes:12,body:"Visualize the whole line: your candidate, the opponent's best response, and your next move. Stop when the position becomes stable, then evaluate king safety, material, and piece activity.",question:"When should you stop calculating a line?",choices:["After your first move","When you find a move you like","When the position becomes stable enough to evaluate"],answer:2,why:"A line is only useful when you have considered the opponent's best resistance."},
 {title:"Convert an advantage",level:"STRATEGY",minutes:12,body:"When ahead, reduce counterplay. Trade pieces when it helps, improve your worst-placed piece, and avoid unnecessary complications. Winning positions still require accurate decisions.",question:"When you are clearly ahead, what is usually a sound priority?",choices:["Give away material for activity","Reduce counterplay and improve your position","Attack regardless of the opponent's threats"],answer:1,why:"A stable advantage is easier to convert when the opponent has fewer active chances."}
];
const el = (tag, cls, text="") => { const n=document.createElement(tag); if(cls)n.className=cls; if(text)n.textContent=text; return n; };
const esc = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const path = () => location.pathname.replace(/\/$/,"") || "/";
const app = () => document.querySelector("#app");
const header = () => '<header class="topbar"><a class="brand" href="/" aria-label="FreeChess home"><b>♞</b><span>FreeChess<small>PLAY YOUR WAY</small></span></a><nav><a href="/play">Vs bot</a><a href="/import">Import</a><a href="/online">Human</a><a href="/learn">Learn</a><a href="/analysis">Analysis</a></nav><a class="install-btn" href="/login">Account</a></header>';
const footer = () => '<footer class="site-footer"><div class="footer-main"><div class="footer-brand"><span class="footer-mark">♞</span><div><strong>FreeChess</strong><small>THINK DEEPLY. PLAY KINDLY.</small></div></div><p class="footer-intro">A quiet place for big moves. Play, study, review and improve one thoughtful move at a time.</p><a class="footer-cta" href="/play">Start a game <span>↗</span></a></div><div class="footer-columns"><div><h3>PLAY</h3><a href="/play">Vs bot</a><a href="/online">Human match</a><a href="/import">Import PGN / FEN</a></div><div><h3>IMPROVE</h3><a href="/learn">Guided lessons</a><a href="/analysis">Game analysis</a><a href="/login">Save progress</a></div><div><h3>PROJECT</h3><a href="https://github.com/avada-kedavra62442/FreeChess" target="_blank" rel="noreferrer">Open source on GitHub ↗</a><span>Free to play. No account required for local games.</span></div></div><div class="footer-bottom"><span>© '+new Date().getFullYear()+' FreeChess</span><span>Your local games stay on this device.</span><small class="engine-disclaimer">Chess engine: Stockfish · GPL-3.0</small></div></footer>';
function shell(title, subtitle, body) { app().innerHTML=header()+'<main class="page-wrap feature-page"><a class="back-link" href="/">← FreeChess home</a><div class="eyebrow">FREECHESS / '+esc(title.toUpperCase())+'</div><h1>'+title+'</h1><p class="feature-subtitle">'+subtitle+'</p><div class="feature-body">'+body+'</div></main>'+footer(); document.documentElement.dataset.theme=localStorage.getItem("fc-theme")||"green"; }
function note(message, good=false) { const n=document.querySelector("#featureNotice"); if(n){n.textContent=message;n.className="feature-notice "+(good?"good":"");} }
async function currentUser(){ if(!supabase)return null; const {data}=await supabase.auth.getUser(); return data?.user||null; }
async function saveProgress(key, value){ const local=JSON.parse(localStorage.getItem("fc-progress")||"{}");local[key]=value;localStorage.setItem("fc-progress",JSON.stringify(local));if(supabase){const user=await currentUser();if(user)await supabase.from("user_progress").upsert({user_id:user.id,progress_key:key,progress_value:value,updated_at:new Date().toISOString()},{onConflict:"user_id,progress_key"});} }
async function getProgress(){let p=JSON.parse(localStorage.getItem("fc-progress")||"{}");if(supabase){const user=await currentUser();if(user){const {data}=await supabase.from("user_progress").select("progress_key,progress_value").eq("user_id",user.id);if(data)for(const row of data)p[row.progress_key]=row.progress_value;}}return p;}
function goToPlay(fen,pgn){const params=new URLSearchParams();if(fen)params.set("fen",fen);if(pgn)params.set("pgn",pgn);location.href="/play"+(params.size?"?"+params.toString():"");}

function importPage(){
 shell("Continue any game","Paste a PGN game or a FEN position. FreeChess will restore the position so you can continue playing from the middle.",'<section class="feature-card"><div class="feature-tabs"><button class="feature-tab active" data-import-tab="pgn">Paste PGN</button><button class="feature-tab" data-import-tab="fen">Paste FEN</button></div><label class="field-label" for="importText" id="importLabel">PGN notation</label><textarea id="importText" rows="8" placeholder="[Event \"Casual Game\"]&#10;1. e4 e5 2. Nf3 Nc6 3. Bb5 a6"></textarea><div class="feature-actions"><button class="primary-btn" id="loadPosition">Load position ↗</button><button class="secondary-btn" id="pasteSample">Use sample</button></div><p id="featureNotice" class="feature-notice" role="status"></p></section><section id="importPreview" class="feature-card" hidden></section>');
 let mode="pgn";const area=document.querySelector("#importText"),label=document.querySelector("#importLabel");
 document.querySelectorAll("[data-import-tab]").forEach(b=>b.onclick=()=>{mode=b.dataset.importTab;document.querySelectorAll("[data-import-tab]").forEach(x=>x.classList.toggle("active",x===b));label.textContent=mode==="pgn"?"PGN notation":"FEN position";area.placeholder=mode==="pgn"?"[Event \"Casual Game\"]\n1. e4 e5 2. Nf3 Nc6":"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";});
 document.querySelector("#pasteSample").onclick=()=>{area.value=mode==="pgn"?'[Event "Casual Game"]\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6':'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2';};
 document.querySelector("#loadPosition").onclick=()=>{try{const text=area.value.trim();if(!text)throw new Error("Paste a PGN or FEN first.");const chess=new Chess();if(mode==="fen")chess.load(text);else chess.loadPgn(text);const fen=chess.fen(),pgn=chess.pgn();const preview=document.querySelector("#importPreview");preview.hidden=false;preview.innerHTML='<h2>Position ready</h2><p>'+chess.history().length+' half-moves loaded. Side to move: <strong>'+(chess.turn()==="w"?"White":"Black")+'</strong>.</p><div class="fen-box">'+esc(fen)+'</div><div class="feature-actions"><button class="primary-btn" id="continueImported">Continue this game ↗</button><button class="secondary-btn" id="saveImported">Save position on this device</button></div>';document.querySelector("#continueImported").onclick=()=>goToPlay(fen,pgn);document.querySelector("#saveImported").onclick=()=>{localStorage.setItem("fc-imported-game",JSON.stringify({fen,pgn,at:Date.now()}));note("Position saved in this browser.",true);};note("Valid "+mode.toUpperCase()+" loaded successfully.",true);}catch(e){note("Could not load that "+mode.toUpperCase()+": "+e.message);}};
}

function learnPage(){
 shell("Train with purpose","A structured curriculum: fundamentals first, then tactics, calculation, and positional play. Finish a lesson, answer its checkpoint, and build a consistent practice habit.",'<div class="learning-progress"><div><span>YOUR CURRICULUM</span><strong id="lessonProgress">0 / '+lessons.length+' completed</strong></div><div class="progress-track"><i id="lessonBar"></i></div></div><div class="lesson-grid" id="lessonGrid"></div><section class="feature-card lesson-detail" id="lessonDetail"><div class="eyebrow">START HERE</div><h2>Small steps compound.</h2><p>Choose a lesson to begin. Spend a few minutes understanding the idea, answer the checkpoint, then try to spot it in your next game.</p></section>');
 let chosen=0,progress={};getProgress().then(p=>{progress=p.lessons||{};drawLessons();showLesson(0);});
 function drawLessons(){document.querySelector("#lessonGrid").innerHTML=lessons.map((l,i)=>'<button class="lesson-card '+(progress[i]?"completed":"")+'" data-lesson="'+i+'"><span class="lesson-number">'+String(i+1).padStart(2,"0")+'</span><span class="lesson-level">'+l.level+'</span><strong>'+l.title+'</strong><small>'+l.minutes+' min · '+(progress[i]?"Completed ✓":"Lesson")+'</small></button>').join("");document.querySelectorAll("[data-lesson]").forEach(b=>b.onclick=()=>showLesson(+b.dataset.lesson));const n=Object.values(progress).filter(Boolean).length;document.querySelector("#lessonProgress").textContent=n+" / "+lessons.length+" completed";document.querySelector("#lessonBar").style.width=(n/lessons.length*100)+"%";}
 function showLesson(i){chosen=i;const l=lessons[i],d=document.querySelector("#lessonDetail");d.innerHTML='<div class="eyebrow">'+l.level+' / LESSON '+(i+1)+'</div><h2>'+l.title+'</h2><p>'+l.body+'</p><div class="lesson-check"><strong>Checkpoint</strong><p>'+l.question+'</p><div class="lesson-choices">'+l.choices.map((c,j)=>'<button data-answer="'+j+'">'+c+'</button>').join("")+'</div><p id="lessonFeedback" class="feature-notice"></p><button id="completeLesson" class="primary-btn" '+(progress[i]?'':'disabled')+'>'+(progress[i]?"Completed ✓":"Complete lesson")+'</button></div>';document.querySelectorAll("[data-answer]").forEach(b=>b.onclick=()=>{const ok=+b.dataset.answer===l.answer;const feedback=document.querySelector("#lessonFeedback");feedback.textContent=(ok?"Correct. ":"Not quite. ")+l.why;feedback.className="feature-notice "+(ok?"good":"");if(ok){progress[i]=true;saveProgress("lessons",progress).then(drawLessons);document.querySelector("#completeLesson").disabled=false;document.querySelector("#completeLesson").textContent="Completed ✓";}});document.querySelector("#completeLesson").onclick=()=>{if(progress[i]){if(chosen<lessons.length-1)showLesson(chosen+1);}};}
}

function authPage(signup=false){
 const title=signup?"Create your account":"Welcome back";
 shell(title,signup?"Save your games, learning streak, preferences and progress across devices.":"Sign in to pick up where you left off.",'<section class="auth-card feature-card"><div class="auth-mark">♞</div><div id="authConfigNotice" class="feature-notice"></div><form id="authForm"><label class="field-label" for="authEmail">Email address</label><input id="authEmail" type="email" autocomplete="email" required placeholder="you@example.com"><label class="field-label" for="authPassword">Password</label><input id="authPassword" type="password" autocomplete="'+(signup?"new-password":"current-password")+'" minlength="8" required placeholder="At least 8 characters">'+(signup?'<label class="field-label" for="authName">Display name (optional)</label><input id="authName" type="text" autocomplete="nickname" placeholder="How should we call you?">':'')+'<button class="primary-btn full-btn" type="submit">'+(signup?"Create account":"Sign in")+'</button></form><div class="auth-divider"><span>OR CONTINUE WITH</span></div><div class="oauth-row"><button id="googleAuth" class="secondary-btn">G Continue with Google</button><button id="appleAuth" class="secondary-btn"> Continue with Apple</button></div><p id="authNotice" class="feature-notice" role="status"></p><p class="auth-switch">'+(signup?'Already have an account? <a href="/login">Sign in</a>':'New to FreeChess? <a href="/signup">Create an account</a>')+'</p><small class="auth-privacy">Your account is managed securely by Supabase Auth. FreeChess never stores raw passwords.</small></section>');
 const config=document.querySelector("#authConfigNotice");
 if(!supabase){config.textContent="Account sign-in is ready to connect, but the Supabase project keys are not configured in this deployment yet. Local games and lessons still work on this device.";return;}
 config.textContent="Email/password, Google and Apple sign-in are available when enabled in the connected Supabase project.";
 document.querySelector("#authForm").onsubmit=async e=>{e.preventDefault();const notice=document.querySelector("#authNotice"),email=document.querySelector("#authEmail").value,password=document.querySelector("#authPassword").value;notice.textContent="Working…";try{let result;if(signup)result=await supabase.auth.signUp({email,password,options:{data:{display_name:document.querySelector("#authName").value.trim()}}});else result=await supabase.auth.signInWithPassword({email,password});if(result.error)throw result.error;notice.textContent=signup?"Account created. Check your email if confirmation is enabled.":"Signed in successfully.";notice.className="feature-notice good";if(!signup&&result.data.session)setTimeout(()=>location.href="/",700);}catch(err){notice.textContent=err.message;notice.className="feature-notice";}};
 async function oauth(provider){const notice=document.querySelector("#authNotice");if(!supabase)return;notice.textContent="Redirecting to "+provider+"…";const {error}=await supabase.auth.signInWithOAuth({provider,options:{redirectTo:location.origin}});if(error){notice.textContent=error.message;}}
 document.querySelector("#googleAuth").onclick=()=>oauth("google");document.querySelector("#appleAuth").onclick=()=>oauth("apple");
}

function onlinePage(){
 const params=new URLSearchParams(location.search);let room=params.get("room")||"",channel=null,chess=new Chess(),color="w",selected=null,legal=[],connected=false,players=0;
 shell("Play another human","Create a private room, share its link, and play a real-time game with a friend. Both players need the same FreeChess deployment and a configured account backend.",'<section class="feature-card online-lobby" id="onlineLobby"><h2>Start a human match</h2><p>One click creates a room code. Send the room link to your opponent.</p><div class="feature-actions"><button class="primary-btn" id="createRoom">Create room ↗</button><input id="roomCode" maxlength="8" placeholder="ROOM CODE" value="'+esc(room)+'"><button class="secondary-btn" id="joinRoom">Join room</button></div><p id="featureNotice" class="feature-notice" role="status"></p></section><section id="onlineGame" class="feature-card" hidden></section>');
 if(!supabase){note("Online rooms need the Supabase URL/key configured in Vercel and the SQL setup applied. The lobby UI is ready; real-time sync is disabled until then.");document.querySelector("#createRoom").disabled=true;document.querySelector("#joinRoom").disabled=true;return;}
 document.querySelector("#createRoom").onclick=()=>{room=Math.random().toString(36).slice(2,8).toUpperCase();location.href="/online?room="+room;};
 document.querySelector("#joinRoom").onclick=()=>{const code=document.querySelector("#roomCode").value.trim().toUpperCase();if(!/^[A-Z0-9]{4,8}$/.test(code)){note("Enter a room code with 4–8 letters or numbers.");return;}location.href="/online?room="+code;};
 if(!room)return;
 startRoom();
 async function startRoom(){document.querySelector("#onlineLobby").hidden=true;const user=await currentUser();if(!user){document.querySelector("#onlineLobby").hidden=false;note("Sign in first so your room can assign a stable player identity.");return;}room=room.toUpperCase();document.querySelector("#onlineGame").hidden=false;document.querySelector("#onlineGame").innerHTML='<div class="online-top"><div><span class="eyebrow">ROOM CODE</span><strong>'+esc(room)+'</strong></div><button class="secondary-btn" id="copyRoom">Copy invite link</button></div><p id="onlineStatus" class="feature-notice">Connecting to room…</p><div class="online-layout"><div class="online-board" id="onlineBoard"></div><aside><h3 id="onlineTurn">Waiting for opponent</h3><p id="onlinePlayers">Connecting players…</p><div id="onlineMoves" class="move-list"></div><button id="onlineReset" class="secondary-btn">New game</button></aside></div>';
 document.querySelector("#copyRoom").onclick=async()=>{await navigator.clipboard?.writeText(location.href);document.querySelector("#onlineStatus").textContent="Invite link copied.";};
 document.querySelector("#onlineReset").onclick=()=>{if(color==="w"){chess=new Chess();broadcastState();draw();}};
 const state=()=>({fen:chess.fen(),pgn:chess.pgn(),turn:chess.turn(),history:chess.history()});
 function broadcastState(){channel?.send({type:"broadcast",event:"position",payload:{...state(),by:user.id}});}
 function draw(){const b=document.querySelector("#onlineBoard");if(!b)return;b.innerHTML=chess.board().map((row,r)=>row.map((p,f)=>{const sq="abcdefgh"[f]+(8-r);return '<button class="square '+((r+f)%2?"dark":"light")+'" data-online-sq="'+sq+'">'+(p?'<span class="piece '+(p.color==="w"?"white-piece":"black-piece")+'">'+PIECES[p.color+p.type]+'</span>':'')+'</button>';}).join("")).join("");b.querySelectorAll("[data-online-sq]").forEach(btn=>btn.onclick=()=>moveSquare(btn.dataset.onlineSq));document.querySelector("#onlineTurn").textContent=chess.isGameOver()?"Game over":(chess.turn()===color?"Your turn":"Opponent’s turn");document.querySelector("#onlineMoves").textContent=chess.history().join(" ");document.querySelector("#onlinePlayers").textContent="You play "+(color==="w"?"White":"Black")+". Room "+room;}
 function moveSquare(sq){if(chess.turn()!==color||chess.isGameOver())return;try{if(selected){const m=chess.move({from:selected,to:sq,promotion:"q"});if(m){selected=null;broadcastState();draw();return;}}const p=chess.get(sq);selected=p&&p.color===color?sq:null;if(selected){legal=chess.moves({square:selected,verbose:true});document.querySelector("#onlineStatus").textContent="Selected "+selected.toUpperCase()+". Choose a destination.";}}catch{}}
 channel=supabase.channel("freechess-room-"+room,{config:{presence:{key:user.id},broadcast:{self:false}}});
 channel.on("presence",{event:"sync"},()=>{const state=channel.presenceState();const ids=Object.keys(state);players=ids.length;color=ids[0]===user.id?"w":"b";if(players===1&&color==="w")broadcastState();document.querySelector("#onlineStatus").textContent=players>=2?"Opponent connected — game ready.":"Room created. Waiting for your opponent to join…";draw();});
 channel.on("broadcast",{event:"position"},({payload})=>{if(payload.by===user.id)return;try{chess.load(payload.fen);draw();}catch{}});
 channel.subscribe(async status=>{if(status==="SUBSCRIBED"){connected=true;await channel.track({user_id:user.id,joined_at:new Date().toISOString()});document.querySelector("#onlineStatus").textContent="Connected. Share the invite link with your opponent.";draw();}else if(status==="CHANNEL_ERROR"||status==="TIMED_OUT")document.querySelector("#onlineStatus").textContent="Could not connect to this room. Check your Supabase Realtime settings.";});
 }
}

function analysisPage(){
 shell("Understand every move","Review a PGN with Stockfish-powered candidate moves and a centipawn-loss estimate. Analysis runs in your browser; longer games take more time.",'<section class="feature-card"><label class="field-label" for="analysisPgn">Paste game PGN</label><textarea id="analysisPgn" rows="7" placeholder="1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 ..."></textarea><div class="feature-actions"><button id="runAnalysis" class="primary-btn">Analyze game ↗</button><button id="sampleAnalysis" class="secondary-btn">Load sample game</button></div><p id="featureNotice" class="feature-notice" role="status"></p></section><section id="analysisResults" class="feature-card" hidden></section>');
 document.querySelector("#sampleAnalysis").onclick=()=>document.querySelector("#analysisPgn").value='[Event "Sample"]\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6';
 document.querySelector("#runAnalysis").onclick=async()=>{const text=document.querySelector("#analysisPgn").value.trim();if(!text){note("Paste a PGN first.");return;}let game;try{game=new Chess();game.loadPgn(text);}catch(e){note("PGN could not be parsed: "+e.message);return;}const moves=game.history({verbose:true});if(!moves.length){note("No moves were found in that PGN.");return;}const results=document.querySelector("#analysisResults");results.hidden=false;results.innerHTML='<h2>Analyzing '+moves.length+' half-moves…</h2><p id="analysisProgress">Preparing Stockfish…</p><div class="progress-track"><i id="analysisBar"></i></div><div id="analysisRows"></div>';const button=document.querySelector("#runAnalysis");button.disabled=true;try{const rows=await engineReview(text,(done,total)=>{document.querySelector("#analysisProgress").textContent="Analyzing move "+done+" of "+total+"…";document.querySelector("#analysisBar").style.width=(done/total*100)+"%";});const list=document.querySelector("#analysisRows");list.innerHTML=rows.map((r,i)=>'<div class="analysis-row"><span class="analysis-number">'+(i+1)+'. '+(i%2===0?"White":"Black")+'</span><strong class="analysis-grade '+r.kind.toLowerCase()+'">'+esc(r.kind)+'</strong><span class="analysis-san">'+esc(r.played)+'</span><span class="analysis-alternative">Engine: '+esc(r.best)+'</span><small>'+esc(r.explanation)+'</small></div>').join("");note("Analysis complete. Best-move comparison is an engine aid, not an official rating.",true);saveProgress("last-analysis",{pgn:text,at:Date.now(),moves:rows.length});}catch(e){note("Analysis stopped: "+e.message+" If Stockfish cannot load, retry after the deployment finishes.");}finally{button.disabled=false;}};
}
function engineReview(pgn,onProgress){
 return new Promise((resolve,reject)=>{
  let worker;
  try{worker=new Worker("/engine/stockfish-19-lite-single.js");}catch(e){reject(e);return;}
  const parsed=new Chess();
  try{parsed.loadPgn(pgn);}catch(e){worker.terminate();reject(e);return;}
  const history=parsed.history({verbose:true}),snapshots=[],replay=new Chess();
  for(const move of history){snapshots.push({fen:replay.fen(),move});replay.move(move);}
  let index=0,phase="boot",bestUci="",score=null,scoreBefore=0,timeout=null,finished=false;
  const rows=[];
  const finishError=err=>{if(finished)return;finished=true;clearTimeout(timeout);worker.terminate();reject(err);};
  const armTimeout=()=>{clearTimeout(timeout);timeout=setTimeout(()=>finishError(new Error("Stockfish timed out")),25000);};
  const search=(fen,nextPhase)=>{phase=nextPhase;score=null;worker.postMessage("position fen "+fen);worker.postMessage("go depth 10");armTimeout();};
  const sanFor=(uci,fen)=>{try{const probe=new Chess(fen);const move=probe.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]||"q"});return move?move.san:uci;}catch{return uci;}};
  const uciFor=move=>move.from+move.to+(move.promotion||"");
  const startNext=()=>{if(index>=history.length){if(!finished){finished=true;clearTimeout(timeout);worker.terminate();resolve(rows);}return;}search(snapshots[index].fen,"before");};
  worker.onmessage=e=>{
   const line=String(e.data||"").trim();
   if(line==="uciok"){worker.postMessage("setoption name Threads value 1");worker.postMessage("setoption name Hash value 32");worker.postMessage("isready");return;}
   if(line==="readyok"){startNext();return;}
   const cp=line.match(/\\bscore cp (-?\\d+)/);if(cp)score=Number(cp[1]);
   const mate=line.match(/\\bscore mate (-?\\d+)/);if(mate)score=Math.sign(Number(mate[1]))*10000;
   const best=line.match(/^bestmove\\s+(\\S+)/);if(!best)return;
   clearTimeout(timeout);
   if(phase==="before"){
    bestUci=best[1];scoreBefore=score??0;
    const after=new Chess(snapshots[index].fen);after.move(snapshots[index].move);
    search(after.fen(),"after");return;
   }
   if(phase==="after"){
    const actual=snapshots[index].move,loss=scoreBefore-(-(score??0)),isTop=bestUci===uciFor(actual);
    let kind;
    if(isTop&&loss<70)kind="Perfect";else if(loss>=300)kind="Blunder";else if(loss>=150)kind="Mistake";else if(loss>=70)kind="Inaccuracy";else kind="Good";
    rows.push({played:actual.san,best:sanFor(bestUci,snapshots[index].fen),kind,explanation:kind==="Perfect"?"Matched Stockfish’s top move at this search depth.":kind==="Blunder"?"Large evaluation loss. Review the opponent’s strongest reply and the tactical idea missed.":kind==="Mistake"?"A substantially stronger continuation was available.":kind==="Inaccuracy"?"A more precise move could preserve more of the position’s value.":"A reasonable move with a relatively small evaluation loss."});
    index++;onProgress(index,history.length);startNext();
   }
  };
  worker.onerror=()=>finishError(new Error("Stockfish worker could not load"));
  armTimeout();worker.postMessage("uci");
 });
}

let gameSaveTimer=null;
export function persistGameProgress(game){
 const games=JSON.parse(localStorage.getItem("fc-saved-games")||"[]");
 games.unshift({...game,savedAt:new Date().toISOString()});
 const dedup=games.filter((item,i)=>i===0||item.pgn!==games[0].pgn).slice(0,30);
 localStorage.setItem("fc-saved-games",JSON.stringify(dedup));
 clearTimeout(gameSaveTimer);
 gameSaveTimer=setTimeout(()=>saveProgress("games",dedup),1000);
}
export async function persistPreferences(preferences){
 localStorage.setItem("fc-theme",preferences.theme||"green");
 localStorage.setItem("fc-elo",String(preferences.elo||800));
 if(supabase){const user=await currentUser();if(user){const {error}=await supabase.from("user_progress").upsert({user_id:user.id,progress_key:"preferences",progress_value:preferences,updated_at:new Date().toISOString()},{onConflict:"user_id,progress_key"});if(error)console.warn("Could not sync FreeChess preferences:",error.message);}}
}
export async function hydratePreferences(){
 if(!supabase)return null;
 try{const user=await currentUser();if(!user)return null;const {data,error}=await supabase.from("user_progress").select("progress_value").eq("user_id",user.id).eq("progress_key","preferences").maybeSingle();if(error){console.warn("Could not load FreeChess preferences:",error.message);return null;}return data?.progress_value||null;}catch{return null;}
}

export function renderFeatureRoute(pathname){
 const routes={"/import":importPage,"/learn":learnPage,"/online":onlinePage,"/analysis":analysisPage,"/login":()=>authPage(false),"/signup":()=>authPage(true)};
 if(!routes[pathname])return false;routes[pathname]();return true;
}
