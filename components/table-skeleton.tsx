import { Skeleton } from "@/components/ui/skeleton";

/**
 * Reusable table skeleton component for loading states
 *
 * @example
 * // Basic usage
 * <TableSkeleton />
 *
 * @example
 * // Employee table with avatar and status
 * <TableSkeleton
 *   rows={8}
 *   columns={6}
 *   showAvatar={true}
 *   showStatusBadge={true}
 *   columnWidths={["w-32", "w-16", "w-24", "w-20", "w-28", "w-16"]}
 * />
 *
 * @example
 * // Simple reports table
 * <TableSkeleton
 *   rows={6}
 *   columns={5}
 *   showAvatar={false}
 *   showStatusBadge={false}
 *   columnWidths={["w-32", "w-20", "w-24", "w-40", "w-16"]}
 * />
 *
 * @example
 * // Using preset configurations
 * <TableSkeleton {...TableSkeletonPresets.standard} />
 */

interface TableSkeletonProps {
  /** Number of rows to display */
  rows?: number;
  /** Number of columns to display */
  columns?: number;
  /** Show avatar in first column */
  showAvatar?: boolean;
  /** Show status badge column */
  showStatusBadge?: boolean;
  /** Show actions column */
  showActions?: boolean;
  /** Show pagination */
  showPagination?: boolean;
  /** Custom column widths (Tailwind classes) */
  columnWidths?: string[];
}

export function TableSkeleton({
  rows = 8,
  columns = 6,
  showAvatar = true,
  showStatusBadge = true,
  showActions = true,
  showPagination = true,
  columnWidths,
}: TableSkeletonProps) {
  // Default column widths if not provided
  const defaultWidths = ["w-20", "w-16", "w-24", "w-20", "w-28", "w-16"];
  const widths = columnWidths || defaultWidths.slice(0, columns);

  // Use CSS Grid with explicit column count for better browser support
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${Math.min(columns, 12)}, minmax(0, 1fr))`,
    gap: "1rem",
    minWidth: 0,
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="border border-gray-200 rounded-lg">
        <div className="min-w-full">
          {/* Table Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <div style={gridStyle}>
              {Array.from({ length: columns }).map((_, index) => (
                <Skeleton
                  key={index}
                  className={`h-4 ${widths[index] || "w-20"}`}
                />
              ))}
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div key={rowIndex} className="px-4 py-4">
                <div style={{ ...gridStyle, alignItems: "center" }}>
                  {Array.from({ length: columns }).map((_, colIndex) => {
                    // First column with avatar
                    if (colIndex === 0 && showAvatar) {
                      return (
                        <div
                          key={colIndex}
                          className="flex items-center gap-3 min-w-0"
                        >
                          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                          <Skeleton className="h-4 w-20 min-w-0" />
                        </div>
                      );
                    }

                    // Status badge column (second to last if actions enabled, otherwise last)
                    if (
                      showStatusBadge &&
                      ((showActions && colIndex === columns - 2) ||
                        (!showActions && colIndex === columns - 1))
                    ) {
                      return (
                        <Skeleton
                          key={colIndex}
                          className="h-6 w-14 rounded-full"
                        />
                      );
                    }

                    // Actions column (last column)
                    if (showActions && colIndex === columns - 1) {
                      return (
                        <div key={colIndex} className="flex justify-end">
                          <Skeleton className="h-8 w-20" />
                        </div>
                      );
                    }

                    // Regular column
                    return (
                      <Skeleton
                        key={colIndex}
                        className={`h-4 ${widths[colIndex] || "w-16"}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Skeleton */}
          {showPagination && (
            <div className="bg-white px-4 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <div className="flex items-center space-x-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Preset configurations for common table types
export const TableSkeletonPresets = {
  // Standard data table with all features
  standard: {
    rows: 8,
    columns: 6,
    showAvatar: true,
    showStatusBadge: true,
    showActions: true,
    showPagination: true,
  },

  // Simple list without complex features
  simple: {
    rows: 6,
    columns: 4,
    showAvatar: false,
    showStatusBadge: false,
    showActions: true,
    showPagination: true,
  },

  // Detailed table with more columns
  detailed: {
    rows: 10,
    columns: 8,
    showAvatar: true,
    showStatusBadge: true,
    showActions: true,
    showPagination: true,
  },

  // Mobile-friendly compact table
  compact: {
    rows: 5,
    columns: 3,
    showAvatar: true,
    showStatusBadge: false,
    showActions: true,
    showPagination: false,
  },
} as const;
