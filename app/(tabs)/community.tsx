import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Button, Card, Chip, Divider, HelperText, IconButton, Text, TextInput } from 'react-native-paper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/providers/AuthProvider';
import { useAddWorkoutComment, useCommunityFeed, useCreateForumPost, useMyProfile, useToggleWorkoutReaction } from '@/hooks/useCommunity';
import { APP_COLORS, APP_RADIUS, APP_SHADOWS, APP_SPACING } from '@/lib/constants';
import { ForumCategory, WorkoutComment, WorkoutPost } from '@/types/database';

const categories: Array<{ value: ForumCategory; label: string; icon: string }> = [
  { value: 'general', label: 'General', icon: 'chat-outline' },
  { value: 'rutinas', label: 'Rutinas', icon: 'calendar-edit' },
  { value: 'ejercicios', label: 'Ejercicios', icon: 'dumbbell' },
  { value: 'nutricion', label: 'Nutrición', icon: 'food-apple-outline' },
  { value: 'progreso', label: 'Progreso', icon: 'chart-line' },
  { value: 'preguntas', label: 'Preguntas', icon: 'help-circle-outline' },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(value));
}

function formatDuration(seconds: number | null) {
  if (seconds == null) return null;
  return `${Math.floor(seconds / 60)} min`;
}

function CommentRow({ comment }: { comment: WorkoutComment }) {
  return (
    <View style={styles.commentRow}>
      <View style={styles.commentAvatar}><Text style={styles.avatarText}>{(comment.profile?.username ?? 'u').slice(0, 1).toUpperCase()}</Text></View>
      <View style={styles.commentCopy}>
        <Text style={styles.commentAuthor}>@{comment.profile?.username ?? 'usuario'}</Text>
        <Text style={styles.commentText}>{comment.content}</Text>
      </View>
    </View>
  );
}

function PostCard({ post }: { post: WorkoutPost }) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState((post.comments?.length ?? 0) > 0);
  const addComment = useAddWorkoutComment();
  const toggleReaction = useToggleWorkoutReaction();
  const author = post.profile?.username ?? 'usuario';
  const category = categories.find((item) => item.value === post.category) ?? categories[0];

  const react = async (reaction: 'like' | 'fire' | 'strong') => {
    if (!user || toggleReaction.isPending) return;
    await toggleReaction.mutateAsync({ postId: post.id, userId: user.id, reaction });
  };

  const submitComment = async () => {
    if (!user || !comment.trim() || addComment.isPending) return;
    await addComment.mutateAsync({ postId: post.id, userId: user.id, content: comment });
    setComment('');
    setShowComments(true);
  };

  return (
    <Card style={styles.postCard} mode="elevated">
      <Card.Content>
        <View style={styles.postHeader}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{author.slice(0, 1).toUpperCase()}</Text></View>
          <View style={styles.authorCopy}>
            <Text style={styles.authorName}>@{author}</Text>
            <Text style={styles.postDate}>{formatDate(post.created_at)}</Text>
          </View>
          <Chip compact icon={category.icon} textStyle={styles.categoryText} style={styles.categoryChip}>{category.label}</Chip>
        </View>
        <Text variant="titleLarge" style={styles.postTitle}>{post.title}</Text>
        {post.content ? <Text style={styles.postContent}>{post.content}</Text> : null}
        {post.total_sets > 0 ? (
          <View style={styles.statsRow}>
            <View style={styles.stat}><MaterialCommunityIcons name="check-circle-outline" size={16} color={APP_COLORS.success} /><Text style={styles.statText}>{post.completed_sets}/{post.total_sets} sets</Text></View>
            <View style={styles.stat}><MaterialCommunityIcons name="timer-outline" size={16} color={APP_COLORS.primary} /><Text style={styles.statText}>{formatDuration(post.duration_seconds) ?? 'Sesión'}</Text></View>
            <View style={styles.stat}><MaterialCommunityIcons name="format-list-bulleted" size={16} color={APP_COLORS.textMuted} /><Text style={styles.statText}>{post.exercise_count} ejercicios</Text></View>
          </View>
        ) : null}
        <Divider style={styles.divider} />
        <View style={styles.socialRow}>
          <Button mode={post.hasReacted ? 'contained-tonal' : 'text'} compact textColor={post.hasReacted ? APP_COLORS.primary : APP_COLORS.textMuted} icon={post.hasReacted ? 'thumb-up' : 'thumb-up-outline'} onPress={() => react('like')} loading={toggleReaction.isPending} disabled={toggleReaction.isPending}>{post.reactionCount ?? 0} Like</Button>
          <IconButton icon="fire" size={19} iconColor={APP_COLORS.warning} onPress={() => react('fire')} disabled={toggleReaction.isPending} accessibilityLabel="Reaccionar con fuego" />
          <IconButton icon="arm-flex" size={19} iconColor={APP_COLORS.primary} onPress={() => react('strong')} disabled={toggleReaction.isPending} accessibilityLabel="Reaccionar con fuerza" />
          <View style={styles.socialSpacer} />
          <Button mode="text" compact textColor={APP_COLORS.textMuted} icon={showComments ? 'chevron-up' : 'comment-outline'} onPress={() => setShowComments((value) => !value)}>{post.comments?.length ?? 0} comentarios</Button>
        </View>
        {showComments ? (
          <View style={styles.commentsSection}>
            {(post.comments ?? []).map((item) => <CommentRow key={item.id} comment={item} />)}
            <View style={styles.commentComposer}>
              <TextInput mode="outlined" dense value={comment} onChangeText={setComment} placeholder="Escribe una respuesta…" placeholderTextColor={APP_COLORS.textMuted} textColor={APP_COLORS.text} outlineColor={APP_COLORS.borderStrong} activeOutlineColor={APP_COLORS.primary} style={styles.commentInput} onSubmitEditing={submitComment} returnKeyType="send" />
              <IconButton icon="send" iconColor={APP_COLORS.primary} disabled={!comment.trim() || addComment.isPending} loading={addComment.isPending} onPress={submitComment} />
            </View>
          </View>
        ) : null}
      </Card.Content>
    </Card>
  );
}

export default function CommunityScreen() {
  const { user } = useAuth();
  const { data: profile } = useMyProfile(user?.id);
  const { data: posts = [], isLoading, isError, error, refetch, isRefetching } = useCommunityFeed(user?.id);
  const createPost = useCreateForumPost();
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ForumCategory>('general');
  const errorMessage = isError ? ((error as { message?: string } | null)?.message ?? 'Error desconocido al consultar Supabase.') : '';

  const publish = async () => {
    if (!user) return;
    await createPost.mutateAsync({ userId: user.id, title, content, category });
    setTitle('');
    setContent('');
    setCategory('general');
    setComposerOpen(false);
  };

  const header = (
    <View>
      <ScreenHeader eyebrow="FORO DE ENTRENAMIENTO" title="Entrena acompañado" subtitle={profile ? `Comparte ideas como @${profile.username} y conversa con la comunidad.` : 'Comparte dudas, ideas, rutinas y progreso con otras personas.'} />
      <Button mode="contained" buttonColor={APP_COLORS.primary} textColor={APP_COLORS.background} icon={composerOpen ? 'close' : 'plus'} onPress={() => setComposerOpen((value) => !value)} style={styles.newTopicButton}> {composerOpen ? 'Cerrar' : 'Nuevo tema'} </Button>
      {composerOpen ? (
        <Card style={styles.composerCard} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.composerTitle}>Crear un tema</Text>
            <Text style={styles.composerHint}>Pregunta, comparte una rutina o cuenta cómo va tu progreso.</Text>
            <TextInput mode="outlined" label="Título del tema" value={title} onChangeText={setTitle} maxLength={100} textColor={APP_COLORS.text} outlineColor={APP_COLORS.borderStrong} activeOutlineColor={APP_COLORS.primary} style={styles.formInput} />
            <TextInput mode="outlined" label="Escribe tu publicación" value={content} onChangeText={setContent} multiline numberOfLines={5} maxLength={2000} textColor={APP_COLORS.text} outlineColor={APP_COLORS.borderStrong} activeOutlineColor={APP_COLORS.primary} style={styles.formInput} />
            <Text style={styles.categoryLabel}>Categoría</Text>
            <View style={styles.categoryRow}>{categories.map((item) => <Chip key={item.value} selected={category === item.value} onPress={() => setCategory(item.value)} style={[styles.selectChip, category === item.value && styles.selectedChip]} textStyle={category === item.value ? styles.selectedChipText : styles.categoryText}>{item.label}</Chip>)}</View>
            {createPost.isError ? <HelperText type="error" visible>{(createPost.error as Error).message}</HelperText> : null}
            <Button mode="contained" buttonColor={APP_COLORS.primary} textColor={APP_COLORS.background} loading={createPost.isPending} disabled={createPost.isPending || !title.trim() || !content.trim()} onPress={publish} style={styles.publishButton}>Publicar tema</Button>
          </Card.Content>
        </Card>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList data={posts} keyExtractor={(item) => item.id} renderItem={({ item }) => <PostCard post={item} />} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshing={isRefetching} onRefresh={refetch} ListHeaderComponent={header} ListEmptyComponent={isLoading ? <ActivityIndicator color={APP_COLORS.primary} style={styles.loader} /> : <View style={styles.empty}><MaterialCommunityIcons name="forum-outline" size={42} color={APP_COLORS.primary} /><Text variant="titleMedium" style={styles.emptyTitle}>{isError ? 'No se pudo cargar el foro' : 'Todavía no hay temas'}</Text><Text style={styles.emptyText}>{isError ? `${errorMessage} Ejecuta la migración social de Supabase.` : 'Sé la primera persona en abrir una conversación de entrenamiento.'}</Text></View>} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  content: { padding: APP_SPACING.lg, paddingBottom: APP_SPACING.xxxl, gap: APP_SPACING.md },
  newTopicButton: { marginBottom: APP_SPACING.md },
  composerCard: { backgroundColor: APP_COLORS.surfaceElevated, borderColor: APP_COLORS.borderStrong, borderRadius: APP_RADIUS.xl, borderWidth: 1, marginBottom: APP_SPACING.md },
  composerTitle: { color: APP_COLORS.text, fontWeight: '800' },
  composerHint: { color: APP_COLORS.textMuted, lineHeight: 19, marginTop: 4 },
  formInput: { backgroundColor: APP_COLORS.surface, marginTop: APP_SPACING.md },
  categoryLabel: { color: APP_COLORS.text, fontWeight: '700', marginTop: APP_SPACING.md },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: APP_SPACING.xs, marginTop: APP_SPACING.sm },
  selectChip: { backgroundColor: APP_COLORS.surface, borderColor: APP_COLORS.border },
  selectedChip: { backgroundColor: APP_COLORS.surfaceAccent },
  selectedChipText: { color: APP_COLORS.primary, fontWeight: '800' },
  publishButton: { marginTop: APP_SPACING.lg },
  loader: { marginTop: APP_SPACING.xl },
  postCard: { ...APP_SHADOWS.card, backgroundColor: APP_COLORS.surfaceElevated, borderColor: APP_COLORS.borderStrong, borderRadius: APP_RADIUS.xl, borderWidth: 1 },
  postHeader: { alignItems: 'center', flexDirection: 'row' },
  avatar: { alignItems: 'center', backgroundColor: APP_COLORS.surfaceAccent, borderRadius: APP_RADIUS.pill, height: 42, justifyContent: 'center', width: 42 },
  commentAvatar: { alignItems: 'center', backgroundColor: APP_COLORS.surfaceAccent, borderRadius: APP_RADIUS.pill, height: 30, justifyContent: 'center', width: 30 },
  avatarText: { color: APP_COLORS.primary, fontWeight: '800' },
  authorCopy: { flex: 1, marginLeft: APP_SPACING.sm },
  authorName: { color: APP_COLORS.text, fontWeight: '800' },
  postDate: { color: APP_COLORS.textMuted, fontSize: 12, marginTop: 2 },
  categoryChip: { backgroundColor: APP_COLORS.surfaceAccent },
  categoryText: { color: APP_COLORS.primary, fontSize: 11 },
  postTitle: { color: APP_COLORS.text, fontWeight: '800', marginTop: APP_SPACING.lg },
  postContent: { color: APP_COLORS.textMuted, lineHeight: 20, marginTop: APP_SPACING.xs },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: APP_SPACING.md, marginTop: APP_SPACING.lg },
  stat: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  statText: { color: APP_COLORS.textMuted, fontSize: 12 },
  divider: { backgroundColor: APP_COLORS.border, marginTop: APP_SPACING.md },
  socialRow: { alignItems: 'center', flexDirection: 'row', minHeight: 48 },
  socialSpacer: { flex: 1 },
  commentsSection: { marginTop: APP_SPACING.xs },
  commentRow: { flexDirection: 'row', gap: APP_SPACING.sm, marginBottom: APP_SPACING.sm },
  commentCopy: { flex: 1 },
  commentAuthor: { color: APP_COLORS.text, fontSize: 12, fontWeight: '800' },
  commentText: { color: APP_COLORS.textMuted, lineHeight: 18, marginTop: 2 },
  commentComposer: { alignItems: 'center', flexDirection: 'row', marginTop: APP_SPACING.xs },
  commentInput: { backgroundColor: APP_COLORS.surface, flex: 1, height: 46 },
  empty: { alignItems: 'center', paddingHorizontal: APP_SPACING.lg, paddingVertical: APP_SPACING.xxxl },
  emptyTitle: { color: APP_COLORS.text, fontWeight: '800', marginTop: APP_SPACING.md, textAlign: 'center' },
  emptyText: { color: APP_COLORS.textMuted, lineHeight: 20, marginTop: APP_SPACING.xs, textAlign: 'center' },
});
