import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import {
  Users, LayoutDashboard, Calendar, Scale, Flame, Dumbbell, Target,
  MessageSquare, Plus, Trash2, Check, X, ChevronLeft, ChevronRight,
  Play, Activity, CheckCircle, Circle, Zap, SkipForward,
  LogOut, Lock, Eye, EyeOff, Search, Copy, Star, Filter,
  TrendingUp, TrendingDown, Edit, GripVertical, Bell, Home,
  AlertTriangle, Youtube, Award
} from "lucide-react";

// ─── THEME ───────────────────────────────────────────────────────────────────
const C = {
  bg:"#080810", surface:"#0e0e1a", card:"#13131f", border:"#1f1f30",
  accent:"#c8ff00", accentDim:"#c8ff0018", accentMid:"#c8ff0044",
  text:"#eeeef5", muted:"#5a5a78",
  danger:"#ff4d6d", success:"#00e5a0", blue:"#4d9fff",
  orange:"#ff9f4d", purple:"#a855f7",
};
const FONT="'Montserrat',sans-serif", BODY="'Montserrat',sans-serif";

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%;}
body{background:${C.bg};color:${C.text};font-family:${BODY};overflow-x:hidden;word-break:break-word;}
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px;}
input,textarea,select{background:${C.bg};color:${C.text};border:1px solid ${C.border};border-radius:10px;padding:10px 14px;font-family:${BODY};font-size:16px;outline:none;width:100%;transition:border-color .2s;}
input:focus,textarea:focus,select:focus{border-color:${C.accent};}
input[type=range]{padding:0;border:none;background:transparent;}
@media(max-width:640px){
  h1{font-size:20px!important;}
  h2{font-size:17px!important;}
  .card-grid{grid-template-columns:1fr!important;}
  button{min-height:40px;}
}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.fadeUp{animation:fadeUp .3s ease;}
.pulse{animation:pulse 2s infinite;}
`;

const SIMONE_WA="393491234567"; // ← cambia con il tuo numero (39 + numero senza 0)

// ─── SOUND & VIBRATION ────────────────────────────────────────────────────────
function playBeep(freq=880,duration=0.3,vol=0.4){
  try{
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    const osc=ctx.createOscillator();const gain=ctx.createGain();
    osc.connect(gain);gain.connect(ctx.destination);
    osc.frequency.value=freq;gain.gain.setValueAtTime(vol,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+duration);
    osc.start(ctx.currentTime);osc.stop(ctx.currentTime+duration);
  }catch{}
  if(navigator.vibrate)navigator.vibrate([100]);
}
function playRestEnd(){
  // 3 ascending beeps to signal end of rest
  [0,0.18,0.36].forEach((delay,i)=>{
    setTimeout(()=>playBeep(660+i*110,0.15,0.5),delay*1000);
  });
  if(navigator.vibrate)navigator.vibrate([200,80,200,80,300]);
}
function playSetDone(){
  playBeep(440,0.12,0.3);
  if(navigator.vibrate)navigator.vibrate([80]);
}

const MUSCLE_COLORS={
  petto:C.orange, schiena:C.blue, spalle:C.purple, bicipiti:"#f472b6",
  tricipiti:"#34d399", gambe:C.accent, glutei:"#fb923c", addome:"#60a5fa",
  fullbody:C.success, cardio:C.danger,
};

// ─── YOUTUBE helper ──────────────────────────────────────────────────────────
const ytUrl = name =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent("come fare "+name+" palestra tutorial")}`;

// ─── EXERCISES ────────────────────────────────────────────────────────────────
const EX=[
  {id:"e1",name:"Panca Piana",muscle:"petto",equipment:"bilanciere",type:"forza"},
  {id:"e2",name:"Panca Inclinata",muscle:"petto",equipment:"bilanciere",type:"ipertrofia"},
  {id:"e3",name:"Panca Declinata",muscle:"petto",equipment:"bilanciere",type:"ipertrofia"},
  {id:"e4",name:"Croci Manubri",muscle:"petto",equipment:"manubri",type:"ipertrofia"},
  {id:"e5",name:"Panca con Manubri",muscle:"petto",equipment:"manubri",type:"ipertrofia"},
  {id:"e6",name:"Piegamenti",muscle:"petto",equipment:"corpo libero",type:"ipertrofia"},
  {id:"e7",name:"Dips Petto",muscle:"petto",equipment:"corpo libero",type:"forza"},
  {id:"e8",name:"Croci ai Cavi",muscle:"petto",equipment:"cavi",type:"ipertrofia"},
  {id:"e9",name:"Peck Deck",muscle:"petto",equipment:"macchine",type:"ipertrofia"},
  {id:"e10",name:"Chest Press Machine",muscle:"petto",equipment:"macchine",type:"ipertrofia"},
  {id:"e11",name:"Stacco da Terra",muscle:"schiena",equipment:"bilanciere",type:"forza"},
  {id:"e12",name:"Rematore Bilanciere",muscle:"schiena",equipment:"bilanciere",type:"ipertrofia"},
  {id:"e13",name:"T-Bar Row",muscle:"schiena",equipment:"bilanciere",type:"ipertrofia"},
  {id:"e14",name:"Rematore Manubrio",muscle:"schiena",equipment:"manubri",type:"ipertrofia"},
  {id:"e15",name:"Trazioni",muscle:"schiena",equipment:"corpo libero",type:"forza"},
  {id:"e16",name:"Trazioni Supine",muscle:"schiena",equipment:"corpo libero",type:"ipertrofia"},
  {id:"e17",name:"Lat Machine",muscle:"schiena",equipment:"macchine",type:"ipertrofia"},
  {id:"e18",name:"Low Row",muscle:"schiena",equipment:"macchine",type:"ipertrofia"},
  {id:"e19",name:"Seated Cable Row",muscle:"schiena",equipment:"cavi",type:"ipertrofia"},
  {id:"e20",name:"Face Pull",muscle:"schiena",equipment:"cavi",type:"ipertrofia"},
  {id:"e21",name:"Military Press",muscle:"spalle",equipment:"bilanciere",type:"forza"},
  {id:"e22",name:"Overhead Press",muscle:"spalle",equipment:"bilanciere",type:"ipertrofia"},
  {id:"e23",name:"Shoulder Press Manubri",muscle:"spalle",equipment:"manubri",type:"ipertrofia"},
  {id:"e24",name:"Alzate Laterali",muscle:"spalle",equipment:"manubri",type:"ipertrofia"},
  {id:"e25",name:"Alzate Frontali",muscle:"spalle",equipment:"manubri",type:"ipertrofia"},
  {id:"e26",name:"Rear Delt Fly",muscle:"spalle",equipment:"manubri",type:"ipertrofia"},
  {id:"e27",name:"Arnold Press",muscle:"spalle",equipment:"manubri",type:"ipertrofia"},
  {id:"e28",name:"Alzate Laterali Cavo",muscle:"spalle",equipment:"cavi",type:"ipertrofia"},
  {id:"e29",name:"Curl Bilanciere",muscle:"bicipiti",equipment:"bilanciere",type:"ipertrofia"},
  {id:"e30",name:"Curl EZ Bar",muscle:"bicipiti",equipment:"bilanciere",type:"ipertrofia"},
  {id:"e31",name:"Curl Manubri",muscle:"bicipiti",equipment:"manubri",type:"ipertrofia"},
  {id:"e32",name:"Curl Martello",muscle:"bicipiti",equipment:"manubri",type:"ipertrofia"},
  {id:"e33",name:"Curl Concentrato",muscle:"bicipiti",equipment:"manubri",type:"ipertrofia"},
  {id:"e34",name:"Curl ai Cavi",muscle:"bicipiti",equipment:"cavi",type:"ipertrofia"},
  {id:"e35",name:"French Press",muscle:"tricipiti",equipment:"bilanciere",type:"ipertrofia"},
  {id:"e36",name:"Close Grip Bench",muscle:"tricipiti",equipment:"bilanciere",type:"forza"},
  {id:"e37",name:"Skull Crusher",muscle:"tricipiti",equipment:"bilanciere",type:"ipertrofia"},
  {id:"e38",name:"Dips Tricipiti",muscle:"tricipiti",equipment:"corpo libero",type:"ipertrofia"},
  {id:"e39",name:"Diamond Push Up",muscle:"tricipiti",equipment:"corpo libero",type:"ipertrofia"},
  {id:"e40",name:"Pushdown Cavo",muscle:"tricipiti",equipment:"cavi",type:"ipertrofia"},
  {id:"e41",name:"Overhead Tricipiti Cavo",muscle:"tricipiti",equipment:"cavi",type:"ipertrofia"},
  {id:"e42",name:"Squat",muscle:"gambe",equipment:"bilanciere",type:"forza"},
  {id:"e43",name:"Squat Frontale",muscle:"gambe",equipment:"bilanciere",type:"forza"},
  {id:"e44",name:"Stacco Rumeno",muscle:"gambe",equipment:"bilanciere",type:"ipertrofia"},
  {id:"e45",name:"Affondi Bilanciere",muscle:"gambe",equipment:"bilanciere",type:"ipertrofia"},
  {id:"e46",name:"Goblet Squat",muscle:"gambe",equipment:"manubri",type:"ipertrofia"},
  {id:"e47",name:"Affondi Manubri",muscle:"gambe",equipment:"manubri",type:"ipertrofia"},
  {id:"e48",name:"Squat Corpo Libero",muscle:"gambe",equipment:"corpo libero",type:"ipertrofia"},
  {id:"e49",name:"Affondi",muscle:"gambe",equipment:"corpo libero",type:"ipertrofia"},
  {id:"e50",name:"Pistol Squat",muscle:"gambe",equipment:"corpo libero",type:"forza"},
  {id:"e51",name:"Wall Sit",muscle:"gambe",equipment:"corpo libero",type:"resistenza"},
  {id:"e52",name:"Jump Squat",muscle:"gambe",equipment:"corpo libero",type:"cardio"},
  {id:"e53",name:"Leg Press",muscle:"gambe",equipment:"macchine",type:"ipertrofia"},
  {id:"e54",name:"Leg Extension",muscle:"gambe",equipment:"macchine",type:"ipertrofia"},
  {id:"e55",name:"Leg Curl",muscle:"gambe",equipment:"macchine",type:"ipertrofia"},
  {id:"e56",name:"Calf Raise",muscle:"gambe",equipment:"macchine",type:"ipertrofia"},
  {id:"e57",name:"Hip Thrust Bilanciere",muscle:"glutei",equipment:"bilanciere",type:"forza"},
  {id:"e58",name:"Hip Thrust Corpo Libero",muscle:"glutei",equipment:"corpo libero",type:"ipertrofia"},
  {id:"e59",name:"Glute Bridge",muscle:"glutei",equipment:"corpo libero",type:"ipertrofia"},
  {id:"e60",name:"Donkey Kick",muscle:"glutei",equipment:"corpo libero",type:"ipertrofia"},
  {id:"e61",name:"Sumo Squat",muscle:"glutei",equipment:"corpo libero",type:"ipertrofia"},
  {id:"e62",name:"Step Up Manubri",muscle:"glutei",equipment:"manubri",type:"ipertrofia"},
  {id:"e63",name:"Abductor Machine",muscle:"glutei",equipment:"macchine",type:"ipertrofia"},
  {id:"e64",name:"Plank",muscle:"addome",equipment:"corpo libero",type:"resistenza"},
  {id:"e65",name:"Crunch",muscle:"addome",equipment:"corpo libero",type:"ipertrofia"},
  {id:"e66",name:"Leg Raise",muscle:"addome",equipment:"corpo libero",type:"ipertrofia"},
  {id:"e67",name:"Mountain Climbers",muscle:"addome",equipment:"corpo libero",type:"cardio"},
  {id:"e68",name:"Russian Twist",muscle:"addome",equipment:"corpo libero",type:"ipertrofia"},
  {id:"e69",name:"Bicycle Crunch",muscle:"addome",equipment:"corpo libero",type:"ipertrofia"},
  {id:"e70",name:"V-Up",muscle:"addome",equipment:"corpo libero",type:"ipertrofia"},
  {id:"e71",name:"Dead Bug",muscle:"addome",equipment:"corpo libero",type:"resistenza"},
  {id:"e72",name:"Ab Wheel",muscle:"addome",equipment:"corpo libero",type:"forza"},
  {id:"e73",name:"Crunch ai Cavi",muscle:"addome",equipment:"cavi",type:"ipertrofia"},
  {id:"e74",name:"Thruster",muscle:"fullbody",equipment:"bilanciere",type:"cardio"},
  {id:"e75",name:"Clean and Press",muscle:"fullbody",equipment:"bilanciere",type:"forza"},
  {id:"e76",name:"Kettlebell Swing",muscle:"fullbody",equipment:"kettlebell",type:"cardio"},
  {id:"e77",name:"Turkish Get Up",muscle:"fullbody",equipment:"kettlebell",type:"resistenza"},
  {id:"e78",name:"Bear Crawl",muscle:"fullbody",equipment:"corpo libero",type:"cardio"},
  {id:"e79",name:"Burpees",muscle:"cardio",equipment:"corpo libero",type:"cardio"},
  {id:"e80",name:"Jumping Jacks",muscle:"cardio",equipment:"corpo libero",type:"cardio"},
  {id:"e81",name:"High Knees",muscle:"cardio",equipment:"corpo libero",type:"cardio"},
  {id:"e82",name:"Box Jump",muscle:"cardio",equipment:"corpo libero",type:"cardio"},
  {id:"e83",name:"Corda",muscle:"cardio",equipment:"corpo libero",type:"cardio"},
  {id:"e84",name:"Sprint",muscle:"cardio",equipment:"corpo libero",type:"cardio"},
  {id:"e85",name:"Tuck Jump",muscle:"cardio",equipment:"corpo libero",type:"cardio"},
  {id:"e86",name:"Step Up",muscle:"cardio",equipment:"corpo libero",type:"cardio"},
];

const ALL_MUSCLES=["tutti","petto","schiena","spalle","bicipiti","tricipiti","gambe","glutei","addome","fullbody","cardio"];
const ALL_EQ=["tutti","bilanciere","manubri","corpo libero","cavi","macchine","kettlebell"];
const ALL_TYPES=["tutti","forza","ipertrofia","cardio","resistenza"];
const TPL_COLORS=[C.accent,C.orange,C.blue,C.purple,C.success,"#f472b6","#fb923c"];

const DEFAULT_TEMPLATES=[
  {id:"tplA",name:"Sessione A",color:"#7C3AED",exercises:[
    {exId:"e6",  sets:3,targetKg:0,  targetReps:10,restSec:60},
    {exId:"e46", sets:3,targetKg:10, targetReps:12,restSec:90},
    {exId:"e23", sets:3,targetKg:8,  targetReps:10,restSec:90},
    {exId:"e7",  sets:3,targetKg:0,  targetReps:8, restSec:90},
    {exId:"e47", sets:3,targetKg:6,  targetReps:12,restSec:60},
    {exId:"e64", sets:3,targetKg:0,  targetReps:30,restSec:60},
  ]},
  {id:"tplB",name:"Sessione B",color:"#0EA5E9",exercises:[
    {exId:"e15", sets:3,targetKg:0,  targetReps:6, restSec:120},
    {exId:"e44", sets:3,targetKg:25, targetReps:10,restSec:90},
    {exId:"e14", sets:3,targetKg:10, targetReps:12,restSec:90},
    {exId:"e24", sets:3,targetKg:5,  targetReps:15,restSec:60},
    {exId:"e31", sets:3,targetKg:8,  targetReps:12,restSec:60},
    {exId:"e72", sets:3,targetKg:0,  targetReps:8, restSec:60},
  ]},
];

// ─── UTILS ───────────────────────────────────────────────────────────────────
const uid=()=>Math.random().toString(36).slice(2,8);
const todayStr=()=>new Date().toISOString().slice(0,10);
const fmtLong=d=>new Date(d+"T12:00:00").toLocaleDateString("it-IT",{day:"numeric",month:"short",year:"2-digit"});
const fmtMonth=d=>new Date(d+"T12:00:00").toLocaleDateString("it-IT",{month:"short",year:"numeric"});
const getEx=id=>EX.find(e=>e.id===id)||{name:"Esercizio",muscle:"",equipment:"",type:""};
const WEEKDAYS=["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];
const MONTHS=["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
const getDIM=(y,m)=>new Date(y,m+1,0).getDate();
const getFD=(y,m)=>{const d=new Date(y,m,1).getDay();return d===0?6:d-1;};

// ─── MOBILE HOOK ─────────────────────────────────────────────────────────────
function useIsMobile(){
  const [m,setM]=useState(()=>typeof window!=="undefined"&&window.innerWidth<768);
  useEffect(()=>{
    const fn=()=>setM(window.innerWidth<768);
    window.addEventListener("resize",fn);return()=>window.removeEventListener("resize",fn);
  },[]);
  return m;
}

// ─── DEMO DATA ────────────────────────────────────────────────────────────────
function makeDemoClients(){
  const lucaEvs=[
    {id:"lp1",date:"2026-02-16",templateId:"tplA",status:"completed",completedSets:[],feedback:{rpe:7,feeling:4,note:""}},
    {id:"lp2",date:"2026-02-18",templateId:"tplB",status:"completed",completedSets:[],feedback:{rpe:7,feeling:4,note:""}},
    {id:"lp3",date:"2026-02-20",templateId:"tplA",status:"completed",completedSets:[],feedback:{rpe:7,feeling:4,note:""}},
    {id:"lp4",date:"2026-02-23",templateId:"tplB",status:"completed",completedSets:[],feedback:{rpe:7,feeling:4,note:""}},
    {id:"lp5",date:"2026-02-25",templateId:"tplA",status:"completed",completedSets:[],feedback:{rpe:7,feeling:4,note:""}},
    {id:"lp6",date:"2026-02-27",templateId:"tplB",status:"completed",completedSets:[],feedback:{rpe:7,feeling:4,note:""}},
    {id:"lp7",date:"2026-03-02",templateId:"tplA",status:"completed",completedSets:[],feedback:{rpe:7,feeling:4,note:""}},
    {id:"ls1",date:"2026-03-04",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls2",date:"2026-03-06",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls3",date:"2026-03-09",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls4",date:"2026-03-11",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls5",date:"2026-03-13",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls6",date:"2026-03-16",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls7",date:"2026-03-18",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls8",date:"2026-03-20",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls9",date:"2026-03-23",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls10",date:"2026-03-25",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls11",date:"2026-03-27",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls12",date:"2026-03-30",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls13",date:"2026-04-01",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls14",date:"2026-04-03",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls15",date:"2026-04-06",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls16",date:"2026-04-08",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls17",date:"2026-04-10",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls18",date:"2026-04-13",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls19",date:"2026-04-15",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls20",date:"2026-04-17",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls21",date:"2026-04-20",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls22",date:"2026-04-22",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls23",date:"2026-04-24",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls24",date:"2026-04-27",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls25",date:"2026-04-29",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls26",date:"2026-05-01",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls27",date:"2026-05-04",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls28",date:"2026-05-06",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls29",date:"2026-05-08",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls30",date:"2026-05-11",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls31",date:"2026-05-13",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls32",date:"2026-05-15",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls33",date:"2026-05-18",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls34",date:"2026-05-20",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls35",date:"2026-05-22",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls36",date:"2026-05-25",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls37",date:"2026-05-27",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls38",date:"2026-05-29",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls39",date:"2026-06-01",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls40",date:"2026-06-03",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls41",date:"2026-06-05",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls42",date:"2026-06-08",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls43",date:"2026-06-10",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls44",date:"2026-06-12",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls45",date:"2026-06-15",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls46",date:"2026-06-17",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls47",date:"2026-06-19",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls48",date:"2026-06-22",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls49",date:"2026-06-24",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls50",date:"2026-06-26",templateId:"tplB",status:"scheduled",completedSets:[],feedback:null},
    {id:"ls51",date:"2026-06-29",templateId:"tplA",status:"scheduled",completedSets:[],feedback:null},
  ];
  const luca={
    id:"luca_bonomelli",name:"Luca Bonomelli",pin:"",age:"32",height:"164",
    goal:"Body Recomposition",
    notes:"Turni 6-14 / 14-22. Preferisce mattino a digiuno.",
    weight:[{date:"2026-02-16",value:61,note:"Pesata iniziale"}],
    calories:[],meals:[],workoutEvents:lucaEvs,messages:[],checkins:[],
    targets:{weight:"65",kcal:"2200",protein:"150",carbs:"220",fats:"70",workoutsPerWeek:"3"},
    mealPlan:"3pasti",
    misure:[{date:"2026-02-16",vita:"81",fianchi:"87",petto:"",braccioSx:"",braccioDx:"",coscia:"",polpaccio:""}],
    blueprint:{
      dataNascita:"1993-11-07",sesso:"M",professione:"Lavoro a turni (6-14 / 14-22)",
      obiettivoPeso:"65",massaGrassa:"",vita:"81",fianchi:"87",
      patologie:"Nessuna",farmaci:"Nessuno",
      integratori:"Creatina (occasionale), proteine vegane",
      infortuni:"no",doloriCronici:"si",esamiSangue:"Si, entro 6 mesi",
      tipoLavoro:"misto",orarioLavoro:"Turni: 6-14 oppure 14-22",
      livelloStress:"4-6",fontiStress:"Turni irregolari",tempoLibero:"Tutti i giorni",fumo:"no",
      oreSonno:"5",oraCoricarsi:"23:00",oraSveglia:"04:00",
      qualitaSonno:"buona",riposato:"a-volte",
      schermiPrimaDormire:"meno 1h",farmaciSonno:"no",luceSolare:"meno 15min",
      tipoDieta:"equilibrata",descrizioneDieta:"Dieta equilibrata",
      intolleranze:"Forse il kiwi",alimentiPreferiti:"2 pasti liberi a settimana",
      dietePassate:"Si, bene",alcol:"raramente",caffe:"1",acqua:"1.5",
      digiunoIntermittente:"provato",
      esperienzaAllenamento:"1-3 anni",tipoAllenamentoPassato:"Corpo libero, karate, corsa",
      modalitaAllenamento:"entrambi",accessoAttrezzi:"Si - palestra",
      partGiornata:"mattino a digiuno",eserciziDaEvitare:"",attivitaExtra:"si",
      postAllenamento:"stanco ma soddisfatto",livelloEnergia:"altalenante",
      sbalziUmore:"stabile",brainFog:"a-volte",portaATermine:"procrastino",
      obiettivoPrincipale:"recomposition",tempistica:"3 mesi",
      motivazione:"Migliorare in generale",metodiPassati:"Si, bene",
      ostacoli:"Niente puo ostacolarmi",disponibilitaCambiamento:"graduale",
      noteLibere:"Suggerisce di aggiungere domanda sullo stato d animo",
      noteTrained:"Molto motivato. Turni variabili - allenare mattina presto. Iniziare conservativo sui carichi.",
      obiettivoVita:"Sentirsi meglio nel corpo e costruire una routine stabile nonostante i turni.",
      numeroPasti:"3",clientUpdatedAt:"2026-03-04",updatedAt:"2026-03-04",
    },
  };
  return[luca];
}

// ─── STORAGE ──────────────────────────────────────────────────────────────────
async function sGet(k){try{const r=await window.storage.get(k);return JSON.parse(r.value);}catch{return null;}}
async function sSet(k,v){try{await window.storage.set(k,JSON.stringify(v));}catch{}}

// ─── ALERT LOGIC (shared) ────────────────────────────────────────────────────
function getClientAlerts(client){
  const alerts=[];
  const today=todayStr();
  const completed=client.workoutEvents.filter(e=>e.status==="completed");
  const lastDone=completed.sort((a,b)=>b.date.localeCompare(a.date))[0];
  const daysSince=lastDone?Math.floor((Date.now()-new Date(lastDone.date+"T12:00:00"))/86400000):null;
  const weekAgo=new Date(Date.now()-7*86400000);
  const weekEvs=client.workoutEvents.filter(e=>new Date(e.date)>=weekAgo);
  const weekDone=weekEvs.filter(e=>e.status==="completed").length;
  const compliance=weekEvs.length>0?Math.round(weekDone/weekEvs.length*100):null;
  const lastWeight=client.weight.at(-1);
  const daysSinceWeight=lastWeight?Math.floor((Date.now()-new Date(lastWeight.date+"T12:00:00"))/86400000):999;

  if(daysSince!==null&&daysSince>=7)alerts.push({level:"danger",msg:`Non si allena da ${daysSince} giorni`,icon:"🚨"});
  else if(daysSince!==null&&daysSince>=5)alerts.push({level:"warning",msg:`Non si allena da ${daysSince} giorni`,icon:"⚠️"});
  if(compliance!==null&&compliance<50)alerts.push({level:"warning",msg:`Compliance questa settimana: ${compliance}%`,icon:"📉"});
  if(daysSinceWeight>14)alerts.push({level:"info",msg:"Peso non registrato da 2+ settimane",icon:"⚖️"});
  if(needsCheckin(client))alerts.push({level:"info",msg:"Check-in settimanale in attesa",icon:"📋"});
  // Deload alert: every 4 weeks from program start
  const prog=client.programAssignment;
  if(prog&&prog.startDate){
    const weeksSinceStart=Math.floor((Date.now()-new Date(prog.startDate+"T12:00:00"))/(7*86400000));
    const weekInCycle=(weeksSinceStart%4)+1;
    if(weekInCycle===4)alerts.push({level:"info",msg:"Settimana di scarico — riduci i carichi al 70%",icon:"🔄"});
  }
  return alerts;
}

// ─── PROGRESSION LOGIC ───────────────────────────────────────────────────────
// Returns suggested kg if the athlete crushed target in last 2 sessions, else null
function getProgressionSuggestion(exId, targetKg, templateId, workoutHistory){
  if(!targetKg||targetKg<=0)return null;
  const relevant=[...workoutHistory]
    .filter(e=>e.status==="completed"&&e.templateId===templateId&&e.completedSets?.length)
    .sort((a,b)=>b.date.localeCompare(a.date))
    .slice(0,2);
  if(relevant.length<2)return null;
  // Find exercise index in template's completed sets — we pass exIdx separately
  // Instead we search by matching completedSets order — caller passes exIdx
  return relevant; // caller processes
}
function getExProgression(exIdx, targetKg, targetReps, templateId, workoutHistory){
  if(!targetKg||targetKg<=0)return null;
  const relevant=[...workoutHistory]
    .filter(e=>e.status==="completed"&&e.templateId===templateId&&e.completedSets?.length>exIdx)
    .sort((a,b)=>b.date.localeCompare(a.date))
    .slice(0,2);
  if(relevant.length<2)return null;
  const allCrushed=relevant.every(ev=>{
    const sets=ev.completedSets[exIdx]||[];
    return sets.length>0&&sets.every(s=>s.done&&(parseInt(s.reps)||0)>=targetReps&&(parseFloat(s.kg)||0)>=targetKg);
  });
  if(!allCrushed)return null;
  // Suggest increment: 2.5kg for most, 1.25kg for isolation
  const ex=EX.find(e=>e.exId===exIdx);
  const increment=targetKg>=40?2.5:1.25;
  return Math.round((targetKg+increment)*4)/4; // round to nearest 0.25
}

// ─── CHECKIN HELPERS ─────────────────────────────────────────────────────────
function needsCheckin(client){
  const now=new Date();
  const isMonday=now.getDay()===1;
  if(!isMonday)return false; // only show on Mondays
  const checkins=client.checkins||[];
  if(checkins.length===0)return true;
  const last=checkins.at(-1);
  const daysSince=Math.floor((Date.now()-new Date(last.date+"T12:00:00"))/86400000);
  return daysSince>=6; // not yet done this week
}
function hasCheckinThisWeek(client){
  const checkins=client.checkins||[];
  if(checkins.length===0)return false;
  const last=checkins.at(-1);
  const daysSince=Math.floor((Date.now()-new Date(last.date+"T12:00:00"))/86400000);
  return daysSince<7;
}
function Btn({children,onClick,variant="primary",size="md",style:sx={},disabled=false}){
  const base={display:"inline-flex",alignItems:"center",gap:"6px",borderRadius:"10px",fontWeight:600,
    cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1,fontFamily:BODY,border:"none",
    fontSize:size==="sm"?"12px":"14px",padding:size==="sm"?"6px 12px":"10px 18px",transition:"opacity .15s",whiteSpace:"nowrap"};
  const vs={
    primary:{background:C.accent,color:"#000"},
    ghost:{background:"transparent",color:C.muted,border:`1px solid ${C.border}`},
    danger:{background:C.danger+"22",color:C.danger,border:`1px solid ${C.danger}44`},
    success:{background:C.success+"22",color:C.success,border:`1px solid ${C.success}44`},
  };
  return <button disabled={disabled} onClick={onClick} style={{...base,...vs[variant],...sx}}>{children}</button>;
}
function Tag({label,color=C.accent}){
  return <span style={{background:color+"22",color,padding:"3px 10px",borderRadius:"999px",fontSize:"11px",fontWeight:700,whiteSpace:"nowrap"}}>{label}</span>;
}
function Card({children,style:sx={}}){
  return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"16px",padding:"20px",...sx}}>{children}</div>;
}
function StatTile({icon,label,value,sub,color=C.accent,style:sx={}}){
  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"14px",padding:"12px 8px",flex:1,minWidth:0,...sx}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{color:C.muted,fontSize:"9px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:"4px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{label}</div>
          <div style={{fontFamily:FONT,fontSize:"clamp(16px,4.5vw,24px)",fontWeight:800,color,whiteSpace:"nowrap"}}>{value}</div>
          {sub&&<div style={{color:C.muted,fontSize:"11px",marginTop:"3px"}}>{sub}</div>}
        </div>
        <div style={{background:color+"18",borderRadius:"8px",padding:"5px",color,flexShrink:0}}>{icon}</div>
      </div>
    </div>
  );
}
function PBar({value,max,color=C.accent,height="6px"}){
  const pct=max>0?Math.min(100,Math.round(value/max*100)):0;
  return <div style={{background:C.bg,borderRadius:"999px",height,overflow:"hidden"}}>
    <div style={{background:color,width:`${pct}%`,height:"100%",borderRadius:"999px",transition:"width .5s ease"}}/>
  </div>;
}
function ChartTip({active,payload,label,unit=""}){
  if(!active||!payload?.length)return null;
  return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"10px",padding:"10px 14px",fontSize:"13px"}}>
    <div style={{color:C.muted,marginBottom:"4px"}}>{label}</div>
    {payload.map((p,i)=><div key={i} style={{color:p.color||C.accent,fontWeight:700}}>{p.name?p.name+": ":""}{p.value}{unit}</div>)}
  </div>;
}
function AlertBadge({alerts}){
  if(!alerts.length)return null;
  const worst=alerts.some(a=>a.level==="danger")?C.danger:alerts.some(a=>a.level==="warning")?C.orange:C.blue;
  return <div style={{width:"8px",height:"8px",borderRadius:"50%",background:worst,flexShrink:0}} className="pulse"/>;
}

