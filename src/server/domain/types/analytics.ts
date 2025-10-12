export interface AnalyticsDateRange {
    startDate: Date;
    endDate: Date;
}

export interface CallMetrics {
    totalCalls: number;
    completedCalls: number;
    failedCalls: number;
    averageDuration: number;
    totalDuration: number;
    emergencyCalls: number;
    urgentCalls: number;
    appointmentsScheduled: number;
    topSymptoms: { symptom: string; count: number; }[];
    transcriptionSuccessRate?: number;
}

export interface SymptomFrequency {
    symptom: string;
    count: number;
    percentage: number;
}