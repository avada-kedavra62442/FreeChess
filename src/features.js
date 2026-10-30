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
 const params=new URLSearchParams(location.search),requested=params.get("next")||"/account",next=requested.startsWith("/")&&!requested.startsWith("//")?requested:"/account";
 shell("Your account","Sign in to sync your games and preferences across devices.",'<div class="auth-modal-backdrop" id="authBackdrop"><div class="auth-stack"><section class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="authTitle"><button class="modal-close" id="authClose" type="button" aria-label="Close">×</button><div class="auth-brand"><span class="auth-brand-mark">♞</span><span>FreeChess</span></div><p class="eyebrow">WELCOME TO FREECHESS</p><h2 id="authTitle">'+(signup?"Create your account":"Your next move starts here.")+'</h2><p class="auth-copy">Sign in to sync your games across devices, or continue as a guest. Guest mode never requires an account.</p><form id="authForm"><label>Email<input id="authEmail" type="email" autocomplete="email" required placeholder="you@example.com"></label><label>Password<input id="authPassword" type="password" autocomplete="'+(signup?"new-password":"current-password")+'" minlength="6" required placeholder="At least 6 characters"></label><div class="auth-buttons"><button class="auth-primary" id="authSubmit" type="submit">'+(signup?"Create account":"Sign in")+'</button><button class="auth-secondary" id="authModeSwitch" type="button">'+(signup?"I already have an account":"Create account")+'</button></div></form><div class="auth-divider"><span>OR CONTINUE WITH</span></div><button class="auth-provider-button auth-google-button" id="googleAuth" type="button"><svg class="provider-logo google-logo" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.46 13.72 17.74 9.5 24 9.5Z" transform="translate(0 4)"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 38.03 46.98 31.93 46.98 24.55Z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z" transform="translate(0 4)"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.55-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" transform="translate(0 -2)"/></svg><span>Continue with Google</span></button><button class="auth-provider-button auth-discord-button" id="discordAuth" type="button"><svg class="provider-logo discord-logo" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.73 5.1A19.4 19.4 0 0 0 14.96 3.6l-.59 1.2a17.9 17.9 0 0 0-4.74 0l-.6-1.2A19.3 19.3 0 0 0 4.27 5.1C1.25 9.57.43 13.93.84 18.23a19.6 19.6 0 0 0 5.86 2.96l1.26-2.05a12.8 12.8 0 0 1-1.98-.96l.48-.37c3.82 1.77 7.97 1.77 11.75 0l.5.37c-.64.38-1.3.7-1.99.96l1.26 2.05a19.5 19.5 0 0 0 5.87-2.96c.49-4.98-.82-9.3-4.12-13.13ZM8.9 15.3c-1.14 0-2.07-1.04-2.07-2.32s.91-2.32 2.07-2.32 2.08 1.05 2.06 2.32c0 1.28-.91 2.32-2.06 2.32Zm6.2 0c-1.14 0-2.07-1.04-2.07-2.32s.91-2.32 2.07-2.32 2.08 1.05 2.06 2.32c0 1.28-.91 2.32-2.06 2.32Z"/></svg><span>Continue with Discord</span></button><p id="authNotice" class="auth-message" role="status"></p></section><button class="guest-mode-button" id="guestModeButton" type="button">Continue as guest <span>→</span></button><p class="auth-footnote">Free to play · No subscription · Your choice</p></div></div>');
 const notice=document.querySelector("#authNotice"),form=document.querySelector("#authForm"),say=(message,good=false)=>{notice.textContent=message;notice.className="auth-message"+(good?" good":"");};
 document.querySelector("#authClose").onclick=()=>location.href="/";document.querySelector("#authBackdrop").onclick=event=>{if(event.target.id==="authBackdrop")location.href="/";};
 document.querySelector("#guestModeButton").onclick=()=>location.href=next.startsWith("/online")?"/":(next==="/account"?"/":next);
 document.querySelector("#authModeSwitch").onclick=()=>location.href=(signup?"/login":"/signup")+"?next="+encodeURIComponent(next);
 if(!supabase){say("Accounts are not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to FreeChess in Vercel, then redeploy.");form.querySelectorAll("input,button").forEach(el=>el.disabled=true);document.querySelector("#googleAuth").disabled=true;document.querySelector("#discordAuth").disabled=true;return;}
 supabase.auth.getSession().then(({data})=>{if(data.session?.user)location.replace(next);});
 form.onsubmit=async event=>{event.preventDefault();const email=document.querySelector("#authEmail").value.trim(),password=document.querySelector("#authPassword").value;if(!email||password.length<6){say("Enter a valid email and a password with at least 6 characters.");return;}const submit=document.querySelector("#authSubmit");submit.disabled=true;say("Working…");try{const result=signup?await supabase.auth.signUp({email,password}):await supabase.auth.signInWithPassword({email,password});if(result.error)throw result.error;if(signup&&!result.data.session){say("Account created. Check your email to confirm, then sign in.",true);return;}say("Signed in. Your cloud account is ready.",true);location.replace(next);}catch(error){say(error.message||"Authentication failed. Please try again.");}finally{submit.disabled=false;}};
 async function oauth(provider,label){say("Redirecting to "+label+"…");const {error}=await supabase.auth.signInWithOAuth({provider,options:{redirectTo:location.origin+next}});if(error)say(error.message);}
 document.querySelector("#googleAuth").onclick=()=>oauth("google","Google");document.querySelector("#discordAuth").onclick=()=>oauth("discord","Discord");
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
 shell("Understand every move","Review a PGN with the local Stockfish engine. It warms up while you prepare the game and stays running for faster repeat analysis.",'<section class="feature-card"><label class="field-label" for="analysisPgn">Paste game PGN</label><textarea id="analysisPgn" rows="7" placeholder="1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 ..."></textarea><div class="feature-actions"><button id="runAnalysis" class="primary-btn">Analyze game ↗</button><button id="sampleAnalysis" class="secondary-btn">Load sample game</button></div><p id="featureNotice" class="feature-notice" role="status">Preparing local Stockfish…</p></section><section id="analysisResults" class="feature-card" hidden></section>');
 const incomingPgn=new URLSearchParams(location.search).get("pgn");if(incomingPgn)document.querySelector("#analysisPgn").value=incomingPgn;document.querySelector("#sampleAnalysis").onclick=()=>document.querySelector("#analysisPgn").value='[Event "Sample"]\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6';
 prepareReviewWorker(message=>note(message)).then(()=>note("Stockfish is ready. Paste a PGN and start your review.",true)).catch(error=>note(error.message));
 document.querySelector("#runAnalysis").onclick=async()=>{const text=document.querySelector("#analysisPgn").value.trim();if(!text){note("Paste a PGN first.");return;}let game;try{game=new Chess();game.loadPgn(text);}catch(error){note("PGN could not be parsed: "+error.message);return;}const moves=game.history({verbose:true});if(!moves.length){note("No moves were found in that PGN.");return;}const results=document.querySelector("#analysisResults");results.hidden=false;results.innerHTML='<h2>Analyzing '+moves.length+' half-moves…</h2><p id="analysisProgress">Preparing Stockfish…</p><div class="progress-track"><i id="analysisBar"></i></div><div id="analysisRows"></div>';const button=document.querySelector("#runAnalysis");button.disabled=true;try{const rows=await engineReview(text,(done,total)=>{document.querySelector("#analysisProgress").textContent="Analyzing move "+done+" of "+total+"…";document.querySelector("#analysisBar").style.width=(done/total*100)+"%";},message=>{document.querySelector("#analysisProgress").textContent=message;});document.querySelector("#analysisRows").innerHTML=rows.map((row,index)=>'<div class="analysis-row"><span class="analysis-number">'+(index+1)+'. '+(index%2===0?"White":"Black")+'</span><strong class="analysis-grade '+row.kind.toLowerCase()+'">'+esc(row.kind)+'</strong><span class="analysis-san">'+esc(row.played)+'</span><span class="analysis-alternative">Engine: '+esc(row.best)+'</span><small>'+esc(row.explanation)+'</small></div>').join("");note("Analysis complete. Depth 8 is optimized for quicker feedback; deeper analysis takes longer.",true);saveProgress("last-analysis",{pgn:text,at:Date.now(),moves:rows.length});}catch(error){note("Analysis stopped: "+error.message);}finally{button.disabled=false;}};
}
let reviewWorker=null,reviewBootPromise=null,reviewWorkerReady=false,reviewRunning=false;
function prepareReviewWorker(onStatus=()=>{}){
 if(reviewWorkerReady&&reviewWorker)return Promise.resolve(reviewWorker);if(reviewBootPromise)return reviewBootPromise;
 reviewBootPromise=new Promise((resolve,reject)=>{let settled=false,bootTimer;
  const fail=error=>{if(settled)return;settled=true;clearTimeout(bootTimer);try{reviewWorker?.terminate();}catch{}reviewWorker=null;reviewWorkerReady=false;reviewBootPromise=null;reject(error);};
  try{reviewWorker=new Worker("/engine/stockfish-19-lite-single.js");}catch(error){fail(error);return;}
  onStatus("Loading the local Stockfish engine…");
  reviewWorker.onmessage=event=>{const line=String(event.data||"").trim();if(line==="uciok"){reviewWorker.postMessage("setoption name Threads value 1");reviewWorker.postMessage("setoption name Hash value 32");reviewWorker.postMessage("isready");}else if(line==="readyok"&&!settled){settled=true;clearTimeout(bootTimer);reviewWorkerReady=true;onStatus("Stockfish is ready. Your game can be analyzed.");resolve(reviewWorker);}};
  reviewWorker.onerror=()=>fail(new Error("Stockfish could not start. Refresh the page and try again."));
  bootTimer=setTimeout(()=>fail(new Error("Stockfish initialization timed out. Check your connection and retry.")),18000);reviewWorker.postMessage("uci");
 });return reviewBootPromise;
}
function engineReview(pgn,onProgress,onStatus=()=>{}){
 if(reviewRunning)return Promise.reject(new Error("An analysis is already running."));reviewRunning=true;
 return prepareReviewWorker(onStatus).then(worker=>new Promise((resolve,reject)=>{
  const parsed=new Chess();try{parsed.loadPgn(pgn);}catch(error){reviewRunning=false;reject(error);return;}
  const history=parsed.history({verbose:true}),snapshots=[],replay=new Chess();for(const move of history){snapshots.push({fen:replay.fen(),move});replay.move(move);}
  let index=0,phase="before",bestUci="",score=null,scoreBefore=0,timeout=null,finished=false;const rows=[];
  const cleanup=()=>{clearTimeout(timeout);reviewRunning=false;};
  const finishError=error=>{if(finished)return;finished=true;cleanup();try{worker.terminate();}catch{}reviewWorker=null;reviewWorkerReady=false;reviewBootPromise=null;reject(error);};
  const armTimeout=()=>{clearTimeout(timeout);timeout=setTimeout(()=>finishError(new Error("Stockfish search timed out")),18000);};
  const search=(fen,nextPhase)=>{phase=nextPhase;score=null;worker.postMessage("position fen "+fen);worker.postMessage("go depth 8");armTimeout();};
  const sanFor=(uci,fen)=>{try{const probe=new Chess(fen),move=probe.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]||"q"});return move?move.san:uci;}catch{return uci;}};
  const uciFor=move=>move.from+move.to+(move.promotion||"");
  const startNext=()=>{if(index>=history.length){if(!finished){finished=true;cleanup();resolve(rows);}return;}search(snapshots[index].fen,"before");};
  worker.onmessage=event=>{const line=String(event.data||"").trim(),cp=line.match(/\bscore cp (-?\d+)/),mate=line.match(/\bscore mate (-?\d+)/),best=line.match(/^bestmove\s+(\S+)/);if(cp)score=Number(cp[1]);if(mate)score=Math.sign(Number(mate[1]))*10000;if(!best)return;clearTimeout(timeout);
   if(phase==="before"){bestUci=best[1];scoreBefore=score??0;const after=new Chess(snapshots[index].fen);after.move(snapshots[index].move);search(after.fen(),"after");return;}
   const actual=snapshots[index].move,loss=scoreBefore-(-(score??0)),isTop=bestUci===uciFor(actual);let kind;
   if(isTop&&loss<70)kind="Perfect";else if(loss>=300)kind="Blunder";else if(loss>=150)kind="Mistake";else if(loss>=70)kind="Inaccuracy";else kind="Good";
   rows.push({played:actual.san,best:sanFor(bestUci,snapshots[index].fen),kind,explanation:kind==="Perfect"?"Matched Stockfish’s top move at this search depth.":kind==="Blunder"?"Large evaluation loss. Review the opponent’s strongest reply and the tactical idea missed.":kind==="Mistake"?"A substantially stronger continuation was available.":kind==="Inaccuracy"?"A more precise move could preserve more of the position’s value.":"A reasonable move with a relatively small evaluation loss."});
   index++;onProgress(index,history.length);startNext();
  };
  worker.onerror=()=>finishError(new Error("Stockfish worker could not load"));startNext();
 })).catch(error=>{reviewRunning=false;throw error;});
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
