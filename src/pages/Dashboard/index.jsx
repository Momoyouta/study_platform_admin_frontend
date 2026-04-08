import { Column, Pie } from '@ant-design/plots';
import {
    Alert,
    Button,
    Card,
    Col,
    Empty,
    Input,
    Progress,
    Row,
    Segmented,
    Space,
    Spin,
    Statistic,
    Tabs,
    Typography,
    message,
} from 'antd';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import Store from '@/store/index.ts';
import {
    getPlatformCourseSummary,
    getPlatformSchoolFunnel,
    getPlatformSchoolTotal,
    getPlatformStorageUsage,
    getPlatformUserTotal,
    getSchoolAssetSummary,
    getSchoolCourseSummary,
    getSchoolLearningSummary,
    getSchoolPeopleSummary,
} from '@/http/api.ts';
import './index.less';

const { Title, Text } = Typography;

const PLATFORM_SECTION_KEYS = ['schoolFunnel', 'schoolTotal', 'userTotal', 'storageUsage', 'courseSummary'];
const SCHOOL_SECTION_KEYS = ['peopleSummary', 'courseSummary', 'assetSummary', 'learningSummary'];

const createSectionState = (keys) => {
    return keys.reduce((acc, key) => {
        acc[key] = {
            loading: false,
            error: '',
            data: null,
        };
        return acc;
    }, {});
};

const getErrorMessage = (error, fallbackMessage) => {
    const serverMessage = error?.response?.data?.msg || error?.message;
    return serverMessage ? String(serverMessage) : fallbackMessage;
};

const normalizeRatioPercent = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) {
        return 0;
    }

    const normalized = Math.abs(num) <= 1 ? num * 100 : num;
    return Number(normalized.toFixed(2));
};

const formatPercentText = (value) => {
    return `${normalizeRatioPercent(value).toFixed(2)}%`;
};

const formatCount = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) {
        return 0;
    }
    return num;
};

const formatBytes = (value) => {
    const bytes = Number(value);
    if (!Number.isFinite(bytes) || bytes < 0) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let currentValue = bytes;
    let unitIndex = 0;

    while (currentValue >= 1024 && unitIndex < units.length - 1) {
        currentValue /= 1024;
        unitIndex += 1;
    }

    return `${currentValue.toFixed(2)} ${units[unitIndex]}`;
};

const buildTimeRangeParams = (days) => {
    const safeDays = Number(days) > 0 ? Number(days) : 30;
    const end = moment().endOf('day');
    const start = moment().subtract(safeDays - 1, 'days').startOf('day');

    return {
        startTime: String(start.unix()),
        endTime: String(end.unix()),
    };
};

const SectionCard = ({ title, loading, error, onRetry, children }) => {
    return (
        <Card
            title={title}
            className="dashboard-card"
            extra={
                onRetry ? (
                    <Button type="link" size="small" onClick={onRetry}>
                        刷新
                    </Button>
                ) : null
            }
        >
            {loading ? (
                <div className="dashboard-card-loading">
                    <Spin />
                </div>
            ) : null}

            {!loading && error ? (
                <Alert
                    type="error"
                    showIcon
                    message={error}
                    action={
                        onRetry ? (
                            <Button type="link" size="small" onClick={onRetry}>
                                重试
                            </Button>
                        ) : null
                    }
                />
            ) : null}

            {!loading && !error ? children : null}
        </Card>
    );
};

