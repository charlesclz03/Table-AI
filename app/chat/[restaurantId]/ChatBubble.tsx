'use client'

import { layout, prepare, type PreparedText } from '@chenglou/pretext'
import { cn } from '@/lib/utils'

export type ChatBubbleRole = 'assistant' | 'user'

interface ChatBubbleProps {
  role: ChatBubbleRole
  content: string
  estimatedHeight?: number
  pending?: boolean
}

const PRETEXT_FONT = '400 14px "Space Grotesk", sans-serif'
const PRETEXT_LINE_HEIGHT = 24
const PRETEXT_HORIZONTAL_PADDING = 32
const PRETEXT_VERTICAL_PADDING = 24
const PRETEXT_MIN_BUBBLE_HEIGHT = 48

const preparedTextCache = new Map<string, PreparedText>()

function getPreparedText(content: string) {
  const cached = preparedTextCache.get(content)

  if (cached) {
    return cached
  }

  const prepared = prepare(content, PRETEXT_FONT)
  preparedTextCache.set(content, prepared)
  return prepared
}

export function measureChatBubble(
  content: string,
  bubbleWidth: number
): { height: number; lineCount: number } {
  const prepared = getPreparedText(content)
  const textWidth = Math.max(
    1,
    Math.floor(bubbleWidth - PRETEXT_HORIZONTAL_PADDING)
  )
  const result = layout(prepared, textWidth, PRETEXT_LINE_HEIGHT)

  return {
    height: Math.max(
      PRETEXT_MIN_BUBBLE_HEIGHT,
      Math.ceil(result.height + PRETEXT_VERTICAL_PADDING)
    ),
    lineCount: result.lineCount,
  }
}

export function getChatBubbleWidth(containerWidth: number) {
  if (containerWidth <= 0) {
    return 280
  }

  const widthRatio = containerWidth >= 400 ? 0.88 : 0.92
  return Math.max(140, Math.floor(containerWidth * widthRatio))
}

export function getChatBubbleGap() {
  return 12
}

export function ChatBubble({
  role,
  content,
  estimatedHeight,
  pending = false,
}: ChatBubbleProps) {
  return (
    <div
      className={cn(
        'w-fit max-w-[92%] break-words rounded-[24px] px-4 py-3 text-sm leading-6 sm:max-w-[88%]',
        pending
          ? 'glass-panel-soft border border-dashed border-white/10 italic text-white/60'
          : role === 'assistant'
            ? 'glass-panel-soft text-white'
            : 'glass-button-amber ml-auto text-amber-50'
      )}
      style={
        estimatedHeight ? { minHeight: `${estimatedHeight}px` } : undefined
      }
    >
      {content}
    </div>
  )
}
