'use client'

import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  AlertCircle,
  FileText,
  ImagePlus,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import {
  createMenuDraftId,
  draftMenuItemToAdminItem,
  MENU_UPLOAD_ACCEPT,
  type ParsedMenuDraftItem,
} from '@/lib/admin/menu-import'
import { MENU_CATEGORIES, type AdminMenuItem } from '@/lib/admin/types'
import { cn } from '@/lib/utils'

interface MenuPhotoUploadProps {
  onSaved: (items: AdminMenuItem[]) => void
}

interface SelectedMenuFile {
  id: string
  file: File
  previewUrl: string | null
}

interface ParseApiResponse {
  items?: ParsedMenuDraftItem[]
  notes?: string[]
  fileCount?: number
  error?: string
}

function createBlankDraftItem(): ParsedMenuDraftItem {
  return {
    id: createMenuDraftId(),
    name: '',
    price: null,
    category: 'mains',
    description: '',
    allergens: [],
    is_vegetarian: false,
    is_vegan: false,
  }
}

function createSelectedFile(file: File): SelectedMenuFile {
  return {
    id: createMenuDraftId(),
    file,
    previewUrl: file.type.startsWith('image/')
      ? URL.createObjectURL(file)
      : null,
  }
}

function revokePreview(file: SelectedMenuFile) {
  if (file.previewUrl) {
    URL.revokeObjectURL(file.previewUrl)
  }
}

