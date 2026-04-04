# Table IA — Test Data for Supabase
**Date:** 2026-04-02
**Use:** Seed your Supabase database with test data

---

## SQL to Insert Test Restaurant

Run this in Supabase SQL Editor:

```sql
-- Insert test restaurant
insert into restaurants (
  email,
  name,
  soul_md,
  rules_md,
  menu_json,
  quiz_answers,
  subscription_status
) values (
  'demo@ocelario.pt',
  'O Celeiro',
  'You are O Celeiro''s AI concierge. Warm, local, knowledgeable about Alentejo cuisine. Speak like a proud local who loves their region''s food.',
  '1. RETRIEVE ONLY from the provided menu. 2. If unsure about allergens: "Let me check with the kitchen." 3. Keep responses short for voice.',
  '[
    {"id": "1", "name": "Açorda de Marisco", "price": 18, "category": "mains", "description": "Bread soup with seafood, garlic, cilantro, and poached egg", "allergens": ["gluten", "shellfish", "egg"], "is_vegetarian": false},
    {"id": "2", "name": "Migas Alentejanas", "price": 12, "category": "mains", "description": "Bread and garlic mash with fried eggs and olives", "allergens": ["gluten", "egg"], "is_vegetarian": true},
    {"id": "3", "name": "Cataplana de Porco Preto", "price": 16, "category": "mains", "description": "Slow-cooked black pork with clams and chouriço", "allergens": ["shellfish"], "is_vegetarian": false},
    {"id": "4", "name": "Percebes", "price": 28, "category": "starters", "description": "Gooseneck barnacles — rare and precious", "allergens": ["shellfish"], "is_vegetarian": false},
    {"id": "5", "name": "Açorda de Legumes", "price": 10, "category": "mains", "description": "Vegetarian vegetable bread soup", "allergens": ["gluten"], "is_vegetarian": true},
    {"id": "6", "name": "Herdade do Esporão Reserva 2019", "price": 28, "category": "wine", "description": "Alentejo red wine, full-bodied", "allergens": [], "is_vegetarian": true}
  ]'::jsonb,
  '{
    "signature_dish": "Açorda de Marisco — bread soup with seafood",
    "recommendation": "The sea bass — it''s flown in fresh every morning",
    "wine_pairing_lamb": "The 2019 Herdade do Esporão Reserva",
    "secret_dish": "The percebes — rare and incredible",
    "allergen_notes": "Cataplana has shellfish, migas has gluten",
    "story": "O Celeiro was started in 1991 by José and Maria da Conceição",
    "faq_1": "Do you have vegetarian options?",
    "faq_2": "Is the fish fresh today?",
    "faq_3": "What time does the kitchen close?",
    "faq_4": "Can I pay by card?",
    "faq_5": "Do you have a kids menu?"
  }'::jsonb,
  'demo'
);

-- Get the restaurant ID
select id from restaurants where email = 'demo@ocelario.pt';
```

---

## Test Conversation

After inserting, test the chat API:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "[RESTAURANT_ID]",
    "message": "What wine goes with the cataplana?"
  }'
```

Expected response: GPT-4o mini with soul_md + menu context injected.

---

## Verify in Supabase Dashboard

1. Go to Supabase → Table Editor → restaurants
2. You should see "O Celeiro" with full menu_json and quiz_answers
3. The subscription_status should be "demo"
