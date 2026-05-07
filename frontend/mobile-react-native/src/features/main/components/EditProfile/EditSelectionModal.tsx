import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EditSelectionModalProps {
  visible: boolean;
  title: string;
  options: string[];
  selectedValues: string | string[];
  isMultiSelect: boolean;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export const EditSelectionModal = ({ 
  visible, 
  title, 
  options, 
  selectedValues, 
  isMultiSelect, 
  onSelect, 
  onClose 
}: EditSelectionModalProps) => {
  
  const isSelected = (option: string) => {
    if (Array.isArray(selectedValues)) {
      return selectedValues.includes(option);
    }
    return selectedValues === option;
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.optionItem} onPress={() => onSelect(item)}>
                <Text style={styles.optionText}>{item}</Text>
                {isSelected(item) && (
                  <Ionicons name="checkmark" size={20} color="#EE3F57" />
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
          />

          {isMultiSelect && (
            <TouchableOpacity style={styles.modalDoneButton} onPress={onClose}>
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  listContent: {
    paddingHorizontal: 24,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  modalDoneButton: {
    margin: 20,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EE3F57',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDoneText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
