import { useState, useEffect, useRef } from 'react'

/**
 * Animates a number from 0 to target using requestAnimationFrame.
 * Returns the current animated value (rounded to 2 decimal places).
 */
export function useCountUp(target: number, duration = 600): number {
  const [current, setCurrent] = useState(0)
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const prevTargetRef = useRef(0)

  useEffect(() => {
    const from = prevTargetRef.current
    prevTargetRef.current = target

    if (from === target) {
      setCurrent(target)
      return
    }

    const diff = target - from
    startTimeRef.current = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const value = from + diff * eased

      setCurrent(Math.round(value * 100) / 100)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setCurrent(target)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  return current
}
