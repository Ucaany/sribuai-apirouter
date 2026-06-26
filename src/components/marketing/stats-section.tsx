'use client'

import { useEffect, useState, useRef } from 'react'
import { useInView } from 'react-intersection-observer'

type Stat = {
  value: number
  suffix: string
  label: string
}

const stats: Stat[] = [
  { value: 37, suffix: '+', label: 'Model AI' },
  { value: 99.9, suffix: '%', label: 'Uptime' },
  { value: 500, suffix: 'ms', label: 'Latency rata-rata' },
  { value: 10000, suffix: '+', label: 'Developer terdaftar' },
]

function formatNumber(value: number): string {
  if (value >= 10000) {
    return (value / 1000).toFixed(0) + 'K'
  }
  return value.toString()
}

export function StatsSection() {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  })

  return (
    <section ref={ref} className="border-y bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-bold text-4xl">
                {inView ? (
                  <CounterAnimation
                    end={stat.value}
                    suffix={stat.suffix}
                    duration={2000}
                  />
                ) : (
                  <span className="opacity-0">0</span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CounterAnimation({
  end,
  suffix,
  duration = 2000,
}: {
  end: number
  suffix: string
  duration?: number
}) {
  const [count, setCount] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1)
      const eased = easeOutQuart(progress)
      const current = Math.floor(eased * end)

      setCount(current)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameRef.current)
    }
  }, [end, duration])

  const displayValue = end >= 10000 ? formatNumber(count) : count.toString()
  const displaySuffix = end >= 10000 ? '' : suffix

  return (
    <span>
      {suffix === 'ms' ? '<' : ''}
      {displayValue}
      {displaySuffix}
    </span>
  )
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}
