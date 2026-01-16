import {create} from 'zustand';

export const useRequestStore = create(set => ({
  activeSection: 'today',
  selectedProject: null,

  sectionModal: false,
  projectModal: false,
  projectPickerVisible: false,

  setActiveSection: activeSection => set({activeSection}),
  setSelectedProject: selectedProject => set({selectedProject}),

  openSectionModal: () => set({sectionModal: true}),
  closeSectionModal: () => set({sectionModal: false}),

  openProjectModal: () => set({projectModal: true}),
  closeProjectModal: () => set({projectModal: false}),

  openProjectPicker: () => set({projectPickerVisible: true}),
  closeProjectPicker: () => set({projectPickerVisible: false}),
}));

export const useTaskStore = create(set => ({
  selectedTask: null,
  updates: [],
  standardResponses: [],
  selectedActivity: null,

  setSelectedTask: task => set({selectedTask: task}),
  setUpdates: updates => set({updates}),
  addUpdate: update => set(state => ({updates: [...state.updates, update]})),
  setStandardResponses: responses => set({standardResponses: responses}),
  setSelectedActivity: activity => set({selectedActivity: activity}),
}));

export const useAddTaskStore = create(set => ({
  summary: '',
  setSummary: summary => set({summary}),

  selectedRequestType: null,
  setSelectedRequestType: selectedRequestType => set({selectedRequestType}),

  selectedCategory: null,
  setSelectedCategory: selectedCategory => set({selectedCategory}),

  selectedGroup: null,
  setSelectedGroup: selectedGroup => set({selectedGroup}),

  priority: {id: '3', label: 'High', color: '#E67E22'},
  setPriority: priority => set({priority}),

  selectedProject: null,
  setSelectedProject: selectedProject => set({selectedProject}),

  selectedSalesRep: null,
  setSelectedSalesRep: selectedSalesRep => set({selectedSalesRep}),

  startDate: new Date(),
  setStartDate: startDate => set({startDate}),
  startTime: new Date(),
  setStartTime: startTime => set({startTime}),
  endDate: new Date(),
  setEndDate: endDate => set({endDate}),

  resetForm: () =>
    set({
      summary: '',
      selectedRequestType: null,
      selectedCategory: null,
      selectedGroup: null,
      priority: {id: '3', label: 'High', color: '#E67E22'},
      selectedProject: null,
      selectedSalesRep: null,
      startDate: new Date(),
      startTime: new Date(),
      endDate: new Date(),
    }),
}));
