import { useState, useEffect, useRef, useCallback } from "react";
import { Send, ChevronDown, ChevronRight, ExternalLink, Check, X, Loader2, Terminal, MessageSquare, Globe, Search, Zap, TrendingUp, Download } from "lucide-react";
import jsPDF from "jspdf";

const AVENUE_Z = {
  stats: { commerceDriven: "$1B+", transactionsRepresented: "$38B", techPartnerships: "60+", ranking: "#1 Top AI Search Agency" },
  caseStudies: [
    {client:"eskiin",result:"$1M+ TikTok Revenue in 90 Days"},
    {client:"Kind Patches",result:"175% Growth in 90 Days"},
    {client:"cpap.com",result:"Doubled Conversion Rates"},
    {client:"Better",result:"600+ Media Hits in 3 Days"},
    {client:"Monat",result:"$800K on TikTok Shop"},
    {client:"Dave",result:"WSJ and CNBC Headlines"},
    {client:"Orlando.org",result:"1,100% Conversion via AI Search"},
    {client:"Yogibo",result:"537% Revenue Increase"}
  ],
  competitors: ["powerdigitalmarketing.com","tinuiti.com","nogood.io","5wpr.com","vaynermedia.com","us.bastionagency.com","ogilvy.com"],
};


function Gauge({ score, label, size=90 }) {
  const r = size/2-8, circ = 2*Math.PI*r, pct = score!=null?score/100:0;
  const color = score==null?"#444":score>=90?"#60FF80":score>=50?"#FFFC60":"#FF6060";
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#2a2a2a" strokeWidth={7}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} style={{transition:"stroke-dashoffset 1.2s ease"}}/>
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill={score!=null?color:"#555"} fontSize={18} fontWeight="800">
          {score!=null?score:"—"}
        </text>
      </svg>
      <span style={{color:"#666",fontSize:11,fontWeight:600,textAlign:"center",letterSpacing:"0.02em"}}>{label}</span>
    </div>
  );
}