function BlueprintModal({bp,client}){
  const [open,setOpen]=useState(false);
  const SECTIONS=[
    {t:"Dati personali",f:[["dataNascita","Data nascita"],["sesso","Sesso"],["professione","Professione"],["obiettivoPeso","Obiettivo peso"],["massaGrassa","Massa grassa"]]},
    {t:"Salute",f:[["patologie","Patologie"],["farmaci","Farmaci"],["integratori","Integratori"],["infortuni","Infortuni"],["doloriCronici","Dolori cronici"]]},
    {t:"Lavoro & Stile vita",f:[["tipoLavoro","Tipo lavoro"],["orarioLavoro","Orario"],["livelloStress","Stress"],["fontiStress","Fonti stress"],["fumo","Fumo"]]},
    {t:"Sonno",f:[["oreSonno","Ore/notte"],["oraCoricarsi","Va a letto"],["oraSveglia","Sveglia"],["qualitaSonno","Qualita sonno"],["riposato","Riposato"]]},
    {t:"Alimentazione",f:[["tipoDieta","Dieta"],["intolleranze","Intolleranze"],["alimentiPreferiti","Alimenti preferiti"],["alcol","Alcol"],["caffe","Caffe"],["acqua","Acqua"]]},
    {t:"Allenamento",f:[["esperienzaAllenamento","Esperienza"],["tipoAllenamentoPassato","Tipo passato"],["modalitaAllenamento","Modalita"],["accessoAttrezzi","Attrezzi"],["partGiornata","Orario preferito"],["attivitaExtra","Attivita extra"]]},
    {t:"Benessere",f:[["livelloEnergia","Energia"],["sbalziUmore","Umore"],["brainFog","Brain fog"],["portaATermine","Porta a termine"]]},
    {t:"Obiettivi",f:[["obiettivoPrincipale","Obiettivo"],["tempistica","Tempistica"],["motivazione","Motivazione"],["ostacoli","Ostacoli"],["disponibilitaCambiamento","Disponibilita cambio"]]},
    {t:"Note trainer",f:[["noteTrained","Note trainer"],["obiettivoVita","Obiettivo di vita"],["noteLibere","Note libere"]]},
  ];
  return(
    <>
      <button onClick={()=>setOpen(true)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"14px",padding:"14px 16px",cursor:"pointer",textAlign:"left",width:"100%",display:"flex",alignItems:"center",gap:"14px"}}>
        <div style={{width:"40px",height:"40px",borderRadius:"12px",background:C.accent+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",flexShrink:0}}>📋</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:FONT,fontWeight:700,fontSize:"14px",marginBottom:"2px",color:C.text}}>Blueprint personale</div>
          <div style={{fontSize:"12px",color:C.muted}}>Tutte le tue risposte e le note del percorso</div>
        </div>
        <ChevronRight size={16} color={C.muted}/>
      </button>
      {open&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:9999,overflowY:"auto",padding:"20px 16px"}} onClick={e=>{if(e.target===e.currentTarget)setOpen(false);}}>
        <div style={{maxWidth:"560px",margin:"0 auto",background:C.surface,borderRadius:"18px",padding:"20px",border:`1px solid ${C.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
            <div style={{fontFamily:FONT,fontWeight:900,fontSize:"16px"}}>📋 Il mio Blueprint</div>
            <button onClick={()=>setOpen(false)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"5px 10px",cursor:"pointer",color:C.muted,fontSize:"13px"}}>✕</button>
          </div>
          {SECTIONS.map(sec=>{
            const rows=sec.f.filter(([k])=>bp[k]);
            if(!rows.length)return null;
            return(
              <div key={sec.t} style={{marginBottom:"16px"}}>
                <div style={{fontFamily:FONT,fontWeight:800,fontSize:"11px",color:C.accent,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"8px"}}>{sec.t}</div>
                {rows.map(([k,lbl])=>(
                  <div key={k} style={{display:"flex",gap:"10px",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
                    <span style={{color:C.muted,fontSize:"11px",minWidth:"130px",flexShrink:0}}>{lbl}</span>
                    <span style={{color:C.text,fontSize:"12px",fontWeight:600,flex:1}}>{String(bp[k])}</span>
                  </div>
                ))}
              </div>
            );
          })}
          {bp.clientUpdatedAt&&<div style={{fontSize:"10px",color:C.muted,textAlign:"right",marginTop:"8px"}}>Compilato il {fmtLong(bp.clientUpdatedAt)}</div>}
        </div>
      </div>}
    </>
  );
}


export default function App(){
  const [clients,setClients]=useState(null);
  const [templates,setTemplates]=useState(DEFAULT_TEMPLATES);
  const [session,setSession]=useState({role:"client",clientId:"luca_bonomelli"});
  const [trainerNav,setTrainerNav]=useState("dashboard");
  const [activeClientId,setActiveClientId]=useState(null);
  const [clientTab,setClientTab]=useState("home");
  const [editTemplate,setEditTemplate]=useState(null);
  const [activeWorkout,setActiveWorkout]=useState(null);
  const [sideOpen,setSideOpen]=useState(true);
  const [mobileSideOpen,setMobileSideOpen]=useState(false);
  const isMobile=useIsMobile();

  useEffect(()=>{
    if(isMobile)setSideOpen(false);
  },[isMobile]);

  useEffect(()=>{
    (async()=>{
      const sc=await sGet("luca_bono_clients");
      const st=await sGet("luca_bono_templates");
      setClients(sc||makeDemoClients());
      if(st)setTemplates(st);
    })();
  },[]);

  function saveClients(cls){setClients(cls);sSet("luca_bono_clients",cls);}
  function saveTemplates(tpls){setTemplates(tpls);sSet("luca_bono_templates",tpls);}
  function updateClient(id,fn){saveClients((prev)=>prev.map(c=>c.id===id?fn(c):c));}
  function startWorkout(ev,tpl,cid){const c=clients.find(cl=>cl.id===cid);setActiveWorkout({event:ev,template:tpl,clientId:cid,workoutHistory:c?.workoutEvents||[]});}
  const [progressionToast,setProgressionToast]=useState(null);

  function finishWorkout(evId,completedSets,feedback,acceptedProgressions=[]){
    const {clientId,template}=activeWorkout;
    updateClient(clientId,c=>({...c,workoutEvents:c.workoutEvents.map(e=>e.id===evId?{...e,status:"completed",completedSets,feedback}:e)}));
    // Apply only accepted progressions
    if(acceptedProgressions.length>0){
      const updatedTemplate={...template,exercises:template.exercises.map((ex,i)=>{
        const prog=acceptedProgressions.find(p=>p.exIdx===i);
        return prog?{...ex,targetKg:prog.newKg}:ex;
      })};
      saveTemplates(templates.map(t=>t.id===template.id?updatedTemplate:t));
      setProgressionToast({exercises:acceptedProgressions});
      setTimeout(()=>setProgressionToast(null),5000);
    }
    setActiveWorkout(null);
  }

  if(!clients)return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:C.bg}}><style>{CSS}</style><div style={{fontFamily:FONT,fontSize:"18px",color:C.accent}}>Caricamento…</div></div>;

  if(!session)return <div style={{minHeight:"100vh",background:C.bg}}><style>{CSS}</style><LoginScreen clients={clients} onLoginTrainer={()=>{setSession({role:"trainer"});}} onLoginClient={id=>{setSession({role:"client",clientId:id});setClientTab("home");}}/></div>;

  const WorkoutOverlay=activeWorkout?<WorkoutModal workout={activeWorkout} onClose={()=>setActiveWorkout(null)} onComplete={finishWorkout}/>:null;
  const ProgressionToast=progressionToast?(
    <div style={{position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",zIndex:9999,background:C.card,border:`2px solid ${C.accent}`,borderRadius:"16px",padding:"16px 20px",minWidth:"280px",maxWidth:"360px",boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
      <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}}>
        <div style={{fontSize:"20px"}}>📈</div>
        <div style={{fontFamily:FONT,fontWeight:900,fontSize:"14px",color:C.accent}}>Progressione automatica!</div>
        <button onClick={()=>setProgressionToast(null)} style={{marginLeft:"auto",background:"transparent",border:"none",cursor:"pointer",color:C.muted}}><X size={14}/></button>
      </div>
      {progressionToast.exercises.map((p,i)=>(
        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:i<progressionToast.exercises.length-1?`1px solid ${C.border}`:"none"}}>
          <span style={{fontSize:"13px",color:C.text}}>{p.name}</span>
          <span style={{fontFamily:FONT,fontWeight:800,fontSize:"13px",color:C.accent}}>{p.oldKg}kg → {p.newKg}kg</span>
        </div>
      ))}
      <div style={{fontSize:"10px",color:C.muted,marginTop:"8px"}}>Scheda aggiornata automaticamente ✓</div>
    </div>
  ):null;

  if(session.role==="client"){
    const client=clients.find(c=>c.id===session.clientId);
    if(!client){setSession(null);return null;}
    return <div style={{background:C.bg,minHeight:"100vh"}}><style>{CSS}</style>{WorkoutOverlay}{ProgressionToast}
      <ClientApp client={client} templates={templates} tab={clientTab} setTab={setClientTab}
        onUpdate={updateClient} onStartWorkout={(ev,tpl)=>startWorkout(ev,tpl,client.id)} onLogout={()=>setSession(null)}/>
    </div>;
  }

  if(editTemplate!==null)return <div style={{background:C.bg,minHeight:"100vh"}}><style>{CSS}</style>
    <TemplateBuilder template={editTemplate}
      onSave={tpl=>{const ex=templates.some(t=>t.id===tpl.id);saveTemplates(ex?templates.map(t=>t.id===tpl.id?tpl:t):[...templates,tpl]);setEditTemplate(null);}}
      onCancel={()=>setEditTemplate(null)}/>
  </div>;

  const activeClient=clients.find(c=>c.id===activeClientId);
  const allAlerts=clients.flatMap(c=>getClientAlerts(c).map(a=>({...a,client:c})));

  function openClient(id){setActiveClientId(id);setTrainerNav("client");setClientTab("calendar");setMobileSideOpen(false);}

  // TRAINER LAYOUT
  const sideW=sideOpen?"220px":"52px";

  const NavItem=({id,label,icon,badge})=>{
    const active=(trainerNav===id&&!activeClientId)||(id==="client"&&!!activeClientId);
    return <div onClick={()=>{setTrainerNav(id);setActiveClientId(null);setMobileSideOpen(false);}} style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 10px",borderRadius:"10px",cursor:"pointer",marginBottom:"3px",background:active?C.accentDim:"transparent",color:active?C.accent:C.muted,position:"relative"}}>
      {icon}
      {(sideOpen||isMobile)&&<span style={{fontSize:"13px",fontWeight:500,flex:1}}>{label}</span>}
      {badge&&badge}
    </div>;
  };

  const SidebarContent=()=><>
    <div style={{padding:"14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:"10px"}}>
      <div style={{width:"30px",height:"30px",background:C.accent,borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontFamily:FONT,fontWeight:900,fontSize:"12px",color:"#000"}}>SM</span>
      </div>
      {(sideOpen||isMobile)&&<div><div style={{fontFamily:FONT,fontWeight:800,fontSize:"13px",lineHeight:1.1}}>Simone</div><div style={{fontFamily:FONT,fontWeight:800,fontSize:"13px",color:C.accent,lineHeight:1.1}}>Minici</div></div>}
    </div>
    <nav style={{padding:"8px 6px",flex:1,overflowY:"auto"}}>
      <NavItem id="dashboard" label="Dashboard" icon={<LayoutDashboard size={17}/>}
        badge={allAlerts.length>0&&(sideOpen||isMobile)?<AlertBadge alerts={allAlerts}/>:null}/>
      <NavItem id="clients" label="Clienti" icon={<Users size={17}/>}/>
      <NavItem id="templates" label="Schede" icon={<Dumbbell size={17}/>}/>

      {(sideOpen||isMobile)&&clients.length>0&&<>
        <div style={{color:C.muted,fontSize:"9px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",padding:"12px 10px 5px"}}>Clienti</div>
        {clients.map(c=>{
          const alerts=getClientAlerts(c);
          return <div key={c.id} onClick={()=>openClient(c.id)} style={{display:"flex",alignItems:"center",gap:"8px",padding:"7px 10px",borderRadius:"8px",cursor:"pointer",marginBottom:"2px",background:activeClientId===c.id?C.accentDim:"transparent",color:activeClientId===c.id?C.accent:C.muted,fontSize:"13px"}}>
            <div style={{width:"22px",height:"22px",borderRadius:"50%",background:C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",fontWeight:700,color:C.accent,flexShrink:0}}>{c.name.charAt(0)}</div>
            <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{c.name}</span>
            {alerts.length>0&&<AlertBadge alerts={alerts}/>}
          </div>;
        })}
      </>}
    </nav>
    <div onClick={()=>setSession(null)} style={{padding:"10px",borderTop:`1px solid ${C.border}`,cursor:"pointer",color:C.muted,display:"flex",alignItems:"center",gap:"8px",justifyContent:(sideOpen||isMobile)?"flex-start":"center"}}>
      <LogOut size={15}/>{(sideOpen||isMobile)&&<span style={{fontSize:"13px"}}>Logout</span>}
    </div>
  </>;

  if(isMobile)return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:C.bg,overflow:"hidden"}}>
      <style>{CSS}</style>
      {WorkoutOverlay}
      {ProgressionToast}
      {/* Mobile top bar */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:C.surface,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{width:"28px",height:"28px",background:C.accent,borderRadius:"7px",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontFamily:FONT,fontWeight:900,fontSize:"11px",color:"#000"}}>SM</span>
          </div>
          <span style={{fontFamily:FONT,fontWeight:800,fontSize:"14px"}}>Simone <span style={{color:C.accent}}>Minici</span></span>
        </div>
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          {allAlerts.length>0&&<div style={{background:C.danger+"22",border:`1px solid ${C.danger}33`,borderRadius:"8px",padding:"5px 10px",display:"flex",alignItems:"center",gap:"5px",fontSize:"11px",color:C.danger}} onClick={()=>setTrainerNav("dashboard")}>
            <Bell size={12}/>{allAlerts.length} alert
          </div>}
          <button onClick={()=>setMobileSideOpen(true)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"6px 10px",cursor:"pointer",color:C.text,fontSize:"12px",display:"flex",alignItems:"center",gap:"5px"}}>
            ☰ Menu
          </button>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {mobileSideOpen&&<div style={{position:"fixed",inset:0,zIndex:200}}>
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.7)"}} onClick={()=>setMobileSideOpen(false)}/>
        <div style={{position:"absolute",left:0,top:0,bottom:0,width:"280px",background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",zIndex:201}}>
          <SidebarContent/>
        </div>
      </div>}

      {/* Main content */}
      <div style={{flex:1,overflow:"auto",overflowX:"hidden",padding:"16px 12px"}}>
        {trainerNav==="dashboard"&&!activeClientId&&<DashboardView clients={clients} templates={templates} onOpen={openClient}/>}
        {trainerNav==="clients"&&!activeClientId&&<ClientsView clients={clients} saveClients={saveClients} onOpen={openClient}/>}
        {trainerNav==="templates"&&!activeClientId&&<TemplatesView templates={templates} saveTemplates={saveTemplates}
          onEdit={tpl=>setEditTemplate({...tpl,exercises:tpl.exercises.map(e=>({...e,_uid:uid()}))})}
          onCreate={()=>setEditTemplate({id:uid(),name:"Nuova Scheda",color:C.accent,exercises:[]})}/>}
        {trainerNav==="client"&&activeClient&&<TrainerClientView client={activeClient} tab={clientTab} setTab={setClientTab}
          templates={templates} onUpdate={updateClient}
          onBack={()=>{setTrainerNav("clients");setActiveClientId(null);}}
          onDelete={id=>{saveClients(clients.filter(c=>c.id!==id));setTrainerNav("clients");setActiveClientId(null);}}
          onStartWorkout={(ev,tpl)=>startWorkout(ev,tpl,activeClient.id)}/>}
      </div>
    </div>
  );

  // DESKTOP trainer
  return(
    <div style={{display:"flex",height:"100vh",overflow:"hidden",background:C.bg}}>
      <style>{CSS}</style>
      {WorkoutOverlay}
      <div style={{width:sideW,transition:"width .25s",background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>
        <SidebarContent/>
        <div onClick={()=>setSideOpen(!sideOpen)} style={{padding:"10px",borderTop:`1px solid ${C.border}`,cursor:"pointer",color:C.muted,display:"flex",justifyContent:sideOpen?"flex-end":"center"}}>
          {sideOpen?<ChevronLeft size={15}/>:<ChevronRight size={15}/>}
        </div>
      </div>
      <div style={{flex:1,overflow:"auto",padding:"28px 32px"}}>
        {trainerNav==="dashboard"&&!activeClientId&&<DashboardView clients={clients} templates={templates} onOpen={openClient}/>}
        {trainerNav==="clients"&&!activeClientId&&<ClientsView clients={clients} saveClients={saveClients} onOpen={openClient}/>}
        {trainerNav==="templates"&&!activeClientId&&<TemplatesView templates={templates} saveTemplates={saveTemplates}
          onEdit={tpl=>setEditTemplate({...tpl,exercises:tpl.exercises.map(e=>({...e,_uid:uid()}))})}
          onCreate={()=>setEditTemplate({id:uid(),name:"Nuova Scheda",color:C.accent,exercises:[]})}/>}
        {trainerNav==="client"&&activeClient&&<TrainerClientView client={activeClient} tab={clientTab} setTab={setClientTab}
          templates={templates} onUpdate={updateClient}
          onBack={()=>{setTrainerNav("clients");setActiveClientId(null);}}
          onDelete={id=>{saveClients(clients.filter(c=>c.id!==id));setTrainerNav("clients");setActiveClientId(null);}}
          onStartWorkout={(ev,tpl)=>startWorkout(ev,tpl,activeClient.id)}/>}
      </div>
    </div>
  );
}

function LoginScreen({clients,onLoginTrainer,onLoginClient}){
  const [mode,setMode]=useState("choose");
  const [selId,setSelId]=useState(null);
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <div style={{width:"100%",maxWidth:"400px"}} className="fadeUp">
        <div style={{textAlign:"center",marginBottom:"36px"}}>
          <div style={{width:"64px",height:"64px",background:C.accent,borderRadius:"18px",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:`0 0 40px ${C.accent}44`}}>
            <span style={{fontFamily:FONT,fontWeight:900,fontSize:"24px",color:"#000"}}>SM</span>
          </div>
          <div style={{fontFamily:FONT,fontWeight:900,fontSize:"26px"}}>Simone <span style={{color:C.accent}}>Minici</span></div>
          <div style={{color:C.muted,fontSize:"13px",marginTop:"4px"}}>Fitness Coaching Platform</div>
        </div>

        {mode==="choose"&&<div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
          <div style={{color:C.muted,fontSize:"11px",textAlign:"center",marginBottom:"4px",textTransform:"uppercase",letterSpacing:"0.06em"}}>Accedi come</div>
          <button onClick={onLoginTrainer} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"14px",padding:"18px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:"14px"}}>
            <div style={{width:"44px",height:"44px",borderRadius:"12px",background:C.accent+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",flexShrink:0}}>🎓</div>
            <div><div style={{fontFamily:FONT,fontWeight:700,fontSize:"15px"}}>Trainer</div><div style={{color:C.muted,fontSize:"12px"}}>Gestisci tutti i tuoi clienti</div></div>
            <ChevronRight size={15} color={C.muted} style={{marginLeft:"auto"}}/>
          </button>
          <button onClick={()=>setMode("client")} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"14px",padding:"18px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:"14px"}}>
            <div style={{width:"44px",height:"44px",borderRadius:"12px",background:C.blue+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",flexShrink:0}}>👤</div>
            <div><div style={{fontFamily:FONT,fontWeight:700,fontSize:"15px"}}>Cliente</div><div style={{color:C.muted,fontSize:"12px"}}>Accedi alla tua dashboard</div></div>
            <ChevronRight size={15} color={C.muted} style={{marginLeft:"auto"}}/>
          </button>
        </div>}

        {mode==="client"&&<Card>
          <button onClick={()=>setMode("choose")} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",display:"flex",alignItems:"center",gap:"5px",fontSize:"12px",marginBottom:"16px",padding:0}}><ChevronLeft size={14}/>Indietro</button>
          <div style={{fontFamily:FONT,fontWeight:700,marginBottom:"14px"}}>👤 Seleziona cliente</div>
          <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
            {clients.map(c=>(
              <div key={c.id} onClick={()=>onLoginClient(c.id)} style={{display:"flex",alignItems:"center",gap:"10px",padding:"12px 14px",borderRadius:"10px",border:`1px solid ${C.border}`,background:C.bg,cursor:"pointer"}}>
                <div style={{width:"32px",height:"32px",borderRadius:"50%",background:C.blue+"22",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FONT,fontWeight:800,fontSize:"13px",color:C.blue}}>{c.name.charAt(0)}</div>
                <div style={{flex:1}}><div style={{fontWeight:600,fontSize:"14px"}}>{c.name}</div>{c.goal&&<div style={{color:C.muted,fontSize:"11px"}}>{c.goal}</div>}</div>
                <ChevronRight size={14} color={C.muted}/>
              </div>
            ))}
          </div>
        </Card>}
      </div>
    </div>
  );
}

function DashboardView({clients,templates,onOpen}){
  const isMobile=useIsMobile();
  const today=todayStr();

  function clientScore(c){
    const weekStart=new Date();weekStart.setDate(weekStart.getDate()-6);weekStart.setHours(0,0,0,0);
    const weekEvs=c.workoutEvents.filter(e=>new Date(e.date+"T12:00:00")>=weekStart);
    const scheduled=weekEvs.length;
    const done=weekEvs.filter(e=>e.status==="completed").length;
    const target=parseInt(c.targets?.workoutsPerWeek||3);
    const workoutPct=target>0?done/target:done>0?1:0;
    const weekMeals=(c.meals||[]).filter(m=>new Date(m.date+"T12:00:00")>=weekStart);
    const mealRating=weekMeals.length>0?weekMeals.reduce((s,m)=>s+(m.rating||0),0)/weekMeals.length:null;
    const wArr=[...c.weight].sort((a,b)=>a.date.localeCompare(b.date));
    const wTrend=wArr.length>=2?wArr.at(-1).value-wArr.at(-2).value:null;
    const goalIsLoss=c.goal?.toLowerCase().includes("dimagrimento")||c.goal?.toLowerCase().includes("perdita");
    const goalIsGain=c.goal?.toLowerCase().includes("massa")||c.goal?.toLowerCase().includes("aumento");
    let wStatus="neutral";
    if(wTrend!==null){
      if(goalIsLoss)wStatus=wTrend<-0.1?"good":wTrend>0.3?"bad":"ok";
      else if(goalIsGain)wStatus=wTrend>0.1?"good":wTrend<-0.3?"bad":"ok";
    }
    const lastCheckin=(c.checkins||[]).at(-1);
    const checkinDays=lastCheckin?Math.floor((Date.now()-new Date(lastCheckin.date+"T12:00:00"))/86400000):999;
    const checkinAvg=lastCheckin?(lastCheckin.energy+lastCheckin.diet+lastCheckin.sleep)/3:null;
    const trafficWorkout=workoutPct>=0.9?"green":workoutPct>=0.5?"yellow":"red";
    const trafficMeal=mealRating===null?"grey":mealRating>=3.5?"green":mealRating>=2?"yellow":"red";
    const trafficWeight=wStatus==="good"?"green":wStatus==="ok"?"yellow":wStatus==="bad"?"red":"grey";
    const trafficCheckin=checkinDays<=7?"green":checkinDays<=14?"yellow":"red";

    // NEW: pain flag from last checkin
    const hasPain=lastCheckin?.pain&&lastCheckin.pain.trim().length>0;

    // NEW: checkin energy trend (last 2)
    const recentCheckins=[...(c.checkins||[])].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,2);
    const energyTrend=recentCheckins.length===2&&recentCheckins[0].energy&&recentCheckins[1].energy
      ?recentCheckins[0].energy-recentCheckins[1].energy:null;

    // NEW: progression ready
    const progressionReady=templates.some(tpl=>
      tpl.exercises.some((ex,exIdx)=>{
        if(!ex.targetKg||ex.targetKg<=0)return false;
        const history=[...c.workoutEvents]
          .filter(e=>e.status==="completed"&&e.templateId===tpl.id&&e.completedSets?.length>exIdx)
          .sort((a,b)=>b.date.localeCompare(a.date)).slice(0,2);
        if(history.length<2)return false;
        return history.every(ev=>{
          const sets=ev.completedSets[exIdx]||[];
          return sets.length>0&&sets.every(s=>s.done&&(parseInt(s.reps)||0)>=ex.targetReps&&(parseFloat(s.kg)||0)>=ex.targetKg);
        });
      })
    );

    const reds=[trafficWorkout,trafficMeal,trafficWeight,trafficCheckin].filter(t=>t==="red").length;
    const yellows=[trafficWorkout,trafficMeal,trafficWeight,trafficCheckin].filter(t=>t==="yellow").length;
    const bpFilled=Object.keys(c.blueprint||{}).filter(k=>c.blueprint[k]&&k!=="clientUpdatedAt"&&k!=="updatedAt").length>0;
    const onboardingComplete=!!(c.blueprint?.noteTrained||c.blueprint?.obiettivoVita);
    const onboardingStatus=onboardingComplete?"complete":bpFilled?"blueprint-ok":"nuovo";
    return{done,scheduled,target,workoutPct,mealRating,wTrend,wStatus,wLast:wArr.at(-1)?.value,checkinDays,checkinAvg,trafficWorkout,trafficMeal,trafficWeight,trafficCheckin,reds,yellows,hasPain,energyTrend,progressionReady,onboardingStatus};
  }

  const scores=clients.map(c=>({c,s:clientScore(c)}));
  const sorted=[...scores].sort((a,b)=>b.s.reds-a.s.reds||b.s.yellows-a.s.yellows);
  const needsAttention=sorted.filter(({s})=>s.reds>0||s.yellows>=2||s.hasPain);

  const weekStart=new Date();weekStart.setDate(weekStart.getDate()-6);weekStart.setHours(0,0,0,0);
  const totalDoneWeek=clients.reduce((s,c)=>s+c.workoutEvents.filter(e=>e.status==="completed"&&new Date(e.date+"T12:00:00")>=weekStart).length,0);
  const totalScheduledWeek=clients.reduce((s,c)=>s+c.workoutEvents.filter(e=>new Date(e.date+"T12:00:00")>=weekStart).length,0);
  const checkinsDone=clients.filter(c=>{const l=(c.checkins||[]).at(-1);return l&&Math.floor((Date.now()-new Date(l.date+"T12:00:00"))/86400000)<=7;}).length;
  const allGreen=sorted.filter(({s})=>s.reds===0&&s.yellows===0).length;
  const progressionCount=sorted.filter(({s})=>s.progressionReady).length;

  function TLight({status,label}){
    const col=status==="green"?C.success:status==="yellow"?C.orange:status==="red"?C.danger:C.border;
    return(
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",minWidth:"48px"}}>
        <div style={{width:"14px",height:"14px",borderRadius:"50%",background:status==="grey"?C.border:col,boxShadow:status!=="grey"?`0 0 6px ${col}44`:"none"}}/>
        <div style={{fontSize:"9px",color:C.muted,textAlign:"center",lineHeight:1.2,whiteSpace:"nowrap"}}>{label}</div>
      </div>
    );
  }

  return(
    <div style={{display:"flex",flexDirection:"column",gap:"24px"}}>

      <div>
        <div style={{color:C.muted,fontSize:"12px",marginBottom:"4px"}}>{new Date().toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
        <h1 style={{fontFamily:FONT,fontSize:isMobile?"20px":"26px",fontWeight:900,margin:0}}>Ciao <span style={{color:C.accent}}>Simone</span> 👋</h1>
      </div>

      {/* WEEKLY SUMMARY */}
      <Card style={{background:`linear-gradient(135deg,${C.accent}14,${C.accent}05)`,border:`1px solid ${C.accentMid}`}}>
        <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",marginBottom:"14px",color:C.accent}}>📅 Questa settimana</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px"}}>
          {[
            {label:"Allenamenti",value:`${totalDoneWeek}/${totalScheduledWeek}`,sub:"completati",color:totalDoneWeek>=totalScheduledWeek*0.8?C.success:C.orange,icon:"🏋️"},
            {label:"Check-in",value:`${checkinsDone}/${clients.length}`,sub:"ricevuti",color:checkinsDone===clients.length?C.success:checkinsDone>=clients.length*0.5?C.orange:C.danger,icon:"📋"},
            {label:"On track",value:`${allGreen}/${clients.length}`,sub:"clienti",color:allGreen===clients.length?C.success:allGreen>=clients.length*0.7?C.orange:C.danger,icon:"🎯"},
            {label:"Progressioni",value:progressionCount,sub:"pronte",color:progressionCount>0?C.accent:C.muted,icon:"📈"},
          ].map(s=>(
            <div key={s.label} style={{textAlign:"center",background:C.surface,borderRadius:"12px",padding:"10px 6px"}}>
              <div style={{fontSize:"18px",marginBottom:"4px"}}>{s.icon}</div>
              <div style={{fontFamily:FONT,fontWeight:900,fontSize:"20px",color:s.color,lineHeight:1}}>{s.value}</div>
              <div style={{color:C.muted,fontSize:"9px",marginTop:"3px"}}>{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* NEEDS ATTENTION */}
      {needsAttention.length>0&&(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"12px"}}>
            <Bell size={14} color={C.danger}/>
            <span style={{fontFamily:FONT,fontWeight:700,fontSize:"14px",color:C.danger}}>Richiede attenzione</span>
            <div style={{background:C.danger,color:"#fff",borderRadius:"999px",padding:"1px 8px",fontSize:"11px",fontWeight:700}}>{needsAttention.length}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {needsAttention.map(({c,s})=>{
              const alerts=getClientAlerts(c);
              const worstAlert=alerts.find(a=>a.level==="danger")||alerts.find(a=>a.level==="warning")||alerts[0];
              return(
                <div key={c.id} style={{background:C.card,border:`1px solid ${s.reds>0||s.hasPain?C.danger+"44":C.orange+"44"}`,borderRadius:"14px",padding:"14px 16px",display:"flex",alignItems:"center",gap:"12px"}}>
                  <div style={{width:"36px",height:"36px",borderRadius:"50%",background:s.reds>0?C.danger+"22":C.orange+"22",border:`2px solid ${s.reds>0?C.danger+"55":C.orange+"55"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FONT,fontWeight:800,fontSize:"14px",color:s.reds>0?C.danger:C.orange,flexShrink:0}}>{c.name.charAt(0)}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:"6px",flexWrap:"wrap"}}>
                      <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                      {s.onboardingStatus==="nuovo"&&<span style={{fontSize:"9px",background:C.orange+"22",color:C.orange,border:`1px solid ${C.orange}44`,borderRadius:"999px",padding:"1px 6px",fontWeight:700}}>NUOVO</span>}
                      {s.onboardingStatus==="blueprint-ok"&&<span style={{fontSize:"9px",background:C.blue+"22",color:C.blue,border:`1px solid ${C.blue}44`,borderRadius:"999px",padding:"1px 6px",fontWeight:700}}>BP ✓</span>}
                    </div>
                    {s.hasPain&&<div style={{fontSize:"11px",color:C.danger,marginTop:"2px"}}>🩹 {(c.checkins||[]).at(-1)?.pain}</div>}
                    {!s.hasPain&&worstAlert&&<div style={{fontSize:"11px",color:s.reds>0?C.danger:C.orange,marginTop:"2px"}}>{worstAlert?.icon} {worstAlert?.msg}</div>}
                    {s.energyTrend!==null&&<div style={{fontSize:"10px",color:s.energyTrend<0?C.danger:C.success,marginTop:"2px"}}>{s.energyTrend<0?"⬇ Energia in calo":"⬆ Energia in aumento"} ({s.energyTrend>0?"+":""}{s.energyTrend} rispetto alla settimana scorsa)</div>}
                    <div style={{display:"flex",gap:"6px",marginTop:"6px",flexWrap:"wrap"}}>
                      <TLight status={s.trafficWorkout} label="Workout"/>
                      <TLight status={s.trafficMeal} label="Dieta"/>
                      <TLight status={s.trafficWeight} label="Peso"/>
                      <TLight status={s.trafficCheckin} label="Check-in"/>
                    </div>
                    <div style={{display:"flex",gap:"6px",marginTop:"6px",flexWrap:"wrap"}}>
                      {s.lastCheckinPain&&<span style={{fontSize:"10px",background:C.danger+"18",border:`1px solid ${C.danger}33`,borderRadius:"999px",padding:"2px 8px",color:C.danger}}>🩹 {s.lastCheckinPain}</span>}
                      {s.energyTrend!==null&&s.energyTrend<0&&<span style={{fontSize:"10px",background:C.orange+"18",border:`1px solid ${C.orange}33`,borderRadius:"999px",padding:"2px 8px",color:C.orange}}>⚡ Energia in calo</span>}
                      {s.progressionReady&&<span style={{fontSize:"10px",background:C.accent+"18",border:`1px solid ${C.accent}33`,borderRadius:"999px",padding:"2px 8px",color:C.accent}}>📈 Pronto a progredire</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:"6px",flexShrink:0}}>
                    <a href={`https://wa.me/${SIMONE_WA}`} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{display:"flex",alignItems:"center",gap:"5px",background:"#25D366",borderRadius:"8px",padding:"6px 10px",textDecoration:"none",color:"#000",fontWeight:700,fontSize:"11px"}}>💬</a>
                    <button onClick={()=>onOpen(c.id)} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"6px 10px",cursor:"pointer",color:C.muted,display:"flex",alignItems:"center",justifyContent:"center"}}><ChevronRight size={13}/></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PROGRESSION READY */}
      {(()=>{
        const readyClients=sorted.filter(({s})=>s.readyToProgress&&s.reds===0&&s.yellows<2);
        if(readyClients.length===0)return null;
        return(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"12px"}}>
              <span style={{fontSize:"16px"}}>📈</span>
              <span style={{fontFamily:FONT,fontWeight:700,fontSize:"14px",color:C.accent}}>Pronti a progredire</span>
              <div style={{background:C.accent,color:"#000",borderRadius:"999px",padding:"1px 8px",fontSize:"11px",fontWeight:700}}>{readyClients.length}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}> 
              {readyClients.map(({c})=>(
                <div key={c.id} style={{background:C.card,border:`1px solid ${C.accentMid}`,borderRadius:"14px",padding:"12px 16px",display:"flex",alignItems:"center",gap:"12px",cursor:"pointer"}} onClick={()=>onOpen(c.id)}>
                  <div style={{width:"36px",height:"36px",borderRadius:"50%",background:C.accentDim,border:`2px solid ${C.accentMid}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FONT,fontWeight:800,fontSize:"14px",color:C.accent,flexShrink:0}}>{c.name.charAt(0)}</div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                    <div style={{fontSize:"11px",color:C.accent,marginTop:"2px"}}>Almeno un esercizio pronto per il carico successivo</div>
                  </div>
                  <ChevronRight size={13} color={C.accent}/>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* SEMAPHORE TABLE */}
      <div>
        <div style={{fontFamily:FONT,fontWeight:700,fontSize:"14px",marginBottom:"12px"}}>📊 Panoramica clienti</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 48px 48px 48px 48px 24px 32px",gap:"8px",padding:"6px 12px",marginBottom:"4px"}}>
          <div style={{fontSize:"10px",color:C.muted,fontWeight:600,textTransform:"uppercase"}}>Cliente</div>
          {["🏋️","🍽","⚖️","📋","📈"].map((icon,i)=>(<div key={i} style={{fontSize:"13px",textAlign:"center"}}>{icon}</div>))}
          <div/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
          {sorted.map(({c,s})=>{
            const dotColor=s.reds>0?C.danger:s.yellows>0?C.orange:C.success;
            return(
              <div key={c.id} onClick={()=>onOpen(c.id)} style={{display:"grid",gridTemplateColumns:"1fr 48px 48px 48px 48px 24px 32px",gap:"8px",alignItems:"center",background:C.card,border:`1px solid ${s.hasPain?C.danger+"44":C.border}`,borderRadius:"12px",padding:"12px",cursor:"pointer",transition:"border-color .15s"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px",minWidth:0}}>
                  <div style={{width:"8px",height:"8px",borderRadius:"50%",background:dotColor,flexShrink:0,boxShadow:`0 0 5px ${dotColor}66`}}/>
                  <div style={{minWidth:0}}>
                    <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                    <div style={{fontSize:"10px",color:C.muted}}>{s.hasPain?"🩹 "+((c.checkins||[]).at(-1)?.pain):c.goal}</div>
                  </div>
                </div>
                {[s.trafficWorkout,s.trafficMeal,s.trafficWeight,s.trafficCheckin].map((t,i)=>{
                  const col=t==="green"?C.success:t==="yellow"?C.orange:t==="red"?C.danger:C.border;
                  return(<div key={i} style={{display:"flex",justifyContent:"center"}}><div style={{width:"20px",height:"20px",borderRadius:"50%",background:t==="grey"?C.border:col,boxShadow:t!=="grey"?`0 0 6px ${col}55`:"none"}}/></div>);
                })}
                <div style={{display:"flex",justifyContent:"center"}}>
                  {s.progressionReady?<div style={{width:"20px",height:"20px",borderRadius:"50%",background:C.accent,boxShadow:`0 0 6px ${C.accent}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px"}}>↑</div>:<div style={{width:"20px",height:"20px",borderRadius:"50%",background:C.border}}/>}
                </div>
                <ChevronRight size={13} color={C.muted}/>
              </div>
            );
          })}
        </div>
        <div style={{display:"flex",gap:"16px",marginTop:"10px",flexWrap:"wrap"}}>
          {[{col:C.success,label:"On track"},{col:C.orange,label:"Attenzione"},{col:C.danger,label:"Problema"},{col:C.border,label:"Dati mancanti"}].map(l=>(
            <div key={l.label} style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"10px",color:C.muted}}>
              <div style={{width:"8px",height:"8px",borderRadius:"50%",background:l.col}}/>{l.label}
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:"20px",marginTop:"8px",flexWrap:"wrap",paddingLeft:"13px"}}>
          {[{icon:"🏋️",label:"Workout"},{icon:"🍽",label:"Dieta"},{icon:"⚖️",label:"Peso"},{icon:"📋",label:"Check-in"},{icon:"📈",label:"Progressione"}].map(l=>(
            <div key={l.label} style={{fontSize:"10px",color:C.muted}}>{l.icon} {l.label}</div>
          ))}
        </div>
      </div>

    </div>
  );
}


