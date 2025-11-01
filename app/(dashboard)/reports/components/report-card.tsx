"use client";

import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  FileText,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import type { Report } from "./reports-table";

interface ReportCardProps {
  report: Report;
  onView: (report: Report) => void;
  onEdit: (report: Report) => void;
  onDelete: (report: Report) => void;
}

export function ReportCard({
  report,
  onView,
  onEdit,
  onDelete,
}: ReportCardProps) {
  const formatDate = (date: Date | string) => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("fr-FR");
  };

  const formatDateTime = (date: Date | string) => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Strip HTML tags for plain text version
  const stripHtml = (html: string | null) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const plainTextContent = stripHtml(report.content);
  const truncatedContent =
    plainTextContent.length > 120
      ? plainTextContent.substring(0, 120) + "..."
      : plainTextContent;

  return (
    <Card
      className="w-full bg-white hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView(report)}
    >
      <CardContent className="p-4">
        {/* Header with title and actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1 line-clamp-2">
              {report.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{formatDate(report.reportDate)}</span>
            </div>
          </div>

          {/* Actions */}
          <div
            className="flex items-center gap-1 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                onView(report);
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    onEdit(report);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                    onDelete(report);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Location */}
        {report.location && (
          <div className="mb-3">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate">{report.location}</span>
            </div>
          </div>
        )}

        {/* Content Preview */}
        {report.content && (
          <div className="mb-3">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 flex-shrink-0 text-gray-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                  {truncatedContent}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Creator Information */}
        {report.createdByName && (
          <div className="mb-3">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Par {report.createdByName}</span>
            </div>
          </div>
        )}

        {/* Footer with creation date */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Créé le {formatDateTime(report.createdAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