function VitalCard({ label, value, fullName }: { label: any; value: any; fullName?: string }) {
  return (
    <div style={{background:"#1e1e1e",borderRadius:12,padding:"14px 10px",textAlign:"center",border:"1px solid #ffffff08",minWidth:0,overflow:"hidden"}}>
      <div style={{color:"#FFFC60",fontSize:16,fontWeight:800,lineHeight:1,marginBottom:6,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{value||"—"}</div>
      <div style={{color:"#555",fontSize:11,lineHeight:1.3,fontWeight:700}}>{label}</div>
      {fullName&&<div style={{color:"#8A8A8A",fontSize:10,lineHeight:1.3,marginTop:2}}>{fullName}</div>}
    </div>
  );
}

function Badge({ severity }) {
  const m={critical:{bg:"#3d1515",c:"#FF6060",t:"CRITICAL"},warning:{bg:"#3a2e00",c:"#FFFC60",t:"WARNING"},opportunity:{bg:"#0f2d18",c:"#60FF80",t:"OPPORTUNITY"}};
  const s=m[severity]||m.opportunity;
  return <span style={{background:s.bg,color:s.c,fontSize:10,fontWeight:800,padding:"3px 8px",borderRadius:99,letterSpacing:"0.06em",flexShrink:0}}>{s.t}</span>;
}

function CatTag({ category }) {
  const c={SEO:"#39A0FF",AEO:"#6034FF",Content:"#60FDFF",Technical:"#FFFC60","Performance Media":"#60FF80",PR:"#FF6060"};
  const col=c[category]||"#8A8A8A";
  return <span style={{background:`${col}18`,color:col,fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:99,border:`1px solid ${col}33`,flexShrink:0,display:"inline-block",lineHeight:"normal",whiteSpace:"nowrap"}}>{category||"General"}</span>;
}

function ChkItem({ label, passed, detail }: { label: any; passed: any; detail?: any }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #ffffff07"}}>
      <div style={{width:20,height:20,borderRadius:"50%",background:passed?"#0f2d18":"#3d1515",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        {passed?<Check size={11} color="#60FF80"/>:<X size={11} color="#FF6060"/>}
      </div>
      <span style={{color:"#ccc",fontSize:12,flex:1}}>{label}</span>
      {detail&&<span style={{color:passed?"#60FF80":"#FF6060",fontSize:11,fontWeight:700}}>{detail}</span>}
    </div>
  );
}

export default function App() {
  const [url,setUrl]=useState("");
  const [loading,setLoading]=useState(false);
  const [logs,setLogs]=useState([]);
  const [siteData,setSiteData]=useState(null);
  const [psData,setPsData]=useState(null);
  const [recs,setRecs]=useState([]);
  const [geoData,setGeoData]=useState(null);
  const [expandedRec,setExpandedRec]=useState(null);
  const [tab,setTab]=useState("health");
  const [chat,setChat]=useState([]);
  const [chatIn,setChatIn]=useState("");
  const [chatLoading,setChatLoading]=useState(false);
  const [elapsed,setElapsed]=useState(0);
  const [stage,setStage]=useState(0);
  const timerRef=useRef(null);
  const chatRef=useRef(null);
  const logRef=useRef(null);

  const STAGES=["","Scraping & analyzing website…","Running PageSpeed audit…","Generating AI recommendations…","Analyzing AI/GEO visibility…"];

  useEffect(()=>{
    if(loading){setElapsed(0);timerRef.current=setInterval(()=>setElapsed(p=>+(p+0.1).toFixed(1)),100);}
    else{clearInterval(timerRef.current);if(stage!==0)setTimeout(()=>setStage(0),2000);}
    return()=>clearInterval(timerRef.current);
  },[loading]);

  useEffect(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;},[chat]);
  useEffect(()=>{if(logRef.current)logRef.current.scrollLeft=logRef.current.scrollWidth;},[logs]);

  const log=useCallback(msg=>setLogs(p=>[...p.slice(-10),msg]),[]);

  const callClaude=async(messages,system,maxTokens=3000,useWebSearch=false)=>{
    const body:any={model:"claude-sonnet-4-20250514",max_tokens:maxTokens,messages};
    if(system)body.system=system;
    if(useWebSearch)body.tools=[{type:"web_search_20250305",name:"web_search"}];
    const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const data=await res.json();
    if(!res.ok)throw new Error(data.error||"Claude API error");
    return data.content.filter(b=>b.type==="text").map(b=>b.text).join("");
  };

  const safeParseJSON=(text)=>{
    const cleaned=text.replace(/```json|```/g,"").trim();
    try{return JSON.parse(cleaned);}
    catch{
      // Try to find JSON object in the text
      const match=cleaned.match(/\{[\s\S]*\}/);
      if(match)try{return JSON.parse(match[0]);}catch{}
      throw new Error("Could not parse JSON response");
    }
  };

  const analyze=async()=>{
    if(!url.trim())return;
    const u=url.startsWith("http")?url:`https://${url}`;
    setLoading(true);setLogs([]);setSiteData(null);setPsData(null);setRecs([]);setGeoData(null);setExpandedRec(null);

    try {
      // STAGE 1: Scrape + analyze with web search
      setStage(1);
      log(`> Initiating live web analysis of ${u}...`);

      // Scrape site with Firecrawl first for real content
      let scrapedMarkdown = "";
      let scrapedMeta: any = {};
      try {
        log(`> Scraping site content via Firecrawl...`);
        const fcRes = await fetch("/api/firecrawl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: u, formats: ["markdown"] }),
        });
        if (fcRes.ok) {
          const fcData = await fcRes.json();
          scrapedMarkdown = fcData.data?.markdown || "";
          scrapedMeta = fcData.data?.metadata || {};
          if (scrapedMarkdown) log(`> Firecrawl scraped ${scrapedMarkdown.length} chars of content.`);
        }
      } catch (e) {
        log(`> Firecrawl unavailable — falling back to web search.`);
      }

      const hasScrapedContent = scrapedMarkdown.length > 100;
      const scrapedContext = hasScrapedContent ? `
Here is the actual scraped content from the site — use ONLY this to describe the company, do not use your training data:

SCRAPED METADATA:
- Title: ${scrapedMeta.title || "N/A"}
- Description: ${scrapedMeta.description || "N/A"}
- OG Title: ${scrapedMeta.ogTitle || scrapedMeta["og:title"] || "N/A"}

SCRAPED PAGE CONTENT (first 6000 chars):
${scrapedMarkdown.slice(0, 6000)}
` : "";

      const sitePrompt=hasScrapedContent
        ? `You are an expert SEO and marketing analyst. Analyze this website: ${u}
${scrapedContext}
Based ONLY on the scraped content above, return ONLY valid JSON (absolutely no markdown fences, no explanation):
{
  "companyName": "actual company name from the scraped content",
  "description": "2-3 sentence description of what this company actually does based on the scraped content above",
  "industry": "their specific industry/vertical based on the scraped content",
  "titleTag": "the actual page title tag text from metadata",
  "titleLength": number,
  "metaDescription": "the actual meta description text from metadata or empty string if missing",
  "metaDescriptionLength": number,
  "hasHttps": true/false,
  "hasMobileViewport": true/false,
  "hasStructuredData": true/false,
  "h1Count": number,
  "h2Count": number,
  "estimatedImages": number,
  "estimatedMissingAlt": number,
  "estimatedInternalLinks": number,
  "estimatedExternalLinks": number,
  "keyPages": ["list of main nav pages you found in the content"],
  "primaryCTA": "what is their main call to action based on the scraped content",
  "contentQuality": "brief honest assessment of their content quality and depth based on the scraped content"
}`
        : `You are an expert SEO and marketing analyst. Use your web search tool to visit and thoroughly analyze this website: ${u}

Search for and visit the actual URL. Examine the live page content, meta tags, structure, and any available technical signals.

Then return ONLY valid JSON (absolutely no markdown fences, no explanation):
{
  "companyName": "actual company name from the site",
  "description": "2-3 sentence description of what this company actually does based on their site content",
  "industry": "their specific industry/vertical",
  "titleTag": "the actual page title tag text",
  "titleLength": number,
  "metaDescription": "the actual meta description text or empty string if missing",
  "metaDescriptionLength": number,
  "hasHttps": true/false,
  "hasMobileViewport": true/false,
  "hasStructuredData": true/false,
  "h1Count": number,
  "h2Count": number,
  "estimatedImages": number,
  "estimatedMissingAlt": number,
  "estimatedInternalLinks": number,
  "estimatedExternalLinks": number,
  "keyPages": ["list of main nav pages you found"],
  "primaryCTA": "what is their main call to action",
  "contentQuality": "brief honest assessment of their content quality and depth"
}`;

      const siteText=await callClaude([{role:"user",content:sitePrompt}],null,2000,!hasScrapedContent);
      const siteInfo=safeParseJSON(siteText);
      const sd={
        url:u,
        companyName:siteInfo.companyName||new URL(u).hostname,
        description:siteInfo.description||"",
        industry:siteInfo.industry||"",
        title:siteInfo.titleTag||"",
        titleLength:siteInfo.titleLength||0,
        metaDescription:siteInfo.metaDescription||"",
        descriptionLength:siteInfo.metaDescriptionLength||0,
        https:siteInfo.hasHttps!==false,
        mobileResponsive:siteInfo.hasMobileViewport!==false,
        hasSchema:!!siteInfo.hasStructuredData,
        h1Tags:siteInfo.h1Count||0,
        h2Count:siteInfo.h2Count||0,
        totalImages:siteInfo.estimatedImages||0,
        missingAlt:siteInfo.estimatedMissingAlt||0,
        internalLinks:siteInfo.estimatedInternalLinks||0,
        externalLinks:siteInfo.estimatedExternalLinks||0,
        primaryCTA:siteInfo.primaryCTA||"",
        contentQuality:siteInfo.contentQuality||"",
        keyPages:siteInfo.keyPages||[]
      };
      setSiteData(sd);
      log(`> Site analysis complete — ${sd.companyName}`);

      // STAGE 2: PageSpeed via proxy
      setStage(2);
      log("> Running PageSpeed Insights...");
      let ps=null;
      try{
        const r=await fetch(`/api/pagespeed?url=${encodeURIComponent(u)}`);
        const pj=await r.json();
        const cats=pj.lighthouseResult?.categories;
        if(cats){
          ps={
            performance:Math.round((cats.performance?.score||0)*100),
            accessibility:Math.round((cats.accessibility?.score||0)*100),
            bestPractices:Math.round((cats["best-practices"]?.score||0)*100),
            seo:Math.round((cats.seo?.score||0)*100),
            lcp:pj.lighthouseResult.audits?.["largest-contentful-paint"]?.displayValue||"N/A",
            fcp:pj.lighthouseResult.audits?.["first-contentful-paint"]?.displayValue||"N/A",
            tbt:pj.lighthouseResult.audits?.["total-blocking-time"]?.displayValue||"N/A",
            cls:pj.lighthouseResult.audits?.["cumulative-layout-shift"]?.displayValue||"N/A",
            live:true
          };
          setPsData(ps);
          log(`> PageSpeed live — Perf: ${ps.performance}, SEO: ${ps.seo}, A11y: ${ps.accessibility}`);
        }
      }catch(e){
        log("> PageSpeed proxy blocked — Claude will estimate scores.");
      }

      // STAGE 3: Recommendations + PageSpeed estimates if needed
      setStage(3);
      log("> Generating Conversion Intelligence recommendations...");

      const recsPrompt=`You are the Conversion Intelligence engine at Avenue Z, the #1 AI Search Agency ($1B+ commerce driven). Services: Performance Media (paid social, paid search, TikTok Shop, affiliate, CRO), Earned Media (PR, comms, crisis, thought leadership), Owned Media (AEO/AI Search, SEO, Shopify, brand content).

Based on this actual website analysis, generate 5 high-impact, specific marketing recommendations. Be concrete — reference actual things you found on the site.

SITE DATA:
URL: ${u}
Company: ${sd.companyName}
Description: ${sd.description}
Primary CTA: ${sd.primaryCTA}
Content Quality: ${sd.contentQuality}
Title: "${sd.title}" (${sd.titleLength} chars)
Meta Desc: "${sd.metaDescription}" (${sd.descriptionLength} chars)
HTTPS: ${sd.https}, Mobile Viewport: ${sd.mobileResponsive}, Schema: ${sd.hasSchema}
H1s: ${sd.h1Tags}, H2s: ${sd.h2Count}, Images: ${sd.totalImages} (${sd.missingAlt} missing alt)
Links: ${sd.internalLinks} internal, ${sd.externalLinks} external
${!ps?`\nAlso estimate realistic PageSpeed scores as "pageSpeed": {"performance":N,"accessibility":N,"bestPractices":N,"seo":N,"lcp":"X.X s","fcp":"X.X s","tbt":"XX ms","cls":"0.XX"}`:``}

Return ONLY valid JSON:
{
  ${!ps?`"pageSpeed":{"performance":0,"accessibility":0,"bestPractices":0,"seo":0,"lcp":"","fcp":"","tbt":"","cls":""},`:""}
  "recommendations":[
    {"category":"SEO"|"AEO"|"Content"|"Technical"|"Performance Media"|"PR","title":"specific actionable title","severity":"critical"|"warning"|"opportunity","description":"specific problem found on this actual site that Avenue Z can solve","fix":"concrete action Avenue Z's team will implement — frame as what Avenue Z does, not what a tool does","impact":"high"|"medium"|"low"}
  ]
}`;

      const recsText=await callClaude([{role:"user",content:recsPrompt}],null,2500);
      const recsData=safeParseJSON(recsText);
      if(!ps&&recsData.pageSpeed){
        setPsData({...recsData.pageSpeed,live:false});
        log(`> PageSpeed estimated — Perf: ${recsData.pageSpeed.performance}, SEO: ${recsData.pageSpeed.seo}`);
      }
      setRecs(recsData.recommendations||[]);
      log(`> ${recsData.recommendations?.length||0} recommendations generated.`);

      // STAGE 4: GEO analysis
      setStage(4);
      log("> Analyzing AI/GEO search visibility...");

      const geoPrompt=`You are an AEO (Answer Engine Optimization) expert at Avenue Z, the #1 AI Search Agency. Analyze ${u} (${sd.companyName} — ${sd.description}) for AI search visibility.

Use this EXACT weighted methodology to calculate the overall AI/GEO Visibility Score (0-100):

1. Structured Data / Schema Markup (20 pts): Full schema present = 20, partial = 10, none = 0. Site has schema: ${sd.hasSchema}
2. Content Structure for AI Retrieval (20 pts): Evaluate presence of FAQs, clear H2 structure (found ${sd.h2Count} H2s), conversational content, answer-formatted writing. Score 0-20 based on how citable this content is to an AI engine.
3. Technical Accessibility via PageSpeed (15 pts): Map the PageSpeed accessibility score (${ps?.accessibility??'N/A'}/100) proportionally to 0-15.
4. Security and Mobile Readiness (15 pts): HTTPS = 8pts (site has HTTPS: ${sd.https}), Mobile viewport = 7pts (site is mobile responsive: ${sd.mobileResponsive}).
5. Brand Authority and EAT Signals (15 pts): Evaluate expertise, authoritativeness, trustworthiness signals — team pages, press mentions, about page depth, credentials, client logos. Score 0-15 based on what you find.
6. Content Depth and Substance (15 pts): Evaluate whether the site has enough substantive original content for an AI engine to pull a meaningful cited answer from. Score 0-15.

The overallScore MUST equal the sum of these 6 component scores. Show your work in the breakdown.

Per-engine scores: derive each from the overallScore, adjusted by up to ±15 points based on each engine's weighting:
- ChatGPT: weights brand authority and content depth most heavily
- Perplexity: weights structured data and technical accessibility most heavily
- Google Gemini: weights mobile readiness, HTTPS, and schema most heavily
- Claude: weights content quality and EAT signals most heavily
- Bing Copilot: weights technical SEO signals and structured data most heavily

Each engine note MUST be one specific sentence tied to what was actually found on the site.

Return ONLY valid JSON:
{
  "overallScore":number,
  "scoreBreakdown":{"structuredData":number,"contentStructure":number,"technicalAccessibility":number,"securityMobile":number,"brandAuthority":number,"contentDepth":number},
  "aiEngines":[
    {"name":"ChatGPT","score":number,"status":"strong"|"moderate"|"weak","note":"one specific sentence about this site"},
    {"name":"Perplexity","score":number,"status":"strong"|"moderate"|"weak","note":"one specific sentence about this site"},
    {"name":"Google Gemini","score":number,"status":"strong"|"moderate"|"weak","note":"one specific sentence about this site"},
    {"name":"Claude","score":number,"status":"strong"|"moderate"|"weak","note":"one specific sentence about this site"},
    {"name":"Bing Copilot","score":number,"status":"strong"|"moderate"|"weak","note":"one specific sentence about this site"}
  ],
  "signals":[
    {"label":"Knowledge Graph Presence","passed":true/false,"detail":"specific note"},
    {"label":"Conversational Content","passed":true/false,"detail":"specific note"},
    {"label":"Structured FAQ Content","passed":true/false,"detail":"specific note"},
    {"label":"Brand Mention Authority","passed":true/false,"detail":"specific note"},
    {"label":"AI-Readable Structure","passed":true/false,"detail":"specific note"},
    {"label":"Citation Worthiness","passed":true/false,"detail":"specific note"}
  ],
  "topOpportunities":[
    {"title":"specific opportunity","description":"concrete action Avenue Z can implement for this site","priority":"high"|"medium"}
  ]
}`;

      const geoText=await callClaude([{role:"user",content:geoPrompt}],null,2000);
      const geo=safeParseJSON(geoText);
      setGeoData(geo);
      log(`> AI/GEO score: ${geo.overallScore}/100`);
      log(`> ✓ Full analysis complete.`);

    }catch(e){
      log(`> Error: ${e.message}`);
    }
    setLoading(false);
  };

  const sendChat=async()=>{
    if(!chatIn.trim()||chatLoading)return;
    const msg=chatIn.trim();setChatIn("");
    setChat(p=>[...p,{role:"user",content:msg}]);
    setChatLoading(true);
    try{
      const ctx=siteData?`Analyzed site: ${siteData.url} | Company: ${siteData.companyName} | ${siteData.description} | PageSpeed: Perf ${psData?.performance??'N/A'}, SEO ${psData?.seo??'N/A'} | HTTPS: ${siteData.https}, Mobile: ${siteData.mobileResponsive}, Schema: ${siteData.hasSchema} | H1s: ${siteData.h1Tags}, Images: ${siteData.totalImages} (${siteData.missingAlt} missing alt) | Links: ${siteData.internalLinks} int, ${siteData.externalLinks} ext | AI/GEO Score: ${geoData?.overallScore??'N/A'}/100`:"No site analyzed yet.";
      const sys=`You are the Conversion Intelligence engine at Avenue Z, the #1 AI Search Agency ($1B+ commerce driven). Services: Performance Media (paid social, TikTok Shop, paid search, CRO, affiliate), Earned Media (PR, crisis comms, thought leadership), Owned Media (AEO, SEO, Shopify dev, content). Be concise, strategic, specific. Always connect advice to Avenue Z capabilities.\n\nCurrent analysis context: ${ctx}`;
      const history=chat.map(m=>({role:m.role,content:m.content}));
      const text=await callClaude([...history,{role:"user",content:msg}],sys,800);
      setChat(p=>[...p,{role:"assistant",content:text}]);
    }catch(e){
      setChat(p=>[...p,{role:"assistant",content:"Error — please try again."}]);
    }
    setChatLoading(false);
  };

  const pct=Math.min(97,stage>0?((stage-1)*24)+Math.min(24,(elapsed/15)*24):0);

  const passed=siteData?[
    siteData.https&&{label:"HTTPS Secure",detail:"✓"},
    siteData.mobileResponsive&&{label:"Mobile Responsive",detail:"✓"},
    siteData.titleLength>0&&siteData.titleLength<=60&&{label:"Title Length Optimal",detail:`${siteData.titleLength} chars`},
    siteData.descriptionLength>=100&&siteData.descriptionLength<=160&&{label:"Meta Description Length",detail:`${siteData.descriptionLength} chars`},
    siteData.hasSchema&&{label:"Structured Data Present",detail:"✓"},
    siteData.h1Tags===1&&{label:"Single H1 Tag",detail:"✓"},
    siteData.missingAlt===0&&siteData.totalImages>0&&{label:"All Images Have Alt Text",detail:"✓"},
    psData?.performance>=90&&{label:"Performance Score 90+",detail:psData.performance},
    psData?.seo>=90&&{label:"SEO Score 90+",detail:psData.seo},
    psData?.accessibility>=90&&{label:"Accessibility Score 90+",detail:psData.accessibility},
  ].filter(Boolean):[];

  const analysisComplete = !!(siteData && psData && recs.length > 0 && geoData);

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 40; // margin
    const CW = W - M * 2; // content width
    const P = 16; // card internal padding
    const GAP = 20; // gap between sections
    const TW = CW - P * 2; // text width inside cards (full width minus padding both sides)
    let y = 0;
    let pageNum = 1;

    // Colors
    const BG = "#000000", CARD = "#272727", WHITE = "#FFFFFF", MUTED = "#8A8A8A";
    const GREEN = "#60FF80", YELLOW = "#FFFC60", RED = "#FF6060";
    const CYAN = "#60FDFF", BLUE = "#39A0FF", PURPLE = "#6034FF";
    const GRAD = ["#FFFC60", "#60FF80", "#60FDFF", "#39A0FF", "#6034FF"];

    const hex = (h: string): [number, number, number] => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
    const tCol = (h: string) => { doc.setTextColor(...hex(h)); };
    const fCol = (h: string) => { doc.setFillColor(...hex(h)); };

    const drawPageNum = () => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      tCol(MUTED);
      doc.text(`Page ${pageNum}`, W - M, H - 24, { align: "right" });
    };

    const drawGradientBar = (bx: number, by: number, bw: number, bh: number) => {
      const segW = bw / 5;
      GRAD.forEach((c, i) => { fCol(c); doc.rect(bx + i * segW, by, segW, bh, "F"); });
    };

    const newPage = () => {
      drawPageNum();
      doc.addPage();
      pageNum++;
      fCol(BG); doc.rect(0, 0, W, H, "F");
      y = M;
    };

    const checkSpace = (needed: number) => { if (y + needed > H - 60) newPage(); };

    const card = (cx: number, cy: number, cw: number, ch: number) => {
      fCol(CARD); doc.roundedRect(cx, cy, cw, ch, 8, 8, "F");
    };

    const sectionLabel = (title: string, ly: number) => {
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); tCol(MUTED);
      doc.text(title, M + P, ly + 12);
    };

    const scoreCol = (s: number) => s >= 90 ? GREEN : s >= 50 ? YELLOW : RED;

    const textHeight = (text: string, fontSize: number, maxW: number, font = "normal") => {
      doc.setFont("helvetica", font); doc.setFontSize(fontSize);
      return doc.splitTextToSize(text, maxW).length * fontSize * 1.3;
    };

    // ═══════════════ PAGE 1: HEADER ═══════════════
    fCol(BG); doc.rect(0, 0, W, H, "F");
    y = M;

    // Logo
    doc.setFont("helvetica", "bold"); doc.setFontSize(20); tCol(WHITE);
    doc.text("AVENUE Z", M, y);
    const lw = doc.getTextWidth("AVENUE Z");
    tCol(MUTED); doc.text("  |  ", M + lw, y);
    const sw = doc.getTextWidth("  |  ");
    doc.setFontSize(10); tCol(MUTED);
    doc.text("CONVERSION INTELLIGENCE", M + lw + sw, y);
    y += 10;

    // Gradient bar
    drawGradientBar(M, y, CW, 4);
    y += 20;

    // Date + URL
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); tCol(MUTED);
    doc.text(`Report Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, M, y);
    y += 16;
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); tCol(WHITE);
    doc.text(`URL Analyzed: ${siteData.url}`, M, y);
    y += GAP + 10;

    // ═══════════════ COMPANY PROFILE ═══════════════
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    const descText = siteData.description || "N/A";
    const descWrapped = doc.splitTextToSize(descText, TW);
    const descH = descWrapped.length * 12;
    const cpH = P + 22 + 18 + descH + 10 + 20 + P;
    checkSpace(cpH);
    const cpStart = y;
    card(M, y, CW, cpH);
    sectionLabel("COMPANY PROFILE", y);
    y += P + 22;

    doc.setFont("helvetica", "bold"); doc.setFontSize(14); tCol(WHITE);
    doc.text(siteData.companyName, M + P, y);
    y += 18;

    doc.setFont("helvetica", "normal"); doc.setFontSize(9); tCol(MUTED);
    doc.text(descWrapped, M + P, y);
    y += descH + 10;

    // Industry + HTTPS badges
    if (siteData.industry) {
      doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      fCol("#1a3a5a");
      const indW = doc.getTextWidth(siteData.industry) + 16;
      doc.roundedRect(M + P, y - 4, indW, 16, 8, 8, "F");
      tCol(BLUE); doc.text(siteData.industry, M + P + 8, y + 7);

      const hx = M + P + indW + 8;
      fCol(siteData.https ? "#0f2d18" : "#3d1515");
      const hLabel = siteData.https ? "HTTPS" : "HTTP";
      const hW = doc.getTextWidth(hLabel) + 16;
      doc.roundedRect(hx, y - 4, hW, 16, 8, 8, "F");
      tCol(siteData.https ? GREEN : RED); doc.text(hLabel, hx + 8, y + 7);
    }
    y = cpStart + cpH + GAP;

    // ═══════════════ PAGESPEED SCORES ═══════════════
    const psCardH = P + 22 + 70 + 16 + P;
    checkSpace(psCardH);
    const psStart = y;
    card(M, y, CW, psCardH);
    sectionLabel("PAGESPEED SCORES", y);

    // Live/estimated label on right
    doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    tCol(psData.live ? GREEN : YELLOW);
    doc.text(psData.live ? "LIVE DATA" : "AI ESTIMATED", M + CW - P, y + 12, { align: "right" });

    y += P + 22;

    const psScores = [
      { label: "Performance", score: psData.performance },
      { label: "Accessibility", score: psData.accessibility },
      { label: "Best Practices", score: psData.bestPractices },
      { label: "SEO", score: psData.seo },
    ];
    const blkGap = 12;
    const blkW = (TW - blkGap * 3) / 4;
    const blkH = 70;
    psScores.forEach((s, i) => {
      const bx = M + P + i * (blkW + blkGap);
      const by = y;
      // Colored block background
      fCol(scoreCol(s.score));
      doc.roundedRect(bx, by, blkW, blkH, 6, 6, "F");
      // Dark overlay for readability
      fCol("#00000088");
      doc.roundedRect(bx, by, blkW, blkH, 6, 6, "F");
      // Score number centered at y+30
      doc.setFont("helvetica", "bold"); doc.setFontSize(26);
      tCol(scoreCol(s.score));
      doc.text(String(s.score), bx + blkW / 2, by + 34, { align: "center" });
      // Label centered at y+50
      doc.setFontSize(8); tCol(WHITE);
      doc.text(s.label, bx + blkW / 2, by + 54, { align: "center" });
    });
    y = psStart + psCardH + GAP;

    // ═══════════════ CORE WEB VITALS ═══════════════
    const cwvCardH = P + 22 + 50 + P;
    checkSpace(cwvCardH);
    const cwvStart = y;
    card(M, y, CW, cwvCardH);
    sectionLabel("CORE WEB VITALS", y);
    y += P + 22;

    const vitals = [
      { label: "LCP", value: psData.lcp },
      { label: "FCP", value: psData.fcp },
      { label: "TBT", value: psData.tbt },
      { label: "CLS", value: psData.cls },
    ];
    vitals.forEach((v, i) => {
      const vx = M + P + i * (blkW + blkGap);
      fCol("#1e1e1e");
      doc.roundedRect(vx, y, blkW, 50, 6, 6, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(14);
      tCol(YELLOW);
      doc.text(String(v.value || "N/A"), vx + blkW / 2, y + 22, { align: "center" });
      doc.setFontSize(8); tCol(MUTED);
      doc.text(v.label, vx + blkW / 2, y + 38, { align: "center" });
    });
    y = cwvStart + cwvCardH + GAP;

    // ═══════════════ SEO HEALTH CHECKLIST ═══════════════
    const seoItems = [
      { label: "Meta Title", passed: siteData.titleLength > 0, detail: siteData.titleLength > 0 ? `${siteData.titleLength} chars` : "Missing" },
      { label: "Meta Description", passed: siteData.descriptionLength > 0, detail: siteData.descriptionLength > 0 ? `${siteData.descriptionLength} chars` : "Missing" },
      { label: "HTTPS Secure", passed: siteData.https, detail: siteData.https ? "Secure" : "Not Secure" },
      { label: "Mobile Responsive", passed: siteData.mobileResponsive, detail: siteData.mobileResponsive ? "Yes" : "No" },
      { label: "Structured Data (Schema)", passed: siteData.hasSchema, detail: siteData.hasSchema ? "Present" : "Missing" },
      { label: "H1 Tag Present", passed: siteData.h1Tags > 0, detail: siteData.h1Tags > 0 ? `${siteData.h1Tags} found` : "None" },
      { label: "Image Alt Text", passed: siteData.missingAlt === 0, detail: siteData.missingAlt > 0 ? `${siteData.missingAlt} missing` : "All tagged" },
    ];
    const seoRowH = 24;
    const seoCardH = P + 22 + seoItems.length * seoRowH + P;
    checkSpace(seoCardH);
    const seoStart = y;
    card(M, y, CW, seoCardH);
    sectionLabel("SEO HEALTH CHECKLIST", y);
    let seoY = y + P + 22;

    seoItems.forEach((item) => {
      // PASS/FAIL text indicator (no unicode)
      doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      tCol(item.passed ? GREEN : RED);
      doc.text(item.passed ? "PASS" : "FAIL", M + P, seoY + 4);

      // Label
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); tCol(WHITE);
      doc.text(item.label, M + P + 36, seoY + 4);

      // Detail on right
      doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      tCol(item.passed ? GREEN : RED);
      doc.text(item.detail, M + CW - P, seoY + 4, { align: "right" });

      seoY += seoRowH;
    });
    y = seoStart + seoCardH + GAP;

    // ═══════════════ AI/GEO VISIBILITY SCORE ═══════════════
    const geoScore = geoData.overallScore;
    const geoCol = geoScore >= 70 ? GREEN : geoScore >= 45 ? YELLOW : RED;
    const geoLabel = geoScore >= 80 ? "Strong Presence" : geoScore >= 60 ? "Moderate Presence" : geoScore >= 40 ? "Developing" : "Needs Improvement";
    const geoCardH = P + 50 + P;
    checkSpace(geoCardH);
    const geoStart = y;
    card(M, y, CW, geoCardH);
    sectionLabel("AI / GEO VISIBILITY SCORE", y);
    const geoInnerY = y + P + 22;

    // Big score
    doc.setFont("helvetica", "bold"); doc.setFontSize(32); tCol(geoCol);
    doc.text(String(geoScore), M + P + 30, geoInnerY + 8, { align: "center" });
    doc.setFontSize(11); tCol(MUTED);
    doc.text("/100", M + P + 52, geoInnerY + 8);

    // Status
    doc.setFontSize(14); tCol(WHITE); doc.setFont("helvetica", "bold");
    doc.text(geoLabel, M + P + 110, geoInnerY);
    doc.setFontSize(9); tCol(MUTED); doc.setFont("helvetica", "normal");
    doc.text("ChatGPT  |  Perplexity  |  Gemini  |  Claude  |  Copilot", M + P + 110, geoInnerY + 16);

    y = geoStart + geoCardH + GAP;

    // ═══════════════ PER-ENGINE BREAKDOWN ═══════════════
    // Pre-calculate card height: measure all engine note lines
    doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    const engineRows = geoData.aiEngines.map((engine: any) => {
      const noteWrapped = doc.splitTextToSize(engine.note || "", TW - 40);
      const noteH = noteWrapped.length * 10;
      return { engine, noteWrapped, rowH: 18 + noteH + 8 };
    });
    const engTotalH = engineRows.reduce((sum: number, r: any) => sum + r.rowH, 0);
    const engCardH = P + 22 + engTotalH + P;
    checkSpace(engCardH);
    const engStart = y;
    card(M, y, CW, engCardH);
    sectionLabel("PER-ENGINE BREAKDOWN", y);
    let engY = y + P + 22;

    engineRows.forEach(({ engine, noteWrapped, rowH }: any) => {
      const eCol = engine.status === "strong" ? GREEN : engine.status === "moderate" ? YELLOW : RED;

      // Name
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); tCol(WHITE);
      doc.text(engine.name, M + P, engY + 4);

      // Score number
      doc.setFontSize(11); tCol(eCol);
      doc.text(String(engine.score), M + P + 120, engY + 4);

      // Bar bg
      const barX = M + P + 145;
      const barMaxW = 160;
      fCol("#1e1e1e"); doc.roundedRect(barX, engY - 3, barMaxW, 8, 4, 4, "F");
      // Bar fill
      fCol(eCol);
      doc.roundedRect(barX, engY - 3, Math.max(4, (engine.score / 100) * barMaxW), 8, 4, 4, "F");

      // Status badge
      doc.setFont("helvetica", "bold"); doc.setFontSize(7);
      const stTxt = engine.status.toUpperCase();
      const stW = doc.getTextWidth(stTxt) + 12;
      fCol(eCol + "22");
      doc.roundedRect(M + CW - P - stW, engY - 5, stW, 14, 7, 7, "F");
      tCol(eCol);
      doc.text(stTxt, M + CW - P - stW / 2, engY + 4, { align: "center" });

      engY += 18;

      // Note (full wrap, no truncation)
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); tCol(MUTED);
      doc.text(noteWrapped, M + P, engY);
      engY += noteWrapped.length * 10 + 8;
    });
    y = engStart + engCardH + GAP;

    // ═══════════════ RECOMMENDATIONS ═══════════════
    recs.forEach((rec: any, i: number) => {
      // Pre-measure all text for accurate card height
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      const descWrapped2 = doc.splitTextToSize(rec.description || "", TW);
      const fixWrapped = doc.splitTextToSize(rec.fix || "", TW - 16);
      doc.setFont("helvetica", "bold"); doc.setFontSize(11);
      const titleWrapped = doc.splitTextToSize(rec.title || "", TW);

      const badgeRowH = 18;
      const titleH = titleWrapped.length * 14;
      const descH2 = descWrapped2.length * 12;
      const fixLabelH = 14;
      const fixTextH = fixWrapped.length * 12;
      const fixBoxH = fixLabelH + fixTextH + 12;
      const recCardH = P + (i === 0 ? 22 : 0) + badgeRowH + titleH + 6 + descH2 + 10 + fixBoxH + P;

      checkSpace(recCardH);
      const recStart = y;
      card(M, y, CW, recCardH);

      if (i === 0) { sectionLabel("RECOMMENDATIONS", y); }
      let ry = y + P + (i === 0 ? 22 : 0);

      // Severity badge
      const sevMap: Record<string, { col: string; bg: string }> = {
        critical: { col: RED, bg: "#3d1515" },
        warning: { col: YELLOW, bg: "#3a2e00" },
        opportunity: { col: GREEN, bg: "#0f2d18" },
      };
      const sev = sevMap[rec.severity] || sevMap.opportunity;
      const sevTxt = (rec.severity || "opportunity").toUpperCase();
      doc.setFont("helvetica", "bold"); doc.setFontSize(8);
      const sevW = doc.getTextWidth(sevTxt) + 14;
      fCol(sev.bg); doc.roundedRect(M + P, ry - 4, sevW, 14, 7, 7, "F");
      tCol(sev.col); doc.text(sevTxt, M + P + 7, ry + 5);

      ry += badgeRowH;

      // Title
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); tCol(WHITE);
      doc.text(titleWrapped, M + P, ry + 2);
      ry += titleH + 6;

      // Description (full wrap)
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); tCol(MUTED);
      doc.text(descWrapped2, M + P, ry);
      ry += descH2 + 10;

      // Fix box
      fCol("#1e1e1e");
      doc.roundedRect(M + P, ry - 4, TW, fixBoxH, 4, 4, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(7); tCol(GREEN);
      doc.text("RECOMMENDED ACTION", M + P + 8, ry + 8);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); tCol("#cccccc");
      doc.text(fixWrapped, M + P + 8, ry + 8 + fixLabelH);

      y = recStart + recCardH + GAP;
    });

    // ═══════════════ FOOTER ═══════════════
    checkSpace(40);
    drawGradientBar(M, y, CW, 2);
    y += 14;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); tCol(MUTED);
    doc.text("Generated by Conversion Intelligence -- avenuez.com", W / 2, y, { align: "center" });

    // Add page numbers to all pages
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      tCol(MUTED);
      doc.text(`Page ${p}`, W - M, H - 24, { align: "right" });
    }

    doc.save(`${siteData.companyName.replace(/[^a-zA-Z0-9]/g, "_")}_Conversion_Intelligence_Report.pdf`);
  };

  return (
    <>
      <div style={{background:"#0a0a0a",height:"100vh",color:"#fff",display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* Header */}
        <div style={{background:"#000",borderBottom:"1px solid #ffffff12",padding:"0 20px",height:48,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span className="gt" style={{fontSize:17,fontWeight:900,letterSpacing:"-0.3px"}}>AVENUE Z</span>
            <span style={{color:"#ffffff20"}}>|</span>
            <span style={{color:"#555",fontSize:12,fontWeight:700,letterSpacing:"0.04em"}}>CONVERSION INTELLIGENCE</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {Object.values(AVENUE_Z.stats).map((v,i)=>(
              <span key={i} style={{background:"#111",border:"1px solid #ffffff10",borderRadius:99,padding:"3px 10px",fontSize:10,color:"#555",fontWeight:700}}>
                <span className="gt">{v}</span>
              </span>
            ))}
            <div style={{width:6,height:6,borderRadius:"50%",background:"#60FF80",marginLeft:4}}/>
            {analysisComplete&&(
              <button onClick={generatePDF} style={{display:"flex",alignItems:"center",gap:5,background:"linear-gradient(135deg,#FFFC60,#60FF80,#60FDFF,#39A0FF,#6034FF)",color:"#000",border:"none",borderRadius:99,padding:"5px 14px",fontSize:10,fontWeight:800,cursor:"pointer",letterSpacing:"0.04em",marginLeft:4,flexShrink:0}}>
                <Download size={11}/> Download PDF
              </button>
            )}
          </div>
        </div>

        {/* Terminal */}
        <div ref={logRef} style={{background:"#000",borderBottom:"1px solid #60FF8022",padding:"0 16px",height:36,display:"flex",alignItems:"center",gap:8,overflowX:"auto",flexShrink:0,whiteSpace:"nowrap"}}>
          <Terminal size={12} color="#60FF80" style={{flexShrink:0}}/>
          {logs.length===0
            ?      <span style={{color:"#60FF8044",fontFamily:"monospace",fontSize:11}}>Conversion Intelligence — Ready. Enter a URL to begin.</span>
            :logs.map((l,i)=><span key={i} style={{color:"#60FF80",fontFamily:"monospace",fontSize:11,marginRight:14}}>
              {l}{i===logs.length-1&&<span className="blink">_</span>}
            </span>)}
        </div>

        {/* URL Bar */}
        <div style={{background:"#050505",borderBottom:"1px solid #ffffff0a",padding:"10px 20px",flexShrink:0}}>
          <div style={{display:"flex",gap:10,marginBottom:loading?8:0}}>
            <div style={{flex:1,display:"flex",alignItems:"center",background:"#111",border:"1px solid #ffffff15",borderRadius:10,padding:"0 14px",gap:10}}>
              <Globe size={14} color="#555"/>
              <input value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!loading&&analyze()}
                placeholder="Enter any website URL… (e.g. nike.com, avenuez.com)"
                style={{flex:1,background:"none",border:"none",color:"#fff",fontSize:13,outline:"none",padding:"10px 0"}}/>
            </div>
            <button onClick={analyze} disabled={loading||!url.trim()} className={!loading&&url.trim()?"gb":""}
              style={{padding:"10px 22px",borderRadius:10,border:"none",fontWeight:800,fontSize:13,letterSpacing:"0.06em",cursor:loading||!url.trim()?"not-allowed":"pointer",color:loading||!url.trim()?"#333":"#000",background:loading||!url.trim()?"#111":undefined,display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
              {loading?<Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>:<Search size={14}/>}
              {loading?"ANALYZING…":"ANALYZE"}
            </button>
          </div>
          <p style={{textAlign:"center",fontSize:11,color:"#8A8A8A",padding:"4px 0",margin:0}}>Scan any website. See exactly where your revenue and reputation are at risk.</p>
          {loading&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{color:"#60FF80",fontSize:11,fontFamily:"monospace",display:"flex",alignItems:"center",gap:6}}>
                  <Loader2 size={10} style={{animation:"spin 1s linear infinite"}}/>{STAGES[stage]||"Processing…"}
                </span>
                <span style={{color:"#444",fontSize:11,fontFamily:"monospace"}}>{Math.round(pct)}% · {elapsed}s</span>
              </div>
              <div style={{height:3,background:"#1a1a1a",borderRadius:99,overflow:"hidden",marginBottom:6}}>
                <div className="gb" style={{height:"100%",width:`${pct}%`,borderRadius:99,transition:"width 0.2s linear"}}/>
              </div>
              <div style={{display:"flex",gap:0}}>
                {["Scrape","PageSpeed","AI Recs","AI/GEO"].map((s,i)=>(
                  <div key={i} style={{flex:1,display:"flex",alignItems:"center",gap:4}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:stage>i+1?"#60FF80":stage===i+1?"#FFFC60":"#2a2a2a",transition:"background 0.3s",flexShrink:0}}/>
                    <span style={{fontSize:10,color:stage>i+1?"#60FF80":stage===i+1?"#FFFC60":"#333",fontWeight:600}}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main 3-col layout */}
        <div style={{flex:1,display:"grid",gridTemplateColumns:"220px 1fr 360px",overflow:"hidden",minHeight:0}}>

          {/* LEFT */}
          <div style={{background:"#080808",borderRight:"1px solid #ffffff08",overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:12}}>

            <div style={{background:"#141414",border:"1px solid #ffffff0a",borderRadius:14,padding:14}}>
              <div style={{fontSize:9,color:"#444",fontWeight:800,letterSpacing:"0.12em",marginBottom:10}}>COMPANY PROFILE</div>
              {siteData?(
                <div className="fi">
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <div style={{width:34,height:34,borderRadius:10,background:"#1e1e1e",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:"1px solid #ffffff0a"}}>
                      <Globe size={15} color="#39A0FF"/>
                    </div>
                    <div style={{minWidth:0}}>
                      <div style={{color:"#fff",fontWeight:800,fontSize:13,lineHeight:1.2,marginBottom:2}}>{siteData.companyName}</div>
                      <a href={siteData.url} target="_blank" rel="noreferrer" style={{color:"#444",fontSize:10,display:"flex",alignItems:"center",gap:3,textDecoration:"none"}}>
                        {new URL(siteData.url).hostname}<ExternalLink size={8}/>
                      </a>
                    </div>
                  </div>
                  {siteData.description&&<p style={{color:"#888",fontSize:11,lineHeight:1.6,marginBottom:8}}>{siteData.description}</p>}
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {siteData.industry&&<span style={{background:"#39A0FF15",color:"#39A0FF",fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:99,border:"1px solid #39A0FF25",display:"inline-block",maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",verticalAlign:"middle"}}>{siteData.industry}</span>}
                    <span style={{background:siteData.https?"#0f2d18":"#1a0a0a",color:siteData.https?"#60FF80":"#FF6060",fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:99,border:`1px solid ${siteData.https?"#60FF8030":"#FF606030"}`,flexShrink:0}}>{siteData.https?"HTTPS":"HTTP"}</span>
                  </div>
                  {siteData.primaryCTA&&<div style={{marginTop:10,background:"#1e1e1e",borderRadius:8,padding:"8px 10px"}}><div style={{color:"#444",fontSize:9,fontWeight:700,letterSpacing:"0.08em",marginBottom:3}}>PRIMARY CTA</div><div style={{color:"#ccc",fontSize:11}}>{siteData.primaryCTA}</div></div>}
                </div>
              ):loading?(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <div className="shimmer" style={{height:34,borderRadius:8}}/><div className="shimmer" style={{height:50,borderRadius:8}}/><div className="shimmer" style={{height:24,borderRadius:8}}/>
                </div>
              ):<div style={{color:"#333",fontSize:12,textAlign:"center",padding:"16px 0"}}>Awaiting analysis…</div>}
            </div>

            <div style={{background:"#141414",border:"1px solid #ffffff0a",borderRadius:14,padding:14}}>
              <div style={{fontSize:9,color:"#444",fontWeight:800,letterSpacing:"0.12em",marginBottom:10}}>AVZ SERVICES</div>
              {[["Performance Media","#60FF80"],["Earned Media","#39A0FF"],["Owned Media","#FFFC60"]].map(([s,c],i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:i<2?"1px solid #ffffff07":"none"}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:c,flexShrink:0}}/>
                  <span style={{color:"#aaa",fontSize:12}}>{s}</span>
                </div>
              ))}
            </div>

            <div style={{background:"#141414",border:"1px solid #ffffff0a",borderRadius:14,padding:14}}>
              <div style={{fontSize:9,color:"#444",fontWeight:800,letterSpacing:"0.12em",marginBottom:10}}>COMPETITOR INTEL</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {AVENUE_Z.competitors.map((c,i)=>(
                  <span key={i} style={{background:"#1e1e1e",border:"1px solid #ffffff0a",borderRadius:99,padding:"3px 8px",fontSize:10,color:"#555",fontWeight:600}}>
                    {c.split(".")[0]}
                  </span>
                ))}
              </div>
            </div>

            <div style={{background:"#141414",border:"1px solid #ffffff0a",borderRadius:14,padding:14}}>
              <div style={{fontSize:9,color:"#444",fontWeight:800,letterSpacing:"0.12em",marginBottom:10}}>CASE STUDIES</div>
              {AVENUE_Z.caseStudies.slice(0,5).map((cs,i)=>(
                <div key={i} style={{padding:"6px 0",borderBottom:i<4?"1px solid #ffffff07":"none"}}>
                  <div style={{color:"#ccc",fontSize:11,fontWeight:700}}>{cs.client}</div>
                  <div style={{color:"#60FF80",fontSize:10,marginTop:1}}>{cs.result}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CENTER */}
          <div style={{background:"#0d0d0d",display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{display:"flex",borderBottom:"1px solid #ffffff08",flexShrink:0}}>
              {["health","links","ai-geo","passed"].map(t=>(
                <button key={t} onClick={()=>setTab(t)}
                  style={{padding:"12px 16px",background:"none",border:"none",borderBottom:tab===t?"2px solid #FFFC60":"2px solid transparent",color:tab===t?"#FFFC60":"#444",fontWeight:700,fontSize:11,cursor:"pointer",textTransform:"uppercase",letterSpacing:"0.08em",transition:"color 0.2s"}}>
                  {t==="ai-geo"?"AI/GEO":t==="passed"?"Passed ✓":t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>

            <div style={{flex:1,overflowY:"auto",padding:16}}>
              {tab==="health"&&(
                <div className="fi">
                  <div style={{background:"#141414",border:"1px solid #ffffff0a",borderRadius:14,padding:20,marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                      <div style={{fontSize:9,color:"#444",fontWeight:800,letterSpacing:"0.12em"}}>PAGESPEED SCORES</div>
                      {psData&&<span style={{fontSize:10,background:psData.live?"#0f2d18":"#3a2e00",color:psData.live?"#60FF80":"#FFFC60",padding:"3px 10px",borderRadius:99,fontWeight:700,border:`1px solid ${psData.live?"#60FF8030":"#FFFC6030"}`}}>{psData.live?"● LIVE DATA":"⚡ AI ESTIMATED"}</span>}
                    </div>
                    {loading&&!psData?(
                      <div style={{display:"flex",gap:24,justifyContent:"center"}}>
                        {[1,2,3,4].map(i=><div key={i} className="shimmer" style={{width:90,height:110,borderRadius:12}}/>)}
                      </div>
                    ):(
                      <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
                        <Gauge score={psData?.performance} label="Performance"/>
                        <Gauge score={psData?.accessibility} label="Accessibility"/>
                        <Gauge score={psData?.bestPractices} label="Best Practices"/>
                        <Gauge score={psData?.seo} label="SEO"/>
                      </div>
                    )}
                  </div>

                  {(psData||loading)&&(
                    <div style={{background:"#141414",border:"1px solid #ffffff0a",borderRadius:14,padding:20,marginBottom:14}}>
                      <div style={{fontSize:9,color:"#444",fontWeight:800,letterSpacing:"0.12em",marginBottom:14}}>CORE WEB VITALS</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:10}}>
                        {loading&&!psData
                          ?[1,2,3,4].map(i=><div key={i} className="shimmer" style={{height:60,borderRadius:10}}/>)
                          :[["LCP",psData?.lcp,"Largest Contentful Paint"],["FCP",psData?.fcp,"First Contentful Paint"],["TBT",psData?.tbt,"Total Blocking Time"],["CLS",psData?.cls,"Cumulative Layout Shift"]]
                            .map(([k,v,l])=><VitalCard key={k} label={k} value={v} fullName={l}/>)
                        }
                      </div>
                    </div>
                  )}

                  <div style={{background:"#141414",border:"1px solid #ffffff0a",borderRadius:14,padding:20}}>
                    <div style={{fontSize:9,color:"#444",fontWeight:800,letterSpacing:"0.12em",marginBottom:14}}>SEO HEALTH CHECKLIST</div>
                    {loading&&!siteData
                      ?[1,2,3,4,5,6,7].map(i=><div key={i} className="shimmer" style={{height:30,borderRadius:8,marginBottom:6}}/>)
                      :siteData?(
                        <>
                          <ChkItem label="Meta Title" passed={siteData.titleLength>0} detail={siteData.titleLength>0?`${siteData.titleLength} chars`:"Missing"}/>
                          <ChkItem label="Meta Description" passed={siteData.descriptionLength>0} detail={siteData.descriptionLength>0?`${siteData.descriptionLength} chars`:"Missing"}/>
                          <ChkItem label="HTTPS Secure" passed={siteData.https}/>
                          <ChkItem label="Mobile Responsive" passed={siteData.mobileResponsive}/>
                          <ChkItem label="Structured Data (Schema)" passed={siteData.hasSchema}/>
                          <ChkItem label="H1 Tag Present" passed={siteData.h1Tags>0} detail={siteData.h1Tags>0?`${siteData.h1Tags} found`:"None"}/>
                          <ChkItem label="Image Alt Text" passed={siteData.missingAlt===0} detail={siteData.missingAlt>0?`${siteData.missingAlt} missing`:"All tagged"}/>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
                            <div style={{background:"#1e1e1e",borderRadius:10,padding:14,border:"1px solid #ffffff08"}}>
                              <div style={{color:"#39A0FF",fontSize:22,fontWeight:900}}>{siteData.internalLinks}</div>
                              <div style={{color:"#555",fontSize:11,marginTop:3,fontWeight:600}}>Internal Links</div>
                            </div>
                            <div style={{background:"#1e1e1e",borderRadius:10,padding:14,border:"1px solid #ffffff08"}}>
                              <div style={{color:"#60FDFF",fontSize:22,fontWeight:900}}>{siteData.externalLinks}</div>
                              <div style={{color:"#555",fontSize:11,marginTop:3,fontWeight:600}}>External Links</div>
                            </div>
                          </div>
                        </>
                      ):<div style={{color:"#333",fontSize:13,textAlign:"center",padding:"24px 0"}}>Run an analysis to see SEO health</div>}
                  </div>
                </div>
              )}

              {tab==="links"&&(
                <div className="fi">
                  <div style={{background:"#141414",border:"1px solid #ffffff0a",borderRadius:14,padding:20}}>
                    <div style={{fontSize:9,color:"#444",fontWeight:800,letterSpacing:"0.12em",marginBottom:16}}>LINK PROFILE</div>
                    {siteData?(
                      <>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
                          <div style={{background:"#1e1e1e",borderRadius:12,padding:20,textAlign:"center",border:"1px solid #ffffff08"}}>
                            <div style={{color:"#39A0FF",fontSize:36,fontWeight:900,lineHeight:1}}>{siteData.internalLinks}</div>
                            <div style={{color:"#666",fontSize:12,marginTop:6,fontWeight:600}}>Internal Links</div>
                            <div style={{color:"#444",fontSize:11,marginTop:2}}>Same-domain navigation</div>
                          </div>
                          <div style={{background:"#1e1e1e",borderRadius:12,padding:20,textAlign:"center",border:"1px solid #ffffff08"}}>
                            <div style={{color:"#60FDFF",fontSize:36,fontWeight:900,lineHeight:1}}>{siteData.externalLinks}</div>
                            <div style={{color:"#666",fontSize:12,marginTop:6,fontWeight:600}}>External Links</div>
                            <div style={{color:"#444",fontSize:11,marginTop:2}}>Outbound references</div>
                          </div>
                        </div>
                        <div style={{background:"#1e1e1e",borderRadius:10,padding:14,border:"1px solid #ffffff08"}}>
                          <div style={{display:"flex",gap:3,marginBottom:10,height:8,borderRadius:99,overflow:"hidden"}}>
                            <div style={{flex:siteData.internalLinks||1,background:"#39A0FF",transition:"flex 1s"}}/>
                            <div style={{flex:siteData.externalLinks||1,background:"#60FDFF",transition:"flex 1s"}}/>
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#555",fontWeight:600}}>
                            <span><span style={{color:"#39A0FF"}}>● </span>Internal ({Math.round(siteData.internalLinks/(siteData.internalLinks+siteData.externalLinks||1)*100)}%)</span>
                            <span><span style={{color:"#60FDFF"}}>● </span>External ({Math.round(siteData.externalLinks/(siteData.internalLinks+siteData.externalLinks||1)*100)}%)</span>
                          </div>
                        </div>
                        {siteData.keyPages?.length>0&&(
                          <div style={{marginTop:14}}>
                            <div style={{fontSize:9,color:"#444",fontWeight:800,letterSpacing:"0.12em",marginBottom:10}}>KEY PAGES FOUND</div>
                            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                              {siteData.keyPages.map((p,i)=>(
                                <span key={i} style={{background:"#1e1e1e",border:"1px solid #ffffff0a",borderRadius:99,padding:"4px 10px",fontSize:11,color:"#888"}}>{p}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ):<div style={{color:"#333",fontSize:13,textAlign:"center",padding:"40px 0"}}>Run an analysis to see link data</div>}
                  </div>
                </div>
              )}

              {tab==="ai-geo"&&(
                <div className="fi">
                  {!geoData&&!loading&&(
                    <div style={{background:"#141414",border:"1px solid #ffffff0a",borderRadius:14,padding:40,textAlign:"center"}}>
                      <div style={{fontSize:36,marginBottom:12}}>🤖</div>
                      <div className="gt" style={{fontSize:18,fontWeight:900,marginBottom:8}}>AI Visibility Scoring</div>
                      <div style={{color:"#555",fontSize:13}}>Run an analysis to see AI search visibility scores.</div>
                    </div>
                  )}
                  {loading&&!geoData&&(
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {[100,70,70,90].map((h,i)=><div key={i} className="shimmer" style={{height:h,borderRadius:12}}/>)}
                    </div>
                  )}
                  {geoData&&(
                    <>
                      <div style={{background:"#141414",border:"1px solid #ffffff0a",borderRadius:14,padding:20,marginBottom:14,display:"flex",alignItems:"center",gap:20}}>
                        <div style={{flexShrink:0}}>
                          <svg width={96} height={96}>
                            <circle cx={48} cy={48} r={40} fill="none" stroke="#1e1e1e" strokeWidth={8}/>
                            <circle cx={48} cy={48} r={40} fill="none"
                              stroke={geoData.overallScore>=70?"#60FF80":geoData.overallScore>=45?"#FFFC60":"#FF6060"}
                              strokeWidth={8} strokeLinecap="round"
                              strokeDasharray={2*Math.PI*40}
                              strokeDashoffset={2*Math.PI*40*(1-geoData.overallScore/100)}
                              transform="rotate(-90 48 48)" style={{transition:"stroke-dashoffset 1.2s ease"}}/>
                            <text x="48" y="44" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={20} fontWeight={900}>{geoData.overallScore}</text>
                            <text x="48" y="62" textAnchor="middle" fill="#555" fontSize={9} fontWeight={600}>/100</text>
                          </svg>
                        </div>
                        <div>
                          <div style={{fontSize:9,color:"#444",fontWeight:800,letterSpacing:"0.12em",marginBottom:6}}>AI SEARCH VISIBILITY</div>
                          <div className="gt" style={{fontSize:20,fontWeight:900,lineHeight:1.2,marginBottom:6}}>
                            {geoData.overallScore>=80?"Strong Presence":geoData.overallScore>=60?"Moderate Presence":geoData.overallScore>=40?"Developing":"Needs Improvement"}
                          </div>
                          <div style={{color:"#555",fontSize:11}}>ChatGPT · Perplexity · Gemini · Claude · Copilot</div>
                          <div style={{color:"#44444488",fontSize:9,marginTop:8,lineHeight:1.5,fontStyle:"italic"}}>Scores are data-informed predictions based on real site signals. Not live AI engine queries.</div>
                        </div>
                      </div>

                      <div style={{background:"#141414",border:"1px solid #ffffff0a",borderRadius:14,padding:20,marginBottom:14}}>
                        <div style={{fontSize:9,color:"#444",fontWeight:800,letterSpacing:"0.12em",marginBottom:14}}>PER-ENGINE SCORES</div>
                        <div style={{display:"flex",flexDirection:"column",gap:12}}>
                          {geoData.aiEngines.map((e,i)=>{
                            const col=e.status==="strong"?"#60FF80":e.status==="moderate"?"#FFFC60":"#FF6060";
                            const ico={"ChatGPT":"🤖","Perplexity":"🔍","Google Gemini":"✨","Claude":"🔮","Bing Copilot":"🪟"}[e.name]||"🤖";
                            return (
                              <div key={i} style={{display:"flex",alignItems:"center",gap:12}}>
                                <span style={{fontSize:16,flexShrink:0,width:22,textAlign:"center"}}>{ico}</span>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                                    <span style={{color:"#ccc",fontSize:12,fontWeight:700}}>{e.name}</span>
                                    <span style={{color:col,fontSize:12,fontWeight:800}}>{e.score}</span>
                                  </div>
                                  <div style={{height:4,background:"#1e1e1e",borderRadius:99,overflow:"hidden",marginBottom:4}}>
                                    <div style={{height:"100%",width:`${e.score}%`,background:col,borderRadius:99,transition:"width 1.2s ease"}}/>
                                  </div>
                                  <div style={{color:"#555",fontSize:10,lineHeight:1.4}}>{e.note}</div>
                                </div>
                                <span style={{background:`${col}18`,color:col,fontSize:9,fontWeight:800,padding:"3px 8px",borderRadius:99,flexShrink:0,textTransform:"uppercase",border:`1px solid ${col}28`}}>{e.status}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{background:"#141414",border:"1px solid #ffffff0a",borderRadius:14,padding:20,marginBottom:14}}>
                        <div style={{fontSize:9,color:"#444",fontWeight:800,letterSpacing:"0.12em",marginBottom:12}}>AEO READINESS INDICATORS</div>
                        {geoData.signals.map((s,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<geoData.signals.length-1?"1px solid #ffffff07":"none"}}>
                            <div style={{width:20,height:20,borderRadius:"50%",background:s.passed?"#0f2d18":"#3d1515",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                              {s.passed?<Check size={11} color="#60FF80"/>:<X size={11} color="#FF6060"/>}
                            </div>
                            <span style={{color:"#ccc",fontSize:12,flex:1}}>{s.label}</span>
                            <span style={{color:"#555",fontSize:11}}>{s.detail}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{background:"#141414",border:"1px solid #ffffff0a",borderRadius:14,padding:20}}>
                        <div style={{fontSize:9,color:"#444",fontWeight:800,letterSpacing:"0.12em",marginBottom:12}}>TOP AEO OPPORTUNITIES</div>
                        {geoData.topOpportunities.map((op,i)=>(
                          <div key={i} style={{background:"#1e1e1e",borderRadius:10,padding:12,marginBottom:8,border:"1px solid #ffffff08"}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                              <span style={{background:op.priority==="high"?"#3d1515":"#3a2e00",color:op.priority==="high"?"#FF6060":"#FFFC60",fontSize:9,fontWeight:800,padding:"3px 8px",borderRadius:99,textTransform:"uppercase",letterSpacing:"0.06em"}}>{op.priority}</span>
                              <span style={{color:"#fff",fontSize:12,fontWeight:700}}>{op.title}</span>
                            </div>
                            <p style={{color:"#777",fontSize:12,lineHeight:1.6,margin:0}}>{op.description}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {tab==="passed"&&(
                <div className="fi">
                  <div style={{background:"#141414",border:"1px solid #ffffff0a",borderRadius:14,padding:20}}>
                    <div style={{fontSize:9,color:"#444",fontWeight:800,letterSpacing:"0.12em",marginBottom:14}}>PASSING CHECKS ({passed.length})</div>
                    {passed.length>0?passed.map((c,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<passed.length-1?"1px solid #ffffff07":"none"}}>
                        <div style={{width:20,height:20,borderRadius:"50%",background:"#0f2d18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <Check size={12} color="#60FF80"/>
                        </div>
                        <span style={{color:"#ccc",fontSize:13,flex:1}}>{c.label}</span>
                        <span style={{color:"#60FF80",fontSize:12,fontWeight:700}}>{c.detail}</span>
                      </div>
                    )):<div style={{color:"#333",fontSize:13,textAlign:"center",padding:"40px 0"}}>{siteData?"No passing checks found.":"Run an analysis to see passed checks."}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div style={{background:"#080808",borderLeft:"1px solid #ffffff08",display:"flex",flexDirection:"column",overflow:"hidden"}}>

            {/* Recs — 55% height */}
            <div style={{flex:"0 0 55%",overflowY:"auto",padding:14,borderBottom:"1px solid #ffffff08"}}>
              <div style={{fontSize:9,color:"#444",fontWeight:800,letterSpacing:"0.12em",marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
                <Zap size={11} color="#FFFC60"/> CONVERSION INTELLIGENCE FEED
              </div>
              {loading&&recs.length===0?(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {[1,2,3,4].map(i=><div key={i} className="shimmer" style={{height:64,borderRadius:12}}/>)}
                </div>
              ):recs.length>0?(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {recs.map((rec,i)=>(
                    <div key={i} className="fi" style={{background:"#141414",border:"1px solid #ffffff0a",borderRadius:12,overflow:"hidden",cursor:"pointer",transition:"border-color 0.2s"}}
                      onClick={()=>setExpandedRec(expandedRec===i?null:i)}>
                      <div style={{padding:"12px 14px",display:"flex",alignItems:"flex-start",gap:10}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,flexWrap:"wrap"}}>
                            <Badge severity={rec.severity}/>
                          </div>
                          <div style={{color:"#e0e0e0",fontSize:12,fontWeight:700,lineHeight:1.4}}>{rec.title}</div>
                        </div>
                        {expandedRec===i?<ChevronDown size={14} color="#444" style={{flexShrink:0,marginTop:2}}/>:<ChevronRight size={14} color="#444" style={{flexShrink:0,marginTop:2}}/>}
                      </div>
                      {expandedRec===i&&(
                        <div className="fi" style={{padding:"0 14px 14px",borderTop:"1px solid #ffffff07"}}>
                          <p style={{color:"#888",fontSize:12,lineHeight:1.7,margin:"10px 0 10px"}}>{rec.description}</p>
                          <div style={{background:"#1e1e1e",borderRadius:8,padding:"10px 12px",border:"1px solid #60FF8018",marginBottom:8}}>
                            <div style={{color:"#60FF80",fontSize:9,fontWeight:800,letterSpacing:"0.1em",marginBottom:5}}>RECOMMENDED ACTION</div>
                            <p style={{color:"#ccc",fontSize:12,lineHeight:1.6,margin:0}}>{rec.fix}</p>
                          </div>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:4}}>
                            <span style={{color:rec.impact==="high"?"#60FF80":rec.impact==="medium"?"#FFFC60":"#777",fontSize:11,fontWeight:700,textTransform:"uppercase"}}>
                              {rec.impact} impact
                            </span>
                            {(rec.severity==="critical"||rec.severity==="warning")&&(
                              <a href="https://avenuez.com/contact" target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
                                style={{display:"inline-flex",alignItems:"center",gap:5,background:"linear-gradient(135deg,#39A0FF,#6034FF)",color:"#fff",fontSize:10,fontWeight:800,padding:"5px 12px",borderRadius:99,textDecoration:"none",letterSpacing:"0.03em",transition:"opacity 0.2s",cursor:"pointer",overflow:"visible",whiteSpace:"nowrap",flexShrink:0}}>
                                <span style={{color:"#fff"}}>{"Contact Avenue Z \u2192"}</span> <ExternalLink size={9} color="#fff"/>
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ):(
                <div style={{color:"#2a2a2a",fontSize:12,textAlign:"center",padding:"40px 0",lineHeight:2}}>
                  <TrendingUp size={22} color="#2a2a2a" style={{marginBottom:8}}/>
                  <div>Enter a URL above</div><div>to get AI-powered recommendations</div>
                </div>
              )}
            </div>

            {/* Chat — 45% height */}
            <div style={{flex:"0 0 45%",display:"flex",flexDirection:"column",minHeight:0}}>
              <div style={{padding:"10px 14px",borderBottom:"1px solid #ffffff07",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <MessageSquare size={11} color="#39A0FF"/>
                <span style={{fontSize:9,color:"#444",fontWeight:800,letterSpacing:"0.12em"}}>CHAT WITH CONVERSION INTELLIGENCE</span>
              </div>
              <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:10}}>
                {chat.length===0&&(
                  <div style={{color:"#2a2a2a",fontSize:12,textAlign:"center",marginTop:24,lineHeight:1.8}}>
                    Ask anything about the analysis,<br/>competitors, or growth strategy…
                  </div>
                )}
                {chat.map((m,i)=>(
                  <div key={i} className="fi" style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                    <div style={{maxWidth:"88%",background:m.role==="user"?"#1e1e1e":"#141414",border:`1px solid ${m.role==="user"?"#ffffff0f":"#39A0FF18"}`,borderRadius:m.role==="user"?"12px 12px 4px 12px":"12px 12px 12px 4px",padding:"10px 13px",fontSize:12,color:m.role==="user"?"#ddd":"#bbb",lineHeight:1.6}}>
                      {m.role==="assistant"&&<div style={{color:"#39A0FF",fontSize:9,fontWeight:800,letterSpacing:"0.1em",marginBottom:5}}>Conversion Intelligence</div>}
                      {m.content}
                    </div>
                  </div>
                ))}
                {chatLoading&&(
                  <div style={{display:"flex",justifyContent:"flex-start"}}>
                    <div style={{background:"#141414",border:"1px solid #39A0FF18",borderRadius:"12px 12px 12px 4px",padding:"10px 14px"}}>
                      <div style={{color:"#39A0FF",fontSize:9,fontWeight:800,letterSpacing:"0.1em",marginBottom:5}}>Conversion Intelligence</div>
                      <div style={{display:"flex",gap:4}}>
                        {[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#39A0FF",animation:`bl ${0.8+i*0.15}s step-end infinite`}}/>)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{padding:"10px 14px 14px",flexShrink:0}}>
                <div style={{display:"flex",gap:8,background:"#111",border:"1px solid #ffffff12",borderRadius:12,padding:"8px 8px 8px 14px",alignItems:"flex-end"}}>
                  <input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendChat()}
                    placeholder="Ask Conversion Intelligence anything…"
                    style={{flex:1,background:"none",border:"none",color:"#ddd",fontSize:12,outline:"none",resize:"none",lineHeight:1.5}}/>
                  <button onClick={sendChat} disabled={chatLoading||!chatIn.trim()}
                    style={{width:32,height:32,borderRadius:8,border:"none",cursor:chatLoading||!chatIn.trim()?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",background:chatLoading||!chatIn.trim()?"#1e1e1e":"linear-gradient(135deg,#FFFC60,#60FF80)",flexShrink:0}}>
                    <Send size={13} color={chatLoading||!chatIn.trim()?"#333":"#000"}/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
