"use client";

import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  User,
  Download,
  FileText,
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
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Strip HTML tags for plain text
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const getContentPreview = (content: string | null) => {
    if (!content) return "Aucun contenu";
    const plainText = stripHtml(content);
    return plainText.length > 100
      ? plainText.substring(0, 100) + "..."
      : plainText;
  };

  return (
    <Card
      className="w-full bg-white hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
      onClick={() => onView(report)}
    >
      <CardContent className="p-4">
        {/* Header with title and actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3
              className="text-lg font-semibold text-gray-900 truncate"
              title={report.title}
            >
              {report.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600">
                {formatDate(report.reportDate)}
              </span>
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
              onClick={() => onView(report)}
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
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onSelect={() => onEdit(report)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => onDelete(report)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content Preview */}
        <div className="mb-3">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
              {getContentPreview(report.content)}
            </p>
          </div>
        </div>

        {/* Location and Creator Info */}
        <div className="space-y-2 mb-3">
          {report.location && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate">{report.location}</span>
            </div>
          )}
          {report.createdByName && (
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Créé par {report.createdByName}</span>
            </div>
          )}
        </div>

        {/* Footer with creation date */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Créé le {formatDateTime(report.createdAt)}
            {report.updatedAt && report.updatedAt > report.createdAt && (
              <span> • Modifié le {formatDateTime(report.updatedAt)}</span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