function ClientsView({clients,saveClients,onOpen}){
  const isMobile=useIsMobile();
  const [showAdd,setShowAdd]=useState(false);
  const [search,setSearch]=useState("");
  const [form,setForm]=useState({name:"",age:"",height:"",goal:""});
  const filtered=search.trim()?clients.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.goal?.toLowerCase().includes(search.toLowerCase())):clients;
  function addClient(){
    if(!form.name.trim())return;
    saveClients([...clients,{id:uid(),...form,weight:[],calories:[],meals:[],checkins:[],workoutEvents:[],messages:[],targets:{weight:"",kcal:"",protein:"",carbs:"",fats:"",workoutsPerWeek:""},mealPlan:"4pasti"}]);
    setForm({name:"",age:"",height:"",goal:""});setShowAdd(false);
  }
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
        <div><h1 style={{fontFamily:FONT,fontSize:"24px",fontWeight:900}}>Clienti</h1><div style={{color:C.muted,fontSize:"12px"}}>{clients.length} iscritti</div></div>
        <Btn onClick={()=>setShowAdd(true)}><Plus size={15}/>Nuovo</Btn>
      </div>
      <div style={{position:"relative",marginBottom:"20px"}}>
        <Search size={14} style={{position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)",color:C.muted,pointerEvents:"none"}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca cliente..." style={{paddingLeft:"34px",width:"100%",boxSizing:"border-box"}}/>
      </div>
      {showAdd&&<Card style={{marginBottom:"18px",border:`1px solid ${C.accentMid}`}}>
        <div style={{fontFamily:FONT,fontWeight:700,marginBottom:"12px"}}>Nuovo cliente</div>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:"9px",marginBottom:"10px"}}>
          <input placeholder="Nome e cognome *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{gridColumn:"1 / -1"}}/>
          <input placeholder="Età" value={form.age} onChange={e=>setForm({...form,age:e.target.value})}/>
          <input placeholder="Altezza (cm)" value={form.height} onChange={e=>setForm({...form,height:e.target.value})}/>
          <input placeholder="Obiettivo" value={form.goal} onChange={e=>setForm({...form,goal:e.target.value})} style={{gridColumn:"1 / -1"}}/>

        </div>
        <div style={{display:"flex",gap:"8px"}}><Btn onClick={addClient}><Check size={13}/>Salva</Btn><Btn variant="ghost" onClick={()=>setShowAdd(false)}><X size={13}/>Annulla</Btn></div>
      </Card>}
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(auto-fill, minmax(280px, 1fr))",gap:"14px"}}>
        {filtered.map(c=>{
          const alerts=getClientAlerts(c);
          const lw=c.weight.at(-1);const pw=c.weight.at(-2);
          const delta=lw&&pw?(lw.value-pw.value).toFixed(1):null;
          const upcoming=c.workoutEvents.filter(e=>e.date>=todayStr()&&e.status==="scheduled").length;
          return(
            <div key={c.id} onClick={()=>onOpen(c.id)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"16px",padding:"18px",cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"}}>
                <div style={{width:"38px",height:"38px",borderRadius:"50%",background:C.accentDim,border:`2px solid ${C.accentMid}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FONT,fontWeight:800,fontSize:"14px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:C.accent}}>{c.name.charAt(0)}</div>
                <div style={{flex:1}}><div style={{fontFamily:FONT,fontWeight:700,fontSize:"14px"}}>{c.name}</div><div style={{color:C.muted,fontSize:"11px"}}>{c.goal}</div></div>
                {alerts.length>0&&<AlertBadge alerts={alerts}/>}
              </div>
              <div style={{display:"flex",gap:"8px"}}>
                {lw&&<div style={{flex:1,background:C.bg,borderRadius:"8px",padding:"8px"}}><div style={{color:C.muted,fontSize:"9px",textTransform:"uppercase"}}>Peso</div><div style={{fontFamily:FONT,fontWeight:800,fontSize:"14px"}}>{lw.value}kg</div>{delta!==null&&<div style={{fontSize:"10px",color:parseFloat(delta)<0?C.success:C.danger}}>{parseFloat(delta)<0?"▼":"▲"}{Math.abs(delta)}kg</div>}</div>}
                <div style={{flex:1,background:C.bg,borderRadius:"8px",padding:"8px"}}><div style={{color:C.muted,fontSize:"9px",textTransform:"uppercase"}}>Prossimi</div><div style={{fontFamily:FONT,fontWeight:800,fontSize:"14px",color:C.orange}}>{upcoming}</div><div style={{fontSize:"10px",color:C.muted}}>workout</div></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TemplatesView({templates,saveTemplates,onEdit,onCreate}){
  const isMobile=useIsMobile();
  const [renamingId,setRenamingId]=useState(null);
  const [renameVal,setRenameVal]=useState("");
  const [deleteId,setDeleteId]=useState(null);
  function duplicate(tpl){saveTemplates([...templates,{...tpl,id:uid(),name:tpl.name+" (copia)",exercises:tpl.exercises.map(e=>({...e}))}]);}
  function del(id){saveTemplates(templates.filter(t=>t.id!==id));setDeleteId(null);}
  function startRename(tpl){setRenamingId(tpl.id);setRenameVal(tpl.name);}
  function confirmRename(id){if(renameVal.trim())saveTemplates(templates.map(t=>t.id===id?{...t,name:renameVal.trim()}:t));setRenamingId(null);}
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}>
        <div><h1 style={{fontFamily:FONT,fontSize:"24px",fontWeight:900}}>Schede Workout</h1><div style={{color:C.muted,fontSize:"12px"}}>{templates.length} schede create</div></div>
        <Btn onClick={onCreate}><Plus size={15}/>Nuova scheda</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(auto-fill, minmax(300px, 1fr))",gap:"14px"}}>
        {templates.map(tpl=>(
          <Card key={tpl.id}>
            {deleteId===tpl.id&&(
              <div style={{background:C.danger+"0d",border:`1px solid ${C.danger}44`,borderRadius:"10px",padding:"10px 12px",marginBottom:"12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"8px"}}>
                <span style={{fontSize:"12px",color:C.danger}}>Eliminare "{tpl.name}"?</span>
                <div style={{display:"flex",gap:"6px"}}>
                  <Btn size="sm" variant="danger" onClick={()=>del(tpl.id)}><Check size={11}/>Sì</Btn>
                  <Btn size="sm" variant="ghost" onClick={()=>setDeleteId(null)}><X size={11}/>No</Btn>
                </div>
              </div>
            )}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",flex:1,minWidth:0}}>
                <div style={{width:"10px",height:"10px",borderRadius:"50%",background:tpl.color,flexShrink:0}}/>
                {renamingId===tpl.id?(
                  <div style={{display:"flex",gap:"5px",flex:1}}>
                    <input value={renameVal} onChange={e=>setRenameVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")confirmRename(tpl.id);if(e.key==="Escape")setRenamingId(null);}} autoFocus style={{flex:1,fontSize:"14px",padding:"3px 8px"}}/>
                    <Btn size="sm" onClick={()=>confirmRename(tpl.id)}><Check size={11}/></Btn>
                    <Btn size="sm" variant="ghost" onClick={()=>setRenamingId(null)}><X size={11}/></Btn>
                  </div>
                ):(
                  <div style={{fontFamily:FONT,fontWeight:700,fontSize:"15px",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tpl.name}</div>
                )}
              </div>
              {renamingId!==tpl.id&&<div style={{display:"flex",gap:"5px",flexShrink:0}}>
                <Btn size="sm" variant="ghost" onClick={()=>startRename(tpl)} title="Rinomina"><Edit size={12}/></Btn>
                <Btn size="sm" variant="ghost" onClick={()=>duplicate(tpl)} title="Duplica"><Copy size={12}/></Btn>
                <Btn size="sm" variant="ghost" onClick={()=>onEdit(tpl)} title="Modifica">✏️</Btn>
                <Btn size="sm" variant="danger" onClick={()=>setDeleteId(tpl.id)} title="Elimina"><Trash2 size={12}/></Btn>
              </div>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"5px",marginBottom:"12px"}}>
              {tpl.exercises.map((ex,i)=>{const e=getEx(ex.exId);return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:"8px",padding:"6px 10px",background:C.bg,borderRadius:"8px",fontSize:"12px"}}>
                  <div style={{width:"6px",height:"6px",borderRadius:"50%",background:MUSCLE_COLORS[e.muscle]||C.muted,flexShrink:0}}/>
                  <span style={{flex:1}}>{e.name}</span>
                  <span style={{color:C.muted}}>{ex.sets}×{ex.targetReps}{ex.targetKg>0?` @${ex.targetKg}kg`:""}</span>
                  <a href={ytUrl(e.name)} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{color:C.danger,display:"flex"}}><Youtube size={13}/></a>
                </div>
              );})}
            </div>
            <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
              {[...new Set(tpl.exercises.map(ex=>getEx(ex.exId).muscle))].map(m=><Tag key={m} label={m} color={MUSCLE_COLORS[m]||C.muted}/>)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TemplateBuilder({template,onSave,onCancel}){
  const isMobile=useIsMobile();
  const [tpl,setTpl]=useState({...template,exercises:template.exercises.map(e=>({...e,_uid:e._uid||uid()}))});
  const [search,setSearch]=useState("");
  const [filterM,setFilterM]=useState("tutti");
  const [filterEq,setFilterEq]=useState("tutti");
  const [filterT,setFilterT]=useState("tutti");
  const [showF,setShowF]=useState(false);
  const [showLib,setShowLib]=useState(false);
  const dragIdx=useRef(null);

  const filtered=EX.filter(e=>(filterM==="tutti"||e.muscle===filterM)&&(filterEq==="tutti"||e.equipment===filterEq)&&(filterT==="tutti"||e.type===filterT)&&(!search||e.name.toLowerCase().includes(search.toLowerCase())));
  function addEx(e){setTpl(t=>({...t,exercises:[...t.exercises,{exId:e.id,sets:3,targetKg:0,targetReps:10,restSec:90,_uid:uid()}]}));}
  function removeEx(_uid){setTpl(t=>({...t,exercises:t.exercises.filter(e=>e._uid!==_uid)}));}
  function updateEx(_uid,field,val){setTpl(t=>({...t,exercises:t.exercises.map(e=>e._uid===_uid?{...e,[field]:val}:e)}));}
  function moveEx(idx,dir){
    const exs=[...tpl.exercises];const ni=idx+dir;
    if(ni<0||ni>=exs.length)return;
    [exs[idx],exs[ni]]=[exs[ni],exs[idx]];
    setTpl(t=>({...t,exercises:exs}));
  }
  function onDrop(i){
    if(dragIdx.current===null||dragIdx.current===i)return;
    const exs=[...tpl.exercises];const [d]=exs.splice(dragIdx.current,1);exs.splice(i,0,d);
    setTpl(t=>({...t,exercises:exs}));dragIdx.current=null;
  }
  function save(){onSave({...tpl,exercises:tpl.exercises.map(({_uid,...r})=>r)});}

  const LibraryPanel=()=>(
    <div style={{background:C.surface,borderRadius:"16px",border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",height:isMobile?"70vh":"calc(100vh - 140px)",overflow:"hidden"}}>
      <div style={{padding:"14px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",marginBottom:"10px"}}>📚 Libreria ({EX.length} esercizi)</div>
        <div style={{position:"relative",marginBottom:"8px"}}>
          <Search size={14} style={{position:"absolute",left:"10px",top:"50%",transform:"translateY(-50%)",color:C.muted}}/>
          <input placeholder="Cerca…" value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:"32px"}}/>
        </div>
        <button onClick={()=>setShowF(!showF)} style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"11px",color:C.muted,background:"transparent",border:"none",cursor:"pointer",padding:0}}><Filter size={11}/>Filtri {showF?"▲":"▼"}</button>
        {showF&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",marginTop:"8px"}}>
          {[{label:"Muscolo",val:filterM,set:setFilterM,opts:ALL_MUSCLES},{label:"Attrezzo",val:filterEq,set:setFilterEq,opts:ALL_EQ},{label:"Tipo",val:filterT,set:setFilterT,opts:ALL_TYPES}].map(({label,val,set,opts})=>(
            <div key={label}><div style={{color:C.muted,fontSize:"9px",textTransform:"uppercase",marginBottom:"3px"}}>{label}</div>
            <select value={val} onChange={e=>set(e.target.value)} style={{padding:"6px 8px",fontSize:"11px"}}>{opts.map(o=><option key={o}>{o}</option>)}</select></div>
          ))}
        </div>}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"8px"}}>
        {filtered.length===0&&<div style={{textAlign:"center",padding:"24px",color:C.muted}}>Nessun esercizio trovato</div>}
        {filtered.map(e=>{
          const inTpl=tpl.exercises.some(ex=>ex.exId===e.id);
          return(
            <div key={e.id} style={{display:"flex",alignItems:"center",gap:"8px",padding:"8px 10px",borderRadius:"9px",marginBottom:"2px",background:inTpl?C.accentDim:"transparent",border:`1px solid ${inTpl?C.accentMid:"transparent"}`}}>
              <div onClick={()=>addEx(e)} style={{flex:1,cursor:"pointer",display:"flex",alignItems:"center",gap:"8px"}}>
                <div style={{width:"7px",height:"7px",borderRadius:"50%",background:MUSCLE_COLORS[e.muscle]||C.muted,flexShrink:0}}/>
                <div>
                  <div style={{fontSize:"12px",fontWeight:inTpl?700:500}}>{e.name}</div>
                  <div style={{fontSize:"9px",color:C.muted}}>{e.muscle} · {e.equipment}</div>
                </div>
              </div>
              <a href={ytUrl(e.name)} target="_blank" rel="noreferrer" style={{color:C.danger,display:"flex",padding:"4px"}}><Youtube size={13}/></a>
              {inTpl?<Check size={13} color={C.accent}/>:<Plus size={13} color={C.muted} style={{cursor:"pointer"}} onClick={()=>addEx(e)}/>}
            </div>
          );
        })}
      </div>
    </div>
  );

  return(
    <div style={{maxWidth:"1100px",margin:"0 auto",padding:isMobile?"16px":"28px 24px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
        <button onClick={onCancel} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"9px",padding:"7px",cursor:"pointer",color:C.muted,display:"flex"}}><ChevronLeft size={16}/></button>
        <input value={tpl.name} onChange={e=>setTpl(t=>({...t,name:e.target.value}))} style={{background:"transparent",border:"none",fontFamily:FONT,fontSize:isMobile?"18px":"22px",fontWeight:900,color:C.text,outline:"none",flex:1,padding:0}} placeholder="Nome scheda…"/>
        <div style={{display:"flex",gap:"4px"}}>
          {TPL_COLORS.map(col=><div key={col} onClick={()=>setTpl(t=>({...t,color:col}))} style={{width:"18px",height:"18px",borderRadius:"50%",background:col,cursor:"pointer",border:tpl.color===col?"3px solid #fff":"3px solid transparent"}}/>)}
        </div>
        <Btn onClick={save}><Check size={14}/>Salva</Btn>
      </div>

      {isMobile?(
        <div>
          {/* Mobile: toggle library */}
          <Btn variant="ghost" onClick={()=>setShowLib(!showLib)} style={{width:"100%",justifyContent:"center",marginBottom:"14px"}}><Search size={14}/>{showLib?"Chiudi libreria":"Aggiungi esercizi"}</Btn>
          {showLib&&<div style={{marginBottom:"16px"}}><LibraryPanel/></div>}
          <div style={{fontFamily:FONT,fontWeight:700,marginBottom:"10px",fontSize:"14px"}}>Scheda ({tpl.exercises.length} esercizi)</div>
          {tpl.exercises.length===0&&<div style={{textAlign:"center",padding:"40px",color:C.muted,background:C.card,borderRadius:"14px",border:`2px dashed ${C.border}`}}>Aggiungi esercizi dalla libreria ↑</div>}
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {tpl.exercises.map((ex,i)=>{const e=getEx(ex.exId);return(
              <div key={ex._uid} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"12px",padding:"12px 14px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}}>
                  <div style={{width:"8px",height:"8px",borderRadius:"50%",background:MUSCLE_COLORS[e.muscle]||C.muted,flexShrink:0}}/>
                  <div style={{flex:1}}><div style={{fontWeight:700,fontSize:"13px"}}>{e.name}</div><div style={{color:C.muted,fontSize:"10px"}}>{e.muscle} · {e.equipment}</div></div>
                  <a href={ytUrl(e.name)} target="_blank" rel="noreferrer" style={{color:C.danger,display:"flex",padding:"4px"}}><Youtube size={14}/></a>
                  <div style={{display:"flex",gap:"3px"}}>
                    <button onClick={()=>moveEx(i,-1)} disabled={i===0} style={{background:"transparent",border:"none",cursor:"pointer",color:C.muted,padding:"3px"}}>▲</button>
                    <button onClick={()=>moveEx(i,1)} disabled={i===tpl.exercises.length-1} style={{background:"transparent",border:"none",cursor:"pointer",color:C.muted,padding:"3px"}}>▼</button>
                  </div>
                  <button onClick={()=>removeEx(ex._uid)} style={{background:"transparent",border:"none",cursor:"pointer",color:C.muted}}><X size={14}/></button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"6px"}}>
                  {[{field:"sets",label:"Serie"},{field:"targetKg",label:"KG"},{field:"targetReps",label:"Reps"},{field:"restSec",label:"Pausa"}].map(({field,label})=>(
                    <div key={field}><div style={{color:C.muted,fontSize:"9px",textTransform:"uppercase",marginBottom:"3px"}}>{label}</div>
                    <input type="number" value={ex[field]||0} onChange={ev=>updateEx(ex._uid,field,parseInt(ev.target.value)||0)} style={{padding:"6px 4px",fontSize:"13px",textAlign:"center"}}/></div>
                  ))}
                </div>
              </div>
            );})}
          </div>
        </div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:"20px"}}>
          <div>
            <div style={{fontFamily:FONT,fontWeight:700,marginBottom:"12px",fontSize:"14px"}}>Esercizi nella scheda ({tpl.exercises.length})</div>
            {tpl.exercises.length===0&&<div style={{textAlign:"center",padding:"48px",color:C.muted,background:C.card,borderRadius:"14px",border:`2px dashed ${C.border}`}}>← Aggiungi esercizi dalla libreria</div>}
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {tpl.exercises.map((ex,i)=>{const e=getEx(ex.exId);return(
                <div key={ex._uid} draggable onDragStart={()=>{dragIdx.current=i;}} onDragOver={ev=>ev.preventDefault()} onDrop={()=>onDrop(i)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"12px",padding:"12px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"10px"}}>
                    <GripVertical size={16} color={C.muted} style={{cursor:"grab",flexShrink:0}}/>
                    <div style={{width:"8px",height:"8px",borderRadius:"50%",background:MUSCLE_COLORS[e.muscle]||C.muted,flexShrink:0}}/>
                    <div style={{flex:1}}><div style={{fontWeight:700,fontSize:"14px"}}>{e.name}</div><div style={{color:C.muted,fontSize:"10px"}}>{e.muscle} · {e.equipment}</div></div>
                    <a href={ytUrl(e.name)} target="_blank" rel="noreferrer" style={{color:C.danger,display:"flex",alignItems:"center",gap:"3px",fontSize:"11px",textDecoration:"none",padding:"4px 8px",background:C.danger+"18",borderRadius:"6px"}}><Youtube size={12}/>Tutorial</a>
                    <button onClick={()=>removeEx(ex._uid)} style={{background:"transparent",border:"none",cursor:"pointer",color:C.muted}}><X size={14}/></button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"8px"}}>
                    {[{field:"sets",label:"Serie"},{field:"targetKg",label:"KG"},{field:"targetReps",label:"Reps"},{field:"restSec",label:"Pausa(s)"}].map(({field,label})=>(
                      <div key={field}><div style={{color:C.muted,fontSize:"9px",textTransform:"uppercase",marginBottom:"4px"}}>{label}</div>
                      <input type="number" value={ex[field]||0} onChange={ev=>updateEx(ex._uid,field,parseInt(ev.target.value)||0)} style={{padding:"6px 8px",fontSize:"13px",textAlign:"center"}}/></div>
                    ))}
                  </div>
                </div>
              );})}
            </div>
          </div>
          <LibraryPanel/>
        </div>
      )}
    </div>
  );
}

// ─── WEEKLY CHECK-IN MODAL ────────────────────────────────────────────────────
// ─── ASSIGN PROGRAM MODAL ────────────────────────────────────────────────────
function AssignProgramModal({templates,onConfirm,onClose}){
  const DAYS=["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];
  const DAY_VALS=[1,2,3,4,5,6,0]; // JS getDay() values
  const [tplId,setTplId]=useState(templates[0]?.id||"");
  const [days,setDays]=useState([1,3,5]); // Mon/Wed/Fri default
  const [weeks,setWeeks]=useState(8);
  const [startDate,setStartDate]=useState(todayStr());

  function toggleDay(v){setDays(d=>d.includes(v)?d.filter(x=>x!==v):[...d,v].sort());}

  function generate(){
    if(!tplId||days.length===0)return;
    const events=[];
    const start=new Date(startDate+"T12:00:00");
    for(let w=0;w<weeks;w++){
      const isDeload=(w>0)&&(w%4===3); // every 4th week
      for(let d=0;d<7;d++){
        const date=new Date(start);
        date.setDate(start.getDate()+w*7+d);
        if(days.includes(date.getDay())){
          events.push({
            id:uid(),
            date:date.toISOString().slice(0,10),
            templateId:tplId,
            status:"scheduled",
            completedSets:[],
            feedback:null,
            isDeload,
          });
        }
      }
    }
    onConfirm(events,startDate);
  }

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
      <div style={{background:C.card,borderRadius:"20px",padding:"24px",width:"100%",maxWidth:"420px",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
          <div style={{fontFamily:FONT,fontWeight:900,fontSize:"17px"}}>📅 Assegna programma</div>
          <button onClick={onClose} style={{background:"transparent",border:"none",cursor:"pointer",color:C.muted}}><X size={18}/></button>
        </div>

        {/* Template selector */}
        <div style={{marginBottom:"18px"}}>
          <div style={{color:C.muted,fontSize:"10px",fontWeight:700,textTransform:"uppercase",marginBottom:"8px"}}>Scheda di allenamento</div>
          <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
            {templates.map(t=>(
              <div key={t.id} onClick={()=>setTplId(t.id)} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 12px",borderRadius:"10px",border:`2px solid ${tplId===t.id?t.color:C.border}`,background:tplId===t.id?t.color+"18":"transparent",cursor:"pointer"}}>
                <div style={{width:"10px",height:"10px",borderRadius:"50%",background:t.color,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:"13px"}}>{t.name}</div>
                  <div style={{fontSize:"10px",color:C.muted}}>{t.exercises?.length||0} esercizi</div>
                </div>
                {tplId===t.id&&<Check size={14} color={t.color}/>}
              </div>
            ))}
          </div>
        </div>

        {/* Day selector */}
        <div style={{marginBottom:"18px"}}>
          <div style={{color:C.muted,fontSize:"10px",fontWeight:700,textTransform:"uppercase",marginBottom:"8px"}}>Giorni della settimana</div>
          <div style={{display:"flex",gap:"6px"}}>
            {DAYS.map((label,i)=>{
              const val=DAY_VALS[i];
              const sel=days.includes(val);
              return(
                <button key={val} onClick={()=>toggleDay(val)} style={{flex:1,padding:"10px 0",borderRadius:"9px",border:`2px solid ${sel?C.accent:C.border}`,background:sel?C.accentDim:"transparent",cursor:"pointer",fontFamily:FONT,fontWeight:700,fontSize:"11px",color:sel?C.accent:C.muted}}>
                  {label}
                </button>
              );
            })}
          </div>
          <div style={{fontSize:"10px",color:C.muted,marginTop:"6px",textAlign:"center"}}>{days.length} giorni/settimana selezionati</div>
        </div>

        {/* Start date */}
        <div style={{marginBottom:"18px"}}>
          <div style={{color:C.muted,fontSize:"10px",fontWeight:700,textTransform:"uppercase",marginBottom:"8px"}}>Data di inizio</div>
          <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={{width:"100%"}}/>
        </div>

        {/* Weeks selector */}
        <div style={{marginBottom:"20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
            <div style={{color:C.muted,fontSize:"10px",fontWeight:700,textTransform:"uppercase"}}>Durata</div>
            <div style={{fontFamily:FONT,fontWeight:800,fontSize:"14px",color:C.accent}}>{weeks} settimane</div>
          </div>
          <input type="range" min="4" max="16" step="1" value={weeks} onChange={e=>setWeeks(parseInt(e.target.value))} style={{width:"100%",accentColor:C.accent}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"9px",color:C.muted,marginTop:"2px"}}>
            <span>4 sett.</span><span>8 sett.</span><span>12 sett.</span><span>16 sett.</span>
          </div>
        </div>

        {/* Deload info */}
        <div style={{background:C.orange+"14",border:`1px solid ${C.orange}33`,borderRadius:"10px",padding:"10px 14px",marginBottom:"20px",fontSize:"11px",color:C.orange}}>
          🔄 La settimana di scarico viene inserita automaticamente ogni 4 settimane ({Math.floor(weeks/4)} deload in questo blocco)
        </div>

        {/* Summary */}
        <div style={{background:C.surface,borderRadius:"10px",padding:"10px 14px",marginBottom:"18px",fontSize:"11px",color:C.muted}}>
          Totale sessioni programmate: <span style={{fontFamily:FONT,fontWeight:800,color:C.accent}}>{days.length*weeks}</span>
          {" · "}Dal {startDate} al {(()=>{const e=new Date(startDate+"T12:00:00");e.setDate(e.getDate()+weeks*7-1);return e.toISOString().slice(0,10);})()}
        </div>

        <div style={{display:"flex",gap:"8px"}}>
          <Btn onClick={generate} style={{flex:1,justifyContent:"center"}} disabled={!tplId||days.length===0}>
            <Calendar size={13}/>Assegna programma
          </Btn>
          <Btn variant="ghost" onClick={onClose}><X size={13}/></Btn>
        </div>
      </div>
    </div>
  );
}


function CheckinModal({onSubmit,onDismiss}){
  // kept for backward compat but no longer used as popup
  return null;
}


// ─── CLIENT HOME TAB ──────────────────────────────────────────────────────────
function ClientHomeTab({client,templates,onStartWorkout,onGoTo,onUpdate}){
  const isMobile=useIsMobile();
  const today=todayStr();
  const getTpl=id=>templates.find(t=>t.id===id);
  const isMonday=new Date().getDay()===1;
  const checkinPending=needsCheckin(client);
  const [showCheckinCard,setShowCheckinCard]=useState(true);

  function submitCheckin(data){
    onUpdate(client.id,c=>({...c,checkins:[...(c.checkins||[]),data]}));
    setShowCheckinCard(false);
  }

  // Today's workouts
  const todayEvs=client.workoutEvents.filter(e=>e.date===today);
  // Next scheduled workout
  const nextEv=[...client.workoutEvents].filter(e=>e.date>today&&e.status==="scheduled").sort((a,b)=>a.date.localeCompare(b.date))[0];
  // Stats
  const completed=client.workoutEvents.filter(e=>e.status==="completed");
  const totalSessions=completed.length;
  const lw=client.weight.at(-1);const fw=client.weight[0];
  const weightDelta=lw&&fw?(lw.value-fw.value).toFixed(1):null;
  const firstDate=completed.sort((a,b)=>a.date.localeCompare(b.date))[0]?.date;
  // Weekly compliance — denominator from client target
  const weekStart=new Date();weekStart.setDate(weekStart.getDate()-weekStart.getDay()+1);weekStart.setHours(0,0,0,0);
  const weekEnd=new Date(weekStart);weekEnd.setDate(weekStart.getDate()+6);weekEnd.setHours(23,59,59,999);
  const weekEvs=client.workoutEvents.filter(e=>{const d=new Date(e.date+"T12:00:00");return d>=weekStart&&d<=weekEnd;});
  const weekDone=weekEvs.filter(e=>e.status==="completed").length;
  const weekTarget=parseInt(client.targets?.workoutsPerWeek)||3;
  const compliancePct=Math.round(weekDone/weekTarget*100);
  // PRs
  const prs={};
  [...completed].forEach(ev=>{
    const tpl=getTpl(ev.templateId);if(!tpl||!ev.completedSets?.length)return;
    tpl.exercises.forEach((ex,i)=>{
      const sets=ev.completedSets[i]||[];const maxKg=Math.max(0,...sets.map(s=>parseFloat(s.kg)||0));
      if(maxKg>0&&(!prs[ex.exId]||maxKg>prs[ex.exId]))prs[ex.exId]=maxKg;
    });
  });
  const totalPRs=Object.keys(prs).length;
  // Last message from trainer


  // Blueprint nudge: show if blueprint not started yet
  const blueprintEmpty=!client.blueprint?.obiettivoPrincipale;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:"18px"}}>
      {/* BLUEPRINT NUDGE — shown until blueprint is filled */}
      {blueprintEmpty&&<div style={{background:`linear-gradient(135deg,${C.accent}18,${C.accent}08)`,border:`2px solid ${C.accentMid}`,borderRadius:"16px",padding:"16px 18px",display:"flex",alignItems:"center",gap:"14px",cursor:"pointer"}} onClick={()=>onGoTo("blueprint")}>
        <div style={{fontSize:"32px",flexShrink:0}}>📋</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:FONT,fontWeight:800,fontSize:"14px",color:C.accent,marginBottom:"3px"}}>Prima cosa: compila il tuo profilo</div>
          <div style={{fontSize:"12px",color:C.muted,lineHeight:1.5}}>Vai in <strong style={{color:C.text}}>Percorso → Blueprint</strong> e compila la <strong style={{color:C.text}}>Parte 1</strong> prima della call di onboarding.</div>
        </div>
        <ChevronRight size={18} color={C.accent}/>
      </div>}
      {/* WEEKLY CHECK-IN — shown every Monday until completed */}
      {isMonday&&checkinPending&&showCheckinCard&&(()=>{
        const [vals,setVals]=useState({energy:0,mood:0,sleep:0,motivation:0,diet:0});
        const [pain,setPain]=useState("");
        const [note,setNote]=useState("");
        const setV=(k,v)=>setVals(p=>({...p,[k]:v}));
        const allDone=vals.energy&&vals.mood&&vals.sleep&&vals.motivation&&vals.diet;
        function submit(){if(!allDone)return;submitCheckin({date:todayStr(),...vals,pain,note});}
        const EmojiRow=({label,k,opts})=>(
          <div style={{marginBottom:"14px"}}>
            <div style={{fontSize:"11px",color:C.muted,fontWeight:700,marginBottom:"8px",textTransform:"uppercase",letterSpacing:"0.04em"}}>{label}</div>
            <div style={{display:"flex",gap:"6px"}}>
              {opts.map((o,i)=>(
                <button key={i} onClick={()=>setV(k,i+1)} style={{flex:1,padding:"10px 2px",borderRadius:"10px",border:`2px solid ${vals[k]===i+1?C.accent:C.border}`,background:vals[k]===i+1?C.accentDim:"transparent",cursor:"pointer",fontSize:"18px",transition:"all .15s"}}>{o}</button>
              ))}
            </div>
          </div>
        );
        return(
          <Card style={{border:`2px solid ${C.accentMid}`,background:`linear-gradient(135deg,${C.accent}08,${C.accent}03)`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
              <div>
                <div style={{fontFamily:FONT,fontWeight:900,fontSize:"15px"}}>📋 Check-in settimanale</div>
                <div style={{fontSize:"11px",color:C.muted,marginTop:"2px"}}>Com'è andata questa settimana?</div>
              </div>
              <button onClick={()=>setShowCheckinCard(false)} style={{background:"transparent",border:"none",cursor:"pointer",color:C.muted,display:"flex"}}><X size={15}/></button>
            </div>
            <EmojiRow label="⚡ Energie" k="energy" opts={["😴","😕","😐","😊","⚡"]}/>
            <EmojiRow label="😊 Umore" k="mood" opts={["😔","😐","🙂","😊","🔥"]}/>
            <EmojiRow label="🌙 Sonno" k="sleep" opts={["😣","😴","😐","😊","🌙"]}/>
            <EmojiRow label="💪 Motivazione ad allenarti" k="motivation" opts={["🪫","😒","😐","😤","🔥"]}/>
            <EmojiRow label="🥗 Rispetto della dieta" k="diet" opts={["❌","😬","😐","👍","✅"]}/>
            <div style={{marginBottom:"14px"}}>
              <div style={{fontSize:"11px",color:C.muted,fontWeight:700,marginBottom:"8px",textTransform:"uppercase",letterSpacing:"0.04em"}}>🩹 Dolori o fastidi fisici</div>
              <input value={pain} onChange={e=>setPain(e.target.value)} placeholder="es. schiena bassa, ginocchio destro... (lascia vuoto se nessuno)" style={{fontSize:"13px",width:"100%",boxSizing:"border-box"}}/>
            </div>
            <div style={{marginBottom:"14px"}}>
              <div style={{fontSize:"11px",color:C.muted,fontWeight:700,marginBottom:"8px",textTransform:"uppercase",letterSpacing:"0.04em"}}>💬 Note per Simone</div>
              <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Qualcosa da segnalare? (opzionale)" style={{resize:"none",minHeight:"56px",fontSize:"13px",width:"100%",boxSizing:"border-box"}}/>
            </div>
            <Btn onClick={submit} disabled={!allDone} style={{width:"100%",justifyContent:"center"}}>
              <Check size={14}/>Invia check-in
            </Btn>
            {!allDone&&<div style={{fontSize:"11px",color:C.muted,textAlign:"center",marginTop:"8px"}}>Completa tutte le valutazioni per inviare</div>}
          </Card>
        );
      })()}
            {todayEvs.length>0?(
        <div>
          <div style={{color:C.muted,fontSize:"11px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"8px"}}>📅 Oggi</div>
          {todayEvs.map(ev=>{
            const tpl=getTpl(ev.templateId);if(!tpl)return null;
            const done=ev.status==="completed";
            return(
              <div key={ev.id} style={{background:done?C.success+"18":`linear-gradient(135deg,${tpl.color}22,${tpl.color}08)`,border:`2px solid ${done?C.success+"44":tpl.color+"55"}`,borderRadius:"20px",padding:"20px 22px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"14px"}}>
                  <div>
                    <div style={{color:done?C.success:tpl.color,fontSize:"11px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"4px"}}>{done?"✓ Completato":"Allenamento di oggi"}</div>
                    <div style={{fontFamily:FONT,fontWeight:900,fontSize:"17px",color:C.text}}>{tpl.name}</div>
                    
                  </div>
                  {!done&&<div style={{width:"52px",height:"52px",borderRadius:"50%",background:tpl.color,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}} onClick={()=>onStartWorkout(ev,tpl)}>
                    <Play size={22} color="#000" fill="#000"/>
                  </div>}
                  {done&&<div style={{fontSize:"36px"}}>🎉</div>}
                </div>
                {/* Exercise list preview */}
                <div style={{display:"flex",flexDirection:"column",gap:"3px",marginBottom:done?0:"10px"}}>
                  {tpl.exercises.map((ex,i)=>{const e=getEx(ex.exId);return(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"11px"}}>
                      <div style={{width:"4px",height:"4px",borderRadius:"50%",background:MUSCLE_COLORS[e.muscle]||C.muted,flexShrink:0}}/>
                      <span style={{flex:1,color:C.text}}>{e.name}</span>
                      <span style={{color:C.muted}}>{ex.sets}×{ex.targetReps}{ex.targetKg>0?` @${ex.targetKg}kg`:""}</span>
                    </div>
                  );})}
                  
                </div>
                {!done&&<Btn onClick={()=>onStartWorkout(ev,tpl)} style={{width:"100%",justifyContent:"center",fontSize:"15px",padding:"13px"}}><Play size={16}/>Inizia allenamento</Btn>}
              </div>
            );
          })}
        </div>
      ):(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"20px",padding:"24px",textAlign:"center"}}>
          <div style={{fontSize:"36px",marginBottom:"8px"}}>😴</div>
          <div style={{fontFamily:FONT,fontWeight:700,fontSize:"16px",marginBottom:"4px"}}>Nessun allenamento oggi</div>
          <div style={{color:C.muted,fontSize:"13px",marginBottom:"14px"}}>Goditi il riposo! Il prossimo workout è{nextEv?` il ${fmtLong(nextEv.date)}`:" da programmare"}.</div>
          {nextEv&&getTpl(nextEv.templateId)&&<div style={{background:C.bg,borderRadius:"10px",padding:"10px 14px",fontSize:"12px",color:C.muted}}>Prossimo: <span style={{color:getTpl(nextEv.templateId)?.color,fontWeight:700}}>{getTpl(nextEv.templateId)?.name}</span></div>}
        </div>
      )}

      {/* STATS ROW */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:"10px"}}>
        <StatTile icon={<Dumbbell size={14}/>} label="Sessioni totali" value={totalSessions} color={C.accent}/>
        <StatTile icon={<Zap size={16}/>} label="Questa settimana" value={`${weekDone}/${weekTarget}`} sub={compliancePct+"% completato"} color={compliancePct>=100?C.success:compliancePct>=50?C.orange:C.danger}/>
        <StatTile icon={<Award size={14}/>} label="Record personali" value={totalPRs||"—"} color={C.purple}/>
        {weightDelta&&<StatTile icon={parseFloat(weightDelta)<0?<TrendingDown size={16}/>:<TrendingUp size={16}/>} label="Peso variazione" value={`${parseFloat(weightDelta)<0?"":"+"}${weightDelta}kg`} color={parseFloat(weightDelta)<0?C.success:C.blue}/>}
      </div>

      {/* LAST MESSAGE FROM TRAINER */}
      


    </div>
  );
}


function ClientBlueprintTab({client,onUpdate}){
  const bp=client.blueprint||{};
  const isMobile=useIsMobile();
  const isFinalized=bp.noteTrained||bp.obiettivoVita;
  const [form,setForm]=useState(bp);
  const [saved,setSaved]=useState(false);
  const [editing,setEditing]=useState(!bp.obiettivoPrincipale&&!isFinalized);

  const [showSuccess,setShowSuccess]=useState(false);
  function save(){
    onUpdate(client.id,c=>({...c,blueprint:{...c.blueprint,...form,clientUpdatedAt:todayStr()}}));
    setSaved(true);setTimeout(()=>setSaved(false),2000);
    setShowSuccess(true);
    setTimeout(()=>setEditing(false),3000);
  }
  function setF(k,v){setForm(f=>({...f,[k]:v}));}

  const sortedW=[...client.weight].sort((a,b)=>a.date.localeCompare(b.date));
  const firstW=sortedW[0];const lastW=sortedW.at(-1);
  const totalDelta=firstW&&lastW?(lastW.value-firstW.value).toFixed(1):null;
  const target=client.targets?.weight?parseFloat(client.targets.weight):null;
  const distTarget=target&&lastW?Math.abs(lastW.value-target).toFixed(1):null;
  const pctTarget=target&&firstW&&lastW&&Math.abs(firstW.value-target)>0
    ?Math.min(100,Math.round(Math.abs(firstW.value-lastW.value)/Math.abs(firstW.value-target)*100))
    :null;
  const goalLabel={dimagrimento:"Dimagrimento",massa:"Aumento massa",recomp:"Body Recomposition",recomposition:"Body Recomposition",energia:"Energia & salute"}[bp.obiettivoPrincipale]||null;
  const deltaColor=bp.obiettivoPrincipale==="massa"?(parseFloat(totalDelta)>0?C.success:C.muted):(parseFloat(totalDelta)<0?C.success:C.danger);
  const hasCirc=bp.circVita||bp.circFianchi||bp.circBraccio||bp.circPetto||bp.circCoscia;
  const completed=client.workoutEvents.filter(e=>e.status==="completed");
  const totalSessions=completed.length;

  const SelectOpts=({field,opts})=>(
    <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
      {opts.map(o=>{
        const val=typeof o==="object"?o.v:o;
        const lbl=typeof o==="object"?o.l:o;
        const sel=form[field]===val;
        return(
          <button key={val} onClick={()=>setF(field,sel?null:val)} style={{padding:"8px 14px",borderRadius:"10px",border:`1.5px solid ${sel?C.accent:C.border}`,background:sel?C.accentDim:"transparent",cursor:"pointer",fontSize:"13px",fontWeight:sel?700:400,color:sel?C.accent:C.text}}>{lbl}</button>
        );
      })}
    </div>
  );
  const FieldLabel=({children})=>(<div style={{color:C.muted,fontSize:"10px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"6px"}}>{children}</div>);

  if(editing&&!isFinalized){
    return(
      <div>
        <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"20px"}}>
          <button onClick={()=>setEditing(false)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"9px",padding:"7px",cursor:"pointer",color:C.muted,display:"flex"}}><ChevronLeft size={16}/></button>
          <div>
            <div style={{fontFamily:FONT,fontWeight:900,fontSize:"16px"}}>📋 Il mio profilo</div>
            <div style={{fontSize:"11px",color:C.muted}}>Compila la Parte 1 da solo — finiamo il resto in call</div>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          <div style={{display:"flex",gap:"8px",marginBottom:"4px"}}>
            <div style={{flex:1,background:C.accent+"18",border:`2px solid ${C.accent}`,borderRadius:"10px",padding:"10px 12px",textAlign:"center"}}>
              <div style={{fontFamily:FONT,fontWeight:800,fontSize:"12px",color:C.accent}}>PARTE 1</div>
              <div style={{fontSize:"10px",color:C.muted,marginTop:"2px"}}>Compila da solo</div>
            </div>
            <div style={{flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:"10px",padding:"10px 12px",textAlign:"center",opacity:0.5}}>
              <div style={{fontFamily:FONT,fontWeight:800,fontSize:"12px",color:C.muted}}>PARTE 2</div>
              <div style={{fontSize:"10px",color:C.muted,marginTop:"2px"}}>In call con Simone</div>
            </div>
          </div>
          <Card>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",color:C.accent,marginBottom:"14px"}}>👤 Dati di base</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
              <div><FieldLabel>Data di nascita</FieldLabel><input type="date" value={form.dataNascita||""} onChange={e=>setF("dataNascita",e.target.value)}/></div>
              <div><FieldLabel>Sesso</FieldLabel><SelectOpts field="sesso" opts={[{v:"M",l:"M"},{v:"F",l:"F"}]}/></div>
            </div>
            <div style={{marginBottom:"12px"}}><FieldLabel>Professione</FieldLabel><input value={form.professione||""} onChange={e=>setF("professione",e.target.value)} placeholder="es. Impiegato, Libero professionista..."/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
              <div><FieldLabel>Obiettivo peso (kg)</FieldLabel><input type="number" value={form.obiettivoPeso||""} onChange={e=>setF("obiettivoPeso",e.target.value)}/></div>
              <div><FieldLabel>% Massa grassa</FieldLabel><input type="number" value={form.massaGrassa||""} onChange={e=>setF("massaGrassa",e.target.value)} placeholder="se disponibile"/></div>
            </div>
          </Card>
          <Card>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",color:C.accent,marginBottom:"14px"}}>🏥 Salute</div>
            <div style={{marginBottom:"12px"}}><FieldLabel>Patologie diagnosticate</FieldLabel><textarea value={form.patologie||""} onChange={e=>setF("patologie",e.target.value)} placeholder="Nome e anno, o lascia vuoto" style={{resize:"none",minHeight:"52px",fontSize:"13px"}}/></div>
            <div style={{marginBottom:"12px"}}><FieldLabel>Farmaci assunti</FieldLabel><textarea value={form.farmaci||""} onChange={e=>setF("farmaci",e.target.value)} placeholder="Nome, dosaggio (o lascia vuoto)" style={{resize:"none",minHeight:"52px",fontSize:"13px"}}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
              <div><FieldLabel>Infortuni?</FieldLabel><SelectOpts field="infortuni" opts={[{v:"no",l:"No"},{v:"si",l:"Sì"}]}/></div>
              <div><FieldLabel>Dolori cronici?</FieldLabel><SelectOpts field="doloriCronici" opts={[{v:"no",l:"No"},{v:"si",l:"Sì"}]}/></div>
            </div>
          </Card>
          <Card>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",color:C.accent,marginBottom:"14px"}}>💼 Lavoro & stress</div>
            <div style={{marginBottom:"12px"}}><FieldLabel>Tipo di lavoro</FieldLabel><SelectOpts field="tipoLavoro" opts={[{v:"sed",l:"Scrivania"},{v:"piedi",l:"In piedi"},{v:"misto",l:"Misto"},{v:"turni",l:"Turni"}]}/></div>
            <div><FieldLabel>Livello di stress</FieldLabel><SelectOpts field="livelloStress" opts={[{v:"1-3",l:"Basso"},{v:"4-6",l:"Moderato"},{v:"7-8",l:"Alto"},{v:"9-10",l:"Molto alto"}]}/></div>
          </Card>
          <Card>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",color:C.accent,marginBottom:"14px"}}>🌙 Sonno</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"12px",marginBottom:"12px"}}>
              <div><FieldLabel>Ore/notte</FieldLabel><input type="number" value={form.oreSonno||""} onChange={e=>setF("oreSonno",e.target.value)} placeholder="7"/></div>
              <div><FieldLabel>Vai a letto</FieldLabel><input type="time" value={form.oraCoricarsi||""} onChange={e=>setF("oraCoricarsi",e.target.value)}/></div>
              <div><FieldLabel>Sveglia</FieldLabel><input type="time" value={form.oraSveglia||""} onChange={e=>setF("oraSveglia",e.target.value)}/></div>
            </div>
            <div><FieldLabel>Qualità del sonno</FieldLabel><SelectOpts field="qualitaSonno" opts={[{v:"ottima",l:"Ottima"},{v:"buona",l:"Buona"},{v:"irregolare",l:"Irregolare"},{v:"scarsa",l:"Scarsa"}]}/></div>
          </Card>
          <Card>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",color:C.accent,marginBottom:"14px"}}>🥗 Alimentazione</div>
            <div style={{marginBottom:"12px"}}><FieldLabel>Dieta attuale</FieldLabel><SelectOpts field="tipoDieta" opts={[{v:"eq",l:"Equilibrata"},{v:"iperprot",l:"Iperproteica"},{v:"lowcarb",l:"Low-carb"},{v:"veg",l:"Vegana/Veg"},{v:"nessun",l:"Senza regime"}]}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
              <div><FieldLabel>Pasti al giorno</FieldLabel><SelectOpts field="numeroPasti" opts={["2","3","4","5","6"]}/></div>
              <div><FieldLabel>Acqua (L/giorno)</FieldLabel><input type="number" value={form.acqua||""} onChange={e=>setF("acqua",e.target.value)} placeholder="1.5"/></div>
            </div>
          </Card>
          <Card>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",color:C.accent,marginBottom:"14px"}}>💪 Allenamento</div>
            <div style={{marginBottom:"12px"}}><FieldLabel>Esperienza</FieldLabel><SelectOpts field="esperienzaAllenamento" opts={[{v:"nessuna",l:"Nessuna"},{v:"<1",l:"<1 anno"},{v:"1-3",l:"1-3 anni"},{v:">3",l:">3 anni"}]}/></div>
            <div><FieldLabel>Orario preferito</FieldLabel><SelectOpts field="partGiornata" opts={[{v:"mattino-digiuno",l:"Mattino digiuno"},{v:"mattino-colaz",l:"Mattino colaz."},{v:"pomeriggio",l:"Pomeriggio"},{v:"sera",l:"Sera"}]}/></div>
          </Card>
          <Card>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",color:C.accent,marginBottom:"14px"}}>🎯 Obiettivo</div>
            <div style={{marginBottom:"12px"}}><FieldLabel>Obiettivo principale</FieldLabel><SelectOpts field="obiettivoPrincipale" opts={[{v:"dimagrimento",l:"Dimagrimento"},{v:"massa",l:"Aumento massa"},{v:"recomp",l:"Body recomposition"},{v:"energia",l:"Energia & salute"}]}/></div>
            <div><FieldLabel>Data o evento di riferimento</FieldLabel><input value={form.dataEventoRif||""} onChange={e=>setF("dataEventoRif",e.target.value)} placeholder="es. Estate 2025, matrimonio..."/></div>
          </Card>
          <Btn onClick={save} style={{width:"100%",justifyContent:"center",padding:"15px",fontSize:"15px"}}>
            {saved?<><Check size={15}/>Salvato!</>:<><Check size={15}/>Salva il mio profilo</>}
          </Btn>
          {showSuccess&&<div style={{background:C.success+"18",border:`1px solid ${C.success}44`,borderRadius:"14px",padding:"16px",marginTop:"12px",textAlign:"center"}}>
            <div style={{fontSize:"28px",marginBottom:"8px"}}>✅</div>
            <div style={{fontFamily:FONT,fontWeight:800,fontSize:"14px",color:C.success,marginBottom:"4px"}}>Profilo inviato con successo!</div>
            <div style={{fontSize:"12px",color:C.muted,lineHeight:1.6}}>Simone ha ricevuto le tue risposte.<br/>Finiamo il profilo insieme nella call di onboarding. A presto! 💪</div>
          </div>}
          <div style={{fontSize:"11px",color:C.muted,textAlign:"center",paddingBottom:"20px"}}>📅 La Parte 2 la compileremo insieme nella call di onboarding già fissata</div>
        </div>
      </div>
    );
  }

  return(
    <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontFamily:FONT,fontWeight:900,fontSize:"18px"}}>📊 Il mio percorso</div>
        {!isFinalized&&<Btn size="sm" variant="ghost" onClick={()=>setEditing(true)}><Edit size={12}/>{bp.obiettivoPrincipale?"Modifica":"Compila"}</Btn>}
      </div>

      {bp.obiettivoPrincipale&&!isFinalized&&(()=>{
        const FL={sesso:"Sesso",dataNascita:"Data nascita",professione:"Professione",obiettivoPrincipale:"Obiettivo",dataEventoRif:"Evento",obiettivoPeso:"Obiettivo peso (kg)",massaGrassa:"Massa grassa (%)",patologie:"Patologie",farmaci:"Farmaci",infortuni:"Infortuni",doloriCronici:"Dolori cronici",tipoLavoro:"Tipo lavoro",livelloStress:"Stress",oreSonno:"Ore sonno",oraCoricarsi:"Va a letto",oraSveglia:"Sveglia",qualitaSonno:"Qualita sonno",tipoDieta:"Dieta",numeroPasti:"Pasti al giorno",acqua:"Acqua (L)",esperienzaAllenamento:"Esperienza",partGiornata:"Orario preferito"};
        const LM={sesso:{M:"Maschio",F:"Femmina"},tipoLavoro:{sed:"Scrivania",piedi:"In piedi",misto:"Misto",turni:"Turni"},livelloStress:{"1-3":"Basso","4-6":"Moderato","7-8":"Alto","9-10":"Molto alto"},qualitaSonno:{ottima:"Ottima",buona:"Buona",irregolare:"Irregolare",scarsa:"Scarsa"},tipoDieta:{eq:"Equilibrata",iperprot:"Iperproteica",lowcarb:"Low-carb",veg:"Vegana/Veg",nessun:"Senza regime"},esperienzaAllenamento:{nessuna:"Nessuna","<1":"<1 anno","1-3":"1-3 anni",">3":">3 anni"},obiettivoPrincipale:{dimagrimento:"Dimagrimento",massa:"Aumento massa",recomp:"Body recomposition",energia:"Energia & salute"},infortuni:{no:"No",si:"Si"},doloriCronici:{no:"No",si:"Si"},partGiornata:{"mattino-digiuno":"Mattino digiuno","mattino-colaz":"Mattino","pomeriggio":"Pomeriggio","sera":"Sera"}};
        const filled=Object.entries(bp).filter(([k,v])=>v&&FL[k]);
        if(!filled.length)return null;
        return(
          <Card style={{border:`1px solid ${C.accentMid}`,marginBottom:"0"}}>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",color:C.accent,marginBottom:"12px"}}>Le tue risposte</div>
            <div style={{display:"flex",flexDirection:"column"}}>
              {filled.map(([k,v])=>(
                <div key={k} style={{display:"flex",gap:"12px",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
                  <span style={{color:C.muted,fontSize:"11px",minWidth:"130px",flexShrink:0}}>{FL[k]}</span>
                  <span style={{color:C.text,fontSize:"12px",fontWeight:600}}>{LM[k]?.[String(v)]||String(v)}</span>
                </div>
              ))}
            </div>
            {bp.clientUpdatedAt&&<div style={{fontSize:"10px",color:C.muted,marginTop:"8px",textAlign:"right"}}>Salvato il {fmtLong(bp.clientUpdatedAt)}</div>}
          </Card>
        );
      })()}

      {goalLabel&&<Card style={{background:`linear-gradient(135deg,${C.accent}14,${C.accent}05)`,border:`1px solid ${C.accentMid}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:"10px",color:C.muted,marginBottom:"4px"}}>OBIETTIVO</div>
            <div style={{fontFamily:FONT,fontWeight:900,fontSize:"18px",color:C.accent}}>{goalLabel}</div>
          </div>
          {bp.dataEventoRif&&<div style={{textAlign:"right"}}>
            <div style={{fontSize:"10px",color:C.muted,marginBottom:"4px"}}>RIFERIMENTO</div>
            <div style={{fontWeight:700,fontSize:"13px"}}>📅 {bp.dataEventoRif}</div>
          </div>}
        </div>
      </Card>}
      {(bp.obiettivoPrincipale||bp.noteTrained)&&<BlueprintModal bp={bp} client={client}/>}

      {firstW&&lastW&&<Card>
        <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",marginBottom:"14px"}}>⚖️ Trasformazione peso</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px",marginBottom:"14px"}}>
          <div style={{textAlign:"center",background:C.surface,borderRadius:"12px",padding:"12px 6px"}}>
            <div style={{fontSize:"10px",color:C.muted,marginBottom:"4px"}}>Partenza</div>
            <div style={{fontFamily:FONT,fontWeight:800,fontSize:"clamp(11px,3.5vw,16px)",color:C.muted,whiteSpace:"nowrap"}}>{firstW.value}kg</div>
            <div style={{fontSize:"9px",color:C.muted,marginTop:"2px"}}>{fmtLong(firstW.date)}</div>
          </div>
          <div style={{textAlign:"center",background:C.accentDim,borderRadius:"12px",padding:"12px 6px",border:`1px solid ${C.accentMid}`}}>
            <div style={{fontSize:"10px",color:C.muted,marginBottom:"4px"}}>Oggi</div>
            <div style={{fontFamily:FONT,fontWeight:800,fontSize:"clamp(11px,3.5vw,16px)",color:C.accent,whiteSpace:"nowrap"}}>{lastW.value}kg</div>
            {totalDelta&&<div style={{fontSize:"12px",fontWeight:700,color:deltaColor,marginTop:"2px"}}>{parseFloat(totalDelta)>0?"+":""}{totalDelta}kg</div>}
          </div>
          {target?<div style={{textAlign:"center",background:C.surface,borderRadius:"12px",padding:"12px 6px"}}>
            <div style={{fontSize:"10px",color:C.muted,marginBottom:"4px"}}>Obiettivo</div>
            <div style={{fontFamily:FONT,fontWeight:800,fontSize:"clamp(11px,3.5vw,16px)",color:C.purple,whiteSpace:"nowrap"}}>{target}kg</div>
            {distTarget&&<div style={{fontSize:"10px",color:C.muted,marginTop:"2px"}}>mancano {distTarget}kg</div>}
          </div>:<div style={{textAlign:"center",background:C.surface,borderRadius:"12px",padding:"12px 6px"}}>
            <div style={{fontSize:"10px",color:C.muted,marginBottom:"4px"}}>Sessioni</div>
            <div style={{fontFamily:FONT,fontWeight:800,fontSize:"clamp(11px,3.5vw,16px)",color:C.orange,whiteSpace:"nowrap"}}>{totalSessions}</div>
          </div>}
        </div>
        {pctTarget!==null&&pctTarget>0&&<div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",color:C.muted,marginBottom:"5px"}}>
            <span>Progresso verso obiettivo</span>
            <span style={{fontWeight:700,color:C.accent}}>{Math.min(pctTarget,100)}%</span>
          </div>
          <div style={{height:"10px",background:C.border,borderRadius:"999px",overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.min(pctTarget,100)}%`,background:`linear-gradient(90deg,${C.accent},${C.success})`,borderRadius:"999px"}}/>
          </div>
        </div>}
      </Card>}

      {(()=>{
        const sortedMisure=[...(client.misure||[])].sort((a,b)=>a.date.localeCompare(b.date));
        const firstMisure=sortedMisure[0];const lastMisure=sortedMisure.at(-1);
        const CIRC=[{id:"vita",l:"Vita"},{id:"fianchi",l:"Fianchi"},{id:"petto",l:"Petto"},{id:"coscia",l:"Coscia"},{id:"braccio",l:"Braccio"}];
        const hasDynamic=lastMisure&&CIRC.some(f=>lastMisure[f.id]);
        if(!hasDynamic)return null;
        return(
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
              <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px"}}>📐 Circonferenze</div>
              {lastMisure&&<div style={{fontSize:"10px",color:C.muted}}>{fmtLong(lastMisure.date)}</div>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px"}}>
              {CIRC.filter(f=>lastMisure[f.id]).map(f=>{
                const d=firstMisure&&firstMisure[f.id]&&lastMisure.date!==firstMisure.date?(lastMisure[f.id]-firstMisure[f.id]).toFixed(1):null;
                return(
                  <div key={f.id} style={{background:C.surface,borderRadius:"10px",padding:"10px",textAlign:"center"}}>
                    <div style={{fontSize:"9px",color:C.muted,marginBottom:"3px"}}>{f.l}</div>
                    <div style={{fontFamily:FONT,fontWeight:800,fontSize:"clamp(12px,3.5vw,16px)",whiteSpace:"nowrap"}}>{lastMisure[f.id]}<span style={{fontSize:"10px",fontWeight:400,color:C.muted}}>cm</span></div>
                    {d&&<div style={{fontSize:"10px",fontWeight:700,color:parseFloat(d)<0?C.success:C.danger}}>{parseFloat(d)<0?"":"+"}{ d}</div>}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })()}

      {!bp.obiettivoPrincipale&&!isFinalized&&<Card style={{background:C.orange+"12",border:`1px solid ${C.orange}33`}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <span style={{fontSize:"24px"}}>📋</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:"13px",color:C.orange}}>Profilo da completare</div>
            <div style={{fontSize:"12px",color:C.muted,marginTop:"2px"}}>Compila prima della call con Simone</div>
          </div>
          <Btn size="sm" onClick={()=>setEditing(true)}>Compila</Btn>
        </div>
      </Card>}

      {/* TREND CHECK-IN */}
      {(()=>{
        const sorted=[...(client.checkins||[])].sort((a,b)=>a.date.localeCompare(b.date));
        if(sorted.length<2)return null;
        const METRICS=[
          {k:"energy",label:"Energia",emoji:"⚡",color:C.orange},
          {k:"mood",label:"Umore",emoji:"😊",color:C.blue},
          {k:"sleep",label:"Sonno",emoji:"🌙",color:C.purple},
          {k:"motivation",label:"Motivazione",emoji:"💪",color:C.accent},
          {k:"diet",label:"Dieta",emoji:"🥗",color:C.success},
        ];
        const chartData=sorted.slice(-8).map(c=>({date:c.date.slice(5),energy:c.energy||null,mood:c.mood||null,sleep:c.sleep||null,motivation:c.motivation||null,diet:c.diet||null}));
        const last=sorted.at(-1);
        return(
          <Card>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",marginBottom:"14px"}}>📋 Il mio andamento settimanale</div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                <XAxis dataKey="date" tick={{fill:C.muted,fontSize:9}} tickLine={false}/>
                <YAxis domain={[0,5]} ticks={[1,2,3,4,5]} tick={{fill:C.muted,fontSize:9}} tickLine={false} axisLine={false}/>
                <Tooltip content={({active,payload,label})=>{
                  if(!active||!payload?.length)return null;
                  return(<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"10px",padding:"10px 12px",fontSize:"12px"}}><div style={{color:C.muted,marginBottom:"6px",fontWeight:700}}>{label}</div>{payload.map((p,i)=><div key={i} style={{color:p.color,fontWeight:600}}>{p.name}: {p.value}/5</div>)}</div>);
                }}/>
                {METRICS.map(m=>(<Area key={m.k} type="monotone" dataKey={m.k} name={m.label} stroke={m.color} fill={m.color+"08"} strokeWidth={2} dot={false} connectNulls/>))}
              </AreaChart>
            </ResponsiveContainer>
            <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginTop:"10px"}}>
              {METRICS.map(m=>last[m.k]?<span key={m.k} style={{fontSize:"11px",color:m.color,fontWeight:700}}>{m.emoji} {last[m.k]}/5</span>:null)}
            </div>
          </Card>
        );
      })()}

      {bp.obiettivoPrincipale&&isFinalized&&<div style={{fontSize:"11px",color:C.muted,textAlign:"center",padding:"8px 0"}}>✓ Profilo finalizzato con Simone</div>}
    </div>
  );
}

function ClientApp({client,templates,tab,setTab,onUpdate,onStartWorkout,onLogout}){
  const isMobile=useIsMobile();
  const TABS=[
    {id:"home",label:"Home",icon:<Home size={isMobile?20:13}/>},
    {id:"calendar",label:"Workout",icon:<Calendar size={isMobile?20:13}/>},
    {id:"progressions",label:"Progressi",icon:<TrendingUp size={isMobile?20:13}/>},
    {id:"weight",label:"Peso & Misure",icon:<Scale size={isMobile?20:13}/>},
    {id:"calories",label:"Calorie",icon:<Flame size={isMobile?20:13}/>},
    {id:"blueprint",label:"Percorso",icon:<TrendingUp size={isMobile?20:13}/>},
  ];

  const content=<div style={{maxWidth:"680px",margin:"0 auto"}}>
    {tab==="home"&&<ClientHomeTab client={client} templates={templates} onStartWorkout={onStartWorkout} onGoTo={setTab} onUpdate={onUpdate}/>}
    {tab==="calendar"&&<CalendarTab client={client} templates={templates} mode="client" onUpdate={onUpdate} onStartWorkout={onStartWorkout}/>}
    {tab==="weight"&&<WeightTab client={client} onUpdate={onUpdate}/>}
    {tab==="calories"&&<CaloriesTab client={client} onUpdate={onUpdate}/>}
    {tab==="progressions"&&<ProgressionsTab client={client} templates={templates}/>}
    {tab==="blueprint"&&<ClientBlueprintTab client={client} onUpdate={onUpdate}/>}
  </div>;

  if(isMobile)return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:C.bg}}>
      {/* Mobile top header */}
      <div style={{padding:"14px 18px 10px",background:C.surface,borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div>
          <div style={{fontFamily:FONT,fontWeight:900,fontSize:"18px"}}>Ciao <span style={{color:C.accent}}>{client.name.split(" ")[0]}</span> 💪</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <a href={`https://wa.me/${SIMONE_WA}?text=${encodeURIComponent("Ciao Simone! 👋")}`} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:"5px",background:"#25D366",borderRadius:"8px",padding:"6px 10px",textDecoration:"none",color:"#000",fontWeight:700,fontSize:"11px"}}>
            <span>💬</span> Simone
          </a>
          <button onClick={onLogout} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"6px",cursor:"pointer",color:C.muted,display:"flex"}}><LogOut size={14}/></button>
        </div>
      </div>
      {/* Scrollable content */}
      <div style={{flex:1,overflowY:"auto",padding:"14px 12px 90px",overflowX:"hidden"}}>
        {content}
      </div>
      {/* Bottom tab bar */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:C.surface,borderTop:`1px solid ${C.border}`,display:"flex",zIndex:100,paddingBottom:"env(safe-area-inset-bottom)"}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",padding:"10px 4px",background:"transparent",border:"none",cursor:"pointer",color:tab===t.id?C.accent:C.muted,fontSize:"9px",fontWeight:tab===t.id?700:500}}>
          {t.icon}
          <span style={{fontSize:"9px"}}>{t.label}</span>
          {tab===t.id&&<div style={{width:"4px",height:"4px",borderRadius:"50%",background:C.accent}}/>}
        </button>)}
      </div>
    </div>
  );

  // Desktop client
  return(
    <div style={{maxWidth:"900px",margin:"0 auto",padding:"22px 18px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"22px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"42px",height:"42px",borderRadius:"50%",background:C.accentDim,border:`2px solid ${C.accentMid}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FONT,fontWeight:900,fontSize:"16px",color:C.accent}}>{client.name.charAt(0)}</div>
          <div style={{fontFamily:FONT,fontWeight:900,fontSize:"20px"}}>Ciao <span style={{color:C.accent}}>{client.name.split(" ")[0]}</span> 💪</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <a href={`https://wa.me/${SIMONE_WA}?text=${encodeURIComponent("Ciao Simone! 👋")}`} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:"6px",background:"#25D366",borderRadius:"9px",padding:"8px 14px",textDecoration:"none",color:"#000",fontWeight:700,fontSize:"13px"}}>
            <span>💬</span> Scrivi a Simone
          </a>
          <button onClick={onLogout} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"7px",cursor:"pointer",color:C.muted,display:"flex"}}><LogOut size={14}/></button>
        </div>
      </div>
      <div style={{display:"flex",gap:"3px",marginBottom:"22px",background:C.card,padding:"5px",borderRadius:"12px"}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:"5px",padding:"8px 12px",borderRadius:"8px",fontSize:"12px",fontWeight:600,background:tab===t.id?C.accent:"transparent",color:tab===t.id?"#000":C.muted,border:"none",cursor:"pointer",flex:1,justifyContent:"center"}}>{t.icon}{t.label}</button>)}
      </div>
      {content}
    </div>
  );
}

// ─── TRAINER CLIENT VIEW ──────────────────────────────────────────────────────
function TrainerClientView({client,tab,setTab,templates,onUpdate,onBack,onDelete,onStartWorkout}){
  const isMobile=useIsMobile();
  const alerts=getClientAlerts(client);
  const [showPreCall,setShowPreCall]=useState(false);
  const TABS=[
    {id:"calendar",label:"Calendario",icon:<Calendar size={13}/>},
    {id:"history",label:"Storico",icon:<Dumbbell size={13}/>},
    {id:"progressions",label:"Progressi",icon:<TrendingUp size={13}/>},
    {id:"weight",label:"Peso",icon:<Scale size={13}/>},
    {id:"calories",label:"Calorie",icon:<Flame size={13}/>},
    {id:"goals",label:"Obiettivi",icon:<Target size={13}/>},
    {id:"checkins",label:"Check-in",icon:<CheckCircle size={13}/>},
    {id:"blueprint",label:"Blueprint",icon:<Star size={13}/>},
    {id:"settings",label:"Impostaz.",icon:<Lock size={13}/>},
  ];
  return(
    <div>
      {showPreCall&&<PreCallModal client={client} templates={templates} onClose={()=>setShowPreCall(false)}/>}
      <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"}}>
        <button onClick={onBack} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"9px",padding:"7px",color:C.muted,display:"flex",cursor:"pointer"}}><ChevronLeft size={16}/></button>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <h1 style={{fontFamily:FONT,fontSize:isMobile?"18px":"22px",fontWeight:900}}>{client.name}</h1>
            {alerts.length>0&&<AlertBadge alerts={alerts}/>}
          </div>
          <div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginTop:"4px"}}>
            {client.age&&<Tag label={client.age+" anni"} color={C.muted}/>}
            {client.height&&<Tag label={client.height+" cm"} color={C.blue}/>}
            {client.goal&&<Tag label={client.goal}/>}
          </div>
        </div>
        <div style={{display:"flex",gap:"6px"}}>
          <Btn size="sm" variant="ghost" onClick={()=>setShowPreCall(true)} style={{background:C.accentDim,border:`1px solid ${C.accentMid}`,color:C.accent}}><Bell size={12}/>Pre-call</Btn>
          <a href={`https://wa.me/${SIMONE_WA}`} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:"5px",background:"#25D366",borderRadius:"10px",padding:"6px 12px",textDecoration:"none",color:"#000",fontWeight:700,fontSize:"12px"}}>💬 WA</a>
          {!isMobile&&<Btn variant="danger" size="sm" onClick={()=>{if(confirm("Eliminare questo cliente?"))onDelete(client.id);}}><Trash2 size={12}/>Elimina</Btn>}
        </div>
      </div>

      {/* Alerts inline */}
      {alerts.length>0&&<div style={{display:"flex",flexDirection:"column",gap:"6px",marginBottom:"14px"}}>
        {alerts.map((a,i)=>{const lc=a.level==="danger"?C.danger:C.orange;return <div key={i} style={{background:lc+"14",border:`1px solid ${lc}33`,borderRadius:"10px",padding:"9px 14px",display:"flex",alignItems:"center",gap:"8px",fontSize:"12px"}}>
          <span>{a.icon}</span><span style={{color:lc}}>{a.msg}</span>
        </div>;})}
      </div>}

      <div style={{display:"flex",gap:"3px",marginBottom:"18px",background:C.card,padding:"5px",borderRadius:"12px",overflowX:"auto",flexShrink:0,WebkitOverflowScrolling:"touch"}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:"5px",padding:isMobile?"7px 8px":"8px 11px",borderRadius:"8px",fontSize:isMobile?"11px":"12px",fontWeight:600,background:tab===t.id?C.accent:"transparent",color:tab===t.id?"#000":C.muted,whiteSpace:"nowrap",border:"none",cursor:"pointer"}}>{t.icon}{!isMobile&&t.label}</button>)}
      </div>

      {tab==="calendar"&&<CalendarTab client={client} templates={templates} mode="trainer" onUpdate={onUpdate} onStartWorkout={onStartWorkout}/>}
      {tab==="history"&&<HistoryTab client={client} templates={templates}/>}
      {tab==="weight"&&<WeightTab client={client} onUpdate={onUpdate}/>}
      {tab==="calories"&&<CaloriesTab client={client} onUpdate={onUpdate}/>}
      {tab==="goals"&&<GoalsTab client={client} onUpdate={onUpdate} readOnly={false}/>}
      {tab==="checkins"&&<CheckinsTab client={client}/>}
      {tab==="progressions"&&<ProgressionsTab client={client} templates={templates}/>}
      {tab==="blueprint"&&<BlueprintTab key={client.blueprint?.clientUpdatedAt||"empty"} client={client} onUpdate={onUpdate}/>}
      {tab==="settings"&&<SettingsTab client={client} onUpdate={onUpdate}/>}
    </div>
  );
}

