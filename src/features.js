import { Chess } from "chess.js";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const PIECES = { wk:"♔",wq:"♕",wr:"♖",wb:"♗",wn:"♘",wp:"♙",bk:"♚",bq:"♛",br:"♜",bb:"♝",bn:"♞",bp:"♟" };
const el = (tag, cls, text="") => { const n=document.createElement(tag); if(cls)n.className=cls; if(text)n.textContent=text; return n; };
const esc = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const path = () => location.pathname.replace(/\/$/,"") || "/";
const app = () => document.querySelector("#app");
const header = () => '<header class="topbar"><a class="brand" href="/" aria-label="FreeChess home"><b>♞</b><span>FreeChess<small>PLAY YOUR WAY</small></span></a><nav><a href="/play">Vs bot</a><a href="/import">Import</a><a href="/online">Human</a><a href="/analysis">Analysis</a></nav><a class="install-btn" href="/account">Account</a></header>';
const footer = () => '<footer class="site-footer"><div class="footer-main"><div class="footer-brand"><span class="footer-mark">♞</span><div><strong>FreeChess</strong><small>THINK DEEPLY. PLAY KINDLY.</small></div></div><p class="footer-intro">A quiet place for big moves. Play, review and enjoy chess with people or a worthy opponent.</p><a class="footer-cta" href="/play">Start a game <span>↗</span></a></div><div class="footer-columns"><div><h3>PLAY</h3><a href="/play">Vs bot</a><a href="/online">Human match</a><a href="/import">Import PGN / FEN</a></div><div><h3>YOUR GAME</h3><a href="/analysis">Game analysis</a><a href="/account">Saved games</a><a href="/login">Account</a></div><div><h3>PROJECT</h3><a href="https://github.com/avada-kedavra62442/FreeChess" target="_blank" rel="noreferrer">Open source on GitHub ↗</a><span>Free to play. No ads. No subscription.</span></div></div><div class="footer-bottom"><span>© '+new Date().getFullYear()+' FreeChess</span><span>Your local games stay on this device.</span><small class="engine-disclaimer">Chess engine: Stockfish · GPL-3.0</small></div></footer>';
function shell(title, subtitle, body) { app().innerHTML=header()+'<main class="page-wrap feature-page"><a class="back-link" href="/">← FreeChess home</a><div class="eyebrow">FREECHESS / '+esc(title.toUpperCase())+'</div><h1>'+title+'</h1><p class="feature-subtitle">'+subtitle+'</p><div class="feature-body">'+body+'</div></main>'+footer(); document.documentElement.dataset.theme=localStorage.getItem("fc-theme")||"green"; }
function note(message, good=false) { const n=document.querySelector("#featureNotice"); if(n){n.textContent=message;n.className="feature-notice "+(good?"good":"");} }
async function currentUser(){ if(!supabase)return null; const {data}=await supabase.auth.getUser(); return data?.user||null; }
async function saveProgress(key, value){ const local=JSON.parse(localStorage.getItem("fc-progress")||"{}");local[key]=value;localStorage.setItem("fc-progress",JSON.stringify(local));if(supabase){const user=await currentUser();if(user)await supabase.from("user_progress").upsert({user_id:user.id,progress_key:key,progress_value:value,updated_at:new Date().toISOString()},{onConflict:"user_id,progress_key"});} }
async function getProgress(){let p=JSON.parse(localStorage.getItem("fc-progress")||"{}");if(supabase){const user=await currentUser();if(user){const {data}=await supabase.from("user_progress").select("progress_key,progress_value").eq("user_id",user.id);if(data)for(const row of data)p[row.progress_key]=row.progress_value;}}return p;}
function goToPlay(fen,pgn){const params=new URLSearchParams();if(pgn)params.set("pgn",pgn);else if(fen)params.set("fen",fen);location.href="/play"+(params.size?"?"+params.toString():"");}

