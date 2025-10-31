import { faker } from "@faker-js/faker";
import { NewReport } from "../schema";
import { LOCATIONS, getRandomElement } from "./constants";

export interface ReportGeneratorOptions {
  userIds: string[]; // Required for createdBy/updatedBy
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Report types and templates
const REPORT_TYPES = [
  "Rapport Quotidien de Sécurité",
  "Rapport Hebdomadaire",
  "Rapport Mensuel",
  "Rapport d'Incident",
  "Rapport d'Enquête",
  "Rapport de Patrouille",
  "Rapport d'Opération Spéciale",
  "Rapport de Surveillance",
  "Rapport de Mission",
  "Rapport d'Inspection",
];

// Content templates for different report types
const REPORT_CONTENT_TEMPLATES = {
  "Rapport Quotidien de Sécurité": [
    "SITUATION SÉCURITAIRE - {date}\n\nRÉSUMÉ GÉNÉRAL:\nLa situation sécuritaire dans la zone de {location} a été {status} durant cette journée.\n\nINCIDENTS MAJEURS:\n{incidents}\n\nARRESTATIONS:\n{arrests}\n\nPATROUILLES EFFECTUÉES:\n{patrols}\n\nRECOMMANDATIONS:\n{recommendations}",
    "RAPPORT JOURNALIER DE SÉCURITÉ - {date}\n\nZONE DE SURVEILLANCE: {location}\n\nACTIVITÉS DU JOUR:\n{activities}\n\nÉVÉNEMENTS NOTABLES:\n{events}\n\nMESURES PRISES:\n{actions}\n\nSUIVI NÉCESSAIRE:\n{followup}",
  ],
  "Rapport Hebdomadaire": [
    "SYNTHÈSE HEBDOMADAIRE - Semaine du {startDate} au {endDate}\n\nVUE D'ENSEMBLE:\n{overview}\n\nSTATISTIQUES:\n{statistics}\n\nTENDANCES OBSERVÉES:\n{trends}\n\nACTIONS ENTREPRISES:\n{actions}\n\nOBJECTIFS POUR LA SEMAINE PROCHAINE:\n{objectives}",
    "RAPPORT HEBDOMADAIRE DE SÉCURITÉ\n\nPÉRIODE: {startDate} - {endDate}\nSECTEUR: {location}\n\nBILAN SÉCURITAIRE:\n{security_summary}\n\nINDICATEURS CLÉS:\n{key_indicators}\n\nDÉFIS RENCONTRÉS:\n{challenges}\n\nSOLUTIONS MISES EN ŒUVRE:\n{solutions}",
  ],
  "Rapport d'Incident": [
    "RAPPORT D'INCIDENT - {incident_type}\n\nDATE ET HEURE: {datetime}\nLIEU: {location}\n\nDESCRIPTION:\n{description}\n\nVICTIMES/DÉGÂTS:\n{casualties}\n\nMESURES PRISES:\n{response}\n\nENQUÊTE:\n{investigation}\n\nSUIVI REQUIS:\n{followup}",
    "FICHE D'INCIDENT SÉCURITAIRE\n\nINCIDENT: {incident_type}\nLOCALISATION: {location}\nHEURE: {time}\n\nCIRCONSTANCES:\n{circumstances}\n\nINTERVENTION:\n{intervention}\n\nRÉSULTATS:\n{results}\n\nCONCLUSIONS:\n{conclusions}",
  ],
  "Rapport d'Enquête": [
    "RAPPORT D'ENQUÊTE - Affaire {case_number}\n\nOBJET: {subject}\nENQUÊTEUR: {investigator}\nDATE DE DÉBUT: {start_date}\n\nFAITS ÉTABLIS:\n{facts}\n\nTÉMOIGNAGES:\n{testimonies}\n\nPREUVES COLLECTÉES:\n{evidence}\n\nCONCLUSIONS:\n{conclusions}\n\nRECOMMANDATIONS:\n{recommendations}",
    "DOSSIER D'ENQUÊTE\n\nAFFAIRE: {case_name}\nSTATUT: {status}\nRESPONSABLE: {officer}\n\nCONTEXTE:\n{context}\n\nDÉROULEMENT:\n{timeline}\n\nÉLÉMENTS TECHNIQUES:\n{technical_elements}\n\nSUITE À DONNER:\n{next_steps}",
  ],
};

const SECURITY_STATUSES = [
  "calme",
  "stable",
  "tendue",
  "préoccupante",
  "critique",
];
const INCIDENT_TYPES_FR = [
  "fusillade",
  "vol à main armée",
  "manifestation",
  "accident",
  "bagarre",
  "cambriolage",
];
const ACTIVITIES = [
  "patrouilles",
  "contrôles routiers",
  "fouilles",
  "arrestations",
  "interventions",
];

/**
 * Generates realistic report content based on type
 */
function generateReportContent(
  reportType: string,
  location: string,
  reportDate: Date
): string {
  const templates =
    REPORT_CONTENT_TEMPLATES[
      reportType as keyof typeof REPORT_CONTENT_TEMPLATES
    ];

  if (!templates) {
    // Generic template for unknown report types
    return `RAPPORT - ${reportType}\n\nDATE: ${reportDate.toLocaleDateString(
      "fr-FR"
    )}\nLIEU: ${location}\n\n${faker.lorem.paragraphs(
      3,
      "\n\n"
    )}\n\nCONCLUSION:\n${faker.lorem.paragraph()}`;
  }

  const template = getRandomElement(templates);

  // Replace placeholders with realistic data
  return template
    .replace(/{date}/g, reportDate.toLocaleDateString("fr-FR"))
    .replace(/{location}/g, location)
    .replace(/{status}/g, getRandomElement(SECURITY_STATUSES))
    .replace(
      /{startDate}/g,
      faker.date.recent({ days: 7 }).toLocaleDateString("fr-FR")
    )
    .replace(/{endDate}/g, reportDate.toLocaleDateString("fr-FR"))
    .replace(
      /{datetime}/g,
      `${reportDate.toLocaleDateString(
        "fr-FR"
      )} à ${reportDate.toLocaleTimeString("fr-FR")}`
    )
    .replace(/{incident_type}/g, getRandomElement(INCIDENT_TYPES_FR))
    .replace(/{time}/g, reportDate.toLocaleTimeString("fr-FR"))
    .replace(
      /{case_number}/g,
      `${faker.string.numeric(4)}-${faker.string.numeric(2)}`
    )
    .replace(/{case_name}/g, `Affaire ${faker.person.lastName()}`)
    .replace(/{subject}/g, getRandomElement(INCIDENT_TYPES_FR))
    .replace(/{investigator}/g, faker.person.fullName())
    .replace(
      /{officer}/g,
      `${faker.helpers.arrayElement([
        "Commissaire",
        "Inspecteur",
      ])} ${faker.person.fullName()}`
    )
    .replace(
      /{start_date}/g,
      faker.date.past({ years: 1 }).toLocaleDateString("fr-FR")
    )
    .replace(/{incidents}/g, generateIncidentsList())
    .replace(/{arrests}/g, generateArrestsList())
    .replace(/{patrols}/g, generatePatrolsList())
    .replace(/{recommendations}/g, generateRecommendations())
    .replace(/{activities}/g, generateActivitiesList())
    .replace(/{events}/g, generateEventsList())
    .replace(/{actions}/g, generateActionsList())
    .replace(/{followup}/g, generateFollowupList())
    .replace(/{overview}/g, faker.lorem.paragraph())
    .replace(/{statistics}/g, generateStatistics())
    .replace(/{trends}/g, generateTrends())
    .replace(/{objectives}/g, generateObjectives())
    .replace(/{security_summary}/g, faker.lorem.paragraph())
    .replace(/{key_indicators}/g, generateKeyIndicators())
    .replace(/{challenges}/g, generateChallenges())
    .replace(/{solutions}/g, generateSolutions())
    .replace(/{description}/g, faker.lorem.paragraphs(2, "\n"))
    .replace(/{casualties}/g, generateCasualties())
    .replace(/{response}/g, generateResponse())
    .replace(/{investigation}/g, faker.lorem.paragraph())
    .replace(/{circumstances}/g, faker.lorem.paragraph())
    .replace(/{intervention}/g, faker.lorem.paragraph())
    .replace(/{results}/g, faker.lorem.paragraph())
    .replace(/{conclusions}/g, faker.lorem.paragraph())
    .replace(/{facts}/g, generateFacts())
    .replace(/{testimonies}/g, generateTestimonies())
    .replace(/{evidence}/g, generateEvidence())
    .replace(/{context}/g, faker.lorem.paragraph())
    .replace(/{timeline}/g, generateTimeline())
    .replace(/{technical_elements}/g, generateTechnicalElements())
    .replace(/{next_steps}/g, generateNextSteps());
}

// Helper functions for generating report sections
function generateIncidentsList(): string {
  const count = faker.number.int({ min: 0, max: 3 });
  if (count === 0) return "- Aucun incident majeur signalé";

  const incidents = [];
  for (let i = 0; i < count; i++) {
    incidents.push(
      `- ${getRandomElement(
        INCIDENT_TYPES_FR
      )} signalé à ${faker.location.streetAddress()}`
    );
  }
  return incidents.join("\n");
}

function generateArrestsList(): string {
  const count = faker.number.int({ min: 0, max: 5 });
  if (count === 0) return "- Aucune arrestation effectuée";

  return `- ${count} arrestation(s) effectuée(s) pour divers motifs\n- Suspects transférés au commissariat pour interrogatoire`;
}

function generatePatrolsList(): string {
  const count = faker.number.int({ min: 2, max: 8 });
  return `- ${count} patrouilles effectuées dans différents quartiers\n- Contrôles routiers aux points stratégiques\n- Surveillance des marchés et lieux publics`;
}

function generateRecommendations(): string {
  const recommendations = [
    "Renforcer les patrouilles nocturnes",
    "Améliorer la coordination avec les autorités locales",
    "Sensibiliser la population sur les mesures de sécurité",
    "Installer un éclairage public supplémentaire",
    "Organiser des réunions communautaires",
  ];

  const selected = faker.helpers.arrayElements(recommendations, {
    min: 2,
    max: 4,
  });
  return selected.map((rec) => `- ${rec}`).join("\n");
}

function generateActivitiesList(): string {
  const activities = faker.helpers.arrayElements(ACTIVITIES, {
    min: 3,
    max: 5,
  });
  return activities
    .map((activity) => `- ${activity} dans le secteur`)
    .join("\n");
}

function generateEventsList(): string {
  const events = [
    "Réunion avec les leaders communautaires",
    "Formation du personnel de sécurité",
    "Maintenance des équipements",
    "Visite d'inspection du commissaire",
  ];

  const selected = faker.helpers.arrayElements(events, { min: 1, max: 3 });
  return selected.map((event) => `- ${event}`).join("\n");
}

function generateActionsList(): string {
  return "- Renforcement des mesures préventives\n- Coordination avec les unités adjacentes\n- Suivi des cas en cours";
}

function generateFollowupList(): string {
  return "- Poursuivre la surveillance accrue\n- Finaliser les enquêtes en cours\n- Préparer le rapport de synthèse";
}

function generateStatistics(): string {
  return `- ${faker.number.int({
    min: 0,
    max: 10,
  })} incidents signalés\n- ${faker.number.int({
    min: 0,
    max: 8,
  })} arrestations\n- ${faker.number.int({
    min: 15,
    max: 50,
  })} patrouilles effectuées`;
}

function generateTrends(): string {
  const trends = [
    "Diminution des vols à main armée",
    "Augmentation des disputes domestiques",
    "Amélioration de la collaboration communautaire",
    "Hausse des contrôles préventifs",
  ];

  const selected = faker.helpers.arrayElements(trends, { min: 2, max: 3 });
  return selected.map((trend) => `- ${trend}`).join("\n");
}

function generateObjectives(): string {
  return "- Maintenir le niveau de sécurité actuel\n- Intensifier les patrouilles de nuit\n- Organiser une campagne de sensibilisation";
}

function generateKeyIndicators(): string {
  return `- Taux de criminalité: ${faker.number.int({
    min: 1,
    max: 15,
  })}%\n- Temps de réponse moyen: ${faker.number.int({
    min: 5,
    max: 20,
  })} minutes\n- Satisfaction communautaire: ${faker.number.int({
    min: 60,
    max: 95,
  })}%`;
}

function generateChallenges(): string {
  return "- Ressources limitées pour les patrouilles\n- Communication avec certaines communautés\n- Équipements vieillissants";
}

function generateSolutions(): string {
  return "- Optimisation des horaires de patrouille\n- Formation en communication communautaire\n- Demande de renouvellement d'équipements";
}

function generateCasualties(): string {
  const casualties = faker.number.int({ min: 0, max: 5 });
  if (casualties === 0) return "- Aucune victime signalée";
  return `- ${casualties} victime(s) transportée(s) à l'hôpital\n- Dégâts matériels évalués`;
}

function generateResponse(): string {
  return "- Intervention immédiate des forces de l'ordre\n- Sécurisation du périmètre\n- Évacuation des civils si nécessaire\n- Ouverture d'enquête";
}

function generateFacts(): string {
  return "- Témoignages recueillis sur place\n- Preuves matérielles collectées\n- Identification des suspects\n- Reconstitution des événements";
}

function generateTestimonies(): string {
  const witnesses = faker.number.int({ min: 1, max: 5 });
  return `- ${witnesses} témoin(s) interrogé(s)\n- Déclarations concordantes\n- Identification formelle effectuée`;
}

function generateEvidence(): string {
  return "- Pièces à conviction saisies\n- Photographies de la scène\n- Rapports techniques\n- Expertises demandées";
}

function generateTimeline(): string {
  return "- Alerte reçue à 14h30\n- Arrivée sur les lieux à 14h45\n- Intervention terminée à 16h00\n- Rapport initial rédigé à 17h30";
}

function generateTechnicalElements(): string {
  return "- Analyse balistique en cours\n- Empreintes relevées\n- Traces ADN collectées\n- Analyse vidéosurveillance";
}

function generateNextSteps(): string {
  return "- Finaliser les interrogatoires\n- Attendre les résultats d'expertise\n- Préparer le dossier pour le procureur\n- Poursuivre la surveillance";
}

/**
 * Generates a single report record with realistic content
 */
export function generateReport(options: ReportGeneratorOptions): NewReport {
  const { userIds, dateRange } = options;

  // Generate report date within range or default to last year
  const reportDateStart =
    dateRange?.start || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const reportDateEnd = dateRange?.end || new Date();
  const reportDate = faker.date.between({
    from: reportDateStart,
    to: reportDateEnd,
  });

  const reportType = getRandomElement(REPORT_TYPES);
  const location = getRandomElement(LOCATIONS);

  const title = `${reportType} - ${reportDate.toLocaleDateString(
    "fr-FR"
  )} - ${location}`;
  const content = generateReportContent(reportType, location, reportDate);

  return {
    title,
    content,
    location,
    reportDate,
    createdBy: getRandomElement(userIds),
    updatedBy: getRandomElement(userIds),
  };
}

/**
 * Generates multiple report records
 */
export function generateReports(
  count: number,
  options: ReportGeneratorOptions
): NewReport[] {
  const reports: NewReport[] = [];

  for (let i = 0; i < count; i++) {
    const report = generateReport(options);
    reports.push(report);
  }

  return reports;
}

/**
 * Generates reports in batches for memory efficiency
 */
export function* generateReportBatches(
  totalCount: number,
  batchSize: number,
  options: ReportGeneratorOptions
): Generator<NewReport[], void, unknown> {
  let processed = 0;

  while (processed < totalCount) {
    const currentBatchSize = Math.min(batchSize, totalCount - processed);
    const batch = generateReports(currentBatchSize, options);

    processed += currentBatchSize;
    yield batch;
  }
}

/**
 * Generates reports with specific type distribution
 */
export function generateReportsByType(
  typeDistribution: Record<string, number>,
  options: ReportGeneratorOptions
): NewReport[] {
  const reports: NewReport[] = [];

  for (const [reportType, count] of Object.entries(typeDistribution)) {
    if (!REPORT_TYPES.includes(reportType)) {
      console.warn(`Unknown report type: ${reportType}`);
      continue;
    }

    for (let i = 0; i < count; i++) {
      const report = generateReport(options);
      report.title = `${reportType} - ${report.reportDate.toLocaleDateString(
        "fr-FR"
      )} - ${report.location}`;

      // Regenerate content for specific type
      report.content = generateReportContent(
        reportType,
        report.location!,
        report.reportDate
      );

      reports.push(report);
    }
  }

  // Shuffle to randomize order
  return faker.helpers.shuffle(reports);
}

/**
 * Generates reports for specific time periods (useful for time-series analysis)
 */
export function generateReportsByPeriod(
  periods: Array<{ start: Date; end: Date; count: number; type?: string }>,
  options: ReportGeneratorOptions
): NewReport[] {
  const allReports: NewReport[] = [];

  for (const period of periods) {
    const periodOptions = {
      ...options,
      dateRange: { start: period.start, end: period.end },
    };

    if (period.type) {
      // Generate specific type for this period
      const periodReports = generateReportsByType(
        { [period.type]: period.count },
        periodOptions
      );
      allReports.push(...periodReports);
    } else {
      // Generate mixed types for this period
      const periodReports = generateReports(period.count, periodOptions);
      allReports.push(...periodReports);
    }
  }

  return allReports;
}

/**
 * Helper function to get statistics about generated reports
 */
export function getReportStatistics(reports: NewReport[]) {
  const stats = {
    totalReports: reports.length,
    reportTypes: {} as Record<string, number>,
    locationDistribution: {} as Record<string, number>,
    averageContentLength: 0,
    reportsPerMonth: {} as Record<string, number>,
    oldestReport: null as Date | null,
    newestReport: null as Date | null,
  };

  let totalContentLength = 0;

  for (const report of reports) {
    // Extract report type from title
    const titleParts = report.title.split(" - ");
    const reportType = titleParts[0] || "Unknown";
    stats.reportTypes[reportType] = (stats.reportTypes[reportType] || 0) + 1;

    // Count location distribution
    if (report.location) {
      stats.locationDistribution[report.location] =
        (stats.locationDistribution[report.location] || 0) + 1;
    }

    // Calculate content length
    if (report.content) {
      totalContentLength += report.content.length;
    }

    // Track date range
    const reportDate = report.reportDate;
    if (!stats.oldestReport || reportDate < stats.oldestReport) {
      stats.oldestReport = reportDate;
    }
    if (!stats.newestReport || reportDate > stats.newestReport) {
      stats.newestReport = reportDate;
    }

    // Count reports per month
    const monthKey = `${reportDate.getFullYear()}-${String(
      reportDate.getMonth() + 1
    ).padStart(2, "0")}`;
    stats.reportsPerMonth[monthKey] =
      (stats.reportsPerMonth[monthKey] || 0) + 1;
  }

  // Calculate average content length
  stats.averageContentLength = Math.round(totalContentLength / reports.length);

  return stats;
}

/**
 * Helper function to validate report data
 */
export function validateReports(reports: NewReport[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (const [index, report] of reports.entries()) {
    // Check required fields
    if (!report.title || report.title.trim().length === 0) {
      errors.push(`Report ${index}: Missing or empty title`);
    }

    if (!report.content || report.content.trim().length === 0) {
      errors.push(`Report ${index}: Missing or empty content`);
    }

    if (!report.reportDate) {
      errors.push(`Report ${index}: Missing report date`);
    }

    // Check date validity
    if (report.reportDate && report.reportDate > new Date()) {
      errors.push(`Report ${index}: Report date is in the future`);
    }

    // Check content length (should be reasonable)
    if (
      report.content &&
      (report.content.length < 100 || report.content.length > 10000)
    ) {
      errors.push(
        `Report ${index}: Content length seems unrealistic (${report.content.length} characters)`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
