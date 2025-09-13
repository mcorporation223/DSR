"use client";

import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

// Types for table configuration
export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  label: string;
  className?: string;
  render?: (value: unknown, row: T, index: number) => ReactNode;
  align?: "left" | "center" | "right";
  sortable?: boolean;
}

export interface SortConfig {
  sortBy: string | null;
  sortOrder: "asc" | "desc";
  onSort: (sortBy: string) => void;
}

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export interface DataTableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  keyField?: string;
  className?: string;
  headerClassName?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  onRowClick?: (row: T, index: number) => void;
  emptyMessage?: string;
  pagination?: PaginationConfig;
  showPagination?: boolean;
  sortConfig?: SortConfig;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField = "id",
  className = "",
  headerClassName = "",
  rowClassName = "",
  onRowClick,
  emptyMessage = "Aucune donnée disponible",
  pagination,
  showPagination = false,
  sortConfig,
}: DataTableProps<T>) {
  const getRowClassName = (row: T, index: number) => {
    const baseClass = "hover:bg-gray-50/50 border-b border-gray-100";
    const clickableClass = onRowClick ? "cursor-pointer" : "";

    if (typeof rowClassName === "function") {
      return `${baseClass} ${clickableClass} ${rowClassName(row, index)}`;
    }
    return `${baseClass} ${clickableClass} ${rowClassName}`;
  };

  const getAlignmentClass = (align?: string) => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (
      !sortConfig ||
      !columns.find((col) => col.key === columnKey)?.sortable
    ) {
      return null;
    }

    if (sortConfig.sortBy === columnKey) {
      return sortConfig.sortOrder === "asc" ? (
        <ChevronUp className="w-4 h-4 ml-1" />
      ) : (
        <ChevronDown className="w-4 h-4 ml-1" />
      );
    }

    return <ChevronsUpDown className="w-4 h-4 ml-1 opacity-50" />;
  };

  const handleSort = (columnKey: string) => {
    if (
      !sortConfig ||
      !columns.find((col) => col.key === columnKey)?.sortable
    ) {
      return;
    }
    sortConfig.onSort(columnKey);
  };

  const renderPagination = () => {
    if (!showPagination || !pagination) return null;

    const { currentPage, totalPages, totalItems, itemsPerPage, onPageChange } =
      pagination;
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 5; i++) {
            pages.push(i);
          }
          pages.push("...", totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1, "...");
          for (let i = totalPages - 4; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1, "...");
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push("...", totalPages);
        }
      }
      return pages;
    };

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Affichage de{" "}
          <span className="font-medium">
            {startItem} à {endItem}
          </span>{" "}
          sur <span className="font-medium">{totalItems}</span> résultats
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            className="bg-white"
            onClick={() => onPageChange(currentPage - 1)}
          >
            Précédent
          </Button>
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === "number" && onPageChange(page)}
                disabled={page === "..."}
                className={`w-8 h-8 text-sm font-medium rounded ${
                  page === currentPage
                    ? "text-white bg-blue-500"
                    : page === "..."
                    ? "px-2 text-gray-400 cursor-default"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            className="bg-white"
            onClick={() => onPageChange(currentPage + 1)}
          >
            Suivant
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white overflow-hidden ${className}`}>
      <ScrollArea className="w-[calc(80vw)]">
        <Table>
          <TableHeader>
            <TableRow
              className={`border-b border-gray-200 bg-gray-50 ${headerClassName}`}
            >
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`text-sm font-medium text-gray-600 py-4 ${getAlignmentClass(
                    column.align
                  )} ${column.className || ""} ${
                    column.sortable
                      ? "cursor-pointer hover:bg-gray-100 transition-colors"
                      : ""
                  }`}
                  onClick={() => handleSort(column.key)}
                >
                  <div
                    className={`flex items-center ${
                      column.align === "center"
                        ? "justify-center"
                        : column.align === "right"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <span>{column.label}</span>
                    {getSortIcon(column.key)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={(row[keyField as keyof T] as string) || index.toString()}
                  className={getRowClassName(row, index)}
                  onClick={() => onRowClick?.(row, index)}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={`py-4 ${getAlignmentClass(column.align)} ${
                        column.className || ""
                      }`}
                    >
                      {column.render
                        ? column.render(row[column.key as keyof T], row, index)
                        : (row[column.key as keyof T] as ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {renderPagination()}
    </div>
  );
}