const Dashboard = observer(() => {
    const userRoles = Store.UserStore.userBaseInfo?.userRoles || [];
    const isPlatformRole = userRoles.includes('root') || userRoles.includes('admin');

    const [activeView, setActiveView] = useState(isPlatformRole ? 'platform' : 'school');
    const [rangeDays, setRangeDays] = useState(30);
    const [schoolInputId, setSchoolInputId] = useState('');
    const [schoolQueryId, setSchoolQueryId] = useState('');

    const [platformSections, setPlatformSections] = useState(() => createSectionState(PLATFORM_SECTION_KEYS));
    const [schoolSections, setSchoolSections] = useState(() => createSectionState(SCHOOL_SECTION_KEYS));

    useEffect(() => {
        setActiveView(isPlatformRole ? 'platform' : 'school');
    }, [isPlatformRole]);

    const timeParams = useMemo(() => {
        return buildTimeRangeParams(rangeDays);
    }, [rangeDays]);

    const schoolParams = useMemo(() => {
        return {
            ...timeParams,
            ...(isPlatformRole && schoolQueryId ? { schoolId: schoolQueryId } : {}),
        };
    }, [isPlatformRole, schoolQueryId, timeParams]);

    const updatePlatformSection = useCallback((key, patch) => {
        setPlatformSections((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                ...patch,
            },
        }));
    }, []);

    const updateSchoolSection = useCallback((key, patch) => {
        setSchoolSections((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                ...patch,
            },
        }));
    }, []);

    const loadSection = useCallback(async (sectionUpdater, key, request, fallbackMessage) => {
        sectionUpdater(key, { loading: true, error: '' });

        try {
            const res = await request();
            const isFailed = typeof res?.code === 'number' && res.code !== 200;
            if (isFailed) {
                throw new Error(res?.msg || fallbackMessage);
            }

            sectionUpdater(key, {
                loading: false,
                error: '',
                data: res?.data ?? null,
            });
        } catch (error) {
            sectionUpdater(key, {
                loading: false,
                error: getErrorMessage(error, fallbackMessage),
            });
        }
    }, []);

    const fetchPlatformSchoolFunnel = useCallback((params) => {
        return loadSection(
            updatePlatformSection,
            'schoolFunnel',
            () => getPlatformSchoolFunnel(params),
            '加载学校入驻分析失败'
        );
    }, [loadSection, updatePlatformSection]);

    const fetchPlatformSchoolTotal = useCallback((params) => {
        return loadSection(
            updatePlatformSection,
            'schoolTotal',
            () => getPlatformSchoolTotal(params),
            '加载合作学校总量失败'
        );
    }, [loadSection, updatePlatformSection]);

    const fetchPlatformUserTotal = useCallback((params) => {
        return loadSection(
            updatePlatformSection,
            'userTotal',
            () => getPlatformUserTotal(params),
            '加载平台用户规模失败'
        );
    }, [loadSection, updatePlatformSection]);

    const fetchPlatformStorageUsage = useCallback((params) => {
        return loadSection(
            updatePlatformSection,
            'storageUsage',
            () => getPlatformStorageUsage(params),
            '加载存储统计失败'
        );
    }, [loadSection, updatePlatformSection]);

    const fetchPlatformCourseSummary = useCallback((params) => {
        return loadSection(
            updatePlatformSection,
            'courseSummary',
            () => getPlatformCourseSummary(params),
            '加载课程概览失败'
        );
    }, [loadSection, updatePlatformSection]);

    const fetchSchoolPeopleSummary = useCallback((params) => {
        return loadSection(
            updateSchoolSection,
            'peopleSummary',
            () => getSchoolPeopleSummary(params),
            '加载人员统计失败'
        );
    }, [loadSection, updateSchoolSection]);

    const fetchSchoolCourseSummary = useCallback((params) => {
        return loadSection(
            updateSchoolSection,
            'courseSummary',
            () => getSchoolCourseSummary(params),
            '加载课程建设统计失败'
        );
    }, [loadSection, updateSchoolSection]);

    const fetchSchoolAssetSummary = useCallback((params) => {
        return loadSection(
            updateSchoolSection,
            'assetSummary',
            () => getSchoolAssetSummary(params),
            '加载教学资产统计失败'
        );
    }, [loadSection, updateSchoolSection]);

    const fetchSchoolLearningSummary = useCallback((params) => {
        return loadSection(
            updateSchoolSection,
            'learningSummary',
            () => getSchoolLearningSummary(params),
            '加载学习质量统计失败'
        );
    }, [loadSection, updateSchoolSection]);

    const fetchPlatformOverview = useCallback((params) => {
        return Promise.all([
            fetchPlatformSchoolFunnel(params),
            fetchPlatformSchoolTotal(params),
            fetchPlatformUserTotal(params),
            fetchPlatformStorageUsage(params),
            fetchPlatformCourseSummary(params),
        ]);
    }, [
        fetchPlatformCourseSummary,
        fetchPlatformSchoolFunnel,
        fetchPlatformSchoolTotal,
        fetchPlatformStorageUsage,
        fetchPlatformUserTotal,
    ]);

    const fetchSchoolOverview = useCallback((params) => {
        return Promise.all([
            fetchSchoolPeopleSummary(params),
            fetchSchoolCourseSummary(params),
            fetchSchoolAssetSummary(params),
            fetchSchoolLearningSummary(params),
        ]);
    }, [fetchSchoolAssetSummary, fetchSchoolCourseSummary, fetchSchoolLearningSummary, fetchSchoolPeopleSummary]);

    useEffect(() => {
        if (!isPlatformRole || activeView !== 'platform') {
            return;
        }
        fetchPlatformOverview(timeParams);
    }, [activeView, fetchPlatformOverview, isPlatformRole, timeParams]);

    useEffect(() => {
        if (activeView !== 'school') {
            return;
        }
        if (isPlatformRole && !schoolQueryId) {
            return;
        }
        fetchSchoolOverview(schoolParams);
    }, [activeView, fetchSchoolOverview, isPlatformRole, schoolParams, schoolQueryId]);

    const schoolFunnelData = useMemo(() => {
        const source = platformSections.schoolFunnel.data;
        if (!source) {
            return [];
        }

        return [
            { stage: '申请总数', value: formatCount(source.totalApply) },
            { stage: '审核通过', value: formatCount(source.approved) },
            { stage: '驳回数', value: formatCount(source.rejected) },
        ];
    }, [platformSections.schoolFunnel.data]);

    const userScaleData = useMemo(() => {
        const source = platformSections.userTotal.data;
        if (!source) {
            return [];
        }

        return [
            { type: '注册用户', count: formatCount(source.total) },
            { type: '教师', count: formatCount(source.teacherTotal) },
            { type: '学生', count: formatCount(source.studentTotal) },
        ];
    }, [platformSections.userTotal.data]);

    const storagePieData = useMemo(() => {
        const source = platformSections.storageUsage.data;
        if (!source) {
            return [];
        }

        return [
            { type: '视频文件', value: formatCount(source.videoBytes) },
            { type: '普通文件', value: formatCount(source.normalBytes) },
        ];
    }, [platformSections.storageUsage.data]);

    const collegeDistributionData = useMemo(() => {
        const source = schoolSections.peopleSummary.data?.collegeDistribution;
        if (!Array.isArray(source) || !source.length) {
            return [];
        }

        return source.flatMap((item) => ([
            {
                college: item.college || '未命名学院',
                role: '教师',
                count: formatCount(item.teacherCount),
            },
            {
                college: item.college || '未命名学院',
                role: '学生',
                count: formatCount(item.studentCount),
            },
        ]));
    }, [schoolSections.peopleSummary.data]);

    const schoolFunnelDonutConfig = useMemo(() => {
        return {
            data: schoolFunnelData,
            angleField: 'value',
            colorField: 'stage',
            radius: 0.9,
            innerRadius: 0.62,
            legend: {
                position: 'bottom',
            },
            interactions: [{ type: 'element-active' }],
            height: 260,
        };
    }, [schoolFunnelData]);

    const userColumnConfig = useMemo(() => {
        return {
            data: userScaleData,
            xField: 'type',
            yField: 'count',
            maxColumnWidth: 100,
            label: {
                position: 'top',
            },
            interactions: [{ type: 'element-active' }],
            height: 260,
        };
    }, [userScaleData]);

    const storagePieConfig = useMemo(() => {
        return {
            data: storagePieData,
            angleField: 'value',
            colorField: 'type',
            radius: 0.85,
            legend: {
                position: 'bottom',
            },
            tooltip: {
                formatter: (datum) => ({
                    name: datum.type,
                    value: formatBytes(datum.value),
                }),
            },
            interactions: [{ type: 'element-active' }],
            height: 260,
        };
    }, [storagePieData]);

    const collegeColumnConfig = useMemo(() => {
        return {
            data: collegeDistributionData,
            xField: 'college',
            yField: 'count',
            seriesField: 'role',
            isGroup: true,
            maxColumnWidth: 100,
            label: {
                position: 'top',
            },
            interactions: [{ type: 'element-active' }],
            height: 300,
        };
    }, [collegeDistributionData]);

    const handleApplySchoolId = () => {
        const nextSchoolId = schoolInputId.trim();
        if (!nextSchoolId) {
            message.warning('平台角色进入学校视角时，必须先输入学校ID');
            return;
        }
        setSchoolQueryId(nextSchoolId);
    };

    const handleClearSchoolFilter = () => {
        setSchoolInputId('');
        setSchoolQueryId('');
        setSchoolSections(createSectionState(SCHOOL_SECTION_KEYS));
    };

    const handleRefresh = () => {
        if (activeView === 'platform') {
            fetchPlatformOverview(timeParams);
            return;
        }

        if (isPlatformRole && !schoolQueryId) {
            message.warning('请先输入学校ID再刷新学校视角数据');
            return;
        }

        fetchSchoolOverview(schoolParams);
    };

    const platformSchoolTotal = platformSections.schoolTotal.data?.schoolTotal || 0;
    const platformCourseSummary = platformSections.courseSummary.data;
    const platformStorageSummary = platformSections.storageUsage.data;
    const schoolPeopleSummary = schoolSections.peopleSummary.data;
    const schoolCourseSummary = schoolSections.courseSummary.data;
    const schoolAssetSummary = schoolSections.assetSummary.data;
    const schoolLearningSummary = schoolSections.learningSummary.data;

    const platformView = (
        <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
                <SectionCard
                    title="学校入驻分布"
                    loading={platformSections.schoolFunnel.loading}
                    error={platformSections.schoolFunnel.error}
                    onRetry={() => fetchPlatformSchoolFunnel(timeParams)}
                >
                    {!schoolFunnelData.length ? (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无入驻分布数据" />
                    ) : (
                        <>
                            <div className="dashboard-inline-stats">
                                {schoolFunnelData.map((item) => (
                                    <div key={item.stage} className="dashboard-inline-stat-item">
                                        <Text type="secondary">{item.stage}</Text>
                                        <Text strong>{item.value}</Text>
                                    </div>
                                ))}
                            </div>
                            <Pie {...schoolFunnelDonutConfig} />
                        </>
                    )}
                </SectionCard>
            </Col>

            <Col xs={24} lg={12}>
                <SectionCard
                    title="合作学校总量"
                    loading={platformSections.schoolTotal.loading}
                    error={platformSections.schoolTotal.error}
                    onRetry={() => fetchPlatformSchoolTotal(timeParams)}
                >
                    <div className="dashboard-stat-center">
                        <Statistic title="已入驻学校总数" value={formatCount(platformSchoolTotal)} />
                    </div>
                </SectionCard>
            </Col>

            <Col xs={24} xl={12}>
                <SectionCard
                    title="平台用户规模"
                    loading={platformSections.userTotal.loading}
                    error={platformSections.userTotal.error}
                    onRetry={() => fetchPlatformUserTotal(timeParams)}
                >
                    {!userScaleData.length ? (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无用户规模数据" />
                    ) : (
                        <Column {...userColumnConfig} />
                    )}
                </SectionCard>
            </Col>

            <Col xs={24} xl={12}>
                <SectionCard
                    title="存储空间统计"
                    loading={platformSections.storageUsage.loading}
                    error={platformSections.storageUsage.error}
                    onRetry={() => fetchPlatformStorageUsage(timeParams)}
                >
                    {!storagePieData.length ? (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无存储数据" />
                    ) : (
                        <>
                            <div className="dashboard-storage-overview">
                                <Statistic
                                    title="全平台总存储"
                                    value={formatBytes(platformStorageSummary?.totalBytes || 0)}
                                />
                                <Statistic
                                    title="视频占比"
                                    value={formatPercentText(platformStorageSummary?.videoRatio || 0)}
                                />
                            </div>
                            <Pie {...storagePieConfig} />
                        </>
                    )}
                </SectionCard>
            </Col>

            <Col xs={24}>
                <SectionCard
                    title="平台课程建设概览"
                    loading={platformSections.courseSummary.loading}
                    error={platformSections.courseSummary.error}
                    onRetry={() => fetchPlatformCourseSummary(timeParams)}
                >
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                            <Statistic title="课程总量" value={formatCount(platformCourseSummary?.totalCourses || 0)} />
                        </Col>
                        <Col xs={24} md={8}>
                            <Statistic title="已发布课程" value={formatCount(platformCourseSummary?.publishedCourses || 0)} />
                        </Col>
                        <Col xs={24} md={8}>
                            <div className="dashboard-progress-wrap">
                                <Text className="dashboard-progress-title">已发布课程占比</Text>
                                <Progress
                                    percent={normalizeRatioPercent(platformCourseSummary?.publishedRatio || 0)}
                                    format={(value) => `${Number(value || 0).toFixed(2)}%`}
                                />
                            </div>
                        </Col>
                    </Row>
                </SectionCard>
            </Col>
        </Row>
    );

    const schoolView = (
        <>
            {isPlatformRole && !schoolQueryId ? (
                <div className="dashboard-school-placeholder">
                    <Empty
                        description="平台角色进入学校视角时，必须先输入学校ID并点击“加载学校数据”"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </div>
            ) : (
                <Row gutter={[16, 16]}>
                    <Col xs={24}>
                        <SectionCard
                            title="本校人员大盘"
                            loading={schoolSections.peopleSummary.loading}
                            error={schoolSections.peopleSummary.error}
                            onRetry={() => fetchSchoolPeopleSummary(schoolParams)}
                        >
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12}>
                                    <Statistic title="已激活教师" value={formatCount(schoolPeopleSummary?.activeTeachers || 0)} />
                                </Col>
                                <Col xs={24} md={12}>
                                    <Statistic title="已激活学生" value={formatCount(schoolPeopleSummary?.activeStudents || 0)} />
                                </Col>
                            </Row>

                            {collegeDistributionData.length ? (
                                <div className="dashboard-college-chart">
                                    <Text className="dashboard-subtitle">学院分布（教师 / 学生）</Text>
                                    <Column {...collegeColumnConfig} />
                                </div>
                            ) : null}
                        </SectionCard>
                    </Col>

                    <Col xs={24} lg={12}>
                        <SectionCard
                            title="本校课程建设"
                            loading={schoolSections.courseSummary.loading}
                            error={schoolSections.courseSummary.error}
                            onRetry={() => fetchSchoolCourseSummary(schoolParams)}
                        >
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Statistic title="累计课程数" value={formatCount(schoolCourseSummary?.totalCourses || 0)} />
                                </Col>
                                <Col span={12}>
                                    <Statistic title="已上架课程" value={formatCount(schoolCourseSummary?.publishedCourses || 0)} />
                                </Col>
                            </Row>
                            <div className="dashboard-progress-wrap">
                                <Text className="dashboard-progress-title">课程上架率</Text>
                                <Progress
                                    percent={normalizeRatioPercent(schoolCourseSummary?.publishedRatio || 0)}
                                    format={(value) => `${Number(value || 0).toFixed(2)}%`}
                                />
                            </div>
                        </SectionCard>
                    </Col>

                    <Col xs={24} lg={12}>
                        <SectionCard
                            title="教学资产沉淀"
                            loading={schoolSections.assetSummary.loading}
                            error={schoolSections.assetSummary.error}
                            onRetry={() => fetchSchoolAssetSummary(schoolParams)}
                        >
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Statistic
                                        title="资料库数量"
                                        value={formatCount(schoolAssetSummary?.materialLibraryCount || 0)}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="活跃教学组"
                                        value={formatCount(schoolAssetSummary?.activeTeachingGroups || 0)}
                                    />
                                </Col>
                            </Row>
                        </SectionCard>
                    </Col>

                    <Col xs={24}>
                        <SectionCard
                            title="整体学情与教务监控"
                            loading={schoolSections.learningSummary.loading}
                            error={schoolSections.learningSummary.error}
                            onRetry={() => fetchSchoolLearningSummary(schoolParams)}
                        >
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={8}>
                                    <Statistic
                                        title="平均课程进度"
                                        value={formatPercentText(schoolLearningSummary?.avgProgressPercent || 0)}
                                    />
                                </Col>
                                <Col xs={24} md={8}>
                                    <Statistic
                                        title="作业提交率"
                                        value={formatPercentText(schoolLearningSummary?.assignmentSubmitRate || 0)}
                                    />
                                </Col>
                                <Col xs={24} md={8}>
                                    <Statistic
                                        title="平均得分率"
                                        value={formatPercentText(schoolLearningSummary?.avgScoreRate || 0)}
                                    />
                                </Col>
                            </Row>
                            <Row gutter={[16, 8]} className="dashboard-progress-list">
                                <Col span={24}>
                                    <Text className="dashboard-progress-title">平均课程进度</Text>
                                    <Progress
                                        percent={normalizeRatioPercent(schoolLearningSummary?.avgProgressPercent || 0)}
                                        format={(value) => `${Number(value || 0).toFixed(2)}%`}
                                    />
                                </Col>
                                <Col span={24}>
                                    <Text className="dashboard-progress-title">作业提交率</Text>
                                    <Progress
                                        percent={normalizeRatioPercent(schoolLearningSummary?.assignmentSubmitRate || 0)}
                                        format={(value) => `${Number(value || 0).toFixed(2)}%`}
                                    />
                                </Col>
                                <Col span={24}>
                                    <Text className="dashboard-progress-title">平均得分率</Text>
                                    <Progress
                                        percent={normalizeRatioPercent(schoolLearningSummary?.avgScoreRate || 0)}
                                        format={(value) => `${Number(value || 0).toFixed(2)}%`}
                                    />
                                </Col>
                            </Row>
                        </SectionCard>
                    </Col>
                </Row>
            )}
        </>
    );

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div>
                    <Title level={3}>管理端统计仪表盘</Title>
                    <Text type="secondary">默认展示最近 30 天数据，可切换最近 7 天 / 最近 30 天</Text>
                </div>

                <Space wrap>
                    <Segmented
                        value={rangeDays}
                        options={[
                            { label: '最近 7 天', value: 7 },
                            { label: '最近 30 天', value: 30 },
                        ]}
                        onChange={(value) => setRangeDays(Number(value))}
                    />

                    {activeView === 'school' && isPlatformRole ? (
                        <Space>
                            <Input
                                allowClear
                                value={schoolInputId}
                                placeholder="请输入学校ID"
                                onChange={(event) => setSchoolInputId(event.target.value)}
                                onPressEnter={handleApplySchoolId}
                            />
                            <Button type="primary" onClick={handleApplySchoolId}>
                                加载学校数据
                            </Button>
                            <Button onClick={handleClearSchoolFilter}>清空</Button>
                        </Space>
                    ) : null}

                    <Button onClick={handleRefresh}>刷新当前视角</Button>
                </Space>
            </div>

            {isPlatformRole ? (
                <Tabs
                    activeKey={activeView}
                    onChange={setActiveView}
                    items={[
                        {
                            key: 'platform',
                            label: '平台视角',
                            children: platformView,
                        },
                        {
                            key: 'school',
                            label: '学校视角',
                            children: schoolView,
                        },
                    ]}
                />
            ) : (
                schoolView
            )}
        </div>
    );
});

export default Dashboard;
