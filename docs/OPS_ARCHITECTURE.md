# TableIA — Agentic Operations Architecture
**Inspired by:** OpenClaw 5-Agent System (Larry/YouTube)
**Date:** 2026-04-04
**Status:** CONCEPT

---

## What We Saw in the Video

A 5-agent OpenClaw system:
- **Alex** (Researcher) → **Maya** (Content) → **Jordan** (Marketing) → **Dev** (Developer) → **Sam** (Social Media)
- Each agent has dedicated Discord channel
- All activity logged to Supabase (VPS stays light)
- Mission control dashboard shows: agent name, task, model used, status, timestamp
- Pipeline cascade: one agent triggers the next automatically
- Personal Kanban: To Do / Doing / Done

---

## Why This Changes Everything for TableIA

Current problem: Bidi is doing everything manually
- Research restaurants → done by hand
- Writing outreach → done by hand
- Building features → Codex, but manual coordination
- Posting on social → done by hand

With this architecture:
- Agents do the work
- Bidi supervises from dashboard
- Supabase keeps everything fast and light
- Discord channels = clean communication

---

## Proposed TableIA Agent Team

| Agent | Role | Tasks |
|-------|------|-------|
| **Scout** | Restaurant Researcher | Find Lisbon restaurants, scrape TheFork, build lead list |
| **Pitch** | Sales Outreach | Write + send WhatsApp/email/IG messages to restaurants |
| **Dev** | Developer | Build features in TableIA when Bidi approves |
| **Doc** | Documentation | Update specs, README, onboarding docs |
| **Gram** | Social Media | Post updates about TableIA progress |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    DISCORD                           │
│  #scout  #pitch  #dev  #doc  #gram  #pipeline     │
└─────────────────────────────────────────────────────┘
         │        │       │      │      │
         ▼        ▼       ▼      ▼      ▼
┌─────────────────────────────────────────────────────┐
│                  SUPABASE                           │
│  agent_logs  │  to_dos  │  restaurants  │  tasks   │
└─────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│              MISSION CONTROL DASHBOARD              │
│  Agent │ Task │ Model │ Status │ Time │             │
│  Scout │ Research restaurants │ Codex │ Done │ 10:30  │
│  Pitch │ Send outreach │ GPT-4o │ Doing │ 10:45  │
└─────────────────────────────────────────────────────┘
```

---

## How It Works

### Daily Flow

1. **Bidi** opens Discord → sees agent activity
2. **Scout** researches restaurants → logs to Supabase → posts summary to #scout
3. **Pitch** reads Scout's research → sends outreach → logs results
4. **Dev** builds features when Bidi approves via #dev channel
5. **Dashboard** shows everything in real-time

### Pipeline Cascade (Automatic)

```
Bidi: "Scout, find me 10 restaurants in Alfama"

Scout researches → logs to Supabase → posts to #scout
    ↓
Pitch sees results → "I'll outreach to these 10"
    ↓
Pitch sends messages → logs responses
    ↓
Bidi approves Dev task → Dev builds → logs progress
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

1. **Set up Supabase** (reuse from TableIA)
2. **Create Discord server** with channels: #scout, #pitch, #dev, #doc, #gram, #pipeline
3. **Configure 5 OpenClaw agents** with personality + memory
4. **Build dashboard** (single HTML file, Supabase-connected)
5. **Test pipeline**: Scout finds restaurants → Pitch sends outreach

---

## Priority

**This is for when TableIA is generating revenue.** Not now — now we build and sell.

Once 3-5 restaurants are paying → implement this ops system.

---

## Reference

- Video: OpenClaw 5-Agent System (Larry)
- Supabase: reuse credentials from TableIA
- Dashboard: single HTML file (Tailwind + Vanilla JS + Supabase)
- Discord: private server, 6 channels