function CalendarTab({client,templates,mode,onUpdate,onStartWorkout}){
  const isMobile=useIsMobile();
  const now=new Date();
  const [year,setYear]=useState(now.getFullYear());
  const [month,setMonth]=useState(now.getMonth());
  const [selDay,setSelDay]=useState(null);
  const [moving,setMoving]=useState(null);
  const today=todayStr();
  const getTpl=id=>templates.find(t=>t.id===id);
  const dateStr=day=>`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  const dayEvs=day=>client.workoutEvents.filter(e=>e.date===dateStr(day));
  const [showAssign,setShowAssign]=useState(false);

  function handleBulkAssign(events,startDate){
    onUpdate(client.id,c=>({...c,
      workoutEvents:[...c.workoutEvents,...events],
      programAssignment:{startDate,assignedAt:todayStr()},
    }));
    setShowAssign(false);
  }
  function assign(date,templateId){onUpdate(client.id,c=>({...c,workoutEvents:[...c.workoutEvents,{id:uid(),date,templateId,status:"scheduled",completedSets:[],feedback:null}]}));setSelDay(null);}
  function removeEv(id){onUpdate(client.id,c=>({...c,workoutEvents:c.workoutEvents.filter(e=>e.id!==id)}));}
  function reschedule(evId,newDate){onUpdate(client.id,c=>({...c,workoutEvents:c.workoutEvents.map(e=>e.id===evId?{...e,date:newDate}:e)}));setMoving(null);setSelDay(null);}

  const daysInMonth=getDIM(year,month);const firstDay=getFD(year,month);
  const cells=[];for(let i=0;i<firstDay;i++)cells.push(null);for(let d=1;d<=daysInMonth;d++)cells.push(d);
  const selDateStr=selDay?dateStr(selDay):null;
  const selEvents=selDateStr?client.workoutEvents.filter(e=>e.date===selDateStr):[];
  const monthPfx=`${year}-${String(month+1).padStart(2,"0")}-`;
  const monthEvs=client.workoutEvents.filter(e=>e.date.startsWith(monthPfx));
  const monthDone=monthEvs.filter(e=>e.status==="completed").length;

  const CalGrid=()=>(
    <div>
      {showAssign&&<AssignProgramModal templates={templates} onConfirm={handleBulkAssign} onClose={()=>setShowAssign(false)}/>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"12px"}}>
        <button onClick={()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);}} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"7px",cursor:"pointer",color:C.muted,display:"flex"}}><ChevronLeft size={15}/></button>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:FONT,fontWeight:800,fontSize:"16px"}}>{MONTHS[month]} {year}</div>
          {monthEvs.length>0&&<div style={{fontSize:"10px",color:C.muted}}>{monthDone}/{monthEvs.length} completati · {Math.round(monthDone/monthEvs.length*100)}%</div>}
        </div>
        <button onClick={()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);}} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"7px",cursor:"pointer",color:C.muted,display:"flex"}}><ChevronRight size={15}/></button>
      </div>
      {mode==="trainer"&&!moving&&<div style={{marginBottom:"10px"}}>
        <Btn onClick={()=>setShowAssign(true)} style={{width:"100%",justifyContent:"center",background:C.accentDim,border:`1px solid ${C.accentMid}`,color:C.accent}}>
          <Calendar size={13}/>Assegna programma automatico
        </Btn>
      </div>}
      {moving&&<div style={{background:C.orange+"18",border:`1px solid ${C.orange}33`,borderRadius:"9px",padding:"9px 13px",marginBottom:"10px",fontSize:"12px",color:C.orange,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>📅 Tocca un giorno per spostare</span>
        <button onClick={()=>setMoving(null)} style={{background:"transparent",border:"none",cursor:"pointer",color:C.orange}}><X size={13}/></button>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7, 1fr)",gap:"2px",marginBottom:"2px"}}>
        {WEEKDAYS.map(d=><div key={d} style={{textAlign:"center",fontSize:"9px",color:C.muted,fontWeight:700,padding:"3px",textTransform:"uppercase"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7, 1fr)",gap:"2px"}}>
        {cells.map((day,i)=>{
          if(!day)return <div key={"e"+i}/>;
          const ds=dateStr(day);const evs=dayEvs(day);
          const isToday=ds===today;const isSel=selDay===day;const isPast=ds<today;
          return(
            <div key={day} onClick={()=>{if(moving){reschedule(moving.id,ds);return;}setSelDay(day===selDay?null:day);}} style={{background:isSel?C.accentDim:isToday?C.card:C.surface,border:`1px solid ${isSel?C.accent:isToday?C.accentMid:C.border}`,borderRadius:"8px",padding:"4px 2px",minHeight:isMobile?"52px":"58px",cursor:"pointer",opacity:isPast&&!evs.length?0.35:1}}>
              <div style={{fontFamily:FONT,fontWeight:isToday?800:600,fontSize:"11px",color:isToday?C.accent:C.text,marginBottom:"2px",textAlign:"center"}}>{day}</div>
              {evs.map(ev=>{const tpl=getTpl(ev.templateId);const col=tpl?.color||C.accent;return(
                <div key={ev.id} style={{background:col+(ev.status==="completed"?"44":"22"),border:`1px solid ${col}55`,borderRadius:"3px",padding:"2px 2px",fontSize:"6px",fontWeight:700,color:col,marginBottom:"1px",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",display:"flex",alignItems:"center",gap:"1px"}}>
                  {ev.status==="completed"?<CheckCircle size={5}/>:<Circle size={5}/>}{isMobile?"":tpl?.name?.charAt(0)||"W"}
                </div>
              );})}
            </div>
          );
        })}
      </div>
    </div>
  );

  const DayPanel=()=>selDay?(
    <Card>
      <div style={{fontFamily:FONT,fontWeight:700,marginBottom:"12px",fontSize:"13px"}}>📅 {fmtLong(dateStr(selDay))}</div>
      {selEvents.map(ev=>{const tpl=getTpl(ev.templateId);return(
        <div key={ev.id} style={{background:C.bg,borderRadius:"10px",padding:"10px",marginBottom:"8px",border:`1px solid ${C.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
            <div><div style={{fontWeight:700,fontSize:"13px",color:tpl?.color||C.accent}}>{tpl?.name}</div><div style={{fontSize:"10px",color:C.muted}}>{tpl?.exercises.length} esercizi</div></div>
            <Tag label={ev.status==="completed"?"✓ Fatto":"Prog."} color={ev.status==="completed"?C.success:C.muted}/>
          </div>
          {ev.feedback&&<div style={{background:C.surface,borderRadius:"7px",padding:"7px 9px",marginBottom:"8px",fontSize:"11px"}}>
            <span style={{color:C.muted}}>RPE </span><span style={{color:C.orange,fontWeight:700}}>{ev.feedback.rpe}/10</span>
            <span style={{marginLeft:"8px"}}>{"⭐".repeat(ev.feedback.feeling)}</span>
            {ev.feedback.note&&<div style={{color:C.muted,fontStyle:"italic",marginTop:"3px"}}>"{ev.feedback.note}"</div>}
          </div>}
          {tpl&&ev.status!=="completed"&&<div style={{display:"flex",flexDirection:"column",gap:"4px",marginBottom:"10px"}}>
            {tpl.exercises.map((ex,i)=>{const e=getEx(ex.exId);return(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"7px",fontSize:"11px"}}>
                <div style={{width:"4px",height:"4px",borderRadius:"50%",background:tpl.color,flexShrink:0}}/>
                <span style={{flex:1,color:C.text}}>{e.name}</span>
                <span style={{color:C.muted}}>{ex.sets}x{ex.targetReps}{ex.targetKg>0?" @"+ex.targetKg+"kg":""}  </span>
              </div>
            );})}
          </div>}
          <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
            {ev.status!=="completed"&&tpl&&<Btn size="sm" onClick={()=>onStartWorkout(ev,tpl)}><Play size={11}/>Inizia</Btn>}
            <Btn size="sm" variant="ghost" onClick={()=>setMoving(ev)}><Calendar size={11}/>Sposta</Btn>
            {mode==="trainer"&&<Btn size="sm" variant="danger" onClick={()=>removeEv(ev.id)}><Trash2 size={11}/></Btn>}
          </div>
        </div>
      );})}
      {mode==="trainer"&&<>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"10px 0 7px"}}>
          <div style={{color:C.muted,fontSize:"9px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>Assegna workout</div>
        </div>
        {templates.map(tpl=>(
          <div key={tpl.id} onClick={()=>assign(dateStr(selDay),tpl.id)} style={{display:"flex",alignItems:"center",gap:"8px",padding:"8px 10px",background:C.bg,borderRadius:"8px",marginBottom:"4px",cursor:"pointer",border:`1px solid ${C.border}`}}>
            <div style={{width:"8px",height:"8px",borderRadius:"50%",background:tpl.color}}/>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:"12px"}}>{tpl.name}</div><div style={{color:C.muted,fontSize:"10px"}}>{tpl.exercises.length} esercizi</div></div>
            <Plus size={12} color={C.muted}/>
          </div>
        ))}
      </>}
    </Card>
  ):(
    <Card>
      <div style={{textAlign:"center",padding:"20px 8px",color:C.muted}}>
        <Calendar size={26} style={{margin:"0 auto 8px",opacity:0.4}}/>
        <div style={{fontSize:"12px"}}>{mode==="trainer"?"Tocca un giorno per gestire":"Tocca un giorno per vedere"}</div>
      </div>
      <div style={{borderTop:`1px solid ${C.border}`,paddingTop:"10px",marginTop:"4px"}}>
        {[{label:"Programmati",val:client.workoutEvents.filter(e=>e.status==="scheduled").length,color:C.accent},{label:"Completati",val:client.workoutEvents.filter(e=>e.status==="completed").length,color:C.success}].map(s=>(
          <div key={s.label} style={{display:"flex",justifyContent:"space-between",marginBottom:"4px",fontSize:"12px"}}>
            <span style={{color:C.muted}}>{s.label}</span><span style={{fontFamily:FONT,fontWeight:700,color:s.color}}>{s.val}</span>
          </div>
        ))}
      </div>
    </Card>
  );

  if(isMobile)return <div style={{display:"flex",flexDirection:"column",gap:"14px"}}><CalGrid/><DayPanel/></div>;
  return <div style={{display:"grid",gridTemplateColumns:"1fr 270px",gap:"18px"}}><CalGrid/><DayPanel/></div>;
}

