import { useState, useCallback } from 'react';
import { appwriteService } from '../services/appwriteService';

export const useLikePost = () => {
  const [isLiking, setIsLiking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const likePost = useCallback(
    async (postId: string) => {
      setIsLiking(true);
      setError(null);

      try {
        await appwriteService.likePost(postId);
      } catch (err: any) {
        setError(err.message || 'Ошибка при постановке лайка');
      } finally {
        setIsLiking(false);
      }
    },
    []
  );

  return { likePost, isLiking, error };
};