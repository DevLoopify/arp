import PrimaryButton from '@/components/PrimaryButton';
import StarRating from '@/components/StarRating';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { useWorkplaces } from '@/context/WorkplacesContext';
import { api, Review } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ReviewScreen() {
  const { workplace, review } = useLocalSearchParams<{ workplace: string; review?: string }>();
  const parsedWorkplace = workplace ? JSON.parse(workplace) : null;
  const [editingReview] = useState<Review | null>(() => (review ? (JSON.parse(review) as Review) : null));
  const isEditMode = editingReview != null;

  const [rating, setRating] = useState(editingReview?.rating ?? 4);
  const [comment, setComment] = useState(editingReview?.comment ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const allowRemove = useRef(false);
  const { addReview, updateReview } = useWorkplaces();

  const hasUnsavedChanges = isEditMode
    ? rating !== editingReview.rating || comment !== editingReview.comment
    : rating !== 4 || comment.trim().length > 0;


  const handleSubmit = async () => {
    if (!parsedWorkplace) {
      router.back();
      return;
    }

    if (!comment.trim()) {
      setError('Please write a comment before submitting your review.');
      return;
    }
    setError(null);

    allowRemove.current = true;
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await updateReview(editingReview.id, { rating, comment });
      } else {
        await addReview(parsedWorkplace.id, { rating, comment });
      }
      const updatedWorkplace = await api.workplaces.get(parsedWorkplace.id);
      router.replace({
        pathname: '/(detail)/detail',
        params: {
          workplace: JSON.stringify(updatedWorkplace),
          reviewSubmitted: isEditMode ? 'updated' : 'created',
        },
      });
    } catch (err) {
      Alert.alert(
        isEditMode ? 'Could not update review' : 'Could not submit review',
        err instanceof Error ? err.message : 'Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackPress = () => {
    if (!hasUnsavedChanges) {
      router.back();
      return;
    }

    if (isEditMode) {
      Alert.alert('Discard changes?', 'You have unsaved changes. Do you want to discard them?', [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]);
      return;
    }

    Alert.alert(
      'Unsaved changes',
      'You have unsaved changes. Do you want to save them as a draft or discard them?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            allowRemove.current = true;
            router.back();
          },
        },
        {
          text: 'Save',
          onPress: () => {
            if (!comment.trim()) {
              // iOS silently drops an Alert triggered right as the previous one is
              // still dismissing, so give it a moment before showing the follow-up.
              setTimeout(() => {
                Alert.alert('Add a comment', 'Please write a comment before saving your review.');
              }, 400);
              return;
            }
            allowRemove.current = true;
            setTimeout(() => {
              handleSubmit();
            }, 400);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{isEditMode ? 'Edit Review' : 'Add Review'}</Text>
      </View>

      {parsedWorkplace ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.introText}>Help others know what to expect.</Text>

          <View style={styles.ratingSection}>
            <Text style={styles.sectionLabel}>Your Rating</Text>
            <View style={styles.ratingWrapper}>
              <StarRating rating={rating} onRatingChange={setRating} />
            </View>
          </View>

          <View>
            <Text style={styles.sectionLabel}>Your Review</Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="e.g. Quiet, great wifi, a bit crowded at noon..."
              placeholderTextColor={Colors.textMuted}
              multiline
              style={styles.commentInput}
            />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <PrimaryButton
            label={isSubmitting ? 'Submitting...' : isEditMode ? 'Save Changes' : 'Submit Review'}
            onPress={handleSubmit}
          />
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Workplace data is missing.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundBase,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: Colors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    ...Typography.screenTitle,
    flex: 1,
    fontSize: 20,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginRight: 36,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 20,
  },
  introText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ratingSection: {
    gap: 0,
  },
  sectionLabel: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  ratingWrapper: {
    alignItems: 'flex-start',
  },
  errorText: {
    ...Typography.caption,
    color: Colors.live,
  },
  commentInput: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 16,
    padding: 14,
    backgroundColor: Colors.backgroundWhite,
    textAlignVertical: 'top',
    color: Colors.textPrimary,
  },
  photoUploadBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#9CA3AF',
    backgroundColor: Colors.backgroundWhite,
    paddingVertical: 34,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoUploadContent: {
    alignItems: 'center',
    gap: 8,
  },
  photoUploadText: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 240,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
