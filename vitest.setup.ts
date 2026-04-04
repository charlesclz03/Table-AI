import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

class MockMediaRecorder {
  state: 'inactive' | 'recording' | 'paused' = 'inactive'
  ondataavailable: ((event: { data: Blob }) => void) | null = null
  onpause: ((event: Event) => void) | null = null
  onstop: (() => void) | null = null
  onerror: ((event: Event) => void) | null = null
  onresume: ((event: Event) => void) | null = null
  onstart: ((event: Event) => void) | null = null
  audioBitsPerSecond = 0
  mimeType = 'audio/webm'
  stream = new MediaStream()
  videoBitsPerSecond = 0

  constructor() {
    this.state = 'inactive'
  }

  start() {
    this.state = 'recording'
  }

  stop() {
    this.state = 'inactive'
    if (this.onstop) this.onstop()
  }

  pause() {
    this.state = 'paused'
  }

  resume() {
    this.state = 'recording'
  }

  requestData() {
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob() })
    }
  }
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {
    return true
  }
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  })

  Object.defineProperty(globalThis, 'MediaRecorder', {
    writable: true,
    value: MockMediaRecorder,
  })

  if (typeof HTMLMediaElement !== 'undefined') {
    HTMLMediaElement.prototype.play = () => Promise.resolve()
    HTMLMediaElement.prototype.pause = () => {}
    HTMLMediaElement.prototype.load = () => {}
  }
}