// ─── PROGRESSIONS TAB ────────────────────────────────────────────────────────
function ProgressionsTab({client,templates}){
  const isMobile=useIsMobile();
  const getTpl=id=>templates.find(t=>t.id===id);

  // Build exercise progression data from all completed workouts
  const completed=[...client.workoutEvents].filter(e=>e.status==="completed"&&e.completedSets?.length).sort((a,b)=>a.date.localeCompare(b.date));

  // Map: exId(string) -> [{date, maxKg, totalVol, setsN}]
  const progressionMap={};
  completed.forEach(ev=>{
    const tpl=getTpl(ev.templateId);if(!tpl)return;
    tpl.exercises.forEach((ex,i)=>{
      const sets=ev.completedSets[i]||[];
      const maxKg=Math.max(0,...sets.map(s=>parseFloat(s.kg)||0));
      const totalVol=sets.reduce((s,st)=>(parseFloat(st.kg)||0)*(parseInt(st.reps)||0)+s,0);
      if(maxKg>0){
        if(!progressionMap[ex.exId])progressionMap[ex.exId]=[];
        progressionMap[ex.exId].push({date:ev.date,maxKg,totalVol,setsN:sets.filter(s=>s.done).length});
      }
    });
  });

  // All exercises from templates — always show even without history
  const allTemplateExIds=[...new Set(templates.flatMap(t=>t.exercises.map(e=>e.exId)))];
  const exercises=allTemplateExIds.map(exId=>{
    const ex=EX.find(e=>e.id===exId);
    const data=progressionMap[exId]||[];
    const tplEx=templates.flatMap(t=>t.exercises).find(e=>e.exId===exId);
    const first=data[0];const last=data.at(-1);
    const pr=data.length?Math.max(...data.map(d=>d.maxKg)):tplEx?.targetKg||0;
    const delta=data.length>=2?parseFloat((last.maxKg-first.maxKg).toFixed(1)):0;
    return{exId,name:ex?.name||"Esercizio",muscle:ex?.muscle||"",data,pr,delta,
      last:last?.maxKg||tplEx?.targetKg||0,color:MUSCLE_COLORS[ex?.muscle]||C.accent,
      targetKg:tplEx?.targetKg||0,targetReps:tplEx?.targetReps||0};
  }).sort((a,b)=>b.data.length-a.data.length);

  const [selEx,setSelEx]=useState(()=>exercises[0]?.exId||null);
  const selData=exercises.find(e=>e.exId===selEx);

  if(exercises.length===0){
    return(
      <div style={{textAlign:"center",padding:"60px 20px",color:C.muted}}>
        <div style={{fontSize:"48px",marginBottom:"12px"}}>📊</div>
        <div style={{fontFamily:FONT,fontWeight:700,fontSize:"15px",marginBottom:"6px"}}>Nessuna progressione ancora</div>
        <div style={{fontSize:"13px"}}>Le progressioni appariranno dopo le prime sessioni completate con pesi registrati.</div>
      </div>
    );
  }

  const chartData=selData?.data.map(d=>({date:d.date.slice(5),kg:d.maxKg}));

  return(
    <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>

      {/* Exercise selector */}
      <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
        {exercises.map(ex=>(
          <button key={ex.exId} onClick={()=>setSelEx(ex.exId)} style={{padding:"7px 12px",borderRadius:"10px",border:`2px solid ${selEx===ex.exId?ex.color:C.border}`,background:selEx===ex.exId?ex.color+"18":"transparent",cursor:"pointer",fontSize:"11px",fontWeight:selEx===ex.exId?700:400,color:selEx===ex.exId?ex.color:C.muted}}>
            {ex.name}
            {ex.delta>0&&<span style={{marginLeft:"5px",color:C.success,fontSize:"10px"}}>+{ex.delta}kg</span>}
          </button>
        ))}
      </div>

      {selData&&<>
        {/* Header stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px"}}>
          <StatTile icon={<Award size={14}/>} label="Record (PR)" value={`${selData.pr}kg`} color={C.orange}/>
          <StatTile icon={<TrendingUp size={16}/>} label="Progresso" value={selData.delta>=0?`+${selData.delta}kg`:`${selData.delta}kg`} color={selData.delta>=0?C.success:C.danger}/>
          <StatTile icon={<Dumbbell size={14}/>} label="Sessioni" value={selData.data.length} color={selData.color}/>
        </div>

        {/* Chart */}
        {chartData.length>1&&<Card>
          <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",marginBottom:"14px",color:selData.color}}>
            📈 {selData.name} — andamento kg
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
              <XAxis dataKey="date" tick={{fill:C.muted,fontSize:9}} tickLine={false}/>
              <YAxis domain={["auto","auto"]} tick={{fill:C.muted,fontSize:9}} tickLine={false} axisLine={false}/>
              <Tooltip content={<ChartTip unit="kg"/>}/>
              <ReferenceLine y={selData.pr} stroke={C.orange} strokeDasharray="4 4" label={{value:"PR",fill:C.orange,fontSize:10,position:"right"}}/>
              <Area type="monotone" dataKey="kg" name="Max kg" stroke={selData.color} fill={selData.color+"22"} strokeWidth={2} dot={{r:4,fill:selData.color,strokeWidth:0}}/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>}

        {/* Session history for this exercise */}
        <Card>
          <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",marginBottom:"12px"}}>Storico sessioni</div>
          <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
            {[...selData.data].reverse().map((d,i)=>{
              const isPR=d.maxKg===selData.pr;
              const prev=selData.data[selData.data.length-2-i];
              const delta=prev?(d.maxKg-prev.maxKg):null;
              return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:"12px",background:isPR?C.orange+"12":C.surface,border:`1px solid ${isPR?C.orange+"44":C.border}`,borderRadius:"10px",padding:"10px 14px"}}>
                  {isPR&&<Star size={12} color={C.orange} fill={C.orange}/>}
                  <div style={{fontFamily:FONT,fontWeight:800,fontSize:"17px",color:isPR?C.orange:selData.color,minWidth:"55px"}}>{d.maxKg}kg</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"11px",color:C.muted}}>{fmtLong(d.date)}</div>
                    <div style={{fontSize:"10px",color:C.muted}}>{d.setsN} serie</div>
                  </div>
                  {delta!==null&&<span style={{fontSize:"12px",fontWeight:700,color:delta>0?C.success:delta<0?C.danger:C.muted}}>
                    {delta>0?"+":""}{delta}kg
                  </span>}
                </div>
              );
            })}
          </div>
        </Card>
      </>}

      {/* All PRs summary */}
      <Card>
        <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",marginBottom:"12px"}}>🏆 Tutti i record personali</div>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(3,1fr)",gap:"6px"}}>
          {exercises.map(ex=>(
            <div key={ex.exId} onClick={()=>setSelEx(ex.exId)} style={{background:selEx===ex.exId?ex.color+"18":C.surface,border:`1px solid ${selEx===ex.exId?ex.color+"44":C.border}`,borderRadius:"10px",padding:"10px 12px",cursor:"pointer"}}>
              <div style={{fontSize:"10px",color:C.muted,marginBottom:"3px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ex.name}</div>
              <div style={{fontFamily:FONT,fontWeight:800,fontSize:"14px",color:ex.color,whiteSpace:"nowrap"}}>{ex.pr}kg</div>
              {ex.delta>0&&<div style={{fontSize:"10px",color:C.success}}>+{ex.delta}kg dal primo</div>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── PRE-CALL BRIEF MODAL ────────────────────────────────────────────────────
function PreCallModal({client,templates,onClose}){
  const getTpl=id=>templates.find(t=>t.id===id);
  const today=todayStr();

  // Last 7 days
  const weekAgo=new Date(Date.now()-7*86400000);
  const last7Evs=client.workoutEvents.filter(e=>new Date(e.date+"T12:00:00")>=weekAgo);
  const weekDone=last7Evs.filter(e=>e.status==="completed").length;
  const weekTarget=parseInt(client.targets?.workoutsPerWeek)||3;
  const compliancePct=Math.round(weekDone/weekTarget*100);

  // Weight
  const sorted=[...client.weight].sort((a,b)=>a.date.localeCompare(b.date));
  const lastW=sorted.at(-1);const prevW=sorted.at(-2);
  const weightDelta=lastW&&prevW?(lastW.value-prevW.value).toFixed(1):null;
  const weekWeights=sorted.filter(w=>new Date(w.date+"T12:00:00")>=weekAgo);

  // Meals
  const weekMeals=(client.meals||[]).filter(m=>new Date(m.date+"T12:00:00")>=weekAgo);
  const ratedMeals=weekMeals.filter(m=>m.rating>0);
  const avgRating=ratedMeals.length>0?(ratedMeals.reduce((s,m)=>s+m.rating,0)/ratedMeals.length).toFixed(1):null;
  const avgWater=weekMeals.length>0?(weekMeals.reduce((s,m)=>s+(parseFloat(m.water)||0),0)/weekMeals.length).toFixed(1):null;

  // Last checkin
  const checkins=[...(client.checkins||[])].sort((a,b)=>b.date.localeCompare(a.date));
  const lastCheckin=checkins[0];
  const daysSinceCheckin=lastCheckin?Math.floor((Date.now()-new Date(lastCheckin.date+"T12:00:00"))/86400000):null;

  // PRs this week
  const weekCompleted=last7Evs.filter(e=>e.status==="completed"&&e.completedSets?.length);
  const prsThisWeek=[];
  const allCompleted=[...client.workoutEvents].filter(e=>e.status==="completed"&&e.completedSets?.length).sort((a,b)=>a.date.localeCompare(b.date));
  const historicPRs={};
  allCompleted.forEach(ev=>{
    const tpl=getTpl(ev.templateId);if(!tpl)return;
    tpl.exercises.forEach((ex,i)=>{
      const sets=ev.completedSets[i]||[];
      const maxKg=Math.max(0,...sets.map(s=>parseFloat(s.kg)||0));
      if(maxKg>0){
        const isNew=!historicPRs[ex.exId]||maxKg>historicPRs[ex.exId];
        const isThisWeek=new Date(ev.date+"T12:00:00")>=weekAgo;
        if(isNew&&isThisWeek)prsThisWeek.push({name:getEx(ex.exId).name,kg:maxKg});
        if(isNew)historicPRs[ex.exId]=maxKg;
      }
    });
  });

  const Section=({title,color=C.muted,children})=>(
    <div style={{marginBottom:"18px"}}>
      <div style={{color,fontSize:"10px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"10px"}}>{title}</div>
      {children}
    </div>
  );
  const Row=({label,value,color=C.text,sub})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
      <span style={{fontSize:"13px",color:C.muted}}>{label}</span>
      <div style={{textAlign:"right"}}>
        <span style={{fontFamily:FONT,fontWeight:700,fontSize:"14px",color}}>{value}</span>
        {sub&&<div style={{fontSize:"10px",color:C.muted}}>{sub}</div>}
      </div>
    </div>
  );

  const compColor=compliancePct>=100?C.success:compliancePct>=50?C.orange:C.danger;

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
      <div style={{background:C.card,borderRadius:"22px",padding:"24px",width:"100%",maxWidth:"460px",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
          <div>
            <div style={{fontFamily:FONT,fontWeight:900,fontSize:"17px"}}>📞 Riepilogo pre-call</div>
            <div style={{fontSize:"12px",color:C.muted,marginTop:"2px"}}>{client.name} · settimana corrente</div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"none",cursor:"pointer",color:C.muted}}><X size={18}/></button>
        </div>

        <div style={{background:C.surface,borderRadius:"12px",padding:"14px",marginBottom:"18px",marginTop:"14px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",textAlign:"center"}}>
            <div>
              <div style={{fontFamily:FONT,fontWeight:900,fontSize:"clamp(14px,4vw,22px)",color:compColor,whiteSpace:"nowrap"}}>{weekDone}/{weekTarget}</div>
              <div style={{fontSize:"10px",color:C.muted}}>Allenamenti</div>
            </div>
            <div>
              <div style={{fontFamily:FONT,fontWeight:900,fontSize:"clamp(14px,4vw,22px)",color:lastW?C.accent:C.muted,whiteSpace:"nowrap"}}>{lastW?lastW.value+"kg":"—"}</div>
              <div style={{fontSize:"10px",color:C.muted}}>Peso attuale</div>
              {weightDelta&&<div style={{fontSize:"10px",color:parseFloat(weightDelta)<0?C.success:C.danger}}>{parseFloat(weightDelta)>0?"+":""}{weightDelta}kg</div>}
            </div>
            <div>
              <div style={{fontFamily:FONT,fontWeight:900,fontSize:"clamp(14px,4vw,22px)",color:avgRating>=3.5?C.success:avgRating>=2?C.orange:C.danger}}>{avgRating||"—"}</div>
              <div style={{fontSize:"10px",color:C.muted}}>Rating dieta</div>
            </div>
          </div>
        </div>

        <Section title="💪 Allenamenti" color={compColor}>
          <Row label="Completati questa settimana" value={`${weekDone}/${weekTarget}`} color={compColor}/>
          <Row label="Compliance" value={`${compliancePct}%`} color={compColor}/>
          {weekCompleted.map((ev,i)=>{const tpl=getTpl(ev.templateId);return tpl?<Row key={i} label={fmtLong(ev.date)} value={tpl.name} color={tpl.color}/>:null;})}
          {prsThisWeek.length>0&&<Row label="🏆 Nuovi PR" value={prsThisWeek.map(p=>p.name+" "+p.kg+"kg").join(", ")} color={C.orange}/>}
        </Section>

        <Section title="⚖️ Peso" color={C.blue}>
          {weekWeights.length>0
            ?weekWeights.map((w,i)=><Row key={i} label={fmtLong(w.date)} value={w.value+"kg"} color={C.accent}/>)
            :<div style={{fontSize:"12px",color:C.muted,padding:"6px 0"}}>Nessuna misurazione questa settimana</div>
          }
          {client.targets?.weight&&lastW&&<Row label="Distanza dall'obiettivo" value={`${Math.abs(lastW.value-parseFloat(client.targets.weight)).toFixed(1)}kg`} color={C.purple} sub={`Target: ${client.targets.weight}kg`}/>}
        </Section>

        <Section title="🥗 Alimentazione" color={avgRating>=3.5?C.success:C.orange}>
          <Row label="Giorni tracciati" value={`${weekMeals.length}/7`}/>
          {avgRating&&<Row label="Rating medio" value={`${avgRating}/5 ⭐`} color={parseFloat(avgRating)>=3.5?C.success:C.orange}/>}
          {avgWater&&<Row label="Acqua media" value={`${avgWater}L/giorno`} color={parseFloat(avgWater)>=2?C.success:C.orange}/>}
        </Section>

        <Section title="📋 Check-in" color={daysSinceCheckin!==null&&daysSinceCheckin<=7?C.success:C.danger}>
          {lastCheckin?(
            <>
              <Row label="Ultimo check-in" value={fmtLong(lastCheckin.date)} color={daysSinceCheckin<=7?C.success:C.danger} sub={`${daysSinceCheckin} giorni fa`}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginTop:"10px",marginBottom:"8px"}}>
                {[
                  {k:"energy",label:"Energie",emoji:"⚡",color:C.orange},
                  {k:"mood",label:"Umore",emoji:"😊",color:C.blue},
                  {k:"sleep",label:"Sonno",emoji:"🌙",color:C.purple},
                  {k:"motivation",label:"Motivazione",emoji:"💪",color:C.accent},
                  {k:"diet",label:"Dieta",emoji:"🥗",color:C.success},
                ].filter(m=>lastCheckin[m.k]).map(m=>(
                  <div key={m.k} style={{background:C.surface,borderRadius:"10px",padding:"9px 12px"}}>
                    <div style={{fontSize:"10px",color:C.muted,marginBottom:"4px"}}>{m.emoji} {m.label}</div>
                    <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                      <div style={{flex:1,background:C.bg,borderRadius:"999px",height:"5px",overflow:"hidden"}}>
                        <div style={{background:lastCheckin[m.k]>=4?C.success:lastCheckin[m.k]>=3?C.orange:C.danger,width:`${lastCheckin[m.k]/5*100}%`,height:"100%",borderRadius:"999px"}}/>
                      </div>
                      <span style={{fontFamily:FONT,fontWeight:800,fontSize:"12px",color:m.color}}>{lastCheckin[m.k]}/5</span>
                    </div>
                  </div>
                ))}
              </div>
              {lastCheckin.pain&&<div style={{background:C.danger+"0d",border:`1px solid ${C.danger}33`,borderRadius:"10px",padding:"9px 12px",marginBottom:"8px",fontSize:"12px",color:C.danger}}>🩹 Dolore segnalato: <strong>{lastCheckin.pain}</strong></div>}
              {lastCheckin.note&&<div style={{background:C.surface,borderRadius:"10px",padding:"10px 12px",fontSize:"12px",color:C.muted,fontStyle:"italic"}}>"{lastCheckin.note}"</div>}
            </>
          ):(
            <div style={{fontSize:"12px",color:C.danger,padding:"6px 0"}}>Nessun check-in ricevuto</div>
          )}
        </Section>

        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:"14px",fontSize:"11px",color:C.muted,textAlign:"center"}}>
          Riepilogo generato automaticamente · {today}
        </div>
      </div>
    </div>
  );
}


function HistoryTab({client,templates}){
  const isMobile=useIsMobile();
  const getTpl=id=>templates.find(t=>t.id===id);
  const completed=[...client.workoutEvents].filter(e=>e.status==="completed").sort((a,b)=>b.date.localeCompare(a.date));
  const prs={};
  [...completed].reverse().forEach(ev=>{
    const tpl=getTpl(ev.templateId);if(!tpl||!ev.completedSets?.length)return;
    tpl.exercises.forEach((ex,i)=>{const sets=ev.completedSets[i]||[];const maxKg=Math.max(0,...sets.map(s=>parseFloat(s.kg)||0));if(maxKg>0&&(!prs[ex.exId]||maxKg>prs[ex.exId].kg))prs[ex.exId]={kg:maxKg,date:ev.date};});
  });
  return(
    <div>
      <div style={{fontFamily:FONT,fontWeight:700,fontSize:"15px",marginBottom:"14px"}}>Storico ({completed.length} sessioni)</div>
      {completed.length===0&&<div style={{textAlign:"center",padding:"60px",color:C.muted}}>Nessuna sessione ancora</div>}
      <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
        {completed.map(ev=>{
          const tpl=getTpl(ev.templateId);
          const evPRs=[];
          tpl?.exercises.forEach((ex,i)=>{const sets=ev.completedSets?.[i]||[];const maxKg=Math.max(0,...sets.map(s=>parseFloat(s.kg)||0));if(maxKg>0&&prs[ex.exId]?.kg===maxKg&&prs[ex.exId]?.date===ev.date)evPRs.push(getEx(ex.exId).name);});
          return(
            <Card key={ev.id}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px",flexWrap:"wrap",gap:"6px"}}>
                <div><div style={{fontFamily:FONT,fontWeight:700,color:tpl?.color||C.accent}}>{tpl?.name||"Workout"}</div><div style={{color:C.muted,fontSize:"12px"}}>{fmtLong(ev.date)}</div></div>
                <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
                  {evPRs.length>0&&<Tag label={"🏆 "+evPRs.slice(0,2).join(", ")+(evPRs.length>2?`+${evPRs.length-2}`:"")} color={C.orange}/>}
                  <Tag label="✓ Fatto" color={C.success}/>
                </div>
              </div>
              {ev.completedSets?.length>0&&tpl&&<div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(auto-fill, minmax(140px, 1fr))",gap:"6px",marginBottom:"10px"}}>
                {tpl.exercises.map((ex,i)=>{
                  const sets=ev.completedSets[i]||[];const exData=getEx(ex.exId);
                  const maxKg=Math.max(0,...sets.map(s=>parseFloat(s.kg)||0));
                  const isPR=maxKg>0&&prs[ex.exId]?.kg===maxKg&&prs[ex.exId]?.date===ev.date;
                  return(
                    <div key={i} style={{background:C.bg,borderRadius:"8px",padding:"8px 10px",border:`1px solid ${isPR?C.orange+"44":C.border}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:"4px",marginBottom:"3px"}}>
                        {isPR&&<Star size={10} color={C.orange} fill={C.orange}/>}
                        <div style={{fontWeight:600,fontSize:"11px",color:isPR?C.orange:tpl.color,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{exData.name}</div>
                      </div>
                      <div style={{display:"flex",gap:"3px",flexWrap:"wrap"}}>
                        {sets.map((s,j)=><span key={j} style={{fontSize:"9px",color:C.muted,background:C.surface,borderRadius:"4px",padding:"1px 5px"}}>{s.kg}kg×{s.reps}</span>)}
                      </div>
                    </div>
                  );
                })}
              </div>}
              {ev.feedback&&<div style={{background:C.surface,borderRadius:"9px",padding:"10px 12px",fontSize:"12px",display:"flex",gap:"14px",alignItems:"center",flexWrap:"wrap"}}>
                <span style={{color:C.muted}}>RPE: <span style={{color:C.orange,fontWeight:700}}>{ev.feedback.rpe}/10</span></span>
                <span>{"⭐".repeat(ev.feedback.feeling)}</span>
                {ev.feedback.note&&<span style={{color:C.muted,fontStyle:"italic"}}>"{ev.feedback.note}"</span>}
              </div>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function WorkoutModal({workout,onClose,onComplete}){
  const isMobile=useIsMobile();
  const {event,template}=workout;
  const exercises=template.exercises;
  const [exIdx,setExIdx]=useState(0);
  const [setIdx,setSetIdx]=useState(0);
  const [phase,setPhase]=useState("exercise");
  const [restTime,setRestTime]=useState(0);
  const [totalRestSec,setTotalRestSec]=useState(0);
  // Load last used weights from workout history
  const lastWeights={}; 
  if(workout.workoutHistory){
    [...workout.workoutHistory]
      .filter(e=>e.status==="completed"&&e.templateId===workout.template.id&&e.completedSets?.length)
      .sort((a,b)=>b.date.localeCompare(a.date))
      .slice(0,1)
      .forEach(ev=>{
        ev.completedSets.forEach((sets,i)=>{
          const lastKg=Math.max(0,...(sets||[]).map(s=>parseFloat(s.kg)||0));
          if(lastKg>0)lastWeights[i]=lastKg;
        });
      });
  }
  const initKg=(exIdx)=>{
    if(lastWeights[exIdx])return String(lastWeights[exIdx]);
    return exercises[exIdx].targetKg>0?String(exercises[exIdx].targetKg):"";
  };
  const [loggedSets,setLoggedSets]=useState(()=>exercises.map((ex,i)=>Array.from({length:ex.sets},()=>({kg:initKg(i),reps:String(ex.targetReps),done:false}))));
  const [inputs,setInputs]=useState({kg:initKg(0),reps:String(exercises[0].targetReps)});
  const [acceptedProg,setAcceptedProg]=useState({});
  const [showFeedback,setShowFeedback]=useState(false);
  const [showProgression,setShowProgression]=useState(false);
  const [progDecisions,setProgDecisions]=useState({});
  const [feedback,setFeedback]=useState({rpe:7,feeling:4,note:""});

  // Compute progression suggestions (needs 2 past sessions with all sets crushed)
  const progressionSuggestions=exercises.map((ex,exIdx)=>{
    if(!ex.targetKg||ex.targetKg<=0)return null;
    const history=[...(workout.workoutHistory||[])]
      .filter(e=>e.status==="completed"&&e.templateId===template.id&&e.completedSets?.length>exIdx)
      .sort((a,b)=>b.date.localeCompare(a.date))
      .slice(0,2);
    if(history.length<2)return null;
    const allCrushed=history.every(ev=>{
      const sets=ev.completedSets[exIdx]||[];
      return sets.length>0&&sets.every(s=>s.done&&(parseInt(s.reps)||0)>=ex.targetReps&&(parseFloat(s.kg)||0)>=ex.targetKg);
    });
    if(!allCrushed)return null;
    const increment=ex.targetKg>=40?2.5:1.25;
    const newKg=Math.round((ex.targetKg+increment)*4)/4;
    return {exIdx,name:getEx(ex.exId).name,oldKg:ex.targetKg,newKg};
  }).filter(Boolean);

  // Countdown timer with sound at end
  useEffect(()=>{
    if(phase!=="rest"||restTime<=0)return;
    if(restTime===3)playBeep(550,0.1,0.3); // warning beep at 3s
    const t=setTimeout(()=>setRestTime(r=>r-1),1000);
    return()=>clearTimeout(t);
  },[phase,restTime]);
  useEffect(()=>{
    if(phase==="rest"&&restTime===0){
      playRestEnd();
      setPhase("exercise");
    }
  },[phase,restTime]);

  const curEx=exercises[exIdx];const curExData=getEx(curEx.exId);
  const totalSets=exercises.reduce((s,e)=>s+e.sets,0);
  const doneSets=loggedSets.reduce((s,ex)=>s+ex.filter(st=>st.done).length,0);
  const restPct=totalRestSec>0?restTime/totalRestSec:0;

  // Progression suggestion for current exercise
  const suggestedKg=getExProgression(exIdx,curEx.targetKg,curEx.targetReps,template.id,workout.workoutHistory||[]);
  const progAccepted=acceptedProg[exIdx];
  const effectiveKg=progAccepted===true?suggestedKg:curEx.targetKg;

  function startRest(restSec){
    setTotalRestSec(restSec);
    setRestTime(restSec);
    setPhase("rest");
    playSetDone();
  }

  function completeSet(){
    const kgVal=parseFloat(inputs.kg)||0;
    const repsVal=parseInt(inputs.reps)||0;
    const updated=loggedSets.map((ex,i)=>i===exIdx?ex.map((s,j)=>j===setIdx?{kg:kgVal,reps:repsVal,done:true}:s):ex);
    setLoggedSets(updated);
    const nextSet=setIdx+1;
    if(nextSet<curEx.sets){
      startRest(curEx.restSec);
      setSetIdx(nextSet);
      // Keep same kg (already propagated), just keep current inputs
      setInputs(prev=>({...prev,reps:String(curEx.targetReps)}));
    } else {
      const nextEx=exIdx+1;
      if(nextEx<exercises.length){
        startRest(curEx.restSec);
        setExIdx(nextEx);setSetIdx(0);
        setInputs({kg:initKg(nextEx),reps:String(exercises[nextEx].targetReps)});
      } else setPhase("done");
    }
  }

  const modalStyle=isMobile?{position:"fixed",inset:0,background:C.bg,zIndex:1000,overflowY:"auto",padding:"20px 16px"}:{position:"fixed",inset:0,background:"rgba(8,8,16,0.97)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"};
  const boxStyle=isMobile?{}:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"22px",padding:"26px",width:"100%",maxWidth:"500px",margin:"14px",maxHeight:"92vh",overflowY:"auto"};

  return(
    <div style={modalStyle}>
      <div style={boxStyle}>
        {phase!=="done"&&!showFeedback&&<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"18px"}}>
            <div>
              <div style={{color:C.muted,fontSize:"10px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>{template.name}</div>
              <div style={{fontFamily:FONT,fontWeight:800,fontSize:"20px",color:template.color}}>{curExData.name}</div>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginTop:"4px"}}>
                <span style={{color:C.muted,fontSize:"10px"}}>{curExData.muscle} · {curExData.equipment}</span>
                <a href={ytUrl(curExData.name)} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:"3px",color:C.danger,fontSize:"11px",textDecoration:"none",background:C.danger+"18",padding:"3px 8px",borderRadius:"6px"}}><Youtube size={11}/>Tutorial</a>
              </div>
            </div>
            <button onClick={onClose} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"7px",cursor:"pointer",color:C.muted,display:"flex"}}><X size={15}/></button>
          </div>
          <PBar value={doneSets} max={totalSets} color={template.color} height="8px"/>
          <div style={{color:C.muted,fontSize:"10px",textAlign:"right",marginBottom:"18px",marginTop:"5px"}}>{doneSets}/{totalSets} serie completate</div>

          {phase==="exercise"&&<>
            {/* PROGRESSION SUGGESTION BANNER */}
            {suggestedKg&&progAccepted===undefined&&setIdx===0&&<div style={{background:C.success+"18",border:`1px solid ${C.success}44`,borderRadius:"12px",padding:"12px 14px",marginBottom:"16px",display:"flex",alignItems:"center",gap:"10px"}}>
              <div style={{fontSize:"22px",flexShrink:0}}>💪</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:"13px",color:C.success}}>Pronto a crescere!</div>
                <div style={{fontSize:"12px",color:C.muted,marginTop:"2px"}}>Hai dominato le ultime 2 sessioni. Prova con <strong style={{color:C.success}}>{suggestedKg}kg</strong> invece di {curEx.targetKg}kg</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"5px",flexShrink:0}}>
                <button onClick={()=>{setAcceptedProg(p=>({...p,[exIdx]:true}));setInputs(i=>({...i,kg:String(suggestedKg)}));}} style={{background:C.success,border:"none",borderRadius:"7px",padding:"5px 10px",cursor:"pointer",color:"#000",fontSize:"11px",fontWeight:700}}>✓ Sì!</button>
                <button onClick={()=>setAcceptedProg(p=>({...p,[exIdx]:false}))} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:"7px",padding:"4px 10px",cursor:"pointer",color:C.muted,fontSize:"11px"}}>Dopo</button>
              </div>
            </div>}
            {progAccepted===true&&<div style={{background:C.success+"14",borderRadius:"10px",padding:"8px 12px",marginBottom:"12px",fontSize:"12px",color:C.success,fontWeight:600}}>🔥 Fantastico! Stai usando {suggestedKg}kg — nuovo obiettivo!</div>}

            <div style={{display:"flex",gap:"5px",justifyContent:"center",marginBottom:"16px"}}>
              {Array.from({length:curEx.sets}).map((_,i)=><div key={i} style={{flex:1,height:"6px",borderRadius:"999px",background:i<setIdx?C.success:i===setIdx?template.color:C.border}}/>)}
            </div>
            <div style={{textAlign:"center",color:C.muted,fontSize:"13px",marginBottom:"18px"}}>
              Serie <span style={{color:template.color,fontWeight:700,fontSize:"16px"}}>{setIdx+1}</span>/{curEx.sets}
              {setIdx>0&&loggedSets[exIdx][setIdx-1]?.done&&<div style={{color:C.success,fontSize:"11px",marginTop:"3px"}}>← Precedente: {loggedSets[exIdx][setIdx-1].kg}kg × {loggedSets[exIdx][setIdx-1].reps} reps</div>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"20px"}}>
              {[{label:"KG",key:"kg"},{label:"REPS",key:"reps"}].map(f=>(
                <div key={f.key} style={{textAlign:"center"}}>
                  <div style={{color:C.muted,fontSize:"10px",fontWeight:700,textTransform:"uppercase",marginBottom:"6px"}}>{f.label}</div>
                  <input type="number" value={inputs[f.key]} onChange={e=>{
                    const val=e.target.value;
                    setInputs(prev=>({...prev,[f.key]:val}));
                    // Propagate kg to all remaining undone sets of this exercise
                    if(f.key==="kg"){
                      setLoggedSets(prev=>prev.map((exSets,i)=>
                        i===exIdx
                          ? exSets.map((s,j)=>j>=setIdx&&!s.done?{...s,kg:val}:s)
                          : exSets
                      ));
                    }
                  }} style={{textAlign:"center",fontFamily:FONT,fontSize:"32px",fontWeight:900,border:`2px solid ${C.border}`,borderRadius:"14px",background:C.card,padding:"14px"}}/>
                </div>
              ))}
            </div>
            <Btn onClick={completeSet} style={{width:"100%",justifyContent:"center",padding:"16px",fontSize:"16px",borderRadius:"14px"}}><CheckCircle size={18}/>Completa serie</Btn>
          </>}

          {phase==="rest"&&<div style={{textAlign:"center",padding:"14px 0"}}>
            <div style={{position:"relative",width:"140px",height:"140px",margin:"0 auto 16px"}}>
              <svg width="140" height="140" style={{position:"absolute",top:0,left:0,transform:"rotate(-90deg)"}}>
                <circle cx="70" cy="70" r="60" fill="none" stroke={C.border} strokeWidth="8"/>
                <circle cx="70" cy="70" r="60" fill="none"
                  stroke={restTime<=3?C.danger:C.orange} strokeWidth="8"
                  strokeDasharray={String(2*Math.PI*60)}
                  strokeDashoffset={String(2*Math.PI*60*(1-restPct))}
                  strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear,stroke .3s"}}/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontFamily:FONT,fontSize:"40px",fontWeight:900,color:restTime<=3?C.danger:C.orange,transition:"color .3s"}}>{restTime}</div>
                <div style={{color:C.muted,fontSize:"11px"}}>sec</div>
              </div>
            </div>
            <div style={{color:C.muted,fontSize:"14px",marginBottom:"6px"}}>⏱️ Recupero in corso</div>
            <div style={{color:C.muted,fontSize:"12px",marginBottom:"16px"}}>
              {restTime<=3&&restTime>0?<span style={{color:C.danger,fontWeight:700}}>Preparati! 🔥</span>:"Rilassati, la prossima serie è in arrivo…"}
            </div>
            <Btn variant="ghost" onClick={()=>{setRestTime(0);}}><SkipForward size={14}/>Salta recupero</Btn>
          </div>}

          <div style={{marginTop:"20px",paddingTop:"14px",borderTop:`1px solid ${C.border}`}}>
            {exercises.map((ex,i)=>{const e=getEx(ex.exId);return(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"8px",padding:"5px 0",fontSize:"12px",opacity:i<exIdx?0.4:1}}>
                {i<exIdx?<CheckCircle size={12} color={C.success}/>:i===exIdx?<Zap size={12} color={template.color}/>:<Circle size={12} color={C.muted}/>}
                <span style={{color:i===exIdx?C.text:C.muted,fontWeight:i===exIdx?700:400,flex:1}}>{e.name}</span>
                <span style={{color:C.muted,fontSize:"11px"}}>{ex.sets}×{ex.targetReps}{ex.targetKg>0?`@${ex.targetKg}kg`:""}</span>
              </div>
            );})}
          </div>
        </>}

        {phase==="done"&&!showFeedback&&<div style={{textAlign:"center",padding:"20px 0"}}>
          <div style={{fontSize:"60px",marginBottom:"12px"}}>🎉</div>
          <div style={{fontFamily:FONT,fontWeight:900,fontSize:"24px",marginBottom:"6px"}}>Workout completato!</div>
          <div style={{color:C.muted,fontSize:"13px",marginBottom:"28px"}}>{doneSets} serie eseguite in {exercises.length} esercizi</div>
          <Btn onClick={()=>setShowFeedback(true)} style={{width:"100%",justifyContent:"center",marginBottom:"10px",fontSize:"15px"}}><Star size={15}/>Come è andata?</Btn>
          <Btn variant="ghost" onClick={()=>onComplete(event.id,loggedSets,null,[])} style={{width:"100%",justifyContent:"center"}}>Salta e salva</Btn>
        </div>}

        {showProgression&&<div>
          <div style={{textAlign:"center",marginBottom:"20px"}}>
            <div style={{fontSize:"40px",marginBottom:"8px"}}>📈</div>
            <div style={{fontFamily:FONT,fontWeight:900,fontSize:"20px",marginBottom:"6px",color:C.text}}>Pronto a salire di peso?</div>
            <div style={{color:C.muted,fontSize:"13px"}}>Hai completato tutti i set target per 2 sessioni di fila.<br/>Decidi tu per ogni esercizio.</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"24px"}}>
            {progressionSuggestions.map(p=>(
              <div key={p.exIdx} style={{background:progDecisions[p.exIdx]?C.accentDim:C.surface,border:`2px solid ${progDecisions[p.exIdx]?C.accent:C.border}`,borderRadius:"14px",padding:"14px 16px",transition:"all .15s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                  <div style={{fontFamily:FONT,fontWeight:700,fontSize:"14px",color:C.text}}>{p.name}</div>
                  <div style={{fontFamily:FONT,fontWeight:900,fontSize:"14px",color:C.accent}}>{p.oldKg}kg → <span style={{color:progDecisions[p.exIdx]?C.accent:C.muted}}>{p.newKg}kg</span></div>
                </div>
                <div style={{display:"flex",gap:"8px"}}>
                  <button onClick={()=>setProgDecisions(d=>({...d,[p.exIdx]:true}))} style={{flex:1,padding:"8px",borderRadius:"10px",border:`2px solid ${progDecisions[p.exIdx]?C.accent:C.border}`,background:progDecisions[p.exIdx]?C.accent:"transparent",color:progDecisions[p.exIdx]?"#000":C.muted,fontWeight:700,fontSize:"13px",cursor:"pointer",transition:"all .15s"}}>
                    💪 Sì, aumento
                  </button>
                  <button onClick={()=>setProgDecisions(d=>({...d,[p.exIdx]:false}))} style={{flex:1,padding:"8px",borderRadius:"10px",border:`2px solid ${!progDecisions[p.exIdx]?C.danger:C.border}`,background:!progDecisions[p.exIdx]?C.danger+"18":"transparent",color:!progDecisions[p.exIdx]?C.danger:C.muted,fontWeight:700,fontSize:"13px",cursor:"pointer",transition:"all .15s"}}>
                    ⏸ Non ancora
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Btn onClick={()=>{
            const accepted=progressionSuggestions.filter(p=>progDecisions[p.exIdx]);
            onComplete(event.id,loggedSets,feedback,accepted);
          }} style={{width:"100%",justifyContent:"center",fontSize:"15px",padding:"13px"}}>
            <Check size={16}/>Conferma e salva
          </Btn>
        </div>}

        {showFeedback&&<div>
          <div style={{fontFamily:FONT,fontWeight:800,fontSize:"20px",marginBottom:"20px",textAlign:"center"}}>Com'è andata? 💪</div>
          <div style={{marginBottom:"20px"}}>
            <div style={{color:C.muted,fontSize:"11px",fontWeight:700,textTransform:"uppercase",marginBottom:"8px"}}>Sforzo percepito (RPE): <span style={{color:C.orange,fontSize:"16px"}}>{feedback.rpe}/10</span></div>
            <input type="range" min={1} max={10} value={feedback.rpe} onChange={e=>setFeedback({...feedback,rpe:parseInt(e.target.value)})} style={{width:"100%",accentColor:C.orange}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"10px",color:C.muted,marginTop:"4px"}}><span>Facilissimo</span><span>Al limite</span></div>
          </div>
          <div style={{marginBottom:"20px"}}>
            <div style={{color:C.muted,fontSize:"11px",fontWeight:700,textTransform:"uppercase",marginBottom:"10px"}}>Come ti senti?</div>
            <div style={{display:"flex",gap:"8px",justifyContent:"center"}}>
              {[1,2,3,4,5].map(n=><button key={n} onClick={()=>setFeedback({...feedback,feeling:n})} style={{fontSize:"24px",background:feedback.feeling===n?C.accentDim:"transparent",border:`2px solid ${feedback.feeling===n?C.accent:"transparent"}`,borderRadius:"12px",padding:"8px 12px",cursor:"pointer",transition:"all .2s"}}>{"⭐".repeat(n)}</button>)}
            </div>
          </div>
          <div style={{marginBottom:"20px"}}>
            <div style={{color:C.muted,fontSize:"11px",fontWeight:700,textTransform:"uppercase",marginBottom:"8px"}}>Note (opzionale)</div>
            <textarea value={feedback.note} onChange={e=>setFeedback({...feedback,note:e.target.value})} placeholder="Come ti sei sentito? Cosa hai migliorato?" style={{resize:"vertical",minHeight:"80px"}}/>
          </div>
          <Btn onClick={()=>{
            if(progressionSuggestions.length>0){
              const init={};progressionSuggestions.forEach(p=>{init[p.exIdx]=true;});
              setProgDecisions(init);setShowFeedback(false);setShowProgression(true);
            } else {
              onComplete(event.id,loggedSets,feedback,[]);
            }
          }} style={{width:"100%",justifyContent:"center",fontSize:"16px",padding:"14px"}}><Check size={17}/>Salva allenamento</Btn>
        </div>}
      </div>
    </div>
  );
}

function WeightTab({client,onUpdate}){
  const isMobile=useIsMobile();
  const [subTab,setSubTab]=useState("peso");
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({date:todayStr(),value:"",note:""});
  const [showAddM,setShowAddM]=useState(false);
  const CIRC=[{id:"vita",l:"Vita"},{id:"fianchi",l:"Fianchi"},{id:"petto",l:"Petto"},{id:"coscia",l:"Coscia"},{id:"braccio",l:"Braccio"}];
  const [mForm,setMForm]=useState({date:todayStr(),vita:"",fianchi:"",petto:"",coscia:"",braccio:""});

  function addW(){if(!form.value)return;onUpdate(client.id,c=>({...c,weight:[...c.weight,{date:form.date,value:parseFloat(form.value),note:form.note}].sort((a,b)=>a.date.localeCompare(b.date))}));setForm({date:todayStr(),value:"",note:""});setShowAdd(false);}
  function delW(idx){onUpdate(client.id,c=>({...c,weight:c.weight.filter((_,i)=>i!==idx)}));}
  function addM(){
    if(!CIRC.some(f=>mForm[f.id]))return;
    const entry={date:mForm.date,...Object.fromEntries(CIRC.map(f=>[f.id,mForm[f.id]?parseFloat(mForm[f.id]):null]))};
    onUpdate(client.id,c=>({...c,misure:[...(c.misure||[]),entry].sort((a,b)=>a.date.localeCompare(b.date))}));
    setMForm({date:todayStr(),vita:"",fianchi:"",petto:"",coscia:"",braccio:""});
    setShowAddM(false);
  }
  function delM(idx){onUpdate(client.id,c=>({...c,misure:(c.misure||[]).filter((_,i)=>i!==idx)}));}

  const sorted=[...client.weight].sort((a,b)=>a.date.localeCompare(b.date));
  const last=sorted.at(-1);const prev=sorted.at(-2);
  const delta=last&&prev?(last.value-prev.value).toFixed(1):null;
  const first=sorted[0];const totalDelta=last&&first?(last.value-first.value).toFixed(1):null;
  const bmi=last&&client.height?((last.value/(parseInt(client.height)/100)**2)).toFixed(1):null;
  const target=client.targets?.weight?parseFloat(client.targets.weight):null;
  const chartData=sorted.map(e=>({date:e.date.slice(5),value:e.value}));
  const sortedM=[...(client.misure||[])].sort((a,b)=>a.date.localeCompare(b.date));
  const lastM=sortedM.at(-1);const firstM=sortedM[0];

  const STab=({id,label})=>(<button onClick={()=>setSubTab(id)} style={{flex:1,padding:"9px",borderRadius:"9px",fontFamily:FONT,fontWeight:700,fontSize:"13px",border:"none",cursor:"pointer",background:subTab===id?C.accent:"transparent",color:subTab===id?"#000":C.muted}}>{label}</button>);

  return(
    <div>
      <div style={{display:"flex",background:C.card,borderRadius:"12px",padding:"4px",marginBottom:"20px"}}>
        <STab id="peso" label="⚖️ Peso"/>
        <STab id="misure" label="📐 Misure"/>
      </div>

      {subTab==="peso"&&<>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"20px"}}>
          {last&&<StatTile icon={<Scale size={14}/>} label="Peso attuale" value={`${last.value}kg`} color={C.accent} sub={delta?`${parseFloat(delta)<0?"▼":"▲"}${Math.abs(delta)}kg`:undefined}/>}
          {bmi&&<StatTile icon={<Activity size={14}/>} label="BMI" value={bmi} color={parseFloat(bmi)<25?C.success:C.orange} sub={parseFloat(bmi)<18.5?"Sottopeso":parseFloat(bmi)<25?"Normopeso":parseFloat(bmi)<30?"Sovrappeso":"Obesità"}/>}
          {totalDelta&&<StatTile icon={parseFloat(totalDelta)<0?<TrendingDown size={14}/>:<TrendingUp size={14}/>} label="Dal primo giorno" value={`${parseFloat(totalDelta)<0?"":"+"}${totalDelta}kg`} color={parseFloat(totalDelta)<0?C.success:C.danger}/>}
          {target&&last&&<StatTile icon={<Target size={14}/>} label="All'obiettivo" value={`${Math.abs(last.value-target).toFixed(1)}kg`} color={C.purple} sub={`Target: ${target}kg`}/>}
        </div>
        {chartData.length>1&&<Card style={{marginBottom:"20px"}}>
          <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",marginBottom:"14px"}}>📈 Andamento peso</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
              <XAxis dataKey="date" tick={{fill:C.muted,fontSize:10}} tickLine={false}/>
              <YAxis domain={["auto","auto"]} tick={{fill:C.muted,fontSize:10}} tickLine={false} axisLine={false}/>
              <Tooltip content={<ChartTip unit="kg"/>}/>
              {target&&<ReferenceLine y={target} stroke={C.purple} strokeDasharray="4 4" label={{value:"Target",fill:C.purple,fontSize:10,position:"right"}}/>}
              <Area type="monotone" dataKey="value" name="Peso" stroke={C.accent} fill={C.accentDim} strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
          <div style={{fontFamily:FONT,fontWeight:700,fontSize:"14px"}}>Storico</div>
          <Btn size="sm" onClick={()=>setShowAdd(true)}><Plus size={13}/>Aggiungi</Btn>
        </div>
        {showAdd&&<Card style={{marginBottom:"14px",border:`1px solid ${C.accentMid}`}}>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:"9px",marginBottom:"10px"}}>
            <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
            <input type="number" placeholder="Peso (kg) *" value={form.value} onChange={e=>setForm({...form,value:e.target.value})} step="0.1"/>
            <input placeholder="Note (opzionale)" value={form.note} onChange={e=>setForm({...form,note:e.target.value})} style={{gridColumn:"1 / -1"}}/>
          </div>
          <div style={{display:"flex",gap:"8px"}}><Btn onClick={addW}><Check size={13}/>Salva</Btn><Btn variant="ghost" onClick={()=>setShowAdd(false)}><X size={13}/>Annulla</Btn></div>
        </Card>}
        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
          {[...sorted].reverse().map((e,i)=>{const origIdx=sorted.length-1-i;const prevE=sorted[origIdx-1];const d=prevE?(e.value-prevE.value).toFixed(1):null;return(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",background:C.card,border:`1px solid ${C.border}`,borderRadius:"10px",padding:"10px 14px"}}>
              <div style={{fontFamily:FONT,fontWeight:800,fontSize:"clamp(12px,3.5vw,15px)",color:C.accent,width:"58px",whiteSpace:"nowrap"}}>{e.value}kg</div>
              <div style={{flex:1}}><div style={{fontSize:"12px",color:C.muted}}>{fmtLong(e.date)}</div>{e.note&&<div style={{fontSize:"11px",color:C.muted,fontStyle:"italic"}}>{e.note}</div>}</div>
              {d&&<span style={{fontSize:"12px",fontWeight:700,color:parseFloat(d)<0?C.success:C.danger}}>{parseFloat(d)<0?"▼":"▲"}{Math.abs(d)}kg</span>}
              <button onClick={()=>delW(origIdx)} style={{background:"transparent",border:"none",cursor:"pointer",color:C.muted}}><Trash2 size={13}/></button>
            </div>
          );})}
        </div>
      </>}

      {subTab==="misure"&&<>
        {lastM&&firstM&&lastM.date!==firstM.date&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px",marginBottom:"16px"}}>
          {CIRC.filter(f=>lastM[f.id]&&firstM[f.id]).map(f=>{
            const d=(lastM[f.id]-firstM[f.id]).toFixed(1);
            return(
              <div key={f.id} style={{background:C.card,borderRadius:"12px",padding:"10px",textAlign:"center",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:"9px",color:C.muted,marginBottom:"3px",textTransform:"uppercase"}}>{f.l}</div>
                <div style={{fontFamily:FONT,fontWeight:800,fontSize:"17px",color:C.blue}}>{lastM[f.id]}cm</div>
                <div style={{fontSize:"11px",fontWeight:700,color:parseFloat(d)<0?C.success:C.danger}}>{parseFloat(d)<0?"":"+"}{ d}cm</div>
              </div>
            );
          })}
        </div>}
        {sortedM.length>1&&sortedM.some(m=>m.vita)&&<Card style={{marginBottom:"16px"}}>
          <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",marginBottom:"14px"}}>📉 Andamento circonferenze</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={sortedM.map(m=>({date:m.date.slice(5),vita:m.vita,fianchi:m.fianchi,braccio:m.braccio}))}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
              <XAxis dataKey="date" tick={{fill:C.muted,fontSize:10}} tickLine={false}/>
              <YAxis domain={["auto","auto"]} tick={{fill:C.muted,fontSize:10}} tickLine={false} axisLine={false}/>
              <Tooltip content={<ChartTip unit="cm"/>}/>
              {sortedM.some(m=>m.vita)&&<Area type="monotone" dataKey="vita" name="Vita" stroke={C.accent} fill={C.accent+"11"} strokeWidth={2}/>}
              {sortedM.some(m=>m.fianchi)&&<Area type="monotone" dataKey="fianchi" name="Fianchi" stroke={C.purple} fill={C.purple+"11"} strokeWidth={2}/>}
              {sortedM.some(m=>m.braccio)&&<Area type="monotone" dataKey="braccio" name="Braccio" stroke={C.orange} fill={C.orange+"11"} strokeWidth={2}/>}
            </AreaChart>
          </ResponsiveContainer>
        </Card>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
          <div style={{fontFamily:FONT,fontWeight:700,fontSize:"14px"}}>Storico misure</div>
          <Btn size="sm" onClick={()=>setShowAddM(true)}><Plus size={13}/>Aggiungi</Btn>
        </div>
        {showAddM&&<Card style={{marginBottom:"14px",border:`1px solid ${C.accentMid}`}}>
          <div style={{marginBottom:"10px"}}><input type="date" value={mForm.date} onChange={e=>setMForm({...mForm,date:e.target.value})}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"10px"}}>
            {CIRC.map(f=>(<input key={f.id} type="number" placeholder={`${f.l} (cm)`} value={mForm[f.id]} onChange={e=>setMForm({...mForm,[f.id]:e.target.value})} step="0.5"/>))}
          </div>
          <div style={{display:"flex",gap:"8px"}}><Btn onClick={addM}><Check size={13}/>Salva</Btn><Btn variant="ghost" onClick={()=>setShowAddM(false)}><X size={13}/>Annulla</Btn></div>
        </Card>}
        {sortedM.length===0&&<div style={{textAlign:"center",padding:"40px 20px",color:C.muted}}>
          <div style={{fontSize:"36px",marginBottom:"8px"}}>📐</div>
          <div style={{fontFamily:FONT,fontWeight:700,fontSize:"14px",marginBottom:"4px"}}>Nessuna misura ancora</div>
          <div style={{fontSize:"12px"}}>Aggiungi le tue prime misurazioni per tracciare i progressi nel tempo.</div>
        </div>}
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          {[...sortedM].reverse().map((m,i)=>{
            const origIdx=sortedM.length-1-i;const prevM=sortedM[origIdx-1];
            return(
              <Card key={i}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                  <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px"}}>{fmtLong(m.date)}</div>
                  <button onClick={()=>delM(origIdx)} style={{background:"transparent",border:"none",cursor:"pointer",color:C.muted}}><Trash2 size={13}/></button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"6px"}}>
                  {CIRC.filter(f=>m[f.id]).map(f=>{
                    const d=prevM&&prevM[f.id]?(m[f.id]-prevM[f.id]).toFixed(1):null;
                    return(
                      <div key={f.id} style={{background:C.surface,borderRadius:"8px",padding:"8px",textAlign:"center"}}>
                        <div style={{fontSize:"9px",color:C.muted,marginBottom:"2px"}}>{f.l}</div>
                        <div style={{fontFamily:FONT,fontWeight:700,fontSize:"14px"}}>{m[f.id]}<span style={{fontSize:"9px",color:C.muted}}>cm</span></div>
                        {d&&<div style={{fontSize:"10px",fontWeight:700,color:parseFloat(d)<0?C.success:C.danger}}>{parseFloat(d)<0?"":"+"}{ d}</div>}
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </>}
    </div>
  );
}

function CaloriesTab({client,onUpdate}){
  const isMobile=useIsMobile();
  const [subTab,setSubTab]=useState("diario");

  // ── Meal plan config ──
  const MEAL_PLANS={
    "3pasti":[
      {id:"colazione",label:"Colazione",icon:"☀️"},
      {id:"pranzo",label:"Pranzo",icon:"🌤"},
      {id:"cena",label:"Cena",icon:"🌙"},
    ],
    "4pasti":[
      {id:"colazione",label:"Colazione",icon:"☀️"},
      {id:"pranzo",label:"Pranzo",icon:"🌤"},
      {id:"spuntino",label:"Spuntino",icon:"🍎"},
      {id:"cena",label:"Cena",icon:"🌙"},
    ],
    "5pasti":[
      {id:"colazione",label:"Colazione",icon:"☀️"},
      {id:"spuntino_m",label:"Spuntino mattina",icon:"🍌"},
      {id:"pranzo",label:"Pranzo",icon:"🌤"},
      {id:"spuntino_p",label:"Spuntino pomeriggio",icon:"🍎"},
      {id:"cena",label:"Cena",icon:"🌙"},
    ],
    "168":[
      {id:"pasto1",label:"Primo pasto",icon:"🕐",showTime:true},
      {id:"pasto2",label:"Secondo pasto",icon:"🕑",showTime:true},
      {id:"pasto3",label:"Terzo pasto",icon:"🕒",showTime:true},
    ],
  };
  const SLOTS=MEAL_PLANS[client.mealPlan||"4pasti"];
  const WATER_OPTS=[0.5,1,1.5,2,2.5,3];
  const FEELINGS=[
    {v:1,label:"Bene",emoji:"😊"},
    {v:2,label:"Gonfiore",emoji:"😮‍💨"},
    {v:3,label:"Pesante",emoji:"😓"},
    {v:4,label:"Nausea",emoji:"🤢"},
  ];

  // ── Diary state ──
  const emptyForm=()=>({date:todayStr(),colazione:"",pranzo:"",cena:"",spuntino:"",spuntino_m:"",spuntino_p:"",pasto1:"",pasto2:"",pasto3:"",pasto1_time:"",pasto2_time:"",pasto3_time:"",water:0,feeling:0,rating:0});
  const todayMeal=(client.meals||[]).find(m=>m.date===todayStr());
  const [mealForm,setMealForm]=useState(()=>todayMeal?{...todayMeal}:emptyForm());
  const [mealSaved,setMealSaved]=useState(false);
  function saveMeal(){
    const meals=(client.meals||[]).filter(m=>m.date!==mealForm.date);
    onUpdate(client.id,c=>({...c,meals:[...meals,{...mealForm}].sort((a,b)=>a.date.localeCompare(b.date))}));
    setMealSaved(true);setTimeout(()=>setMealSaved(false),2000);
  }
  function loadDay(date){
    const found=(client.meals||[]).find(m=>m.date===date);
    setMealForm(found?{...found}:{...emptyForm(),date});
  }

  // ── Macro state ──
  const [showAdd,setShowAdd]=useState(false);
  const [macroForm,setMacroForm]=useState({date:todayStr(),kcal:"",protein:"",carbs:"",fats:""});
  function addMacro(){
    if(!macroForm.kcal)return;
    const entry={date:macroForm.date,kcal:parseInt(macroForm.kcal)||0,protein:parseInt(macroForm.protein)||0,carbs:parseInt(macroForm.carbs)||0,fats:parseInt(macroForm.fats)||0};
    onUpdate(client.id,c=>({...c,calories:[...c.calories,entry].sort((a,b)=>a.date.localeCompare(b.date))}));
    setMacroForm({date:todayStr(),kcal:"",protein:"",carbs:"",fats:""});
    setShowAdd(false);
  }
  function delMacro(date){onUpdate(client.id,c=>({...c,calories:c.calories.filter(e=>e.date!==date)}));}
  const macroSorted=[...client.calories].sort((a,b)=>a.date.localeCompare(b.date));
  const tgt=client.targets;
  const lastMacro=macroSorted.at(-1);
  const avg7=macroSorted.length>0?Math.round(macroSorted.slice(-7).reduce((s,e)=>s+e.kcal,0)/Math.min(7,macroSorted.length)):null;
  const chartData=macroSorted.map(e=>({date:e.date.slice(5),kcal:e.kcal}));

  // ── 7-day summary ──
  const last7=Array.from({length:7}).map((_,i)=>{
    const d=new Date();d.setDate(d.getDate()-6+i);
    const ds=d.toISOString().slice(0,10);
    const entry=(client.meals||[]).find(m=>m.date===ds);
    const filled=entry?SLOTS.filter(s=>entry[s.id]?.trim()).length:0;
    return{date:ds,label:["Dom","Lun","Mar","Mer","Gio","Ven","Sab"][d.getDay()],filled,entry};
  });

  const subNavStyle=(id)=>({
    flex:1,padding:"9px",borderRadius:"8px",border:"none",cursor:"pointer",
    fontWeight:600,fontSize:"13px",
    background:subTab===id?C.accent:"transparent",
    color:subTab===id?"#000":C.muted,transition:"all .2s"
  });

  return(
    <div>
      {/* Sub-navigation */}
      <div style={{display:"flex",gap:"4px",background:C.surface,padding:"4px",borderRadius:"12px",marginBottom:"20px"}}>
        <button onClick={()=>setSubTab("diario")} style={subNavStyle("diario")}>🍽 Diario pasti</button>
        <button onClick={()=>setSubTab("macro")} style={subNavStyle("macro")}>📊 Macro / Kcal</button>
      </div>

      {/* ══ DIARIO PASTI ══ */}
      {subTab==="diario"&&<div>

        {/* 7-day strip */}
        <Card style={{marginBottom:"20px"}}>
          <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",marginBottom:"12px"}}>Ultimi 7 giorni</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"4px",marginBottom:"8px"}}>
            {last7.map((d,i)=>{
              const isToday=d.date===todayStr();
              const isSel=mealForm.date===d.date;
              const col=d.filled===SLOTS.length?C.success:d.filled>=2?C.orange:d.filled===1?C.muted:"transparent";
              return(
                <div key={i} onClick={()=>loadDay(d.date)} style={{cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}>
                  <div style={{fontSize:"9px",color:isToday?C.accent:C.muted,fontWeight:isToday?700:500}}>{d.label}</div>
                  <div style={{width:"32px",height:"32px",borderRadius:"50%",background:d.filled>0?col+"33":"transparent",border:`2px solid ${isSel?C.accent:d.filled>0?col:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:700,color:d.filled>0?col:C.muted}}>
                    {d.filled>0?d.filled:"·"}
                  </div>
                  {d.entry&&d.entry.rating>0&&<div style={{fontSize:"8px"}}>{"⭐".repeat(d.entry.rating)}</div>}
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",gap:"12px",fontSize:"10px",color:C.muted,justifyContent:"center"}}>
            <span style={{color:C.success}}>● Completo</span>
            <span style={{color:C.orange}}>● Parziale</span>
            <span>N = pasti su {SLOTS.length}</span>
          </div>
        </Card>

        {/* Day selector */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px"}}>
          <div style={{fontFamily:FONT,fontWeight:700,fontSize:"14px"}}>
            {mealForm.date===todayStr()?"📅 Oggi":fmtLong(mealForm.date)}
          </div>
          <input type="date" value={mealForm.date} onChange={e=>loadDay(e.target.value)} style={{width:"auto",fontSize:"12px",padding:"6px 10px"}}/>
        </div>

        {/* Meal slots */}
        <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"16px"}}>
          {SLOTS.map(slot=>(
            <div key={slot.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"14px",padding:"12px 14px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}>
                <span style={{fontSize:"18px"}}>{slot.icon}</span>
                <span style={{fontFamily:FONT,fontWeight:700,fontSize:"13px"}}>{slot.label}</span>
                {slot.showTime&&(
                  <input type="time" value={mealForm[slot.id+"_time"]||""} onChange={e=>setMealForm(f=>({...f,[slot.id+"_time"]:e.target.value}))} style={{marginLeft:"auto",width:"auto",fontSize:"12px",padding:"4px 8px"}}/>
                )}
                {!slot.showTime&&mealForm[slot.id]&&mealForm[slot.id].trim()&&(
                  <span style={{marginLeft:"auto",fontSize:"10px",color:C.success,fontWeight:700}}>✓</span>
                )}
              </div>
              <textarea value={mealForm[slot.id]||""} onChange={e=>setMealForm(f=>({...f,[slot.id]:e.target.value}))} placeholder={slot.id==="colazione"?"Es: Yogurt greco, frutta, caffè…":slot.id==="pranzo"||slot.id==="pasto2"?"Es: Riso con pollo e verdure…":slot.id==="cena"||slot.id==="pasto3"?"Es: Salmone, broccoli al vapore…":slot.id==="pasto1"?"Es: Uova, avocado, toast integrale…":"Es: Frutta, mandorle…"} style={{resize:"none",minHeight:"48px",fontSize:"13px",lineHeight:1.5}}/>
            </div>
          ))}
        </div>

        {/* Water */}
        <Card style={{marginBottom:"14px"}}>
          <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",marginBottom:"12px"}}>💧 Acqua bevuta oggi</div>
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
            {WATER_OPTS.map(v=>(
              <button key={v} onClick={()=>setMealForm(f=>({...f,water:v}))} style={{padding:"9px 14px",borderRadius:"10px",border:`2px solid ${mealForm.water===v?C.blue:C.border}`,background:mealForm.water===v?C.blue+"22":"transparent",cursor:"pointer",fontFamily:FONT,fontWeight:700,fontSize:"13px",color:mealForm.water===v?C.blue:C.muted}}>
                {v}L
              </button>
            ))}
          </div>
          {mealForm.water>0&&(
            <div style={{marginTop:"10px",fontSize:"10px",color:C.blue,fontWeight:600}}>
              {mealForm.water>=2?"Ottima idratazione 💧":mealForm.water>=1?"Potresti bere di più":"Bevi di più oggi!"}
            </div>
          )}
        </Card>

        {/* Feeling */}
        <Card style={{marginBottom:"14px"}}>
          <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",marginBottom:"12px"}}>🫃 Come ti senti?</div>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            {FEELINGS.map(f=>(
              <button key={f.v} onClick={()=>setMealForm(fm=>({...fm,feeling:fm.feeling===f.v?0:f.v}))} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",padding:"10px 12px",borderRadius:"12px",border:`2px solid ${mealForm.feeling===f.v?C.orange:C.border}`,background:mealForm.feeling===f.v?C.orange+"18":"transparent",cursor:"pointer",minWidth:"60px"}}>
                <span style={{fontSize:"20px"}}>{f.emoji}</span>
                <span style={{fontSize:"10px",color:mealForm.feeling===f.v?C.orange:C.muted,fontWeight:600}}>{f.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Rating */}
        <Card style={{marginBottom:"18px"}}>
          <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",marginBottom:"10px"}}>📝 Quanto hai mangiato bene oggi?</div>
          <div style={{display:"flex",gap:"8px",justifyContent:"center"}}>
            {[1,2,3,4,5].map(n=>(
              <button key={n} onClick={()=>setMealForm(f=>({...f,rating:f.rating===n?0:n}))} style={{fontSize:"26px",background:"transparent",border:`2px solid ${mealForm.rating>=n?C.orange:"transparent"}`,borderRadius:"10px",padding:"6px 10px",cursor:"pointer",filter:mealForm.rating>=n?"none":"grayscale(1)"}}>⭐</button>
            ))}
          </div>
        </Card>

        <Btn onClick={saveMeal} style={{width:"100%",justifyContent:"center",padding:"13px",fontSize:"15px"}}>
          {mealSaved?<><Check size={16}/>Salvato!</>:<><Check size={16}/>Salva diario</>}
        </Btn>

        {/* Past days */}
        {(client.meals||[]).length>0&&(
          <div style={{marginTop:"20px"}}>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",marginBottom:"12px"}}>Giorni precedenti</div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {[...(client.meals||[])].sort((a,b)=>b.date.localeCompare(a.date)).filter(m=>m.date!==todayStr()).slice(0,7).map((m,i)=>{
                const filled=SLOTS.filter(s=>m[s.id]&&m[s.id].trim()).length;
                const col=filled===SLOTS.length?C.success:filled>=2?C.orange:C.muted;
                return(
                  <div key={i} onClick={()=>loadDay(m.date)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"12px",padding:"12px 16px",cursor:"pointer"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                      <span style={{fontFamily:FONT,fontWeight:700,fontSize:"13px"}}>{fmtLong(m.date)}</span>
                      <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                        {m.rating>0&&<span style={{fontSize:"12px"}}>{"⭐".repeat(m.rating)}</span>}
                        {m.water>0&&<span style={{fontSize:"11px",color:C.blue,fontWeight:700}}>💧{m.water}L</span>}
                        <Tag label={`${filled}/${SLOTS.length}`} color={col}/>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px"}}>
                      {SLOTS.filter(s=>m[s.id]&&m[s.id].trim()).map(s=>(
                        <div key={s.id} style={{fontSize:"11px",color:C.muted,display:"flex",gap:"4px",alignItems:"flex-start"}}>
                          <span>{s.icon}</span>
                          <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m[s.id]}</span>
                        </div>
                      ))}
                    </div>
                    {m.feeling>0&&(
                      <div style={{marginTop:"5px",fontSize:"11px",color:C.orange}}>
                        {FEELINGS.find(f=>f.v===m.feeling)?.emoji} {FEELINGS.find(f=>f.v===m.feeling)?.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>}

      {/* ══ MACRO / KCAL ══ */}
      {subTab==="macro"&&<div>
        {lastMacro&&(
          <div style={{display:"flex",gap:"10px",marginBottom:"20px",flexWrap:"wrap"}}>
            <StatTile icon={<Flame size={18}/>} label="Oggi Kcal" value={lastMacro.kcal} color={C.orange} sub={tgt&&tgt.kcal?`Obiettivo: ${tgt.kcal}`:undefined}/>
            <StatTile icon={<Activity size={14}/>} label="Media 7gg" value={avg7||"—"} color={C.blue}/>
            {lastMacro.protein>0&&<StatTile icon={<Dumbbell size={18}/>} label="Proteine oggi" value={`${lastMacro.protein}g`} color={C.success} sub={tgt&&tgt.protein?`Target: ${tgt.protein}g`:undefined}/>}
          </div>
        )}
        {lastMacro&&tgt&&tgt.kcal&&(
          <Card style={{marginBottom:"20px"}}>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",marginBottom:"12px"}}>Oggi vs Obiettivi</div>
            {[{label:"Calorie",val:lastMacro.kcal,target:parseInt(tgt.kcal),unit:"kcal",color:C.orange},{label:"Proteine",val:lastMacro.protein,target:parseInt(tgt.protein),unit:"g",color:C.success},{label:"Carbs",val:lastMacro.carbs,target:parseInt(tgt.carbs),unit:"g",color:C.purple},{label:"Grassi",val:lastMacro.fats,target:parseInt(tgt.fats),unit:"g",color:C.blue}].map(s=>(
              <div key={s.label} style={{marginBottom:"10px"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",marginBottom:"4px"}}>
                  <span style={{color:C.muted}}>{s.label}</span>
                  <span style={{fontFamily:FONT,fontWeight:700,color:s.color}}>{s.val||0}<span style={{color:C.muted,fontWeight:400}}>/{s.target}{s.unit}</span></span>
                </div>
                <PBar value={s.val||0} max={s.target||1} color={s.color}/>
              </div>
            ))}
          </Card>
        )}
        {chartData.length>1&&(
          <Card style={{marginBottom:"20px"}}>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",marginBottom:"14px"}}>📊 Andamento calorie</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                <XAxis dataKey="date" tick={{fill:C.muted,fontSize:10}} tickLine={false}/>
                <YAxis tick={{fill:C.muted,fontSize:10}} tickLine={false} axisLine={false}/>
                <Tooltip content={<ChartTip unit="kcal"/>}/>
                {tgt&&tgt.kcal&&<ReferenceLine y={parseInt(tgt.kcal)} stroke={C.orange} strokeDasharray="4 4"/>}
                <Bar dataKey="kcal" name="Kcal" fill={C.orange} radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
          <div style={{fontFamily:FONT,fontWeight:700,fontSize:"14px"}}>Registro macro</div>
          <Btn size="sm" onClick={()=>setShowAdd(true)}><Plus size={13}/>Aggiungi</Btn>
        </div>
        {showAdd&&(
          <Card style={{marginBottom:"14px",border:`1px solid ${C.accentMid}`}}>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:"9px",marginBottom:"10px"}}>
              <input type="date" value={macroForm.date} onChange={e=>setMacroForm({...macroForm,date:e.target.value})} style={{gridColumn:"1 / -1"}}/>
              <input type="number" placeholder="Kcal *" value={macroForm.kcal} onChange={e=>setMacroForm({...macroForm,kcal:e.target.value})}/>
              <input type="number" placeholder="Proteine (g)" value={macroForm.protein} onChange={e=>setMacroForm({...macroForm,protein:e.target.value})}/>
              <input type="number" placeholder="Carboidrati (g)" value={macroForm.carbs} onChange={e=>setMacroForm({...macroForm,carbs:e.target.value})}/>
              <input type="number" placeholder="Grassi (g)" value={macroForm.fats} onChange={e=>setMacroForm({...macroForm,fats:e.target.value})}/>
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              <Btn onClick={addMacro}><Check size={13}/>Salva</Btn>
              <Btn variant="ghost" onClick={()=>setShowAdd(false)}><X size={13}/>Annulla</Btn>
            </div>
          </Card>
        )}
        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
          {[...macroSorted].reverse().map((e,i)=>(
            <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"10px",padding:"12px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
                <span style={{color:C.muted,fontSize:"12px"}}>{fmtLong(e.date)}</span>
                <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                  <span style={{fontFamily:FONT,fontWeight:800,fontSize:"16px",color:C.orange}}>{e.kcal} kcal</span>
                  <button onClick={()=>delMacro(e.date)} style={{background:"transparent",border:"none",cursor:"pointer",color:C.muted}}><Trash2 size={13}/></button>
                </div>
              </div>
              {(e.protein>0||e.carbs>0||e.fats>0)&&(
                <div style={{display:"flex",gap:"10px"}}>
                  {[{label:"P",val:e.protein,c:C.success},{label:"C",val:e.carbs,c:C.purple},{label:"G",val:e.fats,c:C.blue}].map(m=>(
                    <span key={m.label} style={{fontSize:"11px",color:m.c,fontWeight:700}}>{m.label}: {m.val}g</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>}

    </div>
  );
}

// ─── BLUEPRINT TAB ───────────────────────────────────────────────────────────
function BlueprintTab({client,onUpdate}){
  const isMobile=useIsMobile();
  const bp=client.blueprint||{};
  const [phase,setPhase]=useState("view"); // view | precall | incall
  const [form,setForm]=useState(bp);
  const [saved,setSaved]=useState(false);

  function save(){
    onUpdate(client.id,c=>({...c,blueprint:{...c.blueprint,...form,updatedAt:todayStr()}}));
    setSaved(true);setTimeout(()=>setSaved(false),2000);
    setPhase("view");
  }
  function setF(k,v){setForm(f=>({...f,[k]:v}));}

  const PRECALL_COMPLETE=bp.sesso&&bp.professione&&bp.obiettivoPeso&&bp.livelloStress&&bp.oreSonno&&bp.qualitaSonno&&bp.tipoDieta&&bp.esperienzaAllenamento&&bp.obiettivoPrincipale;
  const INCALL_COMPLETE=bp.alimentazioneTipica&&bp.intolleranze!==undefined&&bp.obiettivoVita&&bp.noteTrained;
  const STATUS=PRECALL_COMPLETE&&INCALL_COMPLETE?"complete":PRECALL_COMPLETE?"precall-done":"incomplete";

  const statusColor=STATUS==="complete"?C.success:STATUS==="precall-done"?C.orange:C.danger;
  const statusLabel=STATUS==="complete"?"Blueprint completo ✓":STATUS==="precall-done"?"Pre-call compilata — da completare in call":"Da compilare";

  const FieldLabel=({children})=>(
    <div style={{color:C.muted,fontSize:"10px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"5px"}}>{children}</div>
  );
  const Row=({children,cols=1})=>(
    <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":`repeat(${cols},1fr)`,gap:"12px",marginBottom:"14px"}}>{children}</div>
  );
  const Field=({label,children})=>(
    <div><FieldLabel>{label}</FieldLabel>{children}</div>
  );
  const SelectOpts=({field,opts})=>(
    <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
      {opts.map(o=>{
        const val=typeof o==="object"?o.v:o;
        const lbl=typeof o==="object"?o.l:o;
        const sel=form[field]===val;
        return(
          <button key={val} onClick={()=>setF(field,sel?null:val)} style={{padding:"6px 12px",borderRadius:"8px",border:`1.5px solid ${sel?C.accent:C.border}`,background:sel?C.accentDim:"transparent",cursor:"pointer",fontSize:"12px",fontWeight:sel?700:400,color:sel?C.accent:C.text}}>
            {lbl}
          </button>
        );
      })}
    </div>
  );

  if(phase==="precall"||phase==="incall"){
    return(
      <div>
        <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"20px"}}>
          <button onClick={()=>{setForm(bp);setPhase("view");}} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"9px",padding:"7px",cursor:"pointer",color:C.muted,display:"flex"}}><ChevronLeft size={16}/></button>
          <div style={{fontFamily:FONT,fontWeight:800,fontSize:"16px"}}>{phase==="precall"?"📋 Sezione pre-call":"📞 Sezione in-call"}</div>
        </div>

        {phase==="precall"&&<div style={{display:"flex",flexDirection:"column",gap:"0px"}}>
          {/* Section 1 - Personal */}
          <Card style={{marginBottom:"12px"}}>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",color:C.accent,marginBottom:"14px"}}>👤 Dati personali</div>
            <Row cols={2}>
              <Field label="Data di nascita"><input type="date" value={form.dataNascita||""} onChange={e=>setF("dataNascita",e.target.value)}/></Field>
              <Field label="Sesso"><SelectOpts field="sesso" opts={[{v:"M",l:"Maschio"},{v:"F",l:"Femmina"}]}/></Field>
            </Row>
            <Row>
              <Field label="Professione / Occupazione"><input value={form.professione||""} onChange={e=>setF("professione",e.target.value)} placeholder="es. Impiegato, Libero professionista..."/></Field>
            </Row>
            <Row cols={2}>
              <Field label="Obiettivo di peso (kg)"><input type="number" value={form.obiettivoPeso||""} onChange={e=>setF("obiettivoPeso",e.target.value)}/></Field>
              <Field label="% Massa grassa stimata"><input type="number" value={form.massaGrassa||""} onChange={e=>setF("massaGrassa",e.target.value)} placeholder="se disponibile"/></Field>
            </Row>
            <Row cols={2}>
              <Field label="Circonferenza vita (cm)"><input type="number" value={form.circVita||""} onChange={e=>setF("circVita",e.target.value)}/></Field>
              <Field label="Circonferenza fianchi (cm)"><input type="number" value={form.circFianchi||""} onChange={e=>setF("circFianchi",e.target.value)}/></Field>
            </Row>
            <Row cols={3}>
              <Field label="Petto (cm)"><input type="number" value={form.circPetto||""} onChange={e=>setF("circPetto",e.target.value)}/></Field>
              <Field label="Coscia (cm)"><input type="number" value={form.circCoscia||""} onChange={e=>setF("circCoscia",e.target.value)}/></Field>
              <Field label="Braccio (cm)"><input type="number" value={form.circBraccio||""} onChange={e=>setF("circBraccio",e.target.value)}/></Field>
            </Row>
          </Card>

          {/* Section 2 - Health */}
          <Card style={{marginBottom:"12px"}}>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",color:C.accent,marginBottom:"14px"}}>🏥 Salute & parametri fisici</div>
            <Row>
              <Field label="Patologie diagnosticate"><textarea value={form.patologie||""} onChange={e=>setF("patologie",e.target.value)} placeholder="Specifica nome e anno (o lascia vuoto)" style={{minHeight:"52px",resize:"none",fontSize:"13px"}}/></Field>
            </Row>
            <Row>
              <Field label="Farmaci assunti"><textarea value={form.farmaci||""} onChange={e=>setF("farmaci",e.target.value)} placeholder="Nome, dosaggio, frequenza (o lascia vuoto)" style={{minHeight:"52px",resize:"none",fontSize:"13px"}}/></Field>
            </Row>
            <Row>
              <Field label="Integratori regolari"><textarea value={form.integratoriAttuali||""} onChange={e=>setF("integratoriAttuali",e.target.value)} placeholder="es. proteine, creatina, omega-3..." style={{minHeight:"52px",resize:"none",fontSize:"13px"}}/></Field>
            </Row>
            <Row cols={2}>
              <Field label="Infortuni muscolo-scheletrici">
                <SelectOpts field="infortuni" opts={[{v:"no",l:"No"},{v:"si",l:"Sì"}]}/>
              </Field>
              <Field label="Dolori cronici ricorrenti">
                <SelectOpts field="doloriCronici" opts={[{v:"no",l:"No"},{v:"si",l:"Sì"}]}/>
              </Field>
            </Row>
            <Row>
              <Field label="Esami del sangue recenti">
                <SelectOpts field="esamiSangue" opts={[{v:"no",l:"No"},{v:"6mesi",l:"Sì, entro 6 mesi"},{v:"oltre",l:"Sì, oltre 6 mesi fa"}]}/>
              </Field>
            </Row>
          </Card>

          {/* Section 3 - Lifestyle */}
          <Card style={{marginBottom:"12px"}}>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",color:C.accent,marginBottom:"14px"}}>💼 Lavoro & stile di vita</div>
            <Row>
              <Field label="Tipo di lavoro">
                <SelectOpts field="tipoLavoro" opts={[{v:"sed",l:"Sedentario"},{v:"piedi",l:"In piedi/fisico"},{v:"misto",l:"Misto"},{v:"turni",l:"Turni/notturno"}]}/>
              </Field>
            </Row>
            <Row>
              <Field label="Orario di lavoro tipico"><input value={form.orarioLavoro||""} onChange={e=>setF("orarioLavoro",e.target.value)} placeholder="es. 9-18, smart working..."/></Field>
            </Row>
            <Row>
              <Field label="Livello di stress percepito">
                <SelectOpts field="livelloStress" opts={[{v:"1-3",l:"1-3 Basso"},{v:"4-6",l:"4-6 Moderato"},{v:"7-8",l:"7-8 Alto"},{v:"9-10",l:"9-10 Molto alto"}]}/>
              </Field>
            </Row>
            <Row cols={2}>
              <Field label="Fumo">
                <SelectOpts field="fumo" opts={[{v:"no",l:"No"},{v:"smesso",l:"Ho smesso"},{v:"si",l:"Sì"}]}/>
              </Field>
              <Field label="Tempo libero per il percorso"><input value={form.tempoLibero||""} onChange={e=>setF("tempoLibero",e.target.value)} placeholder="ore/settimana"/></Field>
            </Row>
          </Card>

          {/* Section 4 - Sleep */}
          <Card style={{marginBottom:"12px"}}>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",color:C.accent,marginBottom:"14px"}}>🌙 Sonno & recupero</div>
            <Row cols={3}>
              <Field label="Ore di sonno"><input type="number" value={form.oreSonno||""} onChange={e=>setF("oreSonno",e.target.value)} placeholder="es. 7"/></Field>
              <Field label="Ora di andare a letto"><input type="time" value={form.oraCoricarsi||""} onChange={e=>setF("oraCoricarsi",e.target.value)}/></Field>
              <Field label="Ora di sveglia"><input type="time" value={form.oraSveglia||""} onChange={e=>setF("oraSveglia",e.target.value)}/></Field>
            </Row>
            <Row>
              <Field label="Qualità del sonno">
                <SelectOpts field="qualitaSonno" opts={[{v:"ottima",l:"Ottima"},{v:"buona",l:"Buona"},{v:"irregolare",l:"Irregolare"},{v:"scarsa",l:"Scarsa"}]}/>
              </Field>
            </Row>
            <Row cols={2}>
              <Field label="Ti svegli riposato?">
                <SelectOpts field="svegliRiposato" opts={[{v:"sempre",l:"Quasi sempre"},{v:"avolta",l:"A volte"},{v:"raramente",l:"Raramente"},{v:"mai",l:"Mai"}]}/>
              </Field>
              <Field label="Schermi prima di dormire">
                <SelectOpts field="schermiSera" opts={[{v:"no",l:"No/poco"},{v:"1h",l:"<1h prima"},{v:"2h",l:"1-2h prima"},{v:"oltre",l:">2h prima"}]}/>
              </Field>
            </Row>
            <Row cols={2}>
              <Field label="Integratori per dormire"><input value={form.integratoriSonno||""} onChange={e=>setF("integratoriSonno",e.target.value)} placeholder="es. melatonina, magnesio..."/></Field>
              <Field label="Luce solare quotidiana">
                <SelectOpts field="luceSolare" opts={[{v:"<15",l:"<15 min"},{v:"15-30",l:"15-30"},{v:"30-60",l:"30-60"},{v:">1h",l:">1h"}]}/>
              </Field>
            </Row>
          </Card>

          {/* Section 5 - Nutrition partial */}
          <Card style={{marginBottom:"12px"}}>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",color:C.accent,marginBottom:"14px"}}>🥗 Alimentazione (base)</div>
            <Row>
              <Field label="Come descrivi la tua dieta attuale?">
                <SelectOpts field="tipoDieta" opts={[{v:"eq",l:"Equilibrata"},{v:"iperprot",l:"Iperproteica"},{v:"lowcarb",l:"Low-carb/Keto"},{v:"veg",l:"Vegana/Vegetariana"},{v:"nessun",l:"Senza regime preciso"}]}/>
              </Field>
            </Row>
            <Row cols={2}>
              <Field label="Quanti pasti al giorno?">
                <SelectOpts field="numeroPasti" opts={["2","3","4","5","6"]}/>
              </Field>
              <Field label="Alcolici?">
                <SelectOpts field="alcolici" opts={[{v:"mai",l:"Mai"},{v:"raramente",l:"Raramente"},{v:"weekend",l:"Weekend"},{v:"quotidiano",l:"Quotidiano"}]}/>
              </Field>
            </Row>
            <Row cols={2}>
              <Field label="Caffè?">
                <SelectOpts field="caffe" opts={[{v:"no",l:"No"},{v:"1",l:"1/giorno"},{v:"2-3",l:"2-3/giorno"},{v:">3",l:">3/giorno"}]}/>
              </Field>
              <Field label="Acqua al giorno (litri)"><input type="number" value={form.acqua||""} onChange={e=>setF("acqua",e.target.value)} placeholder="es. 1.5"/></Field>
            </Row>
            <Row>
              <Field label="Digiuno intermittente?">
                <SelectOpts field="digiunoIF" opts={[{v:"no",l:"No, mai sentito"},{v:"sentito",l:"Ne ho sentito parlare"},{v:"provato",l:"Ho provato"}]}/>
              </Field>
            </Row>
          </Card>

          {/* Section 6 - Training */}
          <Card style={{marginBottom:"12px"}}>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",color:C.accent,marginBottom:"14px"}}>💪 Allenamento</div>
            <Row>
              <Field label="Esperienza di allenamento">
                <SelectOpts field="esperienzaAllenamento" opts={[{v:"nessuna",l:"Nessuna"},{v:"<1",l:"<1 anno"},{v:"1-3",l:"1-3 anni"},{v:">3",l:">3 anni"}]}/>
              </Field>
            </Row>
            <Row>
              <Field label="Preferenza modalità">
                <SelectOpts field="modalitaAllenamento" opts={[{v:"corpo",l:"Corpo libero"},{v:"pesi",l:"Palestra (pesi)"},{v:"entrambi",l:"Entrambi"},{v:"nessuna",l:"Nessuna preferenza"}]}/>
              </Field>
            </Row>
            <Row>
              <Field label="Parte della giornata preferita">
                <SelectOpts field="partGiornata" opts={[{v:"mattino-digiuno",l:"Mattino a digiuno"},{v:"mattino-colaz",l:"Mattino dopo colazione"},{v:"pomeriggio",l:"Pomeriggio"},{v:"sera",l:"Sera"}]}/>
              </Field>
            </Row>
            <Row>
              <Field label="Come ti senti dopo un allenamento intenso?">
                <SelectOpts field="dopoAllenamento" opts={[{v:"energico",l:"Energico e motivato"},{v:"stanco-soddisfatto",l:"Stanco ma soddisfatto"},{v:"esausto-ore",l:"Esausto per ore"},{v:"stremato-giorni",l:"Stremato per giorni"}]}/>
              </Field>
            </Row>
          </Card>

          {/* Section 7 - Hormonal */}
          <Card style={{marginBottom:"12px"}}>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",color:C.accent,marginBottom:"14px"}}>⚡ Sfera ormonale & benessere</div>
            <Row>
              <Field label="Livello di energia durante la giornata">
                <SelectOpts field="livelloEnergia" opts={[{v:"alto",l:"Alto e costante"},{v:"altalenante",l:"Altalenante"},{v:"basso-mattino",l:"Basso al mattino"},{v:"basso-pomeriggio",l:"Basso nel pomeriggio"}]}/>
              </Field>
            </Row>
            <Row cols={2}>
              <Field label="Sbalzi d'umore frequenti?">
                <SelectOpts field="sbalziUmore" opts={[{v:"no",l:"No"},{v:"raramente",l:"Raramente"},{v:"spesso",l:"Spesso"},{v:"sempre",l:"Quasi sempre"}]}/>
              </Field>
              <Field label="Brain fog / difficoltà concentrazione?">
                <SelectOpts field="brainFog" opts={[{v:"no",l:"No"},{v:"avolta",l:"A volte"},{v:"spesso",l:"Spesso"},{v:"sempre",l:"Quasi sempre"}]}/>
              </Field>
            </Row>
            <Row>
              <Field label="Porti a termine ciò che ti prefissi?">
                <SelectOpts field="portaTermine" opts={[{v:"si",l:"Sì"},{v:"non-sempre",l:"Non sempre"},{v:"procrastino",l:"Procrastino molto"}]}/>
              </Field>
            </Row>
          </Card>

          {/* Section 8 - Goals */}
          <Card style={{marginBottom:"12px"}}>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",color:C.accent,marginBottom:"14px"}}>🎯 Obiettivi</div>
            <Row>
              <Field label="Obiettivo principale">
                <SelectOpts field="obiettivoPrincipale" opts={[{v:"dimagrimento",l:"Dimagrimento"},{v:"massa",l:"Aumento massa muscolare"},{v:"recomp",l:"Body recomposition"},{v:"energia",l:"Migliorare energia e salute"}]}/>
              </Field>
            </Row>
            <Row>
              <Field label="Hai una data o evento di riferimento?"><input value={form.dataEventoRif||""} onChange={e=>setF("dataEventoRif",e.target.value)} placeholder="es. Estate 2025, matrimonio..."/></Field>
            </Row>
          </Card>

          <Btn onClick={save} style={{width:"100%",justifyContent:"center",padding:"14px",fontSize:"15px"}}>
            {saved?<><Check size={14}/>Salvato!</>:<><Check size={14}/>Salva sezione pre-call</>}
          </Btn>
        </div>}

        {phase==="incall"&&<div style={{display:"flex",flexDirection:"column",gap:"0px"}}>
          <Card style={{marginBottom:"12px"}}>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",color:C.accent,marginBottom:"14px"}}>🥗 Alimentazione (dettaglio)</div>
            <Row>
              <Field label="Primo e ultimo pasto (orari)"><input value={form.orariPasti||""} onChange={e=>setF("orariPasti",e.target.value)} placeholder="es. 8:00 / 20:30"/></Field>
            </Row>
            <Row>
              <Field label="Prepara i pasti o mangia fuori?"><textarea value={form.pastiCasa||""} onChange={e=>setF("pastiCasa",e.target.value)} placeholder="Chi cucina, quante volte fuori a settimana..." style={{minHeight:"60px",resize:"none",fontSize:"13px"}}/></Field>
            </Row>
            <Row>
              <Field label="Intolleranze, allergie o alimenti evitati"><textarea value={form.intolleranze||""} onChange={e=>setF("intolleranze",e.target.value)} placeholder="Specifica (o nessuna)" style={{minHeight:"52px",resize:"none",fontSize:"13px"}}/></Field>
            </Row>
            <Row>
              <Field label="Alimenti che ama e vuole mantenere"><textarea value={form.alimentiAmati||""} onChange={e=>setF("alimentiAmati",e.target.value)} placeholder="es. pasta, pizza, cioccolato..." style={{minHeight:"52px",resize:"none",fontSize:"13px"}}/></Field>
            </Row>
            <Row>
              <Field label="Diete/approcci passati — per quanto tempo?"><textarea value={form.dietePassate||""} onChange={e=>setF("dietePassate",e.target.value)} placeholder="Quali metodi, per quanto tempo" style={{minHeight:"60px",resize:"none",fontSize:"13px"}}/></Field>
            </Row>
            <Row>
              <Field label="Note alimentazione aggiuntive"><textarea value={form.noteAlimentazione||""} onChange={e=>setF("noteAlimentazione",e.target.value)} placeholder="Situazioni critiche, rituali, difficoltà..." style={{minHeight:"60px",resize:"none",fontSize:"13px"}}/></Field>
            </Row>
          </Card>

          <Card style={{marginBottom:"12px"}}>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",color:C.accent,marginBottom:"14px"}}>💪 Allenamento (dettaglio)</div>
            <Row>
              <Field label="Attrezzi/spazio disponibile"><textarea value={form.attrezzi||""} onChange={e=>setF("attrezzi",e.target.value)} placeholder="es. manubri, bilanciere, abbonamento palestra..." style={{minHeight:"52px",resize:"none",fontSize:"13px"}}/></Field>
            </Row>
            <Row>
              <Field label="Allenamento passato — tipo e durata"><textarea value={form.allenamentoPassato||""} onChange={e=>setF("allenamentoPassato",e.target.value)} placeholder="es. palestra 2 anni, crossfit 6 mesi..." style={{minHeight:"52px",resize:"none",fontSize:"13px"}}/></Field>
            </Row>
            <Row>
              <Field label="Esercizi/movimenti da evitare"><textarea value={form.eserciziEvitare||""} onChange={e=>setF("eserciziEvitare",e.target.value)} placeholder="Per infortuni o limitazioni specifiche" style={{minHeight:"52px",resize:"none",fontSize:"13px"}}/></Field>
            </Row>
            <Row>
              <Field label="Attività fisica fuori dall'allenamento"><textarea value={form.attivitaExtra||""} onChange={e=>setF("attivitaExtra",e.target.value)} placeholder="es. camminate, sport, lavoro fisico..." style={{minHeight:"52px",resize:"none",fontSize:"13px"}}/></Field>
            </Row>
            {bp.esamiSangue&&bp.esamiSangue!=="no"&&<Row>
              <Field label="Valori rilevanti dagli esami del sangue"><textarea value={form.valoriEsami||""} onChange={e=>setF("valoriEsami",e.target.value)} placeholder="testosterone, cortisolo, vitamina D, TSH..." style={{minHeight:"60px",resize:"none",fontSize:"13px"}}/></Field>
            </Row>}
            <Row>
              <Field label="Note sfera ormonale/benessere"><textarea value={form.noteOrmonali||""} onChange={e=>setF("noteOrmonali",e.target.value)} placeholder="Altro rilevante su umore, energia, ciclo..." style={{minHeight:"52px",resize:"none",fontSize:"13px"}}/></Field>
            </Row>
          </Card>

          <Card style={{marginBottom:"12px"}}>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",color:C.accent,marginBottom:"14px"}}>🎯 Motivazione & obiettivi</div>
            <Row>
              <Field label="Cosa cambierebbe concretamente nella tua vita?"><textarea value={form.obiettivoVita||""} onChange={e=>setF("obiettivoVita",e.target.value)} placeholder="Il driver motivazionale profondo" style={{minHeight:"70px",resize:"none",fontSize:"13px"}}/></Field>
            </Row>
            <Row>
              <Field label="Approcci già seguiti — per quanto tempo?"><textarea value={form.approccPassati||""} onChange={e=>setF("approccPassati",e.target.value)} style={{minHeight:"60px",resize:"none",fontSize:"13px"}}/></Field>
            </Row>
          </Card>

          <Card style={{marginBottom:"16px"}}>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",color:C.accent,marginBottom:"14px"}}>📝 Note libere (trainer)</div>
            <Row>
              <Field label="Note riservate — solo per te"><textarea value={form.noteTrained||""} onChange={e=>setF("noteTrained",e.target.value)} placeholder="Impressioni dalla call, carattere del cliente, priorità..." style={{minHeight:"80px",resize:"none",fontSize:"13px"}}/></Field>
            </Row>
          </Card>

          <Btn onClick={save} style={{width:"100%",justifyContent:"center",padding:"14px",fontSize:"15px"}}>
            {saved?<><Check size={14}/>Salvato!</>:<><Check size={14}/>Finalizza Blueprint</>}
          </Btn>
        </div>}
      </div>
    );
  }

  // ── VIEW mode ──
  const LABEL_MAP={
    sesso:{M:"Maschio",F:"Femmina"},
    tipoLavoro:{sed:"Sedentario",piedi:"In piedi/fisico",misto:"Misto",turni:"Turni/notturno"},
    livelloStress:{"1-3":"Basso","4-6":"Moderato","7-8":"Alto","9-10":"Molto alto"},
    qualitaSonno:{ottima:"Ottima",buona:"Buona",irregolare:"Irregolare",scarsa:"Scarsa"},
    tipoDieta:{eq:"Equilibrata",iperprot:"Iperproteica",lowcarb:"Low-carb/Keto",veg:"Vegana/Veg",nessun:"Senza regime"},
    esperienzaAllenamento:{nessuna:"Nessuna","<1":"< 1 anno","1-3":"1-3 anni",">3":"> 3 anni"},
    obiettivoPrincipale:{dimagrimento:"Dimagrimento",massa:"Aumento massa",recomp:"Body recomposition",energia:"Energia & salute"},
    livelloEnergia:{alto:"Alto e costante",altalenante:"Altalenante","basso-mattino":"Basso al mattino","basso-pomeriggio":"Basso pomeriggio"},
    dopoAllenamento:{energico:"Energico",  "stanco-soddisfatto":"Stanco ma ok","esausto-ore":"Esausto per ore","stremato-giorni":"Stremato giorni"},
  };
  const lbl=(field,val)=>LABEL_MAP[field]?.[val]||val||"—";
  const [openSection,setOpenSection]=useState(null);
  const toggleSection=(id)=>setOpenSection(s=>s===id?null:id);

  // ── Chip helper ──
  const Chip=({label,color=C.muted,bg})=>(
    <span style={{display:"inline-flex",alignItems:"center",padding:"3px 10px",borderRadius:"999px",fontSize:"11px",fontWeight:700,background:bg||color+"18",color,border:`1px solid ${color}33`,whiteSpace:"nowrap"}}>{label}</span>
  );

  // ── Collapsible section ──
  const CollSection=({id,title,children,alert=false})=>{
    const open=openSection===id;
    return(
      <div style={{borderRadius:"14px",overflow:"hidden",border:`1px solid ${alert?C.danger+"44":C.border}`,marginBottom:"8px"}}>
        <button onClick={()=>toggleSection(id)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px",background:alert?C.danger+"0a":C.card,border:"none",cursor:"pointer",textAlign:"left"}}>
          <span style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",color:alert?C.danger:C.text}}>{title}</span>
          <ChevronRight size={14} color={C.muted} style={{transform:open?"rotate(90deg)":"rotate(0deg)",transition:"transform .2s"}}/>
        </button>
        {open&&<div style={{padding:"14px 16px",background:C.surface,borderTop:`1px solid ${C.border}`}}>{children}</div>}
      </div>
    );
  };

  // ── Key-value grid inside sections ──
  const KVGrid=({items})=>(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
      {items.filter(i=>i.val&&i.val!=="—").map((item,i)=>(
        <div key={i} style={{background:C.card,borderRadius:"10px",padding:"9px 12px"}}>
          <div style={{fontSize:"9px",color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:"3px"}}>{item.label}</div>
          <div style={{fontSize:"13px",fontWeight:600,color:C.text,lineHeight:1.3}}>{item.val}</div>
        </div>
      ))}
    </div>
  );

  const hasRedFlags=bp.infortuni==="si"||bp.doloriCronici==="si"||bp.farmaci||bp.patologie;
  const stressHigh=bp.livelloStress==="7-8"||bp.livelloStress==="9-10";
  const sleepBad=bp.qualitaSonno==="scarsa"||bp.qualitaSonno==="irregolare";

  return(
    <div style={{display:"flex",flexDirection:"column",gap:"0px"}}>

      {/* ── STATUS HEADER ── */}
      <Card style={{marginBottom:"16px",background:`linear-gradient(135deg,${statusColor}14,${statusColor}05)`,border:`1px solid ${statusColor}44`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px"}}>
          <div>
            <div style={{fontFamily:FONT,fontWeight:900,fontSize:"16px"}}>📋 Blueprint</div>
            <div style={{fontSize:"11px",color:statusColor,fontWeight:600,marginTop:"3px"}}>{statusLabel}</div>
          </div>
          {bp.updatedAt&&<div style={{fontSize:"10px",color:C.muted,textAlign:"right"}}>Aggiornato<br/>{bp.updatedAt}</div>}
        </div>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
          <Btn size="sm" onClick={()=>{setForm(bp);setPhase("precall");}}>
            <Edit size={12}/>{PRECALL_COMPLETE?"Modifica pre-call":"Compila pre-call"}
          </Btn>
          <Btn size="sm" variant={INCALL_COMPLETE?"ghost":"primary"} onClick={()=>{setForm(bp);setPhase("incall");}}>
            <Edit size={12}/>{INCALL_COMPLETE?"Modifica in-call":"Completa in call"}
          </Btn>
        </div>
      </Card>

      {!PRECALL_COMPLETE&&!INCALL_COMPLETE&&(()=>{
        const FIELD_LABELS={
          sesso:"Sesso",dataNascita:"Data di nascita",professione:"Professione",
          obiettivoPrincipale:"Obiettivo principale",dataEventoRif:"Evento di riferimento",
          obiettivoPeso:"Obiettivo peso (kg)",massaGrassa:"Massa grassa (%)",
          circVita:"Vita (cm)",circFianchi:"Fianchi (cm)",circPetto:"Petto (cm)",circCoscia:"Coscia (cm)",circBraccio:"Braccio (cm)",
          patologie:"Patologie",farmaci:"Farmaci",integratoriAttuali:"Integratori",infortuni:"Infortuni pregressi",doloriCronici:"Dolori cronici",
          esamiSangue:"Esami del sangue",valoriEsami:"Valori esami",noteOrmonali:"Note ormonali",
          tipoLavoro:"Tipo di lavoro",orarioLavoro:"Orario di lavoro",livelloStress:"Stress",fumo:"Fumo",tempoLibero:"Tempo libero",
          oreSonno:"Ore di sonno",oraCoricarsi:"Ora di andare a letto",oraSveglia:"Ora di sveglia",qualitaSonno:"Qualità del sonno",
          svegliRiposato:"Si sveglia riposato",schermiSera:"Schermi la sera",integratoriSonno:"Integratori per dormire",luceSolare:"Luce solare",
          tipoDieta:"Tipo di dieta",numeroPasti:"Numero pasti",alcolici:"Alcolici",caffe:"Caffè",acqua:"Acqua (L/giorno)",digiunoIF:"Digiuno IF",
          orariPasti:"Orari pasti",pastiCasa:"Pasti in casa",intolleranze:"Intolleranze/Allergie",alimentiAmati:"Alimenti preferiti",
          dietePassate:"Diete passate",noteAlimentazione:"Note alimentazione",
          esperienzaAllenamento:"Esperienza allenamento",modalitaAllenamento:"Modalità",partGiornata:"Parte del giorno",dopoAllenamento:"Dopo allenamento",
          attrezzi:"Attrezzi disponibili",allenamentoPassato:"Allenamento passato",eserciziEvitare:"Esercizi da evitare",attivitaExtra:"Attività extra",
          obiettivoVita:"Motivazione profonda",approccPassati:"Approcci passati",alimentazioneTipica:"Alimentazione tipica",noteTrained:"Note riservate",
        };
        const filled=Object.entries(bp).filter(([k,v])=>v&&v!==false&&k!=="clientUpdatedAt"&&k!=="updatedAt");
        if(filled.length===0)return(
          <div style={{textAlign:"center",padding:"40px 20px",color:C.muted}}>
            <div style={{fontSize:"48px",marginBottom:"12px"}}>📋</div>
            <div style={{fontFamily:FONT,fontWeight:700,fontSize:"15px",marginBottom:"6px"}}>Blueprint non ancora compilato</div>
            <div style={{fontSize:"13px"}}>Il cliente compila la sezione pre-call prima della call.<br/>Tu completi la parte in-call durante la sessione.</div>
          </div>
        );
        return(
          <Card style={{border:`1px solid ${C.orange}44`,background:C.orange+"06"}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
              <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",color:C.orange}}>📋 Blueprint compilato dal cliente</div>
              <div style={{marginLeft:"auto",fontSize:"10px",color:C.muted}}>{filled.length} campi</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"0px"}}>{
              filled.map(([k,v])=>(
                <div key={k} style={{display:"flex",gap:"12px",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
                  <span style={{color:C.muted,fontSize:"11px",minWidth:"160px",flexShrink:0}}>{FIELD_LABELS[k]||k}</span>
                  <span style={{color:C.text,fontSize:"12px",fontWeight:600,flex:1}}>{lbl(k,String(v))}</span>
                </div>
              ))
            }</div>
            {bp.clientUpdatedAt&&<div style={{fontSize:"10px",color:C.muted,marginTop:"10px",textAlign:"right"}}>Compilato il {fmtLong(bp.clientUpdatedAt)}</div>}
          </Card>
        );
      })()}

      {PRECALL_COMPLETE&&<>

        {/* ── SCHEDA RAPIDA — sempre visibile ── */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"12px"}}>
          {bp.obiettivoPrincipale&&<div style={{background:C.accentDim,border:`1px solid ${C.accentMid}`,borderRadius:"14px",padding:"12px 14px"}}>
            <div style={{fontSize:"9px",color:C.accent,fontWeight:700,textTransform:"uppercase",marginBottom:"4px"}}>Obiettivo</div>
            <div style={{fontFamily:FONT,fontWeight:800,fontSize:"14px",color:C.accent}}>{lbl("obiettivoPrincipale",bp.obiettivoPrincipale)}</div>
            {bp.dataEventoRif&&<div style={{fontSize:"10px",color:C.muted,marginTop:"2px"}}>📅 {bp.dataEventoRif}</div>}
          </div>}
          {bp.esperienzaAllenamento&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"14px",padding:"12px 14px"}}>
            <div style={{fontSize:"9px",color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:"4px"}}>Esperienza</div>
            <div style={{fontFamily:FONT,fontWeight:800,fontSize:"14px"}}>{lbl("esperienzaAllenamento",bp.esperienzaAllenamento)}</div>
            {bp.dopoAllenamento&&<div style={{fontSize:"10px",color:C.muted,marginTop:"2px"}}>{lbl("dopoAllenamento",bp.dopoAllenamento)}</div>}
          </div>}
          {bp.livelloStress&&<div style={{background:stressHigh?C.danger+"0d":C.card,border:`1px solid ${stressHigh?C.danger+"44":C.border}`,borderRadius:"14px",padding:"12px 14px"}}>
            <div style={{fontSize:"9px",color:stressHigh?C.danger:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:"4px"}}>Stress</div>
            <div style={{fontFamily:FONT,fontWeight:800,fontSize:"14px",color:stressHigh?C.danger:C.text}}>{lbl("livelloStress",bp.livelloStress)}</div>
            {bp.tipoLavoro&&<div style={{fontSize:"10px",color:C.muted,marginTop:"2px"}}>{lbl("tipoLavoro",bp.tipoLavoro)}</div>}
          </div>}
          {bp.qualitaSonno&&<div style={{background:sleepBad?C.orange+"0d":C.card,border:`1px solid ${sleepBad?C.orange+"44":C.border}`,borderRadius:"14px",padding:"12px 14px"}}>
            <div style={{fontSize:"9px",color:sleepBad?C.orange:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:"4px"}}>Sonno</div>
            <div style={{fontFamily:FONT,fontWeight:800,fontSize:"14px",color:sleepBad?C.orange:C.text}}>{lbl("qualitaSonno",bp.qualitaSonno)}</div>
            {bp.oreSonno&&<div style={{fontSize:"10px",color:C.muted,marginTop:"2px"}}>{bp.oreSonno}h/notte{bp.oraCoricarsi?` · ${bp.oraCoricarsi}→${bp.oraSveglia}`:""}</div>}
          </div>}
        </div>

        {/* ── RED FLAGS — solo se presenti ── */}
        {hasRedFlags&&<Card style={{background:C.danger+"0a",border:`1px solid ${C.danger+"44"}`,marginBottom:"12px"}}>
          <div style={{fontFamily:FONT,fontWeight:700,fontSize:"12px",color:C.danger,marginBottom:"10px"}}>⚠ Attenzione</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
            {bp.infortuni==="si"&&<Chip label="🦴 Infortuni pregressi" color={C.danger}/>}
            {bp.doloriCronici==="si"&&<Chip label="🩹 Dolori cronici" color={C.danger}/>}
            {bp.farmaci&&<Chip label={`💊 ${bp.farmaci}`} color={C.orange}/>}
            {bp.patologie&&<Chip label={`🏥 ${bp.patologie}`} color={C.orange}/>}
            {bp.eserciziEvitare&&<Chip label={`🚫 ${bp.eserciziEvitare}`} color={C.orange}/>}
          </div>
        </Card>}

        {/* ── MOTIVAZIONE PROFONDA — se presente ── */}
        {bp.obiettivoVita&&<Card style={{background:C.accentDim,border:`1px solid ${C.accentMid}`,marginBottom:"12px"}}>
          <div style={{fontSize:"9px",color:C.accent,fontWeight:700,textTransform:"uppercase",marginBottom:"6px"}}>🎯 Motivazione profonda</div>
          <div style={{fontSize:"13px",fontStyle:"italic",lineHeight:1.6,color:C.text}}>"{bp.obiettivoVita}"</div>
        </Card>}

        {/* ── SEZIONI COLLASSABILI ── */}
        <CollSection id="alimentazione" title="🥗 Alimentazione">
          <KVGrid items={[
            {label:"Dieta attuale",val:lbl("tipoDieta",bp.tipoDieta)},
            {label:"N° pasti",val:bp.numeroPasti?bp.numeroPasti+" pasti/giorno":null},
            {label:"Acqua",val:bp.acqua?bp.acqua+" L/giorno":null},
            {label:"Alcolici",val:bp.alcolici},
            {label:"Caffè",val:bp.caffe},
            {label:"Digiuno IF",val:bp.digiunoIF==="provato"?"Ha già provato":bp.digiunoIF==="sentito"?"Ne ha sentito":bp.digiunoIF==="no"?"Non conosce":null},
          ]}/>
          {bp.intolleranze&&<div style={{marginTop:"10px",padding:"10px",background:C.card,borderRadius:"10px",fontSize:"12px"}}><span style={{color:C.muted,fontWeight:700}}>Intolleranze: </span>{bp.intolleranze}</div>}
          {bp.alimentiAmati&&<div style={{marginTop:"8px",padding:"10px",background:C.card,borderRadius:"10px",fontSize:"12px"}}><span style={{color:C.muted,fontWeight:700}}>Alimenti amati: </span>{bp.alimentiAmati}</div>}
          {bp.noteAlimentazione&&<div style={{marginTop:"8px",padding:"10px",background:C.card,borderRadius:"10px",fontSize:"12px",color:C.muted,fontStyle:"italic"}}>{bp.noteAlimentazione}</div>}
        </CollSection>

        <CollSection id="allenamento" title="💪 Allenamento">
          <KVGrid items={[
            {label:"Esperienza",val:lbl("esperienzaAllenamento",bp.esperienzaAllenamento)},
            {label:"Modalità",val:bp.modalitaAllenamento},
            {label:"Orario preferito",val:bp.partGiornata},
            {label:"Dopo allenamento",val:lbl("dopoAllenamento",bp.dopoAllenamento)},
          ]}/>
          {bp.attrezzi&&<div style={{marginTop:"10px",padding:"10px",background:C.card,borderRadius:"10px",fontSize:"12px"}}><span style={{color:C.muted,fontWeight:700}}>Attrezzi: </span>{bp.attrezzi}</div>}
          {bp.allenamentoPassato&&<div style={{marginTop:"8px",padding:"10px",background:C.card,borderRadius:"10px",fontSize:"12px"}}><span style={{color:C.muted,fontWeight:700}}>Passato: </span>{bp.allenamentoPassato}</div>}
          {bp.attivitaExtra&&<div style={{marginTop:"8px",padding:"10px",background:C.card,borderRadius:"10px",fontSize:"12px"}}><span style={{color:C.muted,fontWeight:700}}>Attività extra: </span>{bp.attivitaExtra}</div>}
        </CollSection>

        <CollSection id="salute" title="🏥 Salute & parametri" alert={hasRedFlags}>
          <KVGrid items={[
            {label:"Patologie",val:bp.patologie||"Nessuna"},
            {label:"Farmaci",val:bp.farmaci||"Nessuno"},
            {label:"Integratori",val:bp.integratoriAttuali||"Nessuno"},
            {label:"Infortuni",val:bp.infortuni==="si"?"Sì ⚠":bp.infortuni==="no"?"No":null},
            {label:"Dolori cronici",val:bp.doloriCronici==="si"?"Sì ⚠":bp.doloriCronici==="no"?"No":null},
            {label:"Esami sangue",val:bp.esamiSangue==="6mesi"?"Sì (<6 mesi)":bp.esamiSangue==="oltre"?"Sì (>6 mesi)":bp.esamiSangue==="no"?"No":null},
          ]}/>
          {bp.valoriEsami&&<div style={{marginTop:"10px",padding:"10px",background:C.card,borderRadius:"10px",fontSize:"12px"}}><span style={{color:C.muted,fontWeight:700}}>Valori esami: </span>{bp.valoriEsami}</div>}
          {bp.noteOrmonali&&<div style={{marginTop:"8px",padding:"10px",background:C.card,borderRadius:"10px",fontSize:"12px",fontStyle:"italic",color:C.muted}}>{bp.noteOrmonali}</div>}
        </CollSection>

        <CollSection id="profilo" title="👤 Profilo personale">
          <KVGrid items={[
            {label:"Sesso",val:lbl("sesso",bp.sesso)},
            {label:"Data nascita",val:bp.dataNascita},
            {label:"Professione",val:bp.professione},
            {label:"Obiettivo peso",val:bp.obiettivoPeso?bp.obiettivoPeso+" kg":null},
            {label:"% Massa grassa",val:bp.massaGrassa?bp.massaGrassa+"%":null},
            {label:"Fumo",val:bp.fumo==="no"?"No":bp.fumo==="smesso"?"Ha smesso":bp.fumo==="si"?"Sì":null},
            {label:"Energia giornata",val:lbl("livelloEnergia",bp.livelloEnergia)},
            {label:"Brain fog",val:bp.brainFog},
            {label:"Sbalzi umore",val:bp.sbalziUmore},
          ]}/>
        </CollSection>

        {(bp.circVita||bp.circFianchi||bp.circPetto||bp.circCoscia||bp.circBraccio)&&
        <CollSection id="misure" title="📐 Misurazioni iniziali">
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px"}}>
            {[["Vita",bp.circVita],["Fianchi",bp.circFianchi],["Petto",bp.circPetto],["Coscia",bp.circCoscia],["Braccio",bp.circBraccio]].filter(([,v])=>v).map(([label,val])=>(
              <div key={label} style={{background:C.card,borderRadius:"10px",padding:"10px",textAlign:"center"}}>
                <div style={{fontSize:"9px",color:C.muted,marginBottom:"3px"}}>{label}</div>
                <div style={{fontFamily:FONT,fontWeight:800,fontSize:"16px"}}>{val}<span style={{fontSize:"10px",color:C.muted}}> cm</span></div>
              </div>
            ))}
          </div>
        </CollSection>}

        {bp.noteTrained&&<Card style={{background:C.surface,marginTop:"4px"}}>
          <div style={{fontSize:"9px",color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:"6px"}}>📝 Note riservate</div>
          <div style={{fontSize:"13px",lineHeight:1.6,color:C.text}}>{bp.noteTrained}</div>
        </Card>}
      </>}
    </div>
  );
}



function GoalsTab({client,onUpdate,readOnly}){
  const isMobile=useIsMobile();
  const [form,setForm]=useState({...client.targets});
  const [saved,setSaved]=useState(false);
  function save(){onUpdate(client.id,c=>({...c,targets:form}));setSaved(true);setTimeout(()=>setSaved(false),2000);}
  return(
    <div>
      <Card>
        <div style={{fontFamily:FONT,fontWeight:700,fontSize:"15px",marginBottom:"16px"}}>🎯 Obiettivi</div>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:"12px"}}>
          {[{key:"weight",label:"Peso target (kg)"},{key:"kcal",label:"Calorie target"},{key:"protein",label:"Proteine (g)"},{key:"carbs",label:"Carboidrati (g)"},{key:"fats",label:"Grassi (g)"},{key:"workoutsPerWeek",label:"Workout/settimana"}].map(f=>(
            <div key={f.key}><div style={{color:C.muted,fontSize:"10px",fontWeight:700,textTransform:"uppercase",marginBottom:"5px"}}>{f.label}</div>
            <input type="number" value={form[f.key]||""} onChange={e=>setForm({...form,[f.key]:e.target.value})} disabled={readOnly} style={{opacity:readOnly?0.6:1}}/></div>
          ))}
        </div>

        {!readOnly&&<div style={{marginTop:"14px"}}><Btn onClick={save}>{saved?<><Check size={13}/>Salvato!</>:<><Check size={13}/>Salva obiettivi</>}</Btn></div>}
      </Card>
    </div>
  );
}

function CheckinsTab({client}){
  const sorted=[...(client.checkins||[])].sort((a,b)=>a.date.localeCompare(b.date));
  const checkins=[...sorted].reverse();
  const METRICS=[
    {k:"energy",label:"Energia",emoji:"⚡",color:C.orange},
    {k:"mood",label:"Umore",emoji:"😊",color:C.blue},
    {k:"sleep",label:"Sonno",emoji:"🌙",color:C.purple},
    {k:"motivation",label:"Motivazione",emoji:"💪",color:C.accent},
    {k:"diet",label:"Dieta",emoji:"🥗",color:C.success},
  ];
  const avgOf=key=>sorted.length?Math.round(sorted.slice(-4).reduce((s,c)=>s+(c[key]||0),0)/Math.min(4,sorted.length)*10)/10:null;
  const chartData=sorted.slice(-8).map(c=>({
    date:c.date.slice(5),
    energy:c.energy||null,
    mood:c.mood||null,
    sleep:c.sleep||null,
    motivation:c.motivation||null,
    diet:c.diet||null,
  }));

  return(
    <div>
      <div style={{fontFamily:FONT,fontWeight:700,fontSize:"15px",marginBottom:"16px"}}>📋 Check-in settimanali ({checkins.length})</div>

      {checkins.length===0&&<div style={{textAlign:"center",padding:"60px",color:C.muted}}>
        <div style={{fontSize:"36px",marginBottom:"8px"}}>📋</div>
        <div style={{fontWeight:700,marginBottom:"4px"}}>Nessun check-in ancora</div>
        <div style={{fontSize:"12px"}}>Appariranno ogni lunedì quando il cliente compila il suo aggiornamento settimanale.</div>
      </div>}

      {/* ── TREND CHART ── */}
      {sorted.length>=2&&<Card style={{marginBottom:"16px"}}>
        <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",marginBottom:"14px"}}>📈 Trend ultime 8 settimane</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
            <XAxis dataKey="date" tick={{fill:C.muted,fontSize:9}} tickLine={false}/>
            <YAxis domain={[0,5]} ticks={[1,2,3,4,5]} tick={{fill:C.muted,fontSize:9}} tickLine={false} axisLine={false}/>
            <Tooltip content={({active,payload,label})=>{
              if(!active||!payload?.length)return null;
              return(
                <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"10px",padding:"10px 12px",fontSize:"12px"}}>
                  <div style={{color:C.muted,marginBottom:"6px",fontWeight:700}}>{label}</div>
                  {payload.map((p,i)=><div key={i} style={{color:p.color,fontWeight:600}}>{p.name}: {p.value}/5</div>)}
                </div>
              );
            }}/>
            {METRICS.map(m=>(
              <Area key={m.k} type="monotone" dataKey={m.k} name={m.label} stroke={m.color} fill={m.color+"08"} strokeWidth={2} dot={false} connectNulls/>
            ))}
          </AreaChart>
        </ResponsiveContainer>
        <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginTop:"10px"}}>
          {METRICS.map(m=><span key={m.k} style={{fontSize:"11px",color:m.color,fontWeight:700}}>{m.emoji} {m.label}</span>)}
        </div>
      </Card>}

      {/* ── MEDIE ULTIME 4 SETT ── */}
      {sorted.length>=2&&<Card style={{marginBottom:"16px"}}>
        <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",marginBottom:"14px"}}>Media ultime 4 settimane</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
          {METRICS.map(m=>{
            const avg=avgOf(m.k);if(!avg)return null;
            const col=avg>=4?C.success:avg>=2.5?C.orange:C.danger;
            return(
              <div key={m.k} style={{background:C.surface,borderRadius:"10px",padding:"10px 12px"}}>
                <div style={{fontSize:"10px",color:C.muted,marginBottom:"4px"}}>{m.emoji} {m.label}</div>
                <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                  <div style={{flex:1,background:C.bg,borderRadius:"999px",height:"5px",overflow:"hidden"}}>
                    <div style={{background:col,width:`${avg/5*100}%`,height:"100%",borderRadius:"999px"}}/>
                  </div>
                  <span style={{fontFamily:FONT,fontWeight:800,fontSize:"13px",color:col}}>{avg}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>}

      {/* ── LISTA CHECK-IN ── */}
      <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
        {checkins.map((c,i)=>{
          const avg=METRICS.reduce((s,m)=>s+(c[m.k]||0),0)/METRICS.filter(m=>c[m.k]).length;
          const col=avg>=4?C.success:avg>=2.5?C.orange:C.danger;
          const vibe=avg>=4?"Settimana ottima 🔥":avg>=2.5?"Nella norma 👍":"Settimana difficile 😓";
          return(
            <Card key={i}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
                <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px"}}>{fmtLong(c.date)}</div>
                <Tag label={vibe} color={col}/>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:c.note||c.pain?"10px":0}}>
                {METRICS.map(m=>c[m.k]?<div key={m.k} style={{background:m.color+"18",border:`1px solid ${m.color}33`,borderRadius:"8px",padding:"3px 8px",fontSize:"11px",fontWeight:700,color:m.color}}>{m.emoji} {c[m.k]}/5</div>:null)}
              </div>
              {c.pain&&<div style={{background:C.danger+"0d",border:`1px solid ${C.danger}33`,borderRadius:"8px",padding:"8px 12px",fontSize:"12px",color:C.danger,marginBottom:"6px"}}>🩹 {c.pain}</div>}
              {c.note&&<div style={{background:C.bg,borderRadius:"8px",padding:"8px 12px",fontSize:"12px",color:C.muted,fontStyle:"italic"}}>"{c.note}"</div>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function MessagesTab({client,onUpdate}){
  const waMsg=`Ciao ${client.name.split(" ")[0]}! 👋`;
  const [text,setText]=useState("");
  const [from,setFrom]=useState("trainer");
  const endRef=useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[client.messages]);
  function send(){if(!text.trim())return;const msg={date:todayStr(),from,text:text.trim()};onUpdate(client.id,c=>({...c,messages:[...c.messages,msg]}));setText("");}
  return(
    <div>
      {/* WhatsApp CTA */}
      <Card style={{marginBottom:"16px",background:`linear-gradient(135deg,#25D36618,#25D36605)`,border:`1px solid #25D36633`}}>
        <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",marginBottom:"10px"}}>
          Contatta {client.name.split(" ")[0]} su WhatsApp
        </div>
        <a href={`https://wa.me/${SIMONE_WA}?text=${encodeURIComponent(waMsg)}`} target="_blank" rel="noreferrer"
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",background:"#25D366",borderRadius:"10px",padding:"12px",textDecoration:"none",color:"#000",fontWeight:700,fontSize:"14px"}}>
          <span style={{fontSize:"18px"}}>💬</span> Apri WhatsApp
        </a>
        <div style={{color:C.muted,fontSize:"10px",marginTop:"6px",textAlign:"center"}}>Apre direttamente la chat con {client.name.split(" ")[0]}</div>
      </Card>
      {/* Internal notes */}
      <div style={{fontFamily:FONT,fontWeight:700,fontSize:"13px",marginBottom:"10px"}}>📝 Note interne</div>
      <div style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"14px",maxHeight:"320px",overflowY:"auto",padding:"2px"}}>
        {client.messages.length===0&&<div style={{textAlign:"center",padding:"32px",color:C.muted,fontSize:"12px"}}>Nessuna nota ancora</div>}
        {client.messages.map((m,i)=>(
          <div key={i} style={{display:"flex",flexDirection:m.from==="trainer"?"row-reverse":"row",gap:"8px"}}>
            <div style={{background:m.from==="trainer"?C.accentDim:C.card,border:`1px solid ${m.from==="trainer"?C.accentMid:C.border}`,borderRadius:"14px",padding:"10px 14px",maxWidth:"80%"}}>
              <div style={{fontSize:"9px",color:C.muted,marginBottom:"4px",fontWeight:600}}>{m.from==="trainer"?"🎓 Trainer":"👤 Cliente"} · {fmtLong(m.date)}</div>
              <div style={{fontSize:"13px",lineHeight:1.5}}>{m.text}</div>
            </div>
          </div>
        ))}
        <div ref={endRef}/>
      </div>
      <Card>
        <div style={{display:"flex",gap:"6px",marginBottom:"8px"}}>
          {[{v:"trainer",l:"✍️ Nota trainer"},{v:"client",l:"👤 Nota cliente"}].map(o=>(
            <button key={o.v} onClick={()=>setFrom(o.v)} style={{fontSize:"11px",padding:"5px 10px",borderRadius:"8px",border:`1px solid ${from===o.v?C.accent:C.border}`,background:from===o.v?C.accentDim:"transparent",color:from===o.v?C.accent:C.muted,cursor:"pointer"}}>{o.l}</button>
          ))}
        </div>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Aggiungi nota…" style={{resize:"vertical",minHeight:"52px",marginBottom:"8px"}} onKeyDown={e=>{if(e.key==="Enter"&&e.metaKey)send();}}/>
        <Btn onClick={send} disabled={!text.trim()}><MessageSquare size={13}/>Aggiungi nota</Btn>
      </Card>
    </div>
  );
}

function SettingsTab({client,onUpdate}){
  const isMobile=useIsMobile();
  const [form,setForm]=useState({name:client.name,age:client.age,height:client.height,goal:client.goal,pin:client.pin||"",mealPlan:client.mealPlan||"4pasti"});
  const [saved,setSaved]=useState(false);
  function save(){if(!form.name.trim())return;onUpdate(client.id,c=>({...c,...form}));setSaved(true);setTimeout(()=>setSaved(false),2000);}

  const PLAN_OPTIONS=[
    {id:"3pasti",label:"3 pasti",sub:"Colazione · Pranzo · Cena",icon:"🍽"},
    {id:"4pasti",label:"4 pasti",sub:"Colazione · Pranzo · Spuntino · Cena",icon:"🍽🍎"},
    {id:"5pasti",label:"5 pasti",sub:"Colazione · Spuntino · Pranzo · Spuntino · Cena",icon:"🍽🍎🍌"},
    {id:"168",label:"Digiuno 16/8",sub:"3 pasti in 8 ore · con orario",icon:"⏱"},
  ];

  return(
    <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>

      {/* MEAL PLAN CARD */}
      <Card style={{border:`1px solid ${C.accentMid}`}}>
        <div style={{fontFamily:FONT,fontWeight:700,fontSize:"14px",marginBottom:"4px"}}>🍽 Piano pasti</div>
        <div style={{color:C.muted,fontSize:"12px",marginBottom:"14px"}}>Imposta una volta sola — determina i campi nel diario quotidiano</div>
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          {PLAN_OPTIONS.map(p=>(
            <div key={p.id} onClick={()=>setForm(f=>({...f,mealPlan:p.id}))} style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 14px",borderRadius:"12px",border:`2px solid ${form.mealPlan===p.id?C.accent:C.border}`,background:form.mealPlan===p.id?C.accentDim:"transparent",cursor:"pointer",transition:"all .15s"}}>
              <span style={{fontSize:"20px",width:"28px",textAlign:"center"}}>{p.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:"13px",color:form.mealPlan===p.id?C.accent:C.text}}>{p.label}</div>
                <div style={{fontSize:"11px",color:C.muted,marginTop:"2px"}}>{p.sub}</div>
              </div>
              {form.mealPlan===p.id&&<Check size={16} color={C.accent}/>}
            </div>
          ))}
        </div>
      </Card>

      {/* CLIENT DATA CARD */}
      <Card>
        <div style={{fontFamily:FONT,fontWeight:700,fontSize:"14px",marginBottom:"16px"}}>⚙️ Dati cliente</div>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
          <div style={{gridColumn:"1 / -1"}}><div style={{color:C.muted,fontSize:"10px",fontWeight:700,textTransform:"uppercase",marginBottom:"5px"}}>Nome completo</div><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
          {[{key:"age",label:"Età"},{key:"height",label:"Altezza (cm)"}].map(f=><div key={f.key}><div style={{color:C.muted,fontSize:"10px",fontWeight:700,textTransform:"uppercase",marginBottom:"5px"}}>{f.label}</div><input type="number" value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})}/></div>)}
          <div style={{gridColumn:"1 / -1"}}><div style={{color:C.muted,fontSize:"10px",fontWeight:700,textTransform:"uppercase",marginBottom:"5px"}}>Obiettivo</div><input value={form.goal} onChange={e=>setForm({...form,goal:e.target.value})}/></div>

          <div style={{gridColumn:"1 / -1"}}><div style={{color:C.muted,fontSize:"10px",fontWeight:700,textTransform:"uppercase",marginBottom:"5px"}}>PIN accesso cliente (4 cifre)</div><input inputMode="numeric" maxLength={4} value={form.pin} onChange={e=>setForm({...form,pin:e.target.value.replace(/\D/g,"").slice(0,4)})}/></div>
        </div>
        <Btn onClick={save}>{saved?<><Check size={13}/>Salvato!</>:<><Check size={13}/>Salva modifiche</>}</Btn>
      </Card>
    </div>
  );
}
