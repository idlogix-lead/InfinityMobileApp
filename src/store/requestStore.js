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
