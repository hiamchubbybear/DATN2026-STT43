import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { swipeService, SwipeType } from './swipeService';
import { profileService } from './profileService';

export const useSwipeFeed = (filters?: {
  gender?: string;
  minAge?: number;
  maxAge?: number;
  distance?: number;
}) => {
  console.log('[Hook] useSwipeFeed called with filters:', filters);
  return useQuery({
    queryKey: ['swipeFeed', filters],
    queryFn: () => {
        console.log('[Hook] Fetching swipe feed with filters:', filters);
        return swipeService.getFeed(filters);
    },
    staleTime: 0,
    gcTime: 0,
  });
};

export const useMyProfile = () => {
  return useQuery({
    queryKey: ['myProfile'],
    queryFn: () => profileService.getMyProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSwipeAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetId, type }: { targetId: string; type: SwipeType }) =>
      swipeService.swipeAction(targetId, type),
    onSuccess: (data) => {
      if (data.isMatch) {
        console.log('Match found!', data.matchId);
      }
      queryClient.invalidateQueries({ queryKey: ['swipeFeed'] });
    },
  });
};