function importPage(){
 shell("Continue any game","Paste a PGN game or a FEN position. FreeChess will restore the position so you can continue playing from the middle.",'<section class="feature-card"><div class="feature-tabs"><button class="feature-tab active" data-import-tab="pgn">Paste PGN</button><button class="feature-tab" data-import-tab="fen">Paste FEN</button></div><label class="field-label" for="importText" id="importLabel">PGN notation</label><textarea id="importText" rows="8" placeholder="[Event \"Casual Game\"]&#10;1. e4 e5 2. Nf3 Nc6 3. Bb5 a6"></textarea><div class="feature-actions"><button class="primary-btn" id="loadPosition">Load position ↗</button><button class="secondary-btn" id="pasteSample">Use sample</button></div><p id="featureNotice" class="feature-notice" role="status"></p></section><section id="importPreview" class="feature-card" hidden></section>');
 let mode="pgn";const area=document.querySelector("#importText"),label=document.querySelector("#importLabel");
 document.querySelectorAll("[data-import-tab]").forEach(b=>b.onclick=()=>{mode=b.dataset.importTab;document.querySelectorAll("[data-import-tab]").forEach(x=>x.classList.toggle("active",x===b));label.textContent=mode==="pgn"?"PGN notation":"FEN position";area.placeholder=mode==="pgn"?"[Event \"Casual Game\"]\n1. e4 e5 2. Nf3 Nc6":"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";});
 document.querySelector("#pasteSample").onclick=()=>{area.value=mode==="pgn"?'[Event "Casual Game"]\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6':'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2';};
 document.querySelector("#loadPosition").onclick=()=>{try{const text=area.value.trim();if(!text)throw new Error("Paste a PGN or FEN first.");const chess=new Chess();if(mode==="fen")chess.load(text);else chess.loadPgn(text);const fen=chess.fen(),pgn=chess.pgn();const preview=document.querySelector("#importPreview");preview.hidden=false;preview.innerHTML='<h2>Position ready</h2><p>'+chess.history().length+' half-moves loaded. Side to move: <strong>'+(chess.turn()==="w"?"White":"Black")+'</strong>.</p><div class="fen-box">'+esc(fen)+'</div><div class="feature-actions"><button class="primary-btn" id="continueImported">Continue this game ↗</button><button class="secondary-btn" id="saveImported">Save position on this device</button></div>';document.querySelector("#continueImported").onclick=()=>goToPlay(fen,pgn);document.querySelector("#saveImported").onclick=()=>{localStorage.setItem("fc-imported-game",JSON.stringify({fen,pgn,at:Date.now()}));note("Position saved in this browser.",true);};note("Valid "+mode.toUpperCase()+" loaded successfully.",true);}catch(e){note("Could not load that "+mode.toUpperCase()+": "+e.message);}};
}

function authPage(signup=false){
 const params=new URLSearchParams(location.search);
 const requested=params.get("next")||"/account";
 const next=requested.startsWith("/")&&!requested.startsWith("//")?requested:"/account";
 const title=signup?"Create your account":"Welcome back";
 shell(title,signup?"Create a FreeChess account to keep your games and preferences in sync.":"Sign in to continue your chess journey.",'<section class="auth-card feature-card"><div class="auth-brand"><span class="auth-mark">♞</span><span>FreeChess</span></div><p class="eyebrow">YOUR GAME. YOUR ACCOUNT.</p><h2 id="authTitle">'+(signup?"Create your account":"Welcome back.")+'</h2><p class="auth-copy">Sign in to sync your games and preferences across devices, or continue as a guest. Guest mode never requires an account.</p><form id="authForm"><label class="field-label" for="authEmail">Email address</label><input id="authEmail" type="email" autocomplete="email" required placeholder="you@example.com"><label class="field-label" for="authPassword">Password</label><input id="authPassword" type="password" autocomplete="'+(signup?"new-password":"current-password")+'" minlength="6" required placeholder="At least 6 characters"><div class="auth-buttons"><button class="auth-primary" id="authSubmit" type="submit">'+(signup?"Create account":"Sign in")+'</button><a class="auth-secondary" href="'+(signup?"/login":"/signup")+'?next='+encodeURIComponent(next)+'">'+(signup?"Sign in":"Create account")+'</a></div></form><div class="auth-divider"><span>OR CONTINUE WITH</span></div><button class="auth-provider-button auth-google-button" id="googleAuth" type="button"><span class="provider-logo">G</span><span>Continue with Google</span></button><button class="auth-provider-button auth-discord-button" id="discordAuth" type="button"><span class="provider-logo discord-mark">◉</span><span>Continue with Discord</span></button><p id="authNotice" class="auth-message" role="status"></p><button class="guest-mode-button" id="guestModeButton" type="button">Continue as guest <span>→</span></button><p class="auth-footnote">Free to play · No subscription · Your choice</p><small class="auth-privacy">Authentication is handled securely by Supabase. FreeChess never stores raw passwords.</small></section>');
 const notice=document.querySelector("#authNotice"),form=document.querySelector("#authForm");
 const say=(message,good=false)=>{notice.textContent=message;notice.className="auth-message"+(good?" good":"");};
 document.querySelector("#guestModeButton").onclick=()=>location.href=next.startsWith("/online")?"/":(next==="/account"?"/":next);
 if(!supabase){say("Accounts are not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the FreeChess Vercel project, then redeploy.");form.querySelectorAll("input,button").forEach(el=>el.disabled=true);document.querySelector("#googleAuth").disabled=true;document.querySelector("#discordAuth").disabled=true;return;}
 supabase.auth.getSession().then(({data})=>{if(data.session?.user)location.replace(next);});
 form.onsubmit=async event=>{event.preventDefault();const email=document.querySelector("#authEmail").value.trim(),password=document.querySelector("#authPassword").value;if(!email||password.length<6){say("Enter a valid email and a password with at least 6 characters.");return;}const submit=document.querySelector("#authSubmit");submit.disabled=true;say("Working…");try{const result=signup?await supabase.auth.signUp({email,password}):await supabase.auth.signInWithPassword({email,password});if(result.error)throw result.error;if(signup&&!result.data.session){say("Account created. Check your email to confirm, then sign in.",true);return;}say("Signed in. Your cloud account is ready.",true);location.replace(next);}catch(error){say(error.message||"Authentication failed. Please try again.");}finally{submit.disabled=false;}};
 async function oauth(provider,label){say("Redirecting to "+label+"…");const {error}=await supabase.auth.signInWithOAuth({provider,options:{redirectTo:location.origin+next}});if(error)say(error.message);}
 document.querySelector("#googleAuth").onclick=()=>oauth("google","Google");
 document.querySelector("#discordAuth").onclick=()=>oauth("discord","Discord");
}

function onlinePage(){
 const params=new URLSearchParams(location.search);
 let room=(params.get("room")||"").toUpperCase(),channel=null,chess=new Chess(),color=null,selected=null,legal=[],user=null,sessionKey=(globalThis.crypto?.randomUUID?.()||("guest-"+Date.now()+"-"+Math.random().toString(36).slice(2)));
 let members=[],lastPresenceCount=-1,roomReady=false,gameLocked=false;
 const hostMode=params.get("host")==="1";
 shell("Play another human","Create a room, share its invite link, and play a live game. Both players sign in with FreeChess accounts.",'<section class="feature-card online-lobby" id="onlineLobby"><h2>Start a human match</h2><p>Create a room and share its invite link, or enter a room code from a friend.</p><div class="feature-actions"><button class="primary-btn" id="createRoom">Create room ↗</button><input id="roomCode" maxlength="8" autocomplete="off" placeholder="ROOM CODE" value="'+esc(room)+'"><button class="secondary-btn" id="joinRoom">Join room</button></div><p id="featureNotice" class="feature-notice" role="status"></p></section><section id="onlineGame" class="feature-card online-game" hidden></section>');
 const createRoom=()=>{const code=Math.random().toString(36).slice(2,8).toUpperCase();location.href="/online?room="+code+"&host=1";};
 document.querySelector("#createRoom").onclick=async()=>{if(!supabase){note("Room play needs the FreeChess Supabase project configured in Vercel.");return;}const account=await currentUser();if(!account){location.href="/login?next="+encodeURIComponent("/online?create=1");return;}createRoom();};
 document.querySelector("#joinRoom").onclick=async()=>{const code=document.querySelector("#roomCode").value.trim().toUpperCase();if(!/^[A-Z0-9]{4,8}$/.test(code)){note("Enter a room code with 4–8 letters or numbers.");return;}if(!supabase){note("Room play needs the FreeChess Supabase project configured in Vercel.");return;}const account=await currentUser();if(!account){location.href="/login?next="+encodeURIComponent("/online?room="+code);return;}location.href="/online?room="+code;};
 if(params.get("create")==="1"){createRoom();return;}
 if(!room)return;
 if(!supabase){note("Online rooms are unavailable because the Supabase URL/key are not configured in the FreeChess Vercel project.");return;}
 if(!/^[A-Z0-9]{4,8}$/.test(room)){note("That room code is invalid. Use 4–8 letters or numbers.");return;}
 startRoom();
 async function startRoom(){
  user=await currentUser();
  if(!user){location.replace("/login?next="+encodeURIComponent(location.pathname+location.search));return;}
  document.querySelector("#onlineLobby").hidden=true;
  const game=document.querySelector("#onlineGame");game.hidden=false;
  game.innerHTML='<div class="online-top"><div><span class="eyebrow">ROOM CODE</span><strong>'+esc(room)+'</strong><small id="roomRole">Connecting…</small></div><button class="secondary-btn" id="copyRoom">Copy invite link</button></div><p id="onlineStatus" class="feature-notice">Connecting to room…</p><div class="online-layout"><div class="online-board" id="onlineBoard" aria-label="Live chess board"></div><aside class="online-aside"><h3 id="onlineTurn">Waiting for opponent</h3><p id="onlinePlayers">Connecting players…</p><div id="onlineMoves" class="move-list"></div><button id="onlineReset" class="secondary-btn">New game</button><button id="onlineAnalyze" class="secondary-btn">Analyze game ↗</button></aside></div>';
  const status=document.querySelector("#onlineStatus");
  const setStatus=(message,good=false)=>{status.textContent=message;status.className="feature-notice"+(good?" good":"");};
  document.querySelector("#copyRoom").onclick=async()=>{const invite=new URL(location.href);invite.searchParams.delete("host");const link=invite.toString();try{await navigator.clipboard.writeText(link);setStatus("Invite link copied. Send it to your opponent.",true);}catch{setStatus("Copy this invite link: "+link);}};
  document.querySelector("#onlineReset").onclick=async()=>{if(color!=="w"||!roomReady){setStatus("Only the room creator can start a new game.");return;}chess=new Chess();selected=null;legal=[];draw();await broadcastState();};
  document.querySelector("#onlineAnalyze").onclick=()=>location.href="/analysis?pgn="+encodeURIComponent(chess.pgn());
  function canPlay(){return roomReady&&!gameLocked&&color!==null&&members.length===2&&chess.turn()===color&&!chess.isGameOver();}
  function draw(){
   const board=document.querySelector("#onlineBoard");if(!board)return;
   const rows=chess.board(),rankOrder=color==="b"?[7,6,5,4,3,2,1,0]:[0,1,2,3,4,5,6,7],fileOrder=color==="b"?[7,6,5,4,3,2,1,0]:[0,1,2,3,4,5,6,7];
   board.innerHTML=rankOrder.map(r=>fileOrder.map(f=>{const piece=rows[r][f],square="abcdefgh"[f]+(8-r),target=legal.some(move=>move.to===square),capture=target&&!!piece;return '<button type="button" class="square '+((r+f)%2?"dark":"light")+(target?" legal ":"")+(capture?" capture ":"")+(selected===square?" selected":"")+'" data-online-sq="'+square+'" aria-label="'+square+(piece?" "+(piece.color==="w"?"White ":"Black ")+piece.type:"")+'">'+(piece?'<span class="piece '+(piece.color==="w"?"white-piece":"black-piece")+'">'+PIECES[piece.color+piece.type]+'</span>':(target?'<i class="move-dot"></i>':""))+'</button>';}).join("")).join("");
   board.querySelectorAll("[data-online-sq]").forEach(button=>button.onclick=()=>moveSquare(button.dataset.onlineSq));
   const turn=chess.isGameOver()?"Game over":(canPlay()?"Your turn":(color?"Opponent’s turn":"Waiting for a seat"));
   document.querySelector("#onlineTurn").textContent=turn;
   document.querySelector("#onlinePlayers").textContent=members.length+" / 2 players connected · "+(color==="w"?"White":color==="b"?"Black":"Spectator");
   document.querySelector("#onlineMoves").textContent=chess.history().join(" ")||"No moves yet";
   document.querySelector("#roomRole").textContent=color==="w"?"ROOM CREATOR · WHITE":color==="b"?"GUEST · BLACK":"SPECTATING";
   board.querySelectorAll("button").forEach(button=>button.disabled=!roomReady||!color||members.length!==2||gameLocked);
  }
  async function broadcastState(){
   if(!channel||!color||!roomReady)return;
   const payload={fen:chess.fen(),pgn:chess.pgn(),ply:chess.history().length,by:sessionKey,room};
   const result=await channel.send({type:"broadcast",event:"position",payload});
   if(result!=="ok"&&result?.status!=="ok")setStatus("Move saved locally, but the live update could not be confirmed. Reconnecting…");
   persistGameProgress({mode:"human",room,pgn:chess.pgn(),fen:chess.fen(),theme:localStorage.getItem("fc-theme")||"green"});
  }
  async function moveSquare(square){
   if(!canPlay())return;
   if(selected){
    try{const move=chess.move({from:selected,to:square,promotion:"q"});if(move){selected=null;legal=[];draw();setStatus(move.san+" played. Waiting for your opponent.",true);await broadcastState();return;}}catch{}
   }
   const piece=chess.get(square);
   if(piece&&piece.color===color){selected=square;legal=chess.moves({square,verbose:true});setStatus("Choose a highlighted legal destination.");}
   else{selected=null;legal=[];}
   draw();
  }
  const onPresence=()=>{
   const state=channel.presenceState();
   members=Object.values(state).flatMap(entries=>entries||[]);
   const me=members.find(member=>member.session_id===sessionKey);
   const host=members.find(member=>member.role==="host");
   const guests=members.filter(member=>member.role!=="host").sort((a,b)=>String(a.joined_at||"").localeCompare(String(b.joined_at||"")));
   color=me?.role==="host"?"w":(me&&guests[0]?.session_id===sessionKey?"b":null);
   roomReady=!!host&&members.length===2&&!!color;
   gameLocked=members.length>2||(!host&&members.length>0);
   if(members.length>2)setStatus("This room is full. Only two players can join.");
   else if(!host)setStatus("Waiting for the room creator to connect…");
   else if(members.length===1)setStatus("Room is open. Share the invite link with one opponent.");
   else if(roomReady)setStatus("Both players connected. White moves first.",true);
   else setStatus("Waiting for an available player seat…");
   draw();
   if(hostMode&&me?.role==="host"&&members.length<=2&&members.length!==lastPresenceCount){lastPresenceCount=members.length;broadcastState();}
  };
  channel=supabase.channel("freechess-room-"+room,{config:{presence:{key:sessionKey},broadcast:{self:false}}});
  channel.on("presence",{event:"sync"},onPresence);
  channel.on("broadcast",{event:"position"},({payload})=>{
   if(!payload||payload.by===sessionKey||payload.room!==room||typeof payload.fen!=="string")return;
   if(Number(payload.ply)<chess.history().length)return;
   try{chess.load(payload.fen);selected=null;legal=[];draw();setStatus(chess.isGameOver()?"Game over.":"Opponent played. Your move.",true);persistGameProgress({mode:"human",room,pgn:chess.pgn(),fen:chess.fen(),theme:localStorage.getItem("fc-theme")||"green"});}catch(error){setStatus("Received an invalid game position. The room was not updated.");}
  });
  channel.subscribe(async state=>{
   if(state==="SUBSCRIBED"){
    const trackStatus=await channel.track({session_id:sessionKey,user_id:user.id,role:hostMode?"host":"guest",joined_at:new Date().toISOString()});
    if(trackStatus!=="ok")setStatus("Could not register your player seat ("+trackStatus+"). Please reconnect.");
    else setStatus("Connected to the room. Syncing player seats…");
   }else if(state==="CHANNEL_ERROR"||state==="TIMED_OUT"||state==="CLOSED")setStatus("Room connection failed ("+state+"). Check Supabase Realtime is enabled and try again.");
  });
  window.addEventListener("pagehide",()=>{if(channel)supabase.removeChannel(channel);},{once:true});
 }
}

