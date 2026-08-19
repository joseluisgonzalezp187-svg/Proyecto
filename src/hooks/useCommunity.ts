import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addWorkoutComment, createForumPost, createWorkoutPost, getCommunityFeed, getMyProfile, toggleWorkoutReaction, updateMyProfile } from '@/lib/api/community';

export function useMyProfile(userId?: string) {
  return useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: () => getMyProfile(userId as string),
  });
}

export function useCommunityFeed(userId?: string) {
  return useQuery({
    queryKey: ['community-feed', userId],
    queryFn: () => getCommunityFeed(userId),
  });
}

export function useToggleWorkoutReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleWorkoutReaction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community-feed'] }),
  });
}

export function useUpdateMyProfile(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: { username: string; displayName: string }) => updateMyProfile(userId, values),
    onSuccess: (profile) => {
      queryClient.setQueryData(['profile', userId], profile);
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
    },
  });
}

export function useCreateWorkoutPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkoutPost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community-feed'] }),
  });
}

export function useCreateForumPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createForumPost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community-feed'] }),
  });
}

export function useAddWorkoutComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addWorkoutComment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community-feed'] }),
  });
}
