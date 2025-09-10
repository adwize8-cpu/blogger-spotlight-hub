import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BloggerData {
  id: string;
  handle: string;
  bio?: string;
  gender?: string;
  topics?: string[];
  post_price?: number;
  story_price?: number;
  barter_available?: boolean;
  mart_available?: boolean;
  work_conditions?: string;
  restricted_topics?: string[];
  profile: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
  platforms: Array<{
    id: string;
    platform_type: string;
    followers?: number;
    engagement_rate?: number;
    post_reach?: number;
    story_reach?: number;
    is_active?: boolean;
  }>;
}

export const useBloggers = () => {
  const [bloggers, setBloggers] = useState<BloggerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBloggers = async () => {
      try {
        setLoading(true);
        
        // Fetch bloggers with their profiles and platforms
        // Only select non-sensitive profile fields (exclude email)
        const { data, error } = await supabase
          .from('bloggers')
          .select(`
            id,
            handle,
            bio,
            gender,
            topics,
            post_price,
            story_price,
            barter_available,
            mart_available,
            work_conditions,
            restricted_topics,
            profile:profiles!inner(
              id,
              full_name,
              avatar_url
            ),
            platforms(
              id,
              platform_type,
              followers,
              engagement_rate,
              post_reach,
              story_reach,
              is_active
            )
          `)
          .eq('platforms.is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching bloggers:', error);
          setError(error.message);
        } else {
          setBloggers(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBloggers();
  }, []);

  return { bloggers, loading, error };
};