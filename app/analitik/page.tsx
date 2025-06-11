
'use client';
import { AnalitikView } from '@/components/AnalitikView'; // Named import
import { useSharedState } from '@/context/SharedStateContext';
// import { useRouter } from 'next/navigation'; // useRouter can be added if navigation logic is needed here

export default function AnalitikPage() {
    const { questionsData, historicalAnalyticsToShow, setHistoricalAnalyticsToShow, addHistoryEntry } = useSharedState();
    // const router = useRouter(); // Example if needed later

    const handleSwitchToLiveAnalyticsInApp = () => {
        setHistoricalAnalyticsToShow(null);
        addHistoryEntry('Analitik Dilihat', `Beralih ke analitik data saat ini dari halaman Analitik.`);
        // No explicit setActiveView needed, AnalitikView will re-render based on historicalAnalyticsToShow
    };
    
    return (
        <AnalitikView
            questionsData={questionsData} 
            historicalSnapshot={historicalAnalyticsToShow}
            onSwitchToLiveAnalytics={handleSwitchToLiveAnalyticsInApp}
        />
    );
}