async function accountPage(){
 shell("Your account","Your chess identity, saved games and preferences.",'<section class="feature-card" id="accountPanel"><p>Loading account…</p></section><section class="feature-card"><h2>Recent games</h2><div id="accountGames"></div></section>');
 const user=await currentUser(),panel=document.querySelector("#accountPanel");
 let games=JSON.parse(localStorage.getItem("fc-saved-games")||"[]"),progress={};
 if(user){progress=await getProgress();if(Array.isArray(progress.games)){const merged=new Map();for(const game of [...progress.games,...games])if(game.gameId)merged.set(game.gameId,game);games=[...merged.values()].sort((a,b)=>new Date(b.savedAt||0)-new Date(a.savedAt||0)).slice(0,30);localStorage.setItem("fc-saved-games",JSON.stringify(games));}}
 document.querySelector("#accountGames").innerHTML=games.length?games.slice(0,8).map((game,i)=>'<div class="saved-game-row"><div><strong>'+(game.mode==="human"?"Human match":"Vs bot")+'</strong><small>'+(game.elo?game.elo+" Elo · ":"")+(game.savedAt?new Date(game.savedAt).toLocaleString():"Saved locally")+'</small></div><button class="secondary-btn" data-open-game="'+i+'">Continue / review</button></div>').join(""):'<p>No games saved yet. Your moves will appear here as you play.</p>';
 document.querySelectorAll("[data-open-game]").forEach(button=>button.onclick=()=>{const game=games[+button.dataset.openGame];if(game)goToPlay(game.fen,game.pgn);});
 if(!supabase){panel.innerHTML='<h2>Account setup needed</h2><p>Connect Supabase in Vercel to activate sign-in and cloud game sync.</p><a class="primary-btn" href="/login">Sign in / create account ↗</a>';return;}
 if(!user){panel.innerHTML='<h2>Save your games</h2><p>Sign in to sync your preferences and saved games between devices.</p><div class="feature-actions"><a class="primary-btn" href="/login">Sign in</a><a class="secondary-btn" href="/signup">Create an account</a></div>';return;}
 const preference=progress.preferences||{};
 panel.innerHTML='<div class="account-identity"><div class="auth-mark">♞</div><div><h2>'+esc(user.user_metadata?.display_name||user.email||"Chess player")+'</h2><p>'+esc(user.email||"Signed in")+'</p></div></div><div class="account-stats"><div><strong>'+games.length+'</strong><small>Saved games</small></div><div><strong>'+(preference.elo||localStorage.getItem("fc-elo")||800)+'</strong><small>Target Elo</small></div><div><strong>'+esc((preference.theme||localStorage.getItem("fc-theme")||"green").toUpperCase())+'</strong><small>Colour theme</small></div></div><div class="feature-actions"><a class="primary-btn" href="/play">Play chess ↗</a><button id="signOut" class="secondary-btn">Sign out</button></div><p id="featureNotice" class="feature-notice" role="status"></p>';
 document.querySelector("#signOut").onclick=async()=>{const {error}=await supabase.auth.signOut();if(error){note(error.message);return;}location.href="/";};
}
function analysisPage(){
 shell("Understand every move","Review a PGN with Stockfish-powered candidate moves and a centipawn-loss estimate. Analysis runs in your browser; longer games take more time.",'<section class="feature-card"><label class="field-label" for="analysisPgn">Paste game PGN</label><textarea id="analysisPgn" rows="7" placeholder="1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 ..."></textarea><div class="feature-actions"><button id="runAnalysis" class="primary-btn">Analyze game ↗</button><button id="sampleAnalysis" class="secondary-btn">Load sample game</button></div><p id="featureNotice" class="feature-notice" role="status"></p></section><section id="analysisResults" class="feature-card" hidden></section>');
 const incomingPgn=new URLSearchParams(location.search).get("pgn");if(incomingPgn)document.querySelector("#analysisPgn").value=incomingPgn;document.querySelector("#sampleAnalysis").onclick=()=>document.querySelector("#analysisPgn").value='[Event "Sample"]\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6';
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
 const gameId=game.gameId||(game.mode==="human"?"human-"+game.room:"saved-"+Date.now());
 const entry={...game,gameId,savedAt:new Date().toISOString()};
 const index=games.findIndex(item=>item.gameId===gameId);
 if(index>=0)games[index]=entry;else games.unshift(entry);
 const dedup=games.slice(0,30);
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
 const routes={"/import":importPage,"/online":onlinePage,"/analysis":analysisPage,"/account":accountPage,"/login":()=>authPage(false),"/signup":()=>authPage(true)};
 if(!routes[pathname])return false;routes[pathname]();return true;
}
