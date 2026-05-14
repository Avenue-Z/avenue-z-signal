# Avenue Z Signal

AI-powered website audit and conversion intelligence tool. Crawls any URL, scores it across SEO, GEO (AI search readiness), Core Web Vitals, and conversion performance, and exports a PDF report with prioritized recommendations.

Built as an internal strategy tool for Avenue Z's CMO and growth team.

## What It Audits

- **GEO Score** — AI search citability, llms.txt, AI crawler access (GPTBot, ClaudeBot, PerplexityBot), brand authority signals
- **Core Web Vitals** — LCP, FCP, TBT, CLS scored against Google's gold-standard thresholds
- **Technical SEO** — issues, schema markup, meta tags
- **Conversion Intelligence** — full-funnel analysis benchmarked against Avenue Z client results
- **Competitor comparison** — cross-references against major agency and competitor sites

## Stack

- Next.js 14, TypeScript, Tailwind CSS
- Groq API (Llama 3.3 70B Versatile) — AI analysis
- Firecrawl API — page content extraction
- Google PageSpeed Insights API — Core Web Vitals
- jsPDF — client-ready PDF report generation

## Setup

```bash
npm install
cp .env.local.example .env.local
# Add: GROQ_API_KEY, FIRECRAWL_API_KEY
npm run dev
```

## API Routes

| Route | Purpose |
|-------|---------|
| `/api/claude` | AI analysis via Groq/Llama |
| `/api/firecrawl` | Page content extraction |
| `/api/pagespeed` | Core Web Vitals from Google |
| `/api/webhook` | Zapier integration |