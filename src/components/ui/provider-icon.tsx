import { cn } from '@/lib/utils'
import {
  Building2,
  Bot,
  Globe,
  Cpu,
  Users,
  Wind,
  ShoppingBag,
  BrainCircuit,
} from 'lucide-react'

interface ProviderIconProps {
  provider: string
  className?: string
}

export function ProviderIcon({ provider, className }: ProviderIconProps) {
  const iconProps = { className: cn('size-4 shrink-0', className) }
  switch (provider) {
    case 'Anthropic': return <Building2 {...iconProps} />
    case 'OpenAI':    return <Bot {...iconProps} />
    case 'Google':    return <Globe {...iconProps} />
    case 'DeepSeek':  return <Cpu {...iconProps} />
    case 'Meta':      return <Users {...iconProps} />
    case 'Mistral':   return <Wind {...iconProps} />
    case 'Alibaba':   return <ShoppingBag {...iconProps} />
    case 'Yi':        return <BrainCircuit {...iconProps} />
    default:          return <Bot {...iconProps} />
  }
}
