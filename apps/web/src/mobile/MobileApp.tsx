import { useState } from 'react';
import { Home, MessageSquare, BookOpen, CheckSquare, Settings } from 'lucide-react';
import { MobileHomeScreen } from './screens/MobileHomeScreen';
import { MobileCoachingScreen } from './screens/MobileCoachingScreen';
import { MobileLibraryScreen } from './screens/MobileLibraryScreen';
import { MobileEvalsScreen } from './screens/MobileEvalsScreen';
import { MobileSettingsScreen } from './screens/MobileSettingsScreen';

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'coaching', icon: MessageSquare, label: 'Coaching' },
  { id: 'library', icon: BookOpen, label: 'Library' },
  { id: 'evals', icon: CheckSquare, label: 'Evals' },
  { id: 'settings', icon: Settings, label: 'Settings' },
] as const;

type TabId = typeof tabs[number]['id'];

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState<TabId>('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return <MobileHomeScreen onNavigate={(tab) => setActiveTab(tab as TabId)} />;
      case 'coaching': return <MobileCoachingScreen />;
      case 'library': return <MobileLibraryScreen />;
      case 'evals': return <MobileEvalsScreen />;
      case 'settings': return <MobileSettingsScreen />;
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#0a0a0a', padding: 40,
    }}>
      <div style={{
        width: 390, height: 844,
        background: '#000', borderRadius: 54,
        boxShadow: '0 0 0 2px #333, 0 0 0 4px #111, 0 40px 80px rgba(0,0,0,0.8)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Dynamic island */}
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          width: 126, height: 37, background: '#000', borderRadius: 20, zIndex: 100,
        }} />

        {/* Status bar */}
        <div style={{
          height: 59, background: 'transparent', flexShrink: 0,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          padding: '0 28px 8px', zIndex: 10, position: 'relative',
        }}>
          <span style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>9:41</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ color: 'white', fontSize: 11 }}>●●●</span>
            <span style={{ color: 'white', fontSize: 11 }}>WiFi</span>
            <span style={{ color: 'white', fontSize: 13 }}>🔋</span>
          </div>
        </div>

        {/* Screen content */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: '#000' }}>
          {renderScreen()}
        </div>

        {/* Bottom tab bar */}
        <div style={{
          height: 83, background: 'rgba(28,28,30,0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '0.5px solid rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around',
          padding: '10px 0 0',
          flexShrink: 0,
        }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px',
              color: activeTab === tab.id ? '#17A589' : 'rgba(255,255,255,0.45)',
              minWidth: 64,
            }}>
              <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2 : 1.5} />
              <span style={{ fontSize: 10, fontWeight: activeTab === tab.id ? 600 : 400 }}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Home indicator */}
        <div style={{
          height: 34, background: 'rgba(28,28,30,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <div style={{ width: 134, height: 5, background: 'rgba(255,255,255,0.3)', borderRadius: 3 }} />
        </div>
      </div>
    </div>
  );
}
