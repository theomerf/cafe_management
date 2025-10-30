import { useEffect, useState } from 'react'

const RAW = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

type BreakpointKey = keyof typeof RAW

interface BreakpointFlags {
  current: BreakpointKey | 'base'
  up: Record<BreakpointKey, boolean>
  down: Record<BreakpointKey, boolean>
  between: (min: BreakpointKey, max: BreakpointKey) => boolean
}

export function useBreakpoint(): BreakpointFlags {
  const [width, setWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  )

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const order: BreakpointKey[] = ['sm', 'md', 'lg', 'xl', '2xl']

  let current: BreakpointKey | 'base' = 'base'
  for (const bp of order) {
    if (width >= RAW[bp]) current = bp
  }

  const up = Object.fromEntries(
    order.map(k => [k, width >= RAW[k]])
  ) as Record<BreakpointKey, boolean>

  const down = Object.fromEntries(
    order.map(k => [k, width < RAW[k]])
  ) as Record<BreakpointKey, boolean>

  const between = (min: BreakpointKey, max: BreakpointKey) =>
    width >= RAW[min] && width < RAW[max]

  return { current, up, down, between }
}