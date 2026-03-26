// @ts-nocheck
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

const SHEET_ID = "1ti5t_Hj19NpBijp2GfJIfdEyAUNF6FynoXT0Lkkq31k";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=tiktok_ads`;

const C = {
  fr: "#E8C547", es: "#E85D47", it: "#47B5E8",
  accent: "#E8C547", green: "#4ADE80", red: "#F87171", purple: "#A78BFA", orange: "#FB923C",
  bg: "#0A0A0B", card: "#111113", border: "#1E1E22",
  text: "#F0EDE8", muted: "#6B6870", sidebar: "#0D0D0F",
};

// ── FETCH GOOGLE SHEETS ───────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split("\n").slice(1);
  return lines
    .map(line => {
      const cols = line.split(",").map(c => c.replace(/^"|"$/g, "").trim());
      return {
        date: cols[0] || "",
        pays: cols[1] || "",
        depense: parseFloat(cols[2]) || 0,
        ca: parseFloat(cols[3]) || 0,
        commandes: parseInt(cols[4]) || 0,
        cpr: parseFloat(cols[5]) || 0,
      };
    })
    .filter(r => r.pays);
}

function useSheetData() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  async function fetch_() {
    try {
      const res = await fetch(CSV_URL);
      const text = await res.text();
      setRows(parseCSV(text));
      setLastUpdate(new Date().toLocaleTimeString("fr-FR"));
    } catch (e) {
      console.error("Erreur Google Sheets:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch_();
    const interval = setInterval(fetch_, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  function getStatsPays(pays) {
    const r = rows.filter(r => r.pays.trim().toLowerCase() === pays.toLowerCase());
    const depense = r.reduce((s, x) => s + x.depense, 0);
    const commandes = r.reduce((s, x) => s + x.commandes, 0);
    const cpr = commandes > 0 ? depense / commandes : 0;
    return { depense, commandes, cpr };
  }

  return { rows, loading, lastUpdate, refresh: fetch_, getStatsPays };
}

// Nom des campagnes TikTok → code pays
const CAMP_MAP = {
  "SIO": "FR",
  "italie": "IT",
  "spain": "ES",
  "belgium": "BE",
  "uk": "UK",
  "bel/sui/lux": "BSL",
};

const DATA = {
  overview: { revenueMois: 28400, objectif: 100000, depenses: 9200, margeNette: 19200, margePct: 67.6, ventesTotales: 312, prixMoyen: 91, croissance: 18.4 },
  revenuePoles: [
    { pole: "Boutiques Shopify", montant: 11628, icon: "🏪", couleur: C.accent,  depense: 1260, desc: "Vente stores turnkey 37€" },
    { pole: "Bump Agents 57€",   montant: 8000,  icon: "⚡", couleur: C.orange,  depense: 0,    desc: "Pack Agents Privés Europe" },
    { pole: "Fast Track 197€",   montant: 0,     icon: "🚀", couleur: C.purple,  depense: 0,    desc: "OTO1 — À lancer" },
    { pole: "Pack Pubs",         montant: 5112,  icon: "🎬", couleur: C.it,      depense: 840,  desc: "69€ / 44€ downsell" },
    { pole: "Affiliation Shopify",montant: 1844, icon: "🤝", couleur: C.green,   depense: 0,    desc: "Commissions partenaire Shopify" },
  ],
  pays: [
    { code: "FR", nom: "France",   flag: "🇫🇷", campName: "SIO",      color: C.fr, revenue: 18200, depenses: 5100, ventes: 198, leads: 1240, tauxConversion: 15.97, cac: 25.76, roas: 3.57, adsSpend: 700,  tauxClose: 42, statut: "actif",     objectif: 30000,
      funnelData: [{ etape:"Vue Ad",valeur:48000},{etape:"Clic",valeur:9600},{etape:"Landing",valeur:4800},{etape:"Optin",valeur:1240},{etape:"Vente",valeur:198}] },
    { code: "ES", nom: "Espagne",  flag: "🇪🇸", campName: "spain",    color: C.es, revenue: 6800,  depenses: 2800, ventes: 74,  leads: 580,  tauxConversion: 12.76, cac: 37.84, roas: 3.31, adsSpend: 200,  tauxClose: 31, statut: "actif",     objectif: 15000,
      funnelData: [{ etape:"Vue Ad",valeur:22000},{etape:"Clic",valeur:3800},{etape:"Landing",valeur:1700},{etape:"Optin",valeur:580},{etape:"Vente",valeur:74}] },
    { code: "IT", nom: "Italie",   flag: "🇮🇹", campName: "italie",   color: C.it, revenue: 3400,  depenses: 1300, ventes: 40,  leads: 290,  tauxConversion: 13.79, cac: 32.5,  roas: 4.37, adsSpend: 300,  tauxClose: 28, statut: "actif",     objectif: 20000,
      funnelData: [{ etape:"Vue Ad",valeur:11000},{etape:"Clic",valeur:1900},{etape:"Landing",valeur:850},{etape:"Optin",valeur:290},{etape:"Vente",valeur:40}] },
    { code: "UK", nom: "UK",       flag: "🇬🇧", campName: "uk",       color: "#60A5FA", revenue: 0, depenses: 0, ventes: 0, leads: 0, tauxConversion: 0, cac: 0, roas: 0, adsSpend: 50, tauxClose: 0, statut: "lancement", objectif: 10000,
      funnelData: [{ etape:"Vue Ad",valeur:0},{etape:"Clic",valeur:0},{etape:"Landing",valeur:0},{etape:"Optin",valeur:0},{etape:"Vente",valeur:0}] },
    { code: "BE", nom: "Belgique", flag: "🇧🇪", campName: "belgium",  color: C.purple, revenue: 0, depenses: 0, ventes: 0, leads: 0, tauxConversion: 0, cac: 0, roas: 0, adsSpend: 60, tauxClose: 0, statut: "lancement", objectif: 5000,
      funnelData: [{ etape:"Vue Ad",valeur:0},{etape:"Clic",valeur:0},{etape:"Landing",valeur:0},{etape:"Optin",valeur:0},{etape:"Vente",valeur:0}] },
  ],
  tendances: [
    { mois:"Oct", fr:12400, es:0,    it:0    },
    { mois:"Nov", fr:14800, es:1200, it:0    },
    { mois:"Déc", fr:16200, es:2800, it:0    },
    { mois:"Jan", fr:15900, es:4100, it:800  },
    { mois:"Fév", fr:17400, es:5200, it:1900 },
    { mois:"Mar", fr:18200, es:6800, it:3400 },
  ],
  depenses: [
    { poste:"TikTok Ads FR",       montant:700,  roi:4.79, icon:"📱" },
    { poste:"TikTok Ads ES",       montant:200,  roi:3.31, icon:"📱" },
    { poste:"TikTok Ads IT",       montant:300,  roi:4.37, icon:"📱" },
    { poste:"TikTok Ads UK",       montant:50,   roi:0,    icon:"📱" },
    { poste:"Créateurs UGC",       montant:1200, roi:5.20, icon:"🎬" },
    { poste:"Abonnements SaaS",    montant:480,  roi:59.2, icon:"⚙️" },
    { poste:"Systeme.io",          montant:97,   roi:62.1, icon:"🔧" },
    { poste:"Make.com",            montant:29,   roi:88.0, icon:"🔧" },
    { poste:"Shopify (stores)",    montant:130,  roi:89.4, icon:"🏪" },
  ],
  alertes: [
    { type:"success", msg:"IT ROAS 4.37x — passer à 400€/jour maintenant", pays:"IT" },
    { type:"warning", msg:"Fast Track 197€ pas encore live — +13k€/mois manqués", pays:"ALL" },
    { type:"info",    msg:"UK lancé ce matin — ne pas toucher avant jeudi J+3", pays:"UK" },
    { type:"warning", msg:"DE pas encore lancé — commander Billo.app maintenant", pays:"DE" },
  ],
};

const INIT_TODOS = {
  clement:  [
    { id:1, text:"IT passer à 400€/jour (ROAS 4.37x ✅)", done:false, priority:"high" },
    { id:2, text:"DE commander Billo.app maintenant", done:false, priority:"high" },
    { id:3, text:"Rédiger page de vente Fast Track 197€", done:false, priority:"high" },
    { id:4, text:"FR + IT uploader nouvelles créas en test", done:false, priority:"med" },
    { id:5, text:"Email collecte témoignages toute la base", done:false, priority:"med" },
    { id:6, text:"ES scale à 350€/jour si ROAS > 3x", done:false, priority:"med" },
    { id:7, text:"UK décision scale jeudi J+3", done:false, priority:"low" },
  ],
  azzedine: [
    { id:1, text:"Downsell OTO1 → passer à 47€", done:false, priority:"high" },
    { id:2, text:"Intégrer Fast Track 197€ Systeme.io", done:false, priority:"high" },
    { id:3, text:"Créer 4 segments email + règles exclusion", done:false, priority:"high" },
    { id:4, text:"Funnel DE finir + test achat + pixel", done:false, priority:"high" },
    { id:5, text:"War Room connexion Google Sheets live", done:true,  priority:"high" },
    { id:6, text:"Funnels CA + AU dupliquer UK", done:false, priority:"med" },
    { id:7, text:"TY page upsell niche +17€ conditionnel JS", done:false, priority:"med" },
    { id:8, text:"Setup Make.com → Telegram invitation auto", done:false, priority:"low" },
  ],
  equipe:   [
    { id:1, text:"Philippins : brief boutique premium bump 57€", done:false, priority:"high" },
    { id:2, text:"Monteur : vidéos UK montées + 3 hooks", done:false, priority:"high" },
    { id:3, text:"VA bilingue ES+IT : recruter cette semaine", done:false, priority:"med" },
    { id:4, text:"UGC DE : livraison Billo.app 48-72h", done:false, priority:"med" },
    { id:5, text:"Philippins : liste 40 agents Europe WhatsApp", done:false, priority:"high" },
  ],
};

const fmt  = v => `${Number(v).toLocaleString("fr-FR")}€`;
const fmtP = v => `${Number(v).toFixed(1)}%`;

function CountUp({ end, suffix="" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let s=0; const step=end/80;
    const t=setInterval(()=>{ s+=step; if(s>=end){setVal(end);clearInterval(t);}else setVal(Math.floor(s)); },16);
    return ()=>clearInterval(t);
  },[end]);
  return <span>{val.toLocaleString("fr-FR")}{suffix}</span>;
}

function KPI({ label, value, sub, color, suffix="" }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"18px 20px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, width:3, height:"100%", background:color||C.accent }} />
      <div style={{ color:C.muted, fontSize:10, fontFamily:"DM Mono,monospace", letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>{label}</div>
      <div style={{ color:C.text, fontSize:26, fontWeight:700, fontFamily:"Syne,sans-serif", lineHeight:1 }}>
        {typeof value==="number" ? <CountUp end={value} suffix={suffix}/> : value}
      </div>
      {sub && <div style={{ color:C.muted, fontSize:11, marginTop:5, fontFamily:"DM Mono,monospace" }}>{sub}</div>}
    </div>
  );
}

function Card({ title, children, style={} }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:22, ...style }}>
      {title && <div style={{ color:C.muted, fontSize:10, fontFamily:"DM Mono,monospace", letterSpacing:2, textTransform:"uppercase", marginBottom:18 }}>{title}</div>}
      {children}
    </div>
  );
}

function FunnelBar({ data:fd, color }) {
  const max=fd[0]?.valeur||1;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {fd.map((d,i)=>{
        const pct=(d.valeur/max)*100;
        const conv=i>0?((d.valeur/fd[i-1].valeur)*100).toFixed(1):null;
        return (
          <div key={d.etape}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
              <span style={{ color:C.muted, fontSize:10, fontFamily:"DM Mono,monospace", textTransform:"uppercase", letterSpacing:1 }}>{d.etape}</span>
              <span style={{ color:C.text, fontSize:11, fontFamily:"DM Mono,monospace" }}>
                {d.valeur.toLocaleString("fr-FR")}
                {conv && <span style={{ color:C.muted, marginLeft:8 }}>↳ {conv}%</span>}
              </span>
            </div>
            <div style={{ height:5, background:C.border, borderRadius:3 }}>
              <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:3, transition:"width 1s" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── LIVE ADS PANEL ────────────────────────────────────────────────────────────
function LiveAdsPanel({ sheetData }) {
  const { rows, loading, lastUpdate, refresh, getStatsPays } = sheetData;

  const campagnes = ["SIO","italie","spain","belgium","uk","bel/sui/lux"];
  const totalDepense = campagnes.reduce((s,c) => s + getStatsPays(c).depense, 0);
  const totalCommandes = campagnes.reduce((s,c) => s + getStatsPays(c).commandes, 0);

  return (
    <Card title={`📡 TikTok Ads Live — ${lastUpdate ? `mis à jour ${lastUpdate}` : "chargement..."}`} style={{ marginBottom:20 }}>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12 }}>
        <button onClick={refresh} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"5px 12px", color:C.muted, cursor:"pointer", fontSize:11, fontFamily:"DM Mono,monospace" }}>
          🔄 Actualiser
        </button>
      </div>
      {loading ? (
        <div style={{ color:C.muted, fontSize:12, fontFamily:"DM Mono,monospace", textAlign:"center", padding:20 }}>Chargement données TikTok...</div>
      ) : (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
            <div style={{ background:C.bg, borderRadius:8, padding:"12px", textAlign:"center", border:`1px solid ${C.border}` }}>
              <div style={{ color:C.red, fontSize:20, fontWeight:700, fontFamily:"Syne,sans-serif" }}>{totalDepense.toFixed(0)}€</div>
              <div style={{ color:C.muted, fontSize:10, fontFamily:"DM Mono,monospace", marginTop:3 }}>DÉPENSE TOTALE AUJOURD'HUI</div>
            </div>
            <div style={{ background:C.bg, borderRadius:8, padding:"12px", textAlign:"center", border:`1px solid ${C.border}` }}>
              <div style={{ color:C.green, fontSize:20, fontWeight:700, fontFamily:"Syne,sans-serif" }}>{totalCommandes}</div>
              <div style={{ color:C.muted, fontSize:10, fontFamily:"DM Mono,monospace", marginTop:3 }}>VENTES AUJOURD'HUI</div>
            </div>
            <div style={{ background:C.bg, borderRadius:8, padding:"12px", textAlign:"center", border:`1px solid ${C.border}` }}>
              <div style={{ color:C.accent, fontSize:20, fontWeight:700, fontFamily:"Syne,sans-serif" }}>
                {totalCommandes > 0 ? (totalDepense / totalCommandes).toFixed(2) : "—"}€
              </div>
              <div style={{ color:C.muted, fontSize:10, fontFamily:"DM Mono,monospace", marginTop:3 }}>CPR MOYEN</div>
            </div>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr>
                {["Campagne","Pays","Dépense","Ventes","CPR"].map(h=>(
                  <th key={h} style={{ color:C.muted, fontSize:10, fontFamily:"DM Mono,monospace", textAlign:"left", padding:"6px 10px", borderBottom:`1px solid ${C.border}`, letterSpacing:1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campagnes.map(camp => {
                const s = getStatsPays(camp);
                const pays = DATA.pays.find(p => p.campName === camp);
                const cprOk = s.cpr > 0 && s.cpr < 50;
                return (
                  <tr key={camp} style={{ borderBottom:`1px solid ${C.border}22` }}>
                    <td style={{ padding:"8px 10px", color:C.text, fontFamily:"DM Mono,monospace" }}>{camp}</td>
                    <td style={{ padding:"8px 10px" }}>{pays ? `${pays.flag} ${pays.code}` : "—"}</td>
                    <td style={{ padding:"8px 10px", color:C.red, fontFamily:"DM Mono,monospace" }}>{s.depense > 0 ? `${s.depense.toFixed(2)}€` : "—"}</td>
                    <td style={{ padding:"8px 10px", color:C.green, fontFamily:"DM Mono,monospace" }}>{s.commandes > 0 ? s.commandes : "—"}</td>
                    <td style={{ padding:"8px 10px" }}>
                      {s.cpr > 0 ? (
                        <span style={{ color:cprOk?C.green:C.red, fontFamily:"DM Mono,monospace" }}>{s.cpr.toFixed(2)}€</span>
                      ) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </Card>
  );
}

// ── PAGES ──────────────────────────────────────────────────────────────────────
function PageGlobale({ sheetData }) {
  const objectifCA = 100000;
  const caActuel = DATA.overview.revenueMois;
  const progression = Math.min((caActuel / objectifCA) * 100, 100);

  return (
    <div>
      {/* Progression objectif */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 20px", marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ color:C.muted, fontSize:10, fontFamily:"DM Mono,monospace", letterSpacing:2, textTransform:"uppercase" }}>Progression vers 100k€ bénef/mois</span>
          <span style={{ color:C.green, fontSize:12, fontFamily:"DM Mono,monospace", fontWeight:700 }}>{Math.round(progression)}%</span>
        </div>
        <div style={{ height:6, background:C.border, borderRadius:3, overflow:"hidden" }}>
          <div style={{ width:`${progression}%`, height:"100%", background:C.green, borderRadius:3, transition:"width 0.5s" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
          <span style={{ color:C.muted, fontSize:10, fontFamily:"DM Mono,monospace" }}>CA mars estimé : {fmt(caActuel)}</span>
          <span style={{ color:C.muted, fontSize:10, fontFamily:"DM Mono,monospace" }}>Objectif : 100 000€</span>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        <KPI label="Revenue Mois"  value={DATA.overview.revenueMois} suffix="€" color={C.green}  sub={`Obj: ${fmt(DATA.overview.objectif)}`} />
        <KPI label="Marge Nette"   value={DATA.overview.margeNette}  suffix="€" color={C.accent} sub={fmtP(DATA.overview.margePct)+" de marge"} />
        <KPI label="Ventes"        value={DATA.overview.ventesTotales}           color={C.it}    sub={`Panier moy: ${fmt(DATA.overview.prixMoyen)}`} />
        <KPI label="Croissance"    value={DATA.overview.croissance}  suffix="%" color={C.green}  sub="vs mois précédent" />
      </div>

      {/* Live TikTok Panel */}
      <LiveAdsPanel sheetData={sheetData} />

      <div style={{ marginBottom:20 }}>
        {DATA.alertes.map((a,i)=>{ const col=a.type==="warning"?"#F59E0B":a.type==="success"?C.green:C.it; const ico=a.type==="warning"?"⚠":a.type==="success"?"✓":"ℹ"; return (
          <div key={i} style={{ display:"flex", gap:10, padding:"9px 14px", background:col+"11", border:`1px solid ${col}33`, borderRadius:8, marginBottom:7 }}>
            <span style={{ color:col, fontSize:13 }}>{ico}</span>
            <span style={{ color:C.text, fontSize:12, fontFamily:"DM Mono,monospace" }}>{a.msg}</span>
            {a.pays!=="ALL"&&<span style={{ marginLeft:"auto", color:col, fontSize:10, fontFamily:"DM Mono,monospace" }}>[{a.pays}]</span>}
          </div>
        );})}
      </div>

      <Card title="Évolution Revenue par Pays — 6 mois" style={{ marginBottom:20 }}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={DATA.tendances}>
            <defs>
              {[["fr",C.fr],["es",C.es],["it",C.it]].map(([k,col])=>(
                <linearGradient key={k} id={`g_${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={col} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={col} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="mois" stroke={C.muted} tick={{ fontSize:10, fontFamily:"DM Mono" }} />
            <YAxis stroke={C.muted} tick={{ fontSize:10, fontFamily:"DM Mono" }} tickFormatter={v=>`${v/1000}k€`} />
            <Tooltip contentStyle={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, fontFamily:"DM Mono", fontSize:11 }} formatter={v=>fmt(v)} />
            <Area type="monotone" dataKey="fr" stroke={C.fr} fill="url(#g_fr)" strokeWidth={2} name="🇫🇷 France" />
            <Area type="monotone" dataKey="es" stroke={C.es} fill="url(#g_es)" strokeWidth={2} name="🇪🇸 Espagne" />
            <Area type="monotone" dataKey="it" stroke={C.it} fill="url(#g_it)" strokeWidth={2} name="🇮🇹 Italie" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card title="Revenue par Pôle">
          {DATA.revenuePoles.map(p=>{
            const roi = p.depense > 0 ? ((p.montant-p.depense)/p.depense*100).toFixed(0) : "∞";
            return (
              <div key={p.pole} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:14 }}>{p.icon}</span>
                    <div>
                      <div style={{ color:C.text, fontSize:12, fontFamily:"DM Mono,monospace" }}>{p.pole}</div>
                      <div style={{ color:C.muted, fontSize:10 }}>{p.desc}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ color:p.montant>0?p.couleur:C.muted, fontSize:14, fontWeight:700, fontFamily:"Syne,sans-serif" }}>
                      {p.montant > 0 ? fmt(p.montant) : "À lancer"}
                    </div>
                    {p.montant > 0 && <div style={{ color:C.green, fontSize:10, fontFamily:"DM Mono,monospace" }}>ROI +{roi}%</div>}
                  </div>
                </div>
                <div style={{ height:4, background:C.border, borderRadius:2 }}>
                  <div style={{ width:`${DATA.overview.revenueMois > 0 ? (p.montant/DATA.overview.revenueMois)*100 : 0}%`, height:"100%", background:p.couleur, borderRadius:2 }} />
                </div>
              </div>
            );
          })}
        </Card>

        <Card title="ROAS par Pays (live)">
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={DATA.pays.map(p=>({ pays:`${p.flag} ${p.code}`, roas:p.roas }))}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="pays" stroke={C.muted} tick={{ fontSize:10, fontFamily:"DM Mono" }} />
              <YAxis stroke={C.muted} tick={{ fontSize:10, fontFamily:"DM Mono" }} />
              <Tooltip contentStyle={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, fontFamily:"DM Mono", fontSize:11 }} />
              <Bar dataKey="roas" name="ROAS" radius={[4,4,0,0]}>
                {DATA.pays.map((p,i)=><Cell key={i} fill={p.roas>=3?C.green:p.roas>0?C.red:C.muted}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6, marginTop:12 }}>
            {DATA.pays.map(p=>(
              <div key={p.code} style={{ textAlign:"center", background:C.bg, borderRadius:6, padding:"8px 0", border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:16 }}>{p.flag}</div>
                <div style={{ color:p.roas>=3?C.green:p.roas>0?C.red:C.muted, fontSize:13, fontWeight:700, fontFamily:"Syne,sans-serif" }}>{p.roas > 0 ? `x${p.roas}` : "—"}</div>
                <div style={{ color:C.muted, fontSize:9, fontFamily:"DM Mono,monospace" }}>ROAS</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function PagePoles() {
  const totalRev=DATA.revenuePoles.reduce((a,p)=>a+p.montant,0);
  const totalDep=DATA.revenuePoles.reduce((a,p)=>a+p.depense,0);
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
        <KPI label="Revenue Pôles" value={totalRev} suffix="€" color={C.green}  />
        <KPI label="Coûts Directs" value={totalDep} suffix="€" color={C.red}    />
        <KPI label="Marge Pôles"   value={totalRev-totalDep} suffix="€" color={C.accent} sub={totalRev>0?fmtP(((totalRev-totalDep)/totalRev)*100):"0%"} />
      </div>
      <Card title="Revenue / Dépense / Marge par Pôle" style={{ marginBottom:20 }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={DATA.revenuePoles.map(p=>({ name:p.pole.split(" ")[0], rev:p.montant, dep:p.depense, marge:p.montant-p.depense }))}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="name" stroke={C.muted} tick={{ fontSize:10, fontFamily:"DM Mono" }} />
            <YAxis stroke={C.muted} tick={{ fontSize:10, fontFamily:"DM Mono" }} tickFormatter={v=>`${v/1000}k€`} />
            <Tooltip contentStyle={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, fontFamily:"DM Mono", fontSize:11 }} formatter={v=>fmt(v)} />
            <Bar dataKey="rev"   name="Revenue" fill={C.green}  radius={[4,4,0,0]} />
            <Bar dataKey="dep"   name="Dépense" fill={C.red}    radius={[4,4,0,0]} />
            <Bar dataKey="marge" name="Marge"   fill={C.accent} radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
        {DATA.revenuePoles.map(p=>{
          const roi = p.depense > 0 ? ((p.montant-p.depense)/p.depense*100).toFixed(0) : "∞";
          return (
            <div key={p.pole} style={{ background:C.card, border:`1px solid ${p.couleur}33`, borderRadius:10, padding:16 }}>
              <div style={{ fontSize:22, marginBottom:8 }}>{p.icon}</div>
              <div style={{ color:p.couleur, fontSize:13, fontWeight:700, fontFamily:"Syne,sans-serif", marginBottom:2 }}>{p.pole}</div>
              <div style={{ color:C.muted, fontSize:10, marginBottom:10 }}>{p.desc}</div>
              {[["Revenue",fmt(p.montant),C.green],["Dépense",fmt(p.depense),C.red],["Marge",fmt(p.montant-p.depense),C.accent]].map(([l,v,col])=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ color:C.muted, fontSize:10, fontFamily:"DM Mono,monospace" }}>{l}</span>
                  <span style={{ color:col, fontSize:11, fontFamily:"DM Mono,monospace" }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop:8, textAlign:"center", background:C.green+"22", borderRadius:6, padding:"5px 0" }}>
                <span style={{ color:C.green, fontSize:14, fontWeight:700, fontFamily:"Syne,sans-serif" }}>ROI +{roi}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PagePays({ sheetData }) {
  const [sel,setSel]=useState("FR");
  const pays=DATA.pays.find(p=>p.code===sel);
  const liveStats = sheetData.getStatsPays(pays?.campName || "");

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:20 }}>
        {DATA.pays.map(p=>{
          const ls = sheetData.getStatsPays(p.campName);
          return (
            <div key={p.code} onClick={()=>setSel(p.code)} style={{ background:sel===p.code?`${p.color}15`:C.card, border:`1px solid ${sel===p.code?p.color:C.border}`, borderRadius:10, padding:14, cursor:"pointer", transition:"all .2s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ fontSize:20 }}>{p.flag}</span>
                <div style={{ color:p.statut==="actif"?C.green:C.orange, fontSize:9, fontFamily:"DM Mono,monospace", letterSpacing:1 }}>● {p.statut.toUpperCase()}</div>
              </div>
              <div style={{ color:C.text, fontWeight:700, fontFamily:"Syne,sans-serif", marginBottom:6 }}>{p.nom}</div>
              <div style={{ height:3, background:C.border, borderRadius:2, marginBottom:8 }}>
                <div style={{ width:`${(p.revenue/p.objectif)*100}%`, height:"100%", background:p.color, borderRadius:2 }} />
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:C.muted, fontSize:9, fontFamily:"DM Mono,monospace" }}>ROAS</span>
                  <span style={{ color:p.roas>=3?C.green:p.roas>0?C.red:C.muted, fontSize:11, fontFamily:"DM Mono,monospace", fontWeight:700 }}>{p.roas > 0 ? `x${p.roas}` : "—"}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:C.muted, fontSize:9, fontFamily:"DM Mono,monospace" }}>Dépense/j</span>
                  <span style={{ color:C.red, fontSize:11, fontFamily:"DM Mono,monospace" }}>{ls.depense > 0 ? `${ls.depense.toFixed(0)}€` : `${p.adsSpend}€`}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {pays&&(
        <div style={{ background:C.card, border:`1px solid ${pays.color}44`, borderRadius:12, padding:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
            <span style={{ fontSize:28 }}>{pays.flag}</span>
            <div>
              <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:20, color:pays.color }}>{pays.nom} — Live</div>
              <div style={{ color:C.muted, fontSize:11, fontFamily:"DM Mono,monospace" }}>Objectif: {fmt(pays.objectif)} — atteint à {((pays.revenue/pays.objectif)*100).toFixed(0)}%</div>
            </div>
            <div style={{ marginLeft:"auto", background:C.green+"22", border:`1px solid ${C.green}44`, borderRadius:8, padding:"8px 16px", textAlign:"center" }}>
              <div style={{ color:C.green, fontSize:10, fontFamily:"DM Mono,monospace", letterSpacing:1, marginBottom:2 }}>DÉPENSE LIVE</div>
              <div style={{ color:C.red, fontSize:20, fontWeight:700, fontFamily:"Syne,sans-serif" }}>{liveStats.depense > 0 ? `${liveStats.depense.toFixed(0)}€` : "—"}</div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:22 }}>
            {[
              {l:"Revenue",v:fmt(pays.revenue),col:pays.color},
              {l:"Dépenses",v:fmt(pays.depenses),col:C.red},
              {l:"Marge",v:fmt(pays.revenue-pays.depenses),col:C.green},
              {l:"Ventes live",v:liveStats.commandes > 0 ? liveStats.commandes : pays.ventes, col:C.accent}
            ].map(s=>(
              <div key={s.l} style={{ background:C.bg, borderRadius:8, padding:"14px 18px", border:`1px solid ${C.border}` }}>
                <div style={{ color:C.muted, fontSize:10, fontFamily:"DM Mono,monospace", letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{s.l}</div>
                <div style={{ color:s.col, fontSize:20, fontWeight:700, fontFamily:"Syne,sans-serif" }}>{s.v}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:22 }}>
            <div>
              <div style={{ color:C.muted, fontSize:10, fontFamily:"DM Mono,monospace", letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>Funnel de Conversion</div>
              <FunnelBar data={pays.funnelData} color={pays.color} />
            </div>
            <div>
              <div style={{ color:C.muted, fontSize:10, fontFamily:"DM Mono,monospace", letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>Métriques Live</div>
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {[
                  {l:"Dépense pub aujourd'hui",v:liveStats.depense > 0 ? `${liveStats.depense.toFixed(2)}€` : `${pays.adsSpend}€/jour budget`},
                  {l:"CPR live",v:liveStats.cpr > 0 ? `${liveStats.cpr.toFixed(2)}€` : "—",ok:liveStats.cpr > 0 && liveStats.cpr < 50},
                  {l:"ROAS",v:`x${pays.roas}`,ok:pays.roas>=3},
                  {l:"CAC",v:fmt(pays.cac),ok:pays.cac<=30},
                  {l:"Taux Conv. Lead→Vente",v:fmtP(pays.tauxConversion)},
                ].map(m=>(
                  <div key={m.l} style={{ display:"flex", justifyContent:"space-between", padding:"9px 14px", background:C.bg, borderRadius:6, border:`1px solid ${C.border}` }}>
                    <span style={{ color:C.muted, fontSize:12, fontFamily:"DM Mono,monospace" }}>{m.l}</span>
                    <span style={{ color:m.ok===undefined?C.text:m.ok?C.green:C.red, fontSize:13, fontWeight:600, fontFamily:"DM Mono,monospace" }}>{m.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PageDepenses() {
  const total=DATA.depenses.reduce((a,d)=>a+d.montant,0);
  const pieColors=[C.fr,C.es,C.it,C.purple,C.orange,C.green,"#60A5FA"];
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
        <KPI label="Dépenses Totales" value={total} suffix="€" color={C.red} />
        <KPI label="% du Revenue" value={((total/DATA.overview.revenueMois)*100).toFixed(1)} suffix="%" color={C.accent} sub="Obj: < 35%" />
        <KPI label="Marge Nette" value={DATA.overview.margeNette} suffix="€" color={C.green} sub={fmtP(DATA.overview.margePct)} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card title="Répartition Dépenses">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={DATA.depenses.map(d=>({ name:d.poste, value:d.montant }))} cx="50%" cy="50%" outerRadius={75} paddingAngle={3} dataKey="value">
                {DATA.depenses.map((_,i)=><Cell key={i} fill={pieColors[i%pieColors.length]}/>)}
              </Pie>
              <Tooltip formatter={v=>fmt(v)} contentStyle={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, fontFamily:"DM Mono", fontSize:11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Détail par Poste + ROI">
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[...DATA.depenses].sort((a,b)=>b.montant-a.montant).map((d,i)=>{
              const roiCol=d.roi>=10?C.green:d.roi>=3?C.accent:C.red;
              return (
                <div key={d.poste}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:12 }}>{d.icon}</span>
                      <span style={{ color:C.text, fontSize:11, fontFamily:"DM Mono,monospace" }}>{d.poste}</span>
                    </div>
                    <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                      <span style={{ color:C.muted, fontSize:11, fontFamily:"DM Mono,monospace" }}>{fmt(d.montant)}</span>
                      <span style={{ color:roiCol, fontSize:11, fontFamily:"DM Mono,monospace", minWidth:60, textAlign:"right" }}>ROI x{d.roi}</span>
                    </div>
                  </div>
                  <div style={{ height:4, background:C.border, borderRadius:2 }}>
                    <div style={{ width:`${(d.montant/total)*100}%`, height:"100%", background:pieColors[i%pieColors.length], borderRadius:2 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop:14, paddingTop:12, borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between" }}>
            <span style={{ color:C.muted, fontFamily:"DM Mono,monospace", fontSize:12 }}>TOTAL</span>
            <span style={{ color:C.red, fontFamily:"Syne,sans-serif", fontSize:18, fontWeight:700 }}>{fmt(total)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PageTodo() {
  const [todos,setTodos]=useState(INIT_TODOS);
  const [activeUser,setActiveUser]=useState("clement");
  const [newTask,setNewTask]=useState("");
  const [newPrio,setNewPrio]=useState("med");

  const users=[
    {key:"clement",  label:"Clément",  icon:"👑", color:C.accent},
    {key:"azzedine", label:"Azzedine", icon:"⚙️", color:C.it},
    {key:"equipe",   label:"Équipe",   icon:"👥", color:C.purple},
  ];

  const toggle=id=>setTodos(p=>({...p,[activeUser]:p[activeUser].map(t=>t.id===id?{...t,done:!t.done}:t)}));
  const remove=id=>setTodos(p=>({...p,[activeUser]:p[activeUser].filter(t=>t.id!==id)}));
  const add=()=>{ if(!newTask.trim())return; setTodos(p=>({...p,[activeUser]:[...p[activeUser],{id:Date.now(),text:newTask,done:false,priority:newPrio}]})); setNewTask(""); };

  const cu=users.find(u=>u.key===activeUser);
  const tasks=todos[activeUser]||[];
  const done=tasks.filter(t=>t.done).length;
  const prioCols={high:C.red,med:C.accent,low:C.green};
  const prioLabels={high:"🔴 Urgent",med:"🟡 Normal",low:"🟢 Low"};

  return (
    <div>
      <div style={{ display:"flex", gap:10, marginBottom:20 }}>
        {users.map(u=>(
          <button key={u.key} onClick={()=>setActiveUser(u.key)} style={{ background:activeUser===u.key?`${u.color}22`:C.card, border:`1px solid ${activeUser===u.key?u.color:C.border}`, borderRadius:10, padding:"12px 20px", cursor:"pointer", display:"flex", alignItems:"center", gap:8, transition:"all .2s" }}>
            <span style={{ fontSize:16 }}>{u.icon}</span>
            <span style={{ color:activeUser===u.key?u.color:C.muted, fontFamily:"Syne,sans-serif", fontWeight:700 }}>{u.label}</span>
            <span style={{ background:u.color+"33", color:u.color, borderRadius:20, padding:"2px 8px", fontSize:11, fontFamily:"DM Mono,monospace" }}>{todos[u.key].filter(t=>!t.done).length}</span>
          </button>
        ))}
      </div>
      <div style={{ background:C.card, border:`1px solid ${cu.color}44`, borderRadius:12, padding:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:18, color:cu.color }}>{cu.icon} {cu.label}</div>
            <div style={{ color:C.muted, fontSize:11, fontFamily:"DM Mono,monospace", marginTop:2 }}>{done}/{tasks.length} tâches complétées</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ color:cu.color, fontSize:28, fontWeight:700, fontFamily:"Syne,sans-serif" }}>{tasks.length?Math.round((done/tasks.length)*100):0}%</div>
            <div style={{ color:C.muted, fontSize:10, fontFamily:"DM Mono,monospace" }}>AVANCEMENT</div>
          </div>
        </div>
        <div style={{ height:6, background:C.border, borderRadius:3, marginBottom:22 }}>
          <div style={{ width:`${tasks.length?(done/tasks.length)*100:0}%`, height:"100%", background:cu.color, borderRadius:3, transition:"width .4s" }} />
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:20 }}>
          {["high","med","low"].map(prio=>{
            const group=tasks.filter(t=>t.priority===prio);
            if(!group.length)return null;
            return (
              <div key={prio} style={{ marginBottom:8 }}>
                <div style={{ color:prioCols[prio], fontSize:10, fontFamily:"DM Mono,monospace", letterSpacing:1, textTransform:"uppercase", marginBottom:6, marginTop:4 }}>{prioLabels[prio]}</div>
                {group.map(t=>(
                  <div key={t.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:t.done?C.bg+"88":C.bg, border:`1px solid ${t.done?C.border+"44":C.border}`, borderRadius:8, marginBottom:6, transition:"all .2s" }}>
                    <div onClick={()=>toggle(t.id)} style={{ width:18, height:18, borderRadius:5, border:`2px solid ${t.done?cu.color:C.border}`, background:t.done?cu.color:"transparent", cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" }}>
                      {t.done&&<span style={{ color:C.bg, fontSize:11, fontWeight:900 }}>✓</span>}
                    </div>
                    <span style={{ color:t.done?C.muted:C.text, fontSize:13, flex:1, textDecoration:t.done?"line-through":"none" }}>{t.text}</span>
                    <button onClick={()=>remove(t.id)} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:14, opacity:.4 }}>✕</button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <input value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Nouvelle tâche..." style={{ flex:1, background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 14px", color:C.text, fontFamily:"DM Mono,monospace", fontSize:12, outline:"none" }} />
          <select value={newPrio} onChange={e=>setNewPrio(e.target.value)} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:"10px", fontFamily:"DM Mono,monospace", fontSize:11, outline:"none", cursor:"pointer" }}>
            <option value="high">🔴 Urgent</option>
            <option value="med">🟡 Normal</option>
            <option value="low">🟢 Low</option>
          </select>
          <button onClick={add} style={{ background:cu.color, border:"none", borderRadius:8, padding:"10px 18px", color:C.bg, fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>+ Ajouter</button>
        </div>
      </div>
    </div>
  );
}

// ── NAV + APP ──────────────────────────────────────────────────────────────────
const NAV=[
  {id:"global",   label:"Vue Globale",    icon:"⚡", group:"Dashboard"},
  {id:"poles",    label:"Pôles Revenue",  icon:"🏆", group:"Dashboard"},
  {id:"pays",     label:"Par Pays",       icon:"🌍", group:"Dashboard"},
  {id:"depenses", label:"Dépenses & ROI", icon:"💸", group:"Dashboard"},
  {id:"todo",     label:"Todo",           icon:"✅", group:"Équipe"},
];

export default function App() {
  const [page,setPage]=useState("global");
  const [collapsed,setCollapsed]=useState(false);
  const sheetData = useSheetData();
  const groups=[...new Set(NAV.map(n=>n.group))];
  const current=NAV.find(n=>n.id===page);

  const pages={
    global: <PageGlobale sheetData={sheetData} />,
    poles:  <PagePoles />,
    pays:   <PagePays sheetData={sheetData} />,
    depenses: <PageDepenses />,
    todo:   <PageTodo />,
  };

  return (
    <div style={{ display:"flex", height:"100vh", background:C.bg, fontFamily:"DM Sans,sans-serif", color:C.text, overflow:"hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* SIDEBAR */}
      <div style={{ width:collapsed?58:215, background:C.sidebar, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", transition:"width .25s ease", flexShrink:0, overflow:"hidden" }}>
        <div style={{ padding:collapsed?"18px 0":"18px 16px", display:"flex", alignItems:"center", gap:10, borderBottom:`1px solid ${C.border}`, justifyContent:collapsed?"center":"flex-start" }}>
          <div style={{ width:28, height:28, background:C.accent, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ fontSize:13 }}>⚡</span>
          </div>
          {!collapsed&&<span style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:13, color:C.text, whiteSpace:"nowrap" }}>DIGISTAL</span>}
        </div>

        <div style={{ flex:1, padding:"10px 0", overflowY:"auto" }}>
          {groups.map(g=>(
            <div key={g}>
              {!collapsed&&<div style={{ color:C.muted, fontSize:9, fontFamily:"DM Mono,monospace", letterSpacing:2, textTransform:"uppercase", padding:"10px 16px 5px" }}>{g}</div>}
              {NAV.filter(n=>n.group===g).map(n=>{
                const active=page===n.id;
                return (
                  <button key={n.id} onClick={()=>setPage(n.id)} title={n.label} style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:collapsed?"10px 0":"10px 16px", justifyContent:collapsed?"center":"flex-start", background:active?`${C.accent}15`:"none", border:"none", borderLeft:active?`3px solid ${C.accent}`:"3px solid transparent", cursor:"pointer", transition:"all .15s" }}>
                    <span style={{ fontSize:14 }}>{n.icon}</span>
                    {!collapsed&&<span style={{ color:active?C.accent:C.muted, fontSize:12, fontFamily:"DM Mono,monospace", whiteSpace:"nowrap" }}>{n.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ padding:collapsed?"10px 0":"10px 16px", borderTop:`1px solid ${C.border}` }}>
          {!collapsed && (
            <div style={{ background:C.green+"11", border:`1px solid ${C.green}33`, borderRadius:8, padding:"8px 10px", marginBottom:8 }}>
              <div style={{ color:C.green, fontSize:9, fontFamily:"DM Mono,monospace", letterSpacing:1 }}>● LIVE — TikTok Ads</div>
              <div style={{ color:C.muted, fontSize:10, marginTop:2 }}>{sheetData.lastUpdate ? `Mis à jour ${sheetData.lastUpdate}` : "Chargement..."}</div>
            </div>
          )}
          <button onClick={()=>setCollapsed(v=>!v)} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"8px 0", color:C.muted, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", width:"100%" }}>
            {collapsed?"→":"←"}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ borderBottom:`1px solid ${C.border}`, padding:"0 26px", height:54, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:17 }}>{current?.icon}</span>
            <span style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:15 }}>{current?.label}</span>
            <span style={{ color:C.muted, fontSize:10, fontFamily:"DM Mono,monospace", marginLeft:6 }}>WAR ROOM — MARS 2026</span>
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <span style={{ color:C.green, fontSize:9, fontFamily:"DM Mono,monospace", letterSpacing:1 }}>● LIVE</span>
            {["🇫🇷","🇪🇸","🇮🇹","🇬🇧"].map((f,i)=><span key={i} style={{ fontSize:16 }}>{f}</span>)}
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:22 }}>
          {pages[page]}
        </div>
      </div>
    </div>
  );
}
    </div>
  );
}
