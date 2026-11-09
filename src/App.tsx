import React, { useState, useEffect } from 'react';
import {
  Case,
  AdminTask,
  LawyerMember,
  NavigationTab,
  Session,
  LawyerLiveLocation,
} from './types/legal';
import { storageService } from './services/storage';

// Components
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardTab } from './components/DashboardTab';
import { CasesTab } from './components/CasesTab';
import { AdminTasksTab } from './components/AdminTasksTab';
import { GeminiLegalAITab } from './components/GeminiLegalAITab';
import { CloudVaultTab } from './components/CloudVaultTab';
import { LocationShareTab } from './components/LocationShareTab';
import { TeamRolesTab } from './components/TeamRolesTab';
import { ArchiveTab } from './components/ArchiveTab';
import { CaseDetailModal } from './components/CaseDetailModal';
import { SessionDetailModal } from './components/SessionDetailModal';
import { NotificationsModal } from './components/NotificationsModal';
import { CourtRollPrintModal } from './components/CourtRollPrintModal';
import { VideoEmblemModal } from './components/VideoEmblemModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [cases, setCases] = useState<Case[]>([]);
  const [adminTasks, setAdminTasks] = useState<AdminTask[]>([]);
  const [team, setTeam] = useState<LawyerMember[]>([]);
  const [currentUser, setCurrentUser] = useState<LawyerMember>(storageService.getCurrentUser());
  const [location, setLocation] = useState<LawyerLiveLocation>(storageService.getLocation());

  // Modal States
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<Case | null>(null);
  const [sessionModalConfig, setSessionModalConfig] = useState<{
    parentCase: Case;
    session?: Session;
  } | null>(null);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isPrintRollOpen, setIsPrintRollOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [aiContextCase, setAiContextCase] = useState<Case | null>(null);

  // Load initial data
  useEffect(() => {
    setCases(storageService.getCases());
    setAdminTasks(storageService.getAdminTasks());
    setTeam(storageService.getTeam());
    setCurrentUser(storageService.getCurrentUser());
    setLocation(storageService.getLocation());
  }, []);

  // Update Cases
  const handleAddCase = (newCaseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => {
    storageService.addCase(newCaseData);
    setCases(storageService.getCases());
  };

  const handleUpdateCase = (caseId: string, updates: Partial<Case>) => {
    storageService.updateCase(caseId, updates);
    const updatedCases = storageService.getCases();
    setCases(updatedCases);

    if (selectedCaseForDetail && selectedCaseForDetail.id === caseId) {
      const refreshed = updatedCases.find((c) => c.id === caseId);
      if (refreshed) setSelectedCaseForDetail(refreshed);
    }
  };

  const handleDeleteCase = (caseId: string) => {
    storageService.deleteCase(caseId);
    setCases(storageService.getCases());
    if (selectedCaseForDetail?.id === caseId) {
      setSelectedCaseForDetail(null);
    }
  };

  // Reopen Case from Archive
  const handleReopenCase = (caseId: string) => {
    storageService.updateCase(caseId, { degreeStatus: 'active' });
    setCases(storageService.getCases());
  };

  // Admin Tasks Actions
  const handleAddAdminTask = (taskData: Omit<AdminTask, 'id' | 'historyLog'>) => {
    storageService.addAdminTask(taskData);
    setAdminTasks(storageService.getAdminTasks());
  };

  const handleUpdateAdminTask = (
    taskId: string,
    updates: Partial<AdminTask>,
    logAction?: string,
    lawyerName?: string
  ) => {
    storageService.updateAdminTask(taskId, updates, logAction, lawyerName);
    setAdminTasks(storageService.getAdminTasks());
  };

  const handleDeleteAdminTask = (taskId: string) => {
    storageService.deleteAdminTask(taskId);
    setAdminTasks(storageService.getAdminTasks());
  };

  // Sessions Actions (with automatic postponement scheduling!)
  const handleSaveSession = (caseId: string, sessionData: Partial<Session>) => {
    if (sessionData.id) {
      storageService.updateSessionInCase(caseId, sessionData.id, sessionData);
    } else {
      storageService.addSessionToCase(
        caseId,
        sessionData as Omit<Session, 'id' | 'caseId'>
      );
    }

    const updatedCases = storageService.getCases();
    setCases(updatedCases);

    if (selectedCaseForDetail && selectedCaseForDetail.id === caseId) {
      const refreshed = updatedCases.find((c) => c.id === caseId);
      if (refreshed) setSelectedCaseForDetail(refreshed);
    }
  };

  // Switch Active User / Lawyer
  const handleSwitchUser = (lawyer: LawyerMember) => {
    setCurrentUser(lawyer);
    storageService.setCurrentUser(lawyer);
  };

  // Register New Office Owner via Google / Onboarding Wizard
  const handleRegisterOfficeOwner = (newOwner: LawyerMember) => {
    const updatedTeam = [...team, newOwner];
    setTeam(updatedTeam);
    storageService.saveTeam(updatedTeam);
    setCurrentUser(newOwner);
    storageService.setCurrentUser(newOwner);
  };

  // Update Team Members & Permissions
  const handleUpdateTeam = (newTeam: LawyerMember[]) => {
    setTeam(newTeam);
    storageService.saveTeam(newTeam);
  };

  // Save Location
  const handleSaveLocation = (newLoc: LawyerLiveLocation) => {
    setLocation(newLoc);
    storageService.saveLocation(newLoc);
  };

  // Navigate to AI with Case Context
  const handleNavigateToAIWithContext = (c: Case) => {
    setAiContextCase(c);
    setSelectedCaseForDetail(null);
    setCurrentTab('ai_assistant');
  };

  // Calculate Urgent Alerts count (18h & 8am day-of)
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  let urgentAlertsCount = 0;
  cases.forEach((c) => {
    if (c.degreeStatus !== 'finished') {
      c.sessions.forEach((s) => {
        if (!s.isCompleted && (s.date === todayStr || s.date === tomorrowStr)) {
          urgentAlertsCount++;
        }
      });
    }
  });
  adminTasks.forEach((t) => {
    if (t.status !== 'completed' && (t.dueDate <= todayStr || t.dueDate === tomorrowStr)) {
      urgentAlertsCount++;
    }
  });

  const pendingAdminTasksCount = adminTasks.filter((t) => t.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-['Cairo',sans-serif] selection:bg-amber-100 selection:text-amber-900">
      {/* Top Header with Light Theme */}
      <Header
        currentUser={currentUser}
        team={team}
        onSwitchUser={handleSwitchUser}
        urgentAlertsCount={urgentAlertsCount}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        onOpenPrintRoll={() => setIsPrintRollOpen(true)}
        onOpenVideoModal={() => setIsVideoModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenCloudVault={() => setCurrentTab('cloud_vault')}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4">
        {currentTab === 'dashboard' && (
          <DashboardTab
            currentUser={currentUser}
            cases={cases}
            adminTasks={adminTasks}
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectCase={(c) => setSelectedCaseForDetail(c)}
            onUpdateAdminTaskStatus={(id, st) =>
              handleUpdateAdminTask(id, { status: st }, 'تم تحديث حالة العمل الإداري', currentUser.name)
            }
            onOpenSessionModal={(c, s) => setSessionModalConfig({ parentCase: c, session: s })}
            onOpenPrintRoll={() => setIsPrintRollOpen(true)}
          />
        )}

        {currentTab === 'cases' && (
          <CasesTab
            cases={cases}
            currentUser={currentUser}
            adminTasks={adminTasks}
            onSelectCase={(c) => setSelectedCaseForDetail(c)}
            onAddCase={handleAddCase}
            onUpdateCase={handleUpdateCase}
            onDeleteCase={handleDeleteCase}
            onOpenSessionModal={(c, s) => setSessionModalConfig({ parentCase: c, session: s })}
            onOpenNewAdminTask={() => {
              setCurrentTab('admin_tasks');
            }}
          />
        )}

        {/* CENTER FEATURE: Google Gemini Legal Assistant (مساعدك القانوني) */}
        {currentTab === 'ai_assistant' && (
          <GeminiLegalAITab
            cases={cases}
            currentUser={currentUser}
            initialContextCase={aiContextCase}
          />
        )}

        {/* PRIMARY HIGHLIGHTED SECTION: Admin Tasks (الأعمال الإدارية) */}
        {currentTab === 'admin_tasks' && (
          <AdminTasksTab
            adminTasks={adminTasks}
            cases={cases}
            currentUser={currentUser}
            team={team}
            onAddTask={handleAddAdminTask}
            onUpdateTask={handleUpdateAdminTask}
            onDeleteTask={handleDeleteAdminTask}
            onOpenPrintRoll={() => setIsPrintRollOpen(true)}
          />
        )}

        {/* Cloud Vault (الخزنة السحابية للمستندات) */}
        {currentTab === 'cloud_vault' && (
          <CloudVaultTab
            currentUser={currentUser}
            cases={cases}
            onUpdateCase={handleUpdateCase}
          />
        )}

        {/* Live Location Share Tab */}
        {currentTab === 'location_share' && (
          <LocationShareTab
            currentUser={currentUser}
            initialLocation={location}
            onSaveLocation={handleSaveLocation}
          />
        )}

        {/* Managing Partner & Team Roles Tab */}
        {currentTab === 'team_roles' && (
          <TeamRolesTab
            currentUser={currentUser}
            team={team}
            onUpdateTeam={handleUpdateTeam}
            onSwitchUser={handleSwitchUser}
          />
        )}

        {/* Archive Tab for Finished Cases */}
        {currentTab === 'archive' && (
          <ArchiveTab
            cases={cases}
            currentUser={currentUser}
            onSelectCase={(c) => setSelectedCaseForDetail(c)}
            onReopenCase={handleReopenCase}
          />
        )}
      </main>

      {/* Case Dossier Detail Modal */}
      {selectedCaseForDetail && (
        <CaseDetailModal
          caseItem={selectedCaseForDetail}
          adminTasks={adminTasks}
          currentUser={currentUser}
          onClose={() => setSelectedCaseForDetail(null)}
          onUpdateCase={handleUpdateCase}
          onOpenSessionModal={(c, s) => setSessionModalConfig({ parentCase: c, session: s })}
          onOpenNewAdminTask={() => {
            setSelectedCaseForDetail(null);
            setCurrentTab('admin_tasks');
          }}
          onNavigateToAIWithContext={handleNavigateToAIWithContext}
        />
      )}

      {/* Session Add / Postponement Modal */}
      {sessionModalConfig && (
        <SessionDetailModal
          parentCase={sessionModalConfig.parentCase}
          existingSession={sessionModalConfig.session}
          currentUser={currentUser}
          onClose={() => setSessionModalConfig(null)}
          onSaveSession={handleSaveSession}
        />
      )}

      {/* Timed Notifications Modal (18h & 8am alerts) */}
      {isNotificationsModalOpen && (
        <NotificationsModal
          cases={cases}
          adminTasks={adminTasks}
          onClose={() => setIsNotificationsModalOpen(false)}
          onSelectCase={(c) => {
            setIsNotificationsModalOpen(false);
            setSelectedCaseForDetail(c);
          }}
        />
      )}

      {/* Print Official Court & Bailiff Roll Modal */}
      {isPrintRollOpen && (
        <CourtRollPrintModal
          cases={cases}
          adminTasks={adminTasks}
          onClose={() => setIsPrintRollOpen(false)}
        />
      )}

      {/* Gold Video Emblem Modal (3-second countdown splash) */}
      {isVideoModalOpen && (
        <VideoEmblemModal onClose={() => setIsVideoModalOpen(false)} />
      )}

      {/* Dual Login & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        team={team}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(lawyer: LawyerMember) => {
          handleSwitchUser(lawyer);
          setIsAuthModalOpen(false);
        }}
        onRegisterOfficeOwner={(newOwner: LawyerMember) => {
          handleRegisterOfficeOwner(newOwner);
          setIsAuthModalOpen(false);
        }}
      />

      {/* Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onChangeTab={(tab) => setCurrentTab(tab)}
        adminTasksPendingCount={pendingAdminTasksCount}
      />
    </div>
  );
}
