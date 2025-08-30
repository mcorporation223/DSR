"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Columns} from "lucide-react";

export interface ColumnVisibilityOption {
  key: string;
  label: string;
  visible: boolean;
  hideable: boolean;
}

interface ColumnVisibilityProps {
  columns: ColumnVisibilityOption[];
  onVisibilityChange: (columns: ColumnVisibilityOption[]) => void;
  storageKey?: string;
}

export function ColumnVisibility({
  columns,
  onVisibilityChange,
  storageKey = "table-column-visibility",
}: ColumnVisibilityProps) {
  const [columnState, setColumnState] = useState<ColumnVisibilityOption[]>(
    () => {
      // Initialize state on first render
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const savedColumns = JSON.parse(saved);
            return columns.map((col) => {
              const savedCol = savedColumns.find(
                (s: ColumnVisibilityOption) => s.key === col.key
              );
              return savedCol ? { ...col, visible: savedCol.visible } : col;
            });
          } catch (error) {
            console.error("Error loading column visibility:", error);
          }
        }
      }
      return columns;
    }
  );

  // Save to localStorage when state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(columnState));
    }
  }, [columnState, storageKey]);

  // Notify parent of changes using useCallback to prevent unnecessary re-renders
  useEffect(() => {
    onVisibilityChange(columnState);
  }, [columnState, onVisibilityChange]);

  const handleToggleColumn = useCallback((key: string) => {
    setColumnState((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  }, []);

  const handleShowAll = useCallback(() => {
    setColumnState((prev) => prev.map((col) => ({ ...col, visible: true })));
  }, []);

  const handleHideAll = useCallback(() => {
    setColumnState((prev) =>
      prev.map((col) => (col.hideable ? { ...col, visible: false } : col))
    );
  }, []);

  const { visibleCount, hideableCount } = useMemo(() => {
    return {
      visibleCount: columnState.filter((col) => col.visible).length,
      hideableCount: columnState.filter((col) => col.hideable).length,
    };
  }, [columnState]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-gray-300 bg-white text-gray-700 cursor-pointer"
        >
          <Columns className="w-4 h-4 mr-2" />
          Colonnes ({visibleCount})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            {/* <h4 className="text-sm font-medium">Colonnes visibles</h4> */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs cursor-pointer"
                onClick={handleShowAll}
              >
                Tout afficher
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleHideAll}
                disabled={hideableCount === 0}
              >
                Tout masquer
              </Button>
            </div>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {columnState.map((column) => (
              <div
                key={column.key}
                className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50"
              >
                <Checkbox
                  id={column.key}
                  checked={column.visible}
                  disabled={!column.hideable}
                  onCheckedChange={() => handleToggleColumn(column.key)}
                />
                <label
                  htmlFor={column.key}
                  className={`text-sm flex-1 cursor-pointer ${
                    !column.hideable
                      ? "text-gray-500 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {column.label}
                  {!column.hideable && (
                    <span className="text-xs text-gray-400 ml-1">(requis)</span>
                  )}
                </label>
              </div>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