export function MenuPhotoUpload({ onSaved }: MenuPhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const filesRef = useRef<SelectedMenuFile[]>([])
  const [files, setFiles] = useState<SelectedMenuFile[]>([])
  const [parsedItems, setParsedItems] = useState<ParsedMenuDraftItem[]>([])
  const [notes, setNotes] = useState<string[]>([])
  const [isDragActive, setIsDragActive] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    filesRef.current = files
  }, [files])

  useEffect(() => {
    return () => {
      filesRef.current.forEach(revokePreview)
    }
  }, [])

  function appendFiles(nextFiles: File[]) {
    if (nextFiles.length === 0) {
      return
    }

    const keyedFiles = new Set(
      files.map(
        (entry) =>
          `${entry.file.name}-${entry.file.size}-${entry.file.lastModified}`
      )
    )
    const uniqueFiles = nextFiles.filter((file) => {
      const key = `${file.name}-${file.size}-${file.lastModified}`

      if (keyedFiles.has(key)) {
        return false
      }

      keyedFiles.add(key)
      return true
    })

    if (uniqueFiles.length === 0) {
      return
    }

    setFiles((current) => [...current, ...uniqueFiles.map(createSelectedFile)])
    setErrorMessage('')
    setStatus('')
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    appendFiles(Array.from(event.target.files || []))

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragActive(false)
    appendFiles(Array.from(event.dataTransfer.files || []))
  }

  function removeFile(fileId: string) {
    setFiles((current) => {
      const target = current.find((file) => file.id === fileId)

      if (target) {
        revokePreview(target)
      }

      return current.filter((file) => file.id !== fileId)
    })
  }

  function updateParsedItem(
    index: number,
    patch: Partial<ParsedMenuDraftItem>
  ) {
    setParsedItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      )
    )
  }

  function addParsedItem() {
    setParsedItems((current) => [...current, createBlankDraftItem()])
  }

  function deleteParsedItem(index: number) {
    setParsedItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    )
  }

  async function parseMenuFiles() {
    if (files.length === 0) {
      setErrorMessage('Upload at least one menu image or PDF before parsing.')
      return
    }

    setIsParsing(true)
    setErrorMessage('')
    setStatus('')
    setNotes([])

    try {
      const formData = new FormData()

      files.forEach((entry) => {
        formData.append('files', entry.file)
      })

      const response = await fetch('/api/menu/parse', {
        method: 'POST',
        body: formData,
      })
      const payload = (await response.json()) as ParseApiResponse

      if (!response.ok || !payload.items) {
        throw new Error(
          payload.error ||
            'We could not parse this menu photo. Try a clearer image or use manual entry.'
        )
      }

      if (payload.items.length === 0) {
        throw new Error(
          'No menu items were extracted. Try another photo or switch to manual entry.'
        )
      }

      setParsedItems(payload.items)
      setNotes(payload.notes || [])
      setStatus(
        `Parsed ${payload.items.length} menu items from ${payload.fileCount || files.length} file${(payload.fileCount || files.length) > 1 ? 's' : ''}. Review them below before saving.`
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to parse the uploaded menu right now.'
      )
    } finally {
      setIsParsing(false)
    }
  }

  async function saveParsedMenu() {
    if (parsedItems.length === 0) {
      setErrorMessage('Parse a menu first, then review the extracted items.')
      return
    }

    const missingName = parsedItems.find((item) => !item.name.trim())
    if (missingName) {
      setErrorMessage(
        'Each imported row needs a dish or drink name before saving.'
      )
      return
    }

    const missingPrice = parsedItems.find((item) => item.price === null)
    if (missingPrice) {
      setErrorMessage(
        'Please fill in any missing prices before saving to the live menu.'
      )
      return
    }

    setIsSaving(true)
    setErrorMessage('')
    setStatus('')

    try {
      const response = await fetch('/api/admin/menu', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: parsedItems.map((item, index) =>
            draftMenuItemToAdminItem(item, index)
          ),
        }),
      })
      const payload = (await response.json()) as {
        items?: AdminMenuItem[]
        error?: string
      }

      if (!response.ok || !payload.items) {
        throw new Error(payload.error || 'Unable to save the parsed menu.')
      }

      setParsedItems(
        payload.items.map((item) => ({
          ...item,
          price: item.price,
        }))
      )
      setStatus(
        'Parsed menu saved to Supabase. The manual editor is now up to date.'
      )
      onSaved(payload.items)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to save the parsed menu.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragActive(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            setIsDragActive(false)
          }}
          onDrop={handleDrop}
          className={cn(
            'rounded-[28px] border border-dashed p-6 transition',
            isDragActive
              ? 'border-amber-300/60 bg-amber-300/10'
              : 'border-white/15 bg-white/6'
          )}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full border border-white/10 bg-black/20 p-3 text-amber-100">
                <ImagePlus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
                  Upload Menu Pages
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  Drop photos or PDFs and let AI draft the menu
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                  Upload one or many pages. Gustia can read menus in English,
                  Portuguese, French, Spanish, and mixed-language layouts.
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 px-5 py-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-white/65" />
              <p className="mt-4 text-sm text-white/80">
                Drag JPG, PNG, WebP, or PDF files here
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/40">
                Multi-page friendly
              </p>
              <input
                ref={inputRef}
                type="file"
                accept={MENU_UPLOAD_ACCEPT.join(',')}
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="glass"
                className="mt-5"
                onClick={() => inputRef.current?.click()}
              >
                Choose files
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Import Notes
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-white/70">
            <li>
              Use one photo per page when possible for the cleanest extraction.
            </li>
            <li>
              Review every price before saving if the image is dim or angled.
            </li>
            <li>Imported items replace the live menu when you press save.</li>
          </ul>

          <div className="mt-6 flex flex-col gap-3">
            <Button
              variant="brand"
              onClick={parseMenuFiles}
              isLoading={isParsing}
              disabled={files.length === 0}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Parse menu
            </Button>
            <Button
              variant="glass"
              onClick={saveParsedMenu}
              isLoading={isSaving}
              disabled={parsedItems.length === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              Save to menu
            </Button>
          </div>
        </div>
      </section>

      {files.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
              Uploaded Files
            </p>
            <p className="text-sm text-white/60">
              {files.length} file{files.length > 1 ? 's' : ''} ready
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {files.map((entry) => (
              <article
                key={entry.id}
                className="overflow-hidden rounded-[24px] border border-white/10 bg-white/6"
              >
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {entry.file.name}
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                      {(entry.file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(entry.id)}
                    className="rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
                    aria-label={`Remove ${entry.file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {entry.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.previewUrl}
                    alt={entry.file.name}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-black/20 text-white/65">
                    <div className="text-center">
                      <FileText className="mx-auto h-8 w-8" />
                      <p className="mt-3 text-sm">PDF ready for parsing</p>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {status ? (
        <div className="rounded-[24px] border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-50">
          {status}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-[24px] border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-50">
          {errorMessage}
        </div>
      ) : null}

      {notes.length > 0 ? (
        <div className="rounded-[24px] border border-amber-300/20 bg-amber-100/10 px-4 py-4 text-sm text-amber-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
            <div>
              <p className="font-medium">AI notes</p>
              <ul className="mt-2 space-y-2 text-amber-50/80">
                {notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {parsedItems.length > 0 ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
                Review Extracted Items
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                Edit before saving live
              </h3>
            </div>
            <Button variant="glass" onClick={addParsedItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add row
            </Button>
          </div>

          {parsedItems.map((item, index) => (
            <article
              key={item.id}
              className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
                      Parsed item {index + 1}
                    </p>
                    <p className="text-sm text-white/60">
                      Adjust any field before replacing the current menu.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteParsedItem(index)}
                    className="rounded-full border border-rose-300/20 bg-rose-400/10 p-3 text-rose-100 transition hover:bg-rose-400/20"
                    aria-label={`Delete parsed item ${item.name || index + 1}`}
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
                        updateParsedItem(index, { name: event.target.value })
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
                      value={item.price ?? ''}
                      onChange={(event) =>
                        updateParsedItem(index, {
                          price: event.target.value
                            ? Number.parseFloat(event.target.value)
                            : null,
                        })
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-amber-300/40"
                      placeholder="12.50"
                    />
                  </label>

                  <label className="text-sm text-white/70">
                    Category
                    <select
                      value={item.category}
                      onChange={(event) =>
                        updateParsedItem(index, {
                          category: event.target.value,
                        })
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
                        updateParsedItem(index, {
                          allergens: event.target.value
                            .split(',')
                            .map((entry) => entry.trim())
                            .filter(Boolean),
                        })
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-amber-300/40"
                      placeholder="gluten, shellfish"
                    />
                  </label>
                </div>

                <label className="text-sm text-white/70">
                  Description
                  <textarea
                    value={item.description}
                    onChange={(event) =>
                      updateParsedItem(index, {
                        description: event.target.value,
                      })
                    }
                    rows={3}
                    className="mt-2 w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-amber-300/40"
                    placeholder="Short dish description"
                  />
                </label>

                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                    <input
                      type="checkbox"
                      checked={item.is_vegetarian}
                      onChange={(event) =>
                        updateParsedItem(index, {
                          is_vegetarian: event.target.checked,
                        })
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
                        updateParsedItem(index, {
                          is_vegan: event.target.checked,
                        })
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
      ) : null}
    </div>
  )
}
