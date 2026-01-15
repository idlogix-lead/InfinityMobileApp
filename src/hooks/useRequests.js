import {useQuery} from '@tanstack/react-query';
import {useMutation} from '@tanstack/react-query';
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
} from '../api/requests.api';

export const useMyRequests = () =>
  useQuery({
    queryKey: ['my-requests'],
    queryFn: fetchMyRequests,
  });

export const useMyProjects = () =>
  useQuery({
    queryKey: ['my-projects'],
    queryFn: fetchMyProjects,
  });

export const useTaskUpdates = taskId =>
  useQuery({
    queryKey: ['task-updates', taskId],
    queryFn: () => fetchTaskUpdates(taskId),
    refetchInterval: 5000, // optional: auto-refresh every 5s
  });

export const useStandardResponses = () =>
  useQuery({
    queryKey: ['standard-responses'],
    queryFn: fetchStandardResponses,
  });

export const useSendTaskMessage = () =>
  useMutation({
    mutationFn: sendTaskMessage,
  });

export const useUpdateTask = () =>
  useMutation({
    mutationFn: ({taskId, payload}) => updateTask({taskId, payload}),
  });

export const useTaskById = taskId =>
  useQuery({
    queryKey: ['task', taskId],
    queryFn: () => fetchTaskById(taskId),
  });

  export const useBPartner = () =>
  useQuery({
    queryKey: ['bpartner'],
    queryFn: fetchBPartner,
  });

   export const useUsers = () =>
  useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

   export const useProjects = () =>
  useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });


   export const useAssets = () =>
  useQuery({
    queryKey: ['assets'],
    queryFn: fetchAssets,
  });


   export const useCampaigns = () =>
  useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
  });

    export const useRMA = () =>
  useQuery({
    queryKey: ['rma'],
    queryFn: fetchRMA,
  });
