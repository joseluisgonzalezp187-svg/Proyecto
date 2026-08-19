import { supabase } from '@/lib/supabase/client';
import { CreateForumPostInput, Profile, WorkoutComment, WorkoutPost } from '@/types/database';

const profileSelect = 'id, username, display_name';

export async function getMyProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function updateMyProfile(userId: string, values: { username: string; displayName: string }) {
  const username = values.username.trim().toLowerCase();
  const displayName = values.displayName.trim();
  if (!/^[a-z0-9_]{3,24}$/.test(username)) {
    throw new Error('El nombre de usuario debe tener entre 3 y 24 caracteres y solo usar letras, números o _.');
  }
  if (!displayName) throw new Error('El nombre visible no puede estar vacío.');
  const { data, error } = await supabase
    .from('profiles')
    .update({ username, display_name: displayName })
    .eq('id', userId)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function getCommunityFeed(userId?: string) {
  const { data: posts, error: postsError } = await supabase
    .from('workout_posts')
    .select('*')
    .order('created_at', { ascending: false });
  if (postsError) throw postsError;

  const postRows = (posts ?? []) as WorkoutPost[];
  const postIds = postRows.map((post) => post.id);
  const userIds = Array.from(new Set(postRows.map((post) => post.user_id)));
  if (!postIds.length) return [];

  const [{ data: comments, error: commentsError }, { data: reactions, error: reactionsError }, { data: profiles, error: profilesError }] = await Promise.all([
    supabase.from('workout_comments').select('*').in('post_id', postIds).order('created_at', { ascending: true }),
    supabase.from('workout_post_reactions').select('*').in('post_id', postIds),
    supabase.from('profiles').select(profileSelect).in('id', userIds),
  ]);
  if (commentsError) throw commentsError;
  if (reactionsError) throw reactionsError;
  if (profilesError) throw profilesError;

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  return postRows.map((post) => {
    const postReactions = (reactions ?? []).filter((reaction) => reaction.post_id === post.id);
    const postComments = (comments ?? []).filter((comment) => comment.post_id === post.id).map((comment) => ({
      ...comment,
      profile: profileMap.get(comment.user_id) ?? null,
    }));
    return {
      ...post,
      profile: profileMap.get(post.user_id) ?? null,
      comments: postComments,
      reactions: postReactions,
      reactionCount: postReactions.length,
      hasReacted: !!userId && postReactions.some((reaction) => reaction.user_id === userId),
    };
  });
}

export async function toggleWorkoutReaction(input: { postId: string; userId: string; reaction?: 'like' | 'fire' | 'strong' }) {
  const { data: existing, error: lookupError } = await supabase
    .from('workout_post_reactions')
    .select('id, reaction')
    .eq('post_id', input.postId)
    .eq('user_id', input.userId)
    .maybeSingle();
  if (lookupError) throw lookupError;

  if (existing) {
    if ((existing as { reaction: string }).reaction === (input.reaction ?? 'like')) {
      const { error } = await supabase.from('workout_post_reactions').delete().eq('id', (existing as { id: string }).id);
      if (error) throw error;
      return { active: false };
    }
    const { error } = await supabase.from('workout_post_reactions').update({ reaction: input.reaction ?? 'like' }).eq('id', (existing as { id: string }).id);
    if (error) throw error;
    return { active: true };
  }

  const { error } = await supabase.from('workout_post_reactions').insert({
    post_id: input.postId,
    user_id: input.userId,
    reaction: input.reaction ?? 'like',
  });
  if (error) throw error;
  return { active: true };
}

export async function createWorkoutPost(input: {
  userId: string;
  workoutSessionId?: string | null;
  title: string;
  content?: string;
  durationSeconds?: number;
  completedSets: number;
  totalSets: number;
  exerciseCount: number;
}) {
  const { data, error } = await supabase.from('workout_posts').insert({
    user_id: input.userId,
    workout_session_id: input.workoutSessionId ?? null,
    title: input.title.trim() || 'Entrenamiento completado',
    content: input.content?.trim() || null,
    category: 'general',
    duration_seconds: input.durationSeconds ?? null,
    completed_sets: input.completedSets,
    total_sets: input.totalSets,
    exercise_count: input.exerciseCount,
  }).select('*').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('No se pudo crear la publicación. Comprueba las políticas RLS de workout_posts.');
  return data as WorkoutPost;
}

export async function createForumPost(input: CreateForumPostInput) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error('Debes iniciar sesión para publicar un tema.');
  const title = input.title.trim();
  const content = input.content.trim();
  if (title.length < 3) throw new Error('El título debe tener al menos 3 caracteres.');
  if (content.length < 1) throw new Error('Escribe el contenido del tema.');
  const { data, error } = await supabase.from('workout_posts').insert({
    user_id: authData.user.id,
    title,
    content,
    category: input.category,
    workout_session_id: null,
    duration_seconds: null,
    completed_sets: 0,
    total_sets: 0,
    exercise_count: 0,
  }).select('*').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('No se pudo publicar el tema. Comprueba las políticas RLS de workout_posts.');
  return data as WorkoutPost;
}

export async function addWorkoutComment(input: { postId: string; userId: string; content: string }) {
  const content = input.content.trim();
  if (!content) throw new Error('Escribe un comentario antes de publicarlo.');
  const { data, error } = await supabase.from('workout_comments').insert({
    post_id: input.postId,
    user_id: input.userId,
    content,
  }).select('*').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('No se pudo crear el comentario. Comprueba las políticas RLS de workout_comments.');
  const commentData = data as WorkoutComment & { profile?: Pick<Profile, 'username' | 'display_name'> | Pick<Profile, 'username' | 'display_name'>[] | null };
  const rawProfile = commentData.profile;
  return {
    ...commentData,
    profile: Array.isArray(rawProfile) ? rawProfile[0] ?? null : rawProfile ?? null,
  } as WorkoutComment;
}
