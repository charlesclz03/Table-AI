# Gustia â€” Agentic Operations Architecture
**Inspired by:** OpenClaw 5-Agent System (Larry/YouTube)
**Date:** 2026-04-04
**Status:** CONCEPT

---

## What We Saw in the Video

A 5-agent OpenClaw system:
- **Alex** (Researcher) â†’ **Maya** (Content) â†’ **Jordan** (Marketing) â†’ **Dev** (Developer) â†’ **Sam** (Social Media)
- Each agent has dedicated Discord channel
- All activity logged to Supabase (VPS stays light)
- Mission control dashboard shows: agent name, task, model used, status, timestamp
- Pipeline cascade: one agent triggers the next automatically
- Personal Kanban: To Do / Doing / Done

---

## Why This Changes Everything for Gustia

Current problem: Bidi is doing everything manually
- Research restaurants â†’ done by hand
- Writing outreach â†’ done by hand
- Building features â†’ Codex, but manual coordination
- Posting on social â†’ done by hand

With this architecture:
- Agents do the work
- Bidi supervises from dashboard
- Supabase keeps everything fast and light
- Discord channels = clean communication

---

## Proposed Gustia Agent Team

| Agent | Role | Tasks |
|-------|------|-------|
| **Scout** | Restaurant Researcher | Find Lisbon restaurants, scrape TheFork, build lead list |
| **Pitch** | Sales Outreach | Write + send WhatsApp/email/IG messages to restaurants |
| **Dev** | Developer | Build features in Gustia when Bidi approves |
| **Doc** | Documentation | Update specs, README, onboarding docs |
| **Gram** | Social Media | Post updates about Gustia progress |

---

## Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    DISCORD                           â”‚
â”‚  #scout  #pitch  #dev  #doc  #gram  #pipeline     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚        â”‚       â”‚      â”‚      â”‚
         â–¼        â–¼       â–¼      â–¼      â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                  SUPABASE                           â”‚
â”‚  agent_logs  â”‚  to_dos  â”‚  restaurants  â”‚  tasks   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚
         â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚              MISSION CONTROL DASHBOARD              â”‚
â”‚  Agent â”‚ Task â”‚ Model â”‚ Status â”‚ Time â”‚             â”‚
â”‚  Scout â”‚ Research restaurants â”‚ Codex â”‚ Done â”‚ 10:30  â”‚
â”‚  Pitch â”‚ Send outreach â”‚ GPT-4o â”‚ Doing â”‚ 10:45  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## How It Works

### Daily Flow

1. **Bidi** opens Discord â†’ sees agent activity
2. **Scout** researches restaurants â†’ logs to Supabase â†’ posts summary to #scout
3. **Pitch** reads Scout's research â†’ sends outreach â†’ logs results
4. **Dev** builds features when Bidi approves via #dev channel
5. **Dashboard** shows everything in real-time

### Pipeline Cascade (Automatic)

```
Bidi: "Scout, find me 10 restaurants in Alfama"

Scout researches â†’ logs to Supabase â†’ posts to #scout
    â†“
Pitch sees results â†’ "I'll outreach to these 10"
    â†“
Pitch sends messages â†’ logs responses
    â†“
Bidi approves Dev task â†’ Dev builds â†’ logs progress
```

---

## Supabase Schema

```sql
-- Agent activity logs
CREATE TABLE agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  task_description TEXT,
  model_used TEXT,
  status TEXT, -- 'running' | 'done' | 'error'
  created_at TIMESTAMP DEFAULT now()
);

-- Personal todo tracker
CREATE TABLE to_dos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT, -- 'research' | 'sales' | 'build' | 'marketing'
  priority TEXT, -- 'urgent' | 'normal' | 'someday'
  status TEXT, -- 'todo' | 'doing' | 'done'
  created_at TIMESTAMP DEFAULT now()
);

-- Restaurant leads
CREATE TABLE restaurants_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  address TEXT,
  rating NUMERIC,
  thefork_url TEXT,
  status TEXT, -- 'new' | 'contacted' | 'interested' | 'closed'
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## Next Steps

1. **Set up Supabase** (reuse from Gustia)
2. **Create Discord server** with channels: #scout, #pitch, #dev, #doc, #gram, #pipeline
3. **Configure 5 OpenClaw agents** with personality + memory
4. **Build dashboard** (single HTML file, Supabase-connected)
5. **Test pipeline**: Scout finds restaurants â†’ Pitch sends outreach

---

## Priority

**This is for when Gustia is generating revenue.** Not now â€” now we build and sell.

Once 3-5 restaurants are paying â†’ implement this ops system.

---

## Reference

- Video: OpenClaw 5-Agent System (Larry)
- Supabase: reuse credentials from Gustia
- Dashboard: single HTML file (Tailwind + Vanilla JS + Supabase)
- Discord: private server, 6 channels
