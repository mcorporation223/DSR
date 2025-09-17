"use client";

import { StatsCard } from "@/components/stats-card";
import { QuickActions } from "@/components/quick-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  UserX,
  AlertTriangle,
  FileBarChart,
  Gavel,
  FileText,
  TrendingUp,
} from "lucide-react";
import { trpc } from "@/components/trpc-provider";

interface StatusBreakdown {
  status: string | null;
  count: number;
}

export default function DashboardPage() {
  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } =
    trpc.dashboard.getStats.useQuery();

  if (statsLoading) {
    return (
      <div className="p-6 mt-8">
        <div className="animate-pulse">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 mt-8">
        <div className="text-center">
          <p className="text-gray-500">
            Erreur lors du chargement des statistiques
          </p>
        </div>
      </div>
    );
  }

  const totalDetaineesInCustody = stats.statusBreakdowns.detainees
    .filter((status: StatusBreakdown) => status.status === "in_custody")
    .reduce((acc: number, curr: StatusBreakdown) => acc + curr.count, 0);

  const totalSeizuresInCustody = stats.statusBreakdowns.seizures
    .filter((status: StatusBreakdown) => status.status === "in_custody")
    .reduce((acc: number, curr: StatusBreakdown) => acc + curr.count, 0);

  return (
    <div className="p-4 md:p-6 md:space-y-8 max-w-7xl mx-auto">
      <div className="border-b border-border/40 pb-6"></div>

      {/* Enhanced Statistics Cards */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Détenus"
          value={stats.totalCounts.detainees}
          icon={UserX}
          description={`${totalDetaineesInCustody} en détention`}
          trend={{
            value: stats.recentActivity.detainees,
            label: "ce mois",
          }}
        />
        <StatsCard
          title="Employés Actifs"
          value={stats.totalCounts.employees}
          icon={Users}
          description="Personnel enregistré"
        />
        <StatsCard
          title="Incidents"
          value={stats.totalCounts.incidents}
          icon={AlertTriangle}
          description="Incidents signalés"
          trend={{
            value: stats.recentActivity.incidents,
            label: "ce mois",
          }}
        />
        <StatsCard
          title="Rapports"
          value={stats.totalCounts.reports}
          icon={FileBarChart}
          description="Rapports générés"
          trend={{
            value: stats.recentActivity.reports,
            label: "ce mois",
          }}
        />
        <StatsCard
          title="Saisies"
          value={stats.totalCounts.seizures}
          icon={Gavel}
          description={`${totalSeizuresInCustody} en détention`}
          trend={{
            value: stats.recentActivity.seizures,
            label: "ce mois",
          }}
        />
        <StatsCard
          title="Déclarations"
          value={stats.totalCounts.statements}
          icon={FileText}
          description="Déclarations archivées"
        />
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Status Breakdowns */}
        <Card className="border-none hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Statut des Détenus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.statusBreakdowns.detainees.map(
                (status: StatusBreakdown) => (
                  <div
                    key={status.status}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          status.status === "in_custody"
                            ? "bg-yellow-500"
                            : status.status === "released"
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                      ></div>
                      <span className="text-sm font-medium">
                        {status.status === "in_custody"
                          ? "En détention"
                          : status.status === "released"
                          ? "Libéré"
                          : status.status === "transferred"
                          ? "Transféré"
                          : status.status}
                      </span>
                    </div>
                    <span className="text-lg font-bold">{status.count}</span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Activities */}
        {/* {!activitiesLoading && recentActivities && (
          <div className="lg:col-span-1">
            <RecentActivities activities={recentActivities} />
          </div>
        )} */}
      </div>

      {/* {stats.statusBreakdowns.seizures.length > 0 && (
        <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              Statut des Saisies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {stats.statusBreakdowns.seizures.map((status: any) => (
                <div
                  key={status.status}
                  className="text-center p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <p className="text-3xl font-bold mb-2">{status.count}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {status.status === "in_custody"
                      ? "En détention"
                      : status.status === "released"
                      ? "Retourné"
                      : status.status === "disposed"
                      ? "Disposé"
                      : status.status}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )} */}
    </div>
  );
}
