"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Report } from "./reports-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ReportDetailsDialogProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportDetailsDialog({
  report,
  isOpen,
  onClose,
}: ReportDetailsDialogProps) {
  if (!report) {
    return null;
  }

  // Format date for display
  const formatDate = (date: Date | string | null): string => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format datetime for display
  const formatDateTime = (date: Date | string | null): string => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-2 lg:p-4">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div>
                <DialogTitle className="flex text-xl font-semibold text-gray-900">
                  {report.title}
                </DialogTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Date du rapport: {formatDate(report.reportDate)}
                </p>
                {report.location && (
                  <p className="text-sm text-gray-500">
                    Lieu: {report.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="h-[60vh] px-2 pb-4">
          <div className="space-y-8">
            {/* Informations générales */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Informations générales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Titre du rapport
                  </label>
                  <p className="text-sm text-gray-900">
                    {report.title || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Date du rapport
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(report.reportDate)}
                  </p>
                </div>

                {report.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Lieu
                    </label>
                    <p className="text-sm text-gray-900">{report.location}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contenu du rapport */}
            {report.content && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Contenu du rapport
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="prose max-w-none">
                    <div
                      className="text-sm text-gray-800 leading-relaxed"
                      style={{ wordBreak: "break-word" }}
                      dangerouslySetInnerHTML={{ __html: report.content }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Informations système */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Informations système
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Date d&apos;enregistrement
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDateTime(report.createdAt)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Dernière modification
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDateTime(report.updatedAt)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Créé par
                  </label>
                  <p className="text-sm text-gray-900">
                    {report.createdByName || report.createdBy || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Modifié par
                  </label>
                  <p className="text-sm text-gray-900">
                    {report.updatedByName || report.updatedBy || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
