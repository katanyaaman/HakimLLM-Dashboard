
'use client';
import ReportPreview from '@/components/ReportPreview'; // Imports the default export ReportPreviewPage
import { useSharedState } from '@/context/SharedStateContext';
import { useRouter } from 'next/navigation'; 

// The ReportPreviewPage will be the primary component for this route.
// The `onExportReportRequest` prop for ReportPreviewPageContent needs careful handling
// as the modal logic (ReportInfoModal) is typically part of ProyekPage.

export default function LaporanPage() {
    const { reportHtmlForPreview } = useSharedState();
    const router = useRouter();

    // The onExportReportRequest logic is handled internally by ReportPreview (ReportPreviewPage -> ReportPreviewPageContent)
    // or the passed prop would be to ReportPreviewPage if it accepted one.
    // Since ReportPreviewPage (the default export) takes no props, we render it directly.
    
    // If there's no report HTML, perhaps redirect to Proyek page or show a message.
    // This logic might already be inside ReportPreviewPageContent.
    if (!reportHtmlForPreview) {
        // Content for no report is handled within ReportPreviewPageContent itself
        // or by ReportPreview (which is ReportPreviewPage)
    }

    return <ReportPreview />;
}
