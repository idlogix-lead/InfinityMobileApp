// import {useQuery} from '@tanstack/react-query';
// import {useMutation} from '@tanstack/react-query';
// import {
//   fetchMyRequests,
//   fetchMyProjects,
//   fetchStandardResponses,
//   fetchTaskUpdates,
//   sendTaskMessage,
//   updateTask,
//   fetchTaskById,
//   fetchBPartner,
//   fetchUsers,
//   fetchProjects,
//   fetchAssets,
//   fetchCampaigns,
//   fetchRMA,
// } from '../api/requests.api';

// export const useMyRequests = () =>
//   useQuery({
//     queryKey: ['my-requests'],
//     queryFn: fetchMyRequests,
//   });

// export const useMyProjects = () =>
//   useQuery({
//     queryKey: ['my-projects'],
//     queryFn: fetchMyProjects,
//   });

// export const useTaskUpdates = taskId =>
//   useQuery({
//     queryKey: ['task-updates', taskId],
//     queryFn: () => fetchTaskUpdates(taskId),
//     refetchInterval: 5000, // optional: auto-refresh every 5s
//   });

// export const useStandardResponses = () =>
//   useQuery({
//     queryKey: ['standard-responses'],
//     queryFn: fetchStandardResponses,
//   });

// export const useSendTaskMessage = () =>
//   useMutation({
//     mutationFn: sendTaskMessage,
//   });

// export const useUpdateTask = () =>
//   useMutation({
//     mutationFn: ({taskId, payload}) => updateTask({taskId, payload}),
//   });

// export const useTaskById = taskId =>
//   useQuery({
//     queryKey: ['task', taskId],
//     queryFn: () => fetchTaskById(taskId),
//   });

//   export const useBPartner = () =>
//   useQuery({
//     queryKey: ['bpartner'],
//     queryFn: fetchBPartner,
//   });

//    export const useUsers = () =>
//   useQuery({
//     queryKey: ['users'],
//     queryFn: fetchUsers,
//   });

//    export const useProjects = () =>
//   useQuery({
//     queryKey: ['projects'],
//     queryFn: fetchProjects,
//   });

//    export const useAssets = () =>
//   useQuery({
//     queryKey: ['assets'],
//     queryFn: fetchAssets,
//   });

//    export const useCampaigns = () =>
//   useQuery({
//     queryKey: ['campaigns'],
//     queryFn: fetchCampaigns,
//   });

//     export const useRMA = () =>
//   useQuery({
//     queryKey: ['rma'],
//     queryFn: fetchRMA,
//   });

import {useQuery, useMutation, useQueryClient} from 'react-query';
import {
  fetchMyRequests,
  fetchMyProjects,
  fetchStandardResponses,
  fetchTaskUpdates,
  sendTaskMessage,
  updateTask,
  fetchTaskById,
  fetchBPartner,
  fetchUsers,
  fetchProjects,
  fetchAssets,
  fetchCampaigns,
  fetchRMA,
  fetchRequestTyp,
  fetchRequestCat,
  fetchRequestGrp,
  fetchRequestpro,
  fetchReqStatus,
  fetchMyComments,
  uploadAttachment,
  fetchAttachments,
  downloadAttachment,
} from '../services/api/requests.api';

// Queries
export const useMyRequests = () => useQuery('my-requests', fetchMyRequests);

export const useMyProjects = () => useQuery('my-projects', fetchMyProjects);

export const useTaskUpdates = taskId =>
  useQuery(['task-updates', taskId], () => fetchTaskUpdates(taskId), {
    refetchInterval: 5000, // optional: auto-refresh every 5s
  });

export const useMyComments = userName =>
  useQuery(['task-updates', userName], () => fetchMyComments(userName), {
    refetchInterval: 5000, // optional: auto-refresh every 5s
  });

export const useStandardResponses = () =>
  useQuery('standard-responses', fetchStandardResponses);

export const useTaskById = taskId =>
  useQuery(['task', taskId], () => fetchTaskById(taskId));

export const useBPartner = () => useQuery('bpartner', fetchBPartner);

export const useUsers = () => useQuery('users', fetchUsers);

export const useProjects = () => useQuery('projects', fetchProjects);

export const useAssets = () => useQuery('assets', fetchAssets);

export const useCampaigns = () => useQuery('campaigns', fetchCampaigns);

export const useRMA = () => useQuery('rma', fetchRMA);

// Mutations
export const useSendTaskMessage = () => useMutation(sendTaskMessage);

export const useUpdateTask = () =>
  useMutation(({taskId, payload}) => updateTask({taskId, payload}));

// hooks for add task
export const useRequestTyp = () =>
  useQuery('requestTypes', () => fetchRequestTyp());

export const useCategories = () =>
  useQuery('categories', () => fetchRequestCat());

export const useGroups = () => useQuery('groups', () => fetchRequestGrp());

export const useProjectsForAddTask = () =>
  useQuery('projects-add-task', () => fetchRequestpro());

export const useCreateTask = () =>
  useMutation(payload => {
    const {createTask} = require('../services/api/requests.api');
    return createTask(payload);
  });

export const useReqStatus = () => useQuery('reqStatus', () => fetchReqStatus());

// export const useUploadAttachment = () =>
//   useMutation(payload => {
//     const {uploadAttachment} = require('../services/api/requests.api');
//     return uploadAttachment(payload);
//   });
export const useUploadAttachment = () =>
  useMutation({
    mutationFn: uploadAttachment,
  });
export const useAttachments = taskId =>
  useQuery(['attachments', taskId], () => fetchAttachments(taskId));

export const useDownloadAttachment = () => {
  return useMutation(downloadAttachment);
};
