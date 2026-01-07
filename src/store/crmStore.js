// store/crmStore.js
import { create } from 'zustand';

export const useCRMStore = create((set, get) => ({
  // UI states only (non-persistent)
  activeTab: 'Leads',
  showCRMCard: true,
  showSalesCard: false,
  showOverviewCard: false,
  
  // Followup UI states
  editingId: null,
  activeItemId: null,
  showDatePicker: false,
  selectedDate: null,
  tempDescription: '',
  tempName: '',
  tempFollowUp: '',
  
  // Collapsed states
  todayCollapsed: true,
  futureCollapsed: true,
  missedCollapsed: true,
  workingCollapsed: [],
  totalCollapsed: [],
  newCollapsed: [],
  convertedCollapsed: [],
  
  // Actions - ADD THE MISSING ACTIONS HERE
  setActiveTab: (tab) => set({ 
    activeTab: tab,
    showCRMCard: tab === 'Leads',
    showSalesCard: tab === 'SalesOpportunity',
    showOverviewCard: tab === 'Overview'
  }),
  
  // Add these missing setter functions
  setShowCRMCard: (show) => set({ showCRMCard: show }),
  setShowSalesCard: (show) => set({ showSalesCard: show }),
  setShowOverviewCard: (show) => set({ showOverviewCard: show }),
  
  setEditingId: (id) => set({ editingId: id }),
  setActiveItemId: (id) => set({ activeItemId: id }),
  setShowDatePicker: (show) => set({ showDatePicker: show }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setTempDescription: (description) => set({ tempDescription: description }),
  
  toggleSection: (section) => set((state) => ({
    [section]: !state[section]
  })),
  
  resetEditStates: () => set({
    editingId: null,
    activeItemId: null,
    showDatePicker: false,
    selectedDate: null,
    tempDescription: '',
    tempName: '',
    tempFollowUp: '',
  }),
}));