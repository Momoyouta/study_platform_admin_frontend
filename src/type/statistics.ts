export type StatisticsQueryParams = {
    startTime?: string;
    endTime?: string;
};

export type SchoolStatisticsQueryParams = StatisticsQueryParams & {
    schoolId?: string;
};

export type SchoolFunnelDto = {
    totalApply: number;
    approved: number;
    rejected: number;
};

export type PlatformSchoolTotalDto = {
    schoolTotal: number;
};

export type PlatformUserTotalDto = {
    total: number;
    teacherTotal: number;
    studentTotal: number;
};

export type StorageUsageDto = {
    totalBytes: number;
    videoBytes: number;
    normalBytes: number;
    videoRatio: number;
};

export type CourseSummaryDto = {
    totalCourses: number;
    publishedCourses: number;
    publishedRatio: number;
};

export type CollegeDistributionDto = {
    college: string;
    teacherCount: number;
    studentCount: number;
};

export type PeopleSummaryDto = {
    activeTeachers: number;
    activeStudents: number;
    collegeDistribution: CollegeDistributionDto[];
};

export type AssetSummaryDto = {
    materialLibraryCount: number;
    activeTeachingGroups: number;
};

export type LearningSummaryDto = {
    avgProgressPercent: number;
    assignmentSubmitRate: number;
    avgScoreRate: number;
};
