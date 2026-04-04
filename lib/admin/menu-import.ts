import { z } from 'zod'
import { MENU_CATEGORIES, type AdminMenuItem } from '@/lib/admin/types'

const VEGAN_KEYWORDS = [
  'vegan',
  'vegano',
  'vegana',
  'vegetalien',
  'vegetalienne',
]

const VEGETARIAN_KEYWORDS = [
  'vegetarian',
  'vegetariano',
  'vegetariana',
  'vegetarien',
  'vegetarienne',
  'veggie',
]

export const MENU_UPLOAD_ACCEPT = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const

const rawParsedMenuItemSchema = z.object({
  name: z.string().trim().min(1),
  price: z.union([z.number(), z.string(), z.null()]).nullable().default(null),
  category: z.string().trim().default('mains'),
  description: z.string().trim().default(''),
  allergens: z.array(z.string().trim()).default([]),
})

export const parsedMenuPayloadSchema = z.object({
  items: z.array(rawParsedMenuItemSchema).default([]),
  notes: z.array(z.string().trim()).default([]),
})

type RawParsedMenuItem = z.infer<typeof rawParsedMenuItemSchema>

export interface ParsedMenuDraftItem {
  id: string
  name: string
  price: number | null
  category: string
  description: string
  allergens: string[]
  is_vegetarian: boolean
  is_vegan: boolean
}

export interface ParsedMenuResponse {
  items: ParsedMenuDraftItem[]
  notes: string[]
  fileCount: number
}

export function createMenuDraftId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function roundPrice(value: number) {
  return Number(value.toFixed(2))
}

function parsePrice(value: RawParsedMenuItem['price']) {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? roundPrice(value) : null
  }

  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  const normalized = normalizeText(trimmed)

  if (
    normalized.includes('market price') ||
    normalized.includes('prix du marche') ||
    normalized.includes('preco de mercado') ||
    normalized.includes('precio de mercado')
  ) {
    return null
  }

  let cleaned = trimmed.replace(/[^\d,.-]/g, '')

  if (!cleaned || !/\d/.test(cleaned)) {
    return null
  }

  if (cleaned.includes(',') && cleaned.includes('.')) {
    cleaned =
      cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')
        ? cleaned.replace(/\./g, '').replace(',', '.')
        : cleaned.replace(/,/g, '')
  } else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.')
  }

  const parsed = Number.parseFloat(cleaned)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }

  return roundPrice(parsed)
}

export function normalizeMenuCategory(category: string) {
  const normalized = normalizeText(category)

  if (!normalized) {
    return 'mains'
  }

  if (
    MENU_CATEGORIES.includes(normalized as (typeof MENU_CATEGORIES)[number])
  ) {
    return normalized
  }

  if (
    /(wine|vinho|vino|vin|champagne|cava|prosecco|rose|rouge|blanc)/.test(
      normalized
    )
  ) {
    return 'wine'
  }

  if (
    /(drink|drinks|boisson|boissons|bebida|bebidas|cocktail|cocktails|beer|biere|cerveja|cerveza|juice|jus|soft|water|agua|coffee|cafe|tea|cha)/.test(
      normalized
    )
  ) {
    return 'drinks'
  }

  if (
    /(dessert|desserts|sobremesa|sobremesas|postre|postres|sweet|sweets|cake|tart|ice cream|gelato|sorbet)/.test(
      normalized
    )
  ) {
    return 'desserts'
  }

  if (
    /(starter|starters|appetizer|appetizers|appetiser|appetisers|entrada|entradas|entree|entrees|petisco|petiscos|small plate|small plates|tapas|salad|salads|soup|soups|soupe|salade|couvert)/.test(
      normalized
    )
  ) {
    return 'starters'
  }

  return 'mains'
}

function normalizeAllergens(allergens: string[]) {
  const seen = new Set<string>()
  const next: string[] = []

  for (const allergen of allergens) {
    const cleaned = allergen.trim()
    const key = normalizeText(cleaned)

    if (!cleaned || seen.has(key)) {
      continue
    }

    seen.add(key)
    next.push(cleaned)
  }

  return next
}

function inferDietaryFlags(
  item: Pick<ParsedMenuDraftItem, 'name' | 'description'>
) {
  const text = normalizeText(`${item.name} ${item.description}`)
  const isVegan = VEGAN_KEYWORDS.some((keyword) => text.includes(keyword))
  const isVegetarian =
    isVegan || VEGETARIAN_KEYWORDS.some((keyword) => text.includes(keyword))

  return {
    is_vegetarian: isVegetarian,
    is_vegan: isVegan,
  }
}

export function normalizeParsedMenuItems(rawItems: RawParsedMenuItem[]) {
  return rawItems.map((item) => {
    const base = {
      id: createMenuDraftId(),
      name: item.name.trim(),
      price: parsePrice(item.price),
      category: normalizeMenuCategory(item.category),
      description: item.description.trim(),
      allergens: normalizeAllergens(item.allergens),
    }

    return {
      ...base,
      ...inferDietaryFlags(base),
    } satisfies ParsedMenuDraftItem
  })
}

export function dedupeParsedMenuItems(items: ParsedMenuDraftItem[]) {
  const merged = new Map<string, ParsedMenuDraftItem>()

  for (const item of items) {
    const key = `${normalizeText(item.name)}|${item.category}`
    const current = merged.get(key)

    if (!current) {
      merged.set(key, item)
      continue
    }

    merged.set(key, {
      ...current,
      price: current.price ?? item.price,
      description:
        item.description.length > current.description.length
          ? item.description
          : current.description,
      allergens: normalizeAllergens([...current.allergens, ...item.allergens]),
      is_vegetarian: current.is_vegetarian || item.is_vegetarian,
      is_vegan: current.is_vegan || item.is_vegan,
    })
  }

  return [...merged.values()]
}

export function draftMenuItemToAdminItem(
  item: ParsedMenuDraftItem,
  index: number
): AdminMenuItem {
  return {
    id: item.id || createMenuDraftId(),
    name: item.name.trim(),
    price: item.price === null ? 0 : roundPrice(item.price),
    category: normalizeMenuCategory(item.category),
    description: item.description.trim(),
    allergens: normalizeAllergens(item.allergens),
    is_vegetarian: item.is_vegetarian,
    is_vegan: item.is_vegan,
    sort_order: index,
  }
}
