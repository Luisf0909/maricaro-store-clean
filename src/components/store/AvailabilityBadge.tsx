import { Clock, Truck, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AvailabilityBadgeProps {
  stock: number
  madeToOrder: boolean
  isDigital?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function AvailabilityBadge({ stock, madeToOrder, isDigital, size = 'md', className }: AvailabilityBadgeProps) {
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
  const base = `inline-flex items-center gap-1.5 font-medium rounded-full px-2.5 py-1 ${textSize}`

  if (isDigital) {
    return (
      <span className={cn(base, 'bg-blue-50 text-blue-700 border border-blue-100', className)}>
        <Truck className={cn(iconSize, 'flex-shrink-0')} />
        Digital · Entrega inmediata
      </span>
    )
  }

  if (stock > 0) {
    return (
      <span className={cn(base, 'bg-green-50 text-green-700 border border-green-100', className)}>
        <Truck className={cn(iconSize, 'flex-shrink-0')} />
        En stock · Despacho en 24 hrs
      </span>
    )
  }

  if (madeToOrder) {
    return (
      <span className={cn(base, 'bg-amber-50 text-amber-700 border border-amber-100', className)}>
        <Clock className={cn(iconSize, 'flex-shrink-0')} />
        A pedido · 48-72 hrs de preparación
      </span>
    )
  }

  return (
    <span className={cn(base, 'bg-gray-100 text-gray-500 border border-gray-200', className)}>
      <AlertCircle className={cn(iconSize, 'flex-shrink-0')} />
      Agotado
    </span>
  )
}
