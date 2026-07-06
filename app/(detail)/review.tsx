import PrimaryButton from '@/components/PrimaryButton';
import StarRating from '@/components/StarRating';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ReviewScreen() {
  const { workplace } = useLocalSearchParams<{ workplace: string }>();
  const parsedWorkplace = workplace ? JSON.parse(workplace) : null;
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const allowRemove = useRef(false);
  const defaultRating = 4;

  const hasUnsavedChanges = rating !== defaultRating || comment.trim().length > 0;


  const handleSubmit = () => {
    allowRemove.current = true;
    console.log('Review submitted', { rating, comment });
    router.back();
  };

  const handleBackPress = () => {
    if (hasUnsavedChanges) {
      setConfirmVisible(true);
      return;
    }

    router.back();
  };

  const handleDiscard = () => {
    allowRemove.current = true;
    setConfirmVisible(false);
    router.back();
  };

  const handleSaveAndClose = () => {
    allowRemove.current = true;
    setConfirmVisible(false);
    handleSubmit();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Add Review</Text>
      </View>

      {parsedWorkplace ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.ratingWrapper}>
            <StarRating rating={rating} onRatingChange={setRating} />
          </View>

          <Text style={styles.sectionLabel}>Review</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Add your Text here..."
            placeholderTextColor={Colors.textMuted}
            multiline
            style={styles.commentInput}
          />

 

          <PrimaryButton label="Submit Review" onPress={handleSubmit} />

          <Modal visible={confirmVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Unsaved changes</Text>
                <Text style={styles.modalMessage}>
                  You've made changes to your review. Do you want to discard them or save before leaving?
                </Text>
                <View style={styles.modalActions}>
                  <Pressable style={[styles.modalButton, styles.discardButton]} onPress={handleDiscard}>
                    <Text style={styles.discardText}>Discard</Text>
                  </Pressable>
                  <Pressable style={[styles.modalButton, styles.saveButton]} onPress={handleSaveAndClose}>
                    <Text style={styles.saveText}>Save</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Workplace-Daten fehlen.</Text>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  modalTitle: {
    ...Typography.sectionTitle,
    fontSize: 18,
    marginBottom: 12,
    color: Colors.textPrimary,
  },
  modalMessage: {
    ...Typography.body,
    fontSize: 15,
    color: Colors.textMuted,
    marginBottom: 20,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  discardButton: {
    backgroundColor: Colors.backgroundBase,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  discardText: {
    ...Typography.button,
    color: Colors.textPrimary,
  },
  saveText: {
    ...Typography.button,
    color: Colors.backgroundWhite,
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
