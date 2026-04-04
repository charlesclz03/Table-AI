'use client'

import { useMemo, useState } from 'react'
import { GripVertical, Plus, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { MENU_CATEGORIES, type AdminMenuItem } from '@/lib/admin/types'
import { cn } from '@/lib/utils'

interface MenuEditorProps {
  initialItems: AdminMenuItem[]
}

const blankItem = (): AdminMenuItem => ({
  id:
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  name: '',
  price: 0,
  category: 'mains',
  description: '',
  allergens: [],
  is_vegetarian: false,
  is_vegan: false,
  sort_order: 0,
})

export function MenuEditor({ initialItems }: MenuEditorProps) {
  const [items, setItems] = useState<AdminMenuItem[]>(initialItems)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState('')

  const groupedCount = useMemo(
    () =>
      MENU_CATEGORIES.map((category) => ({
        category,
        count: items.filter((item) => item.category === category).length,
      })),
    [items]
  )

  function updateItem(index: number, patch: Partial<AdminMenuItem>) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      )
    )
  }

  function addItem() {
    setItems((current) => [
      ...current,
      { ...blankItem(), sort_order: current.length },
    ])
  }

  function deleteItem(index: number) {
    const target = items[index]

    if (!window.confirm(`Delete ${target.name || 'this menu item'}?`)) {
      return
    }

    setItems((current) =>
      current
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({ ...item, sort_order: itemIndex }))
    )
  }

  function moveItem(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) {
      return
    }

    setItems((current) => {
      const next = [...current]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next.map((item, index) => ({ ...item, sort_order: index }))
    })
  }

  async function saveMenu() {
    setIsSaving(true)
    setStatus('')

    try {
      const response = await fetch('/api/admin/menu', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item, index) => ({
            ...item,
            name: item.name.trim(),
            description: item.description.trim(),
            allergens: item.allergens.filter(Boolean),
            sort_order: index,
          })),
        }),
      })

      const payload = (await response.json()) as {
        items?: AdminMenuItem[]
        error?: string
      }

      if (!response.ok || !payload.items) {
        throw new Error(payload.error || 'Unable to save the menu.')
      }

      setItems(payload.items)
      setStatus('Menu saved to Supabase.')
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Unable to save the menu.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
                Menu Structure
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                {items.length} dishes and drinks ready for the concierge
              </h3>
            </div>
            <Button variant="glass" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add item
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {groupedCount.map((entry) => (
              <span
                key={entry.category}
                className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white/70"
              >
                {entry.category}: {entry.count}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Editing Notes
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-white/70">
            <li>Drag cards by the grip to change menu order.</li>
            <li>Use comma-separated allergens like `gluten, shellfish`.</li>
            <li>Vegetarian and vegan badges feed concierge recommendations.</li>
          </ul>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="brand" onClick={saveMenu} isLoading={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              Save menu
            </Button>
            {status ? (
              <p className="rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                {status}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {items.map((item, index) => (
          <article
            key={item.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) {
                moveItem(dragIndex, index)
                setDragIndex(null)
              }
            }}
            onDragEnd={() => setDragIndex(null)}
            className={cn(
              'rounded-[30px] border border-white/10 bg-white/6 p-5 backdrop-blur transition',
              dragIndex === index && 'border-amber-300/40 bg-amber-300/10'
            )}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="cursor-grab rounded-full border border-white/10 bg-black/20 p-2 text-white/60">
                    <GripVertical className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
                      Item {index + 1}
                    </p>
                    <p className="text-sm text-white/60">
                      Drag to reorder, then save to persist.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteItem(index)}
                  className="rounded-full border border-rose-300/20 bg-rose-400/10 p-3 text-rose-100 transition hover:bg-rose-400/20"
                  aria-label={`Delete ${item.name || 'menu item'}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <label className="text-sm text-white/70">
                  Name
                  <input
                    value={item.name}
                    onChange={(event) =>
                      updateItem(index, { name: event.target.value })
                    }
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-amber-300/40"
                    placeholder="Grilled octopus"
                  />
                </label>

                <label className="text-sm text-white/70">
                  Price
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(event) =>
                      updateItem(index, {
                        price: Number.parseFloat(event.target.value || '0'),
                      })
                    }
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                  />
                </label>

                <label className="text-sm text-white/70">
                  Category
                  <select
                    value={item.category}
                    onChange={(event) =>
                      updateItem(index, { category: event.target.value })
                    }
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                  >
                    {MENU_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm text-white/70">
                  Allergens
                  <input
                    value={item.allergens.join(', ')}
                    onChange={(event) =>
                      updateItem(index, {
                        allergens: event.target.value
                          .split(',')
                          .map((entry) => entry.trim())
                          .filter(Boolean),
                      })
                    }
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-amber-300/40"
                    placeholder="gluten, dairy"
                  />
                </label>
              </div>

              <label className="text-sm text-white/70">
                Description
                <textarea
                  value={item.description}
                  onChange={(event) =>
                    updateItem(index, { description: event.target.value })
                  }
                  rows={3}
                  className="mt-2 w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-amber-300/40"
                  placeholder="What should the concierge say about this dish?"
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <label className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                  <input
                    type="checkbox"
                    checked={item.is_vegetarian}
                    onChange={(event) =>
                      updateItem(index, { is_vegetarian: event.target.checked })
                    }
                    className="h-4 w-4 rounded border-white/20 bg-transparent"
                  />
                  Vegetarian
                </label>
                <label className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                  <input
                    type="checkbox"
                    checked={item.is_vegan}
                    onChange={(event) =>
                      updateItem(index, { is_vegan: event.target.checked })
                    }
                    className="h-4 w-4 rounded border-white/20 bg-transparent"
                  />
                  Vegan
                </label>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
