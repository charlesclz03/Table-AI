# Gustia - Supabase Schema
**Date:** 2026-04-04

---

## Context

This SQL is for the Gustia product tables in Supabase.
The current Prisma schema in this repo still covers the starter's NextAuth and generic subscription tables.

Run each statement below in the Supabase SQL Editor.

---

## SQL

### 1. Restaurants

```sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  soul_md TEXT,
  rules_md TEXT,
  menu_json JSONB DEFAULT '[]',
  quiz_answers JSONB DEFAULT '{}',
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'trial',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 2. Conversations

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number TEXT,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 3. Enable RLS

```sql
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
```

### 4. Policies

```sql
CREATE POLICY "restaurants_public_read" ON restaurants FOR SELECT USING (true);
CREATE POLICY "restaurants_auth_write" ON restaurants FOR INSERT WITH CHECK (true);
CREATE POLICY "conversations_insert" ON conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "conversations_read" ON conversations FOR SELECT USING (true);
```
