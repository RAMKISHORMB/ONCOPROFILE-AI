import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { PatientRegistryPage } from './pages/PatientRegistryPage';
import { OmicsUploadPage } from './pages/OmicsUploadPage';
import { MolecularAnalysisPage } from './pages/MolecularAnalysisPage';
import { PatientClassificationPage } from './pages/PatientClassificationPage';
import { TreatmentPredictionPage } from './pages/TreatmentPredictionPage';
import { PersonalizedStrategyPage } from './pages/PersonalizedStrategyPage';
import { ResearchReportsPage } from './pages/ResearchReportsPage';
import { AboutResearchPage } from './pages/AboutResearchPage';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('ONC-001');

  const handleNavigate = (tab: string, patientId?: string) => {
    if (patientId) {
      setSelectedPatientId(patientId);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      <Navbar
        activeTab={currentTab}
        onNavigate={handleNavigate}
      />

      <div className="flex flex-1">
        <div className="no-print">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={handleNavigate}
            selectedPatientId={selectedPatientId}
          />
        </div>

        <main className="flex-1 bg-slate-50/70 min-w-0 overflow-y-auto">
          {currentTab === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
          {currentTab === 'registry' && (
            <PatientRegistryPage
              onNavigate={handleNavigate}
              onSelectPatient={(id) => setSelectedPatientId(id)}
            />
          )}
          {currentTab === 'upload' && <OmicsUploadPage onNavigate={handleNavigate} />}
          {currentTab === 'analysis' && <MolecularAnalysisPage />}
          {currentTab === 'classification' && (
            <PatientClassificationPage onNavigate={handleNavigate} />
          )}
          {currentTab === 'prediction' && (
            <TreatmentPredictionPage
              selectedPatientId={selectedPatientId}
              onNavigate={handleNavigate}
              onSelectPatient={(id) => setSelectedPatientId(id)}
            />
          )}
          {currentTab === 'strategy' && (
            <PersonalizedStrategyPage
              selectedPatientId={selectedPatientId}
              onSelectPatient={(id) => setSelectedPatientId(id)}
              onNavigate={handleNavigate}
            />
          )}
          {currentTab === 'reports' && (
            <ResearchReportsPage
              selectedPatientId={selectedPatientId}
              onNavigate={handleNavigate}
            />
          )}
          {currentTab === 'about' && <AboutResearchPage />}
        </main>
      </div>
    </div>
  );
};

export default App;
