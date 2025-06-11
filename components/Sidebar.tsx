'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Squares2X2Icon,
  CircleStackIcon,
  DocumentPlusIcon,
  ClockIcon,
  LinkIcon as IntegrationLinkIcon,
  ChartBarIcon,
  ArrowUpCircleIcon,
  LifebuoyIcon,
  HeartIcon,
} from './IconComponents';
import FeedbackModal from './FeedbackModal';
import { useSharedState } from '@/context/SharedStateContext';


interface IconProps {
  className?: string;
}

interface NavItemProps {
  icon: React.ReactElement<IconProps>;
  label: string;
  href: string;
  disabled?: boolean;
  title?: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, href, disabled, title }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href === "/proyek" && pathname === "/");

  const commonClasses = `flex items-center px-3 py-2.5 text-sm font-medium rounded-md group
    ${isActive 
      ? 'bg-sky-100 text-sky-700' 
      : disabled 
        ? 'text-slate-400 cursor-not-allowed bg-slate-50' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;
  
  const iconElement = React.cloneElement(icon, {
    className: `mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-sky-600' : disabled ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-500'}`
  });

  if (disabled) {
    return (
        <div className={commonClasses + " w-full text-left"} title={title}>
            {iconElement}
            {label}
        </div>
    );
  }

  return (
    <Link href={href} className={commonClasses + " w-full text-left"} title={title}>
      {iconElement}
      {label}
    </Link>
  );
};


const Sidebar: React.FC = () => {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const { questionsData } = useSharedState();
  const isDataLoaded = questionsData.length > 0;

  const mainNavItems = [
    { href: '/proyek', icon: <Squares2X2Icon />, label: 'Proyek' },
    { href: '/data-display', icon: <CircleStackIcon />, label: 'Kumpulan Data', disabled: !isDataLoaded, title: !isDataLoaded ? "Unggah data di Proyek terlebih dahulu" : undefined },
    { href: '/laporan', icon: <DocumentPlusIcon />, label: 'Pratinjau Laporan', disabled: !isDataLoaded, title: !isDataLoaded ? "Unggah data dan evaluasi di Proyek terlebih dahulu" : undefined },
    { href: '/riwayat', icon: <ClockIcon />, label: 'Riwayat' },
    { href: '/integrasi', icon: <IntegrationLinkIcon />, label: 'Integrasi LLM' },
    { href: '/analitik', icon: <ChartBarIcon />, label: 'Analitik', disabled: !isDataLoaded, title: !isDataLoaded ? "Unggah data dan evaluasi di Proyek terlebih dahulu" : undefined },
  ];

  const handleFeedbackSubmit = (name: string, email: string, message: string) => {
    const subject = encodeURIComponent("Masukan Pengguna HAKIM LLM");
    const body = encodeURIComponent(
      `Nama: ${name}\nEmail: ${email}\n\nMasukan:\n${message}`
    );
    window.location.href = `mailto:katanyaman@outlook.com?subject=${subject}&body=${body}`;
    setIsFeedbackModalOpen(false);
  };
  
  const footerNavItems = [
    { label: 'Dukungan', icon: <LifebuoyIcon />, onClick: () => alert('Fitur Dukungan akan segera hadir!') },
    { label: 'Beri Masukan', icon: <HeartIcon />, onClick: () => setIsFeedbackModalOpen(true) },
  ];

  return (
    <>
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="flex-grow p-4 space-y-1.5 overflow-y-auto">
          <nav className="space-y-1.5">
            {mainNavItems.map(item => (
              <NavItem 
                key={item.label} 
                icon={item.icon} 
                label={item.label} 
                href={item.href}
                disabled={item.disabled}
                title={item.title}
              />
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-200 space-y-2">
          <button 
            onClick={() => alert('Fitur Tingkatkan Paket akan segera hadir!')}
            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <ArrowUpCircleIcon className="mr-2 h-5 w-5 transform -rotate-90" />
            Tingkatkan Paket
          </button>
          <nav className="space-y-1.5 pt-2">
            {footerNavItems.map(item => (
               <button 
                type="button" 
                key={item.label} 
                onClick={item.onClick} 
                className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md group text-slate-600 hover:bg-slate-100 hover:text-slate-900 w-full text-left"
              >
                {React.cloneElement(item.icon, {className: "mr-3 flex-shrink-0 h-5 w-5 text-slate-400 group-hover:text-slate-500"})}
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  );
};

export default Sidebar;
