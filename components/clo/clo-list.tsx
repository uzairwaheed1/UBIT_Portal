"use client"

import { CLO } from "@/lib/clo-service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface CloListProps {
  clos: CLO[]
  onCloClick: (clo: CLO) => void
}

/**
 * CLO List Component
 * 
 * Displays a list of CLOs in a compact format.
 * Shows CLO numbers (CLO-1, CLO-2, etc.) as clickable badges.
 * Used in the "Additional Information" section of the course view page.
 */
export function CloList({ clos, onCloClick }: CloListProps) {
  if (clos.length === 0) {
    return (
      <div>
        <label className="text-sm font-medium text-gray-500">Course Learning Outcomes</label>
        <p className="text-sm text-gray-500 mt-1">No CLOs available</p>
      </div>
    )
  }

  return (
    <div>
      <label className="text-sm font-medium text-gray-500">Course Learning Outcomes</label>
      <div className="flex flex-wrap gap-2 mt-2">
        {clos.map((clo) => (
          <Button
            key={clo.id}
            variant="outline"
            size="sm"
            onClick={() => onCloClick(clo)}
            className="h-auto py-1 px-3 text-sm"
          >
            CLO-{clo.clo_number}
          </Button>
        ))}
      </div>
    </div>
  )
}

