import { getAnalyticsData } from '@/app/actions/analytics-actions';
import { ReportingClient } from '@/components/analytics/reporting-client';

export const metadata = { title: 'Reporting & Analytics - Selesai.in' };

export default async function AnalyticsPage() {
    const data = await getAnalyticsData();
    return (
        <div className="max-w-[1200px] mx-auto pb-12">
            <ReportingClient initialData={data} />
        </div>
    );
}