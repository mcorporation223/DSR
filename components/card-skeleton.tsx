import { Skeleton } from "@/components/ui/skeleton";

/**
 * Reusable card skeleton component for loading states in card/grid layouts
 *
 * @example
 * // Basic card skeleton
 * <CardSkeleton />
 *
 * @example
 * // Card skeleton with custom configuration
 * <CardSkeleton
 *   showAvatar={true}
 *   showStatusBadge={true}
 *   showContactInfo={true}
 *   className="h-64"
 * />
 */

interface CardSkeletonProps {
  /** Show avatar in the card */
  showAvatar?: boolean;
  /** Show status badge */
  showStatusBadge?: boolean;
  /** Show contact information section */
  showContactInfo?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function CardSkeleton({
  showAvatar = true,
  showStatusBadge = true,
  showContactInfo = true,
  className = "",
}: CardSkeletonProps) {
  return (
    <div
      className={`w-full bg-white border border-gray-200 rounded-lg p-4 ${className}`}
    >
      {/* Header with photo, name, and actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {showAvatar && (
            <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Actions skeleton */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      {/* Status Badge */}
      {showStatusBadge && (
        <div className="mb-3">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      )}

      {/* Key Information Section */}
      <div className="space-y-3">
        {/* Location and basic info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>

        {/* Contact Information */}
        {showContactInfo && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

// Grid skeleton component for multiple cards
interface CardsGridSkeletonProps {
  /** Number of skeleton cards to show */
  count?: number;
  /** Card configuration */
  cardProps?: CardSkeletonProps;
  /** Grid configuration */
  gridCols?: string;
}

export function CardsGridSkeleton({
  count = 8,
  cardProps = {},
  gridCols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
}: CardsGridSkeletonProps) {
  return (
    <div className={`grid ${gridCols} gap-4`}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} {...cardProps} />
      ))}
    </div>
  );
}

// Preset configurations for common card types
export const CardSkeletonPresets = {
  // Standard card with all features (employees, users)
  standard: {
    showAvatar: true,
    showStatusBadge: true,
    showContactInfo: true,
  },

  // Simple card without contact info (reports, documents)
  simple: {
    showAvatar: false,
    showStatusBadge: false,
    showContactInfo: false,
  },

  // Profile card with avatar but no status (detainees)
  profile: {
    showAvatar: true,
    showStatusBadge: false,
    showContactInfo: true,
  },

  // Status card with badge but no avatar (items, seizures)
  status: {
    showAvatar: false,
    showStatusBadge: true,
    showContactInfo: false,
  },
} as const;
