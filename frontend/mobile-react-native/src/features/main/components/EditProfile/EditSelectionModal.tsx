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

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      />
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
          showsVerticalScrollIndicator={false}
        />

        {isMultiSelect && (
          <TouchableOpacity style={styles.modalDoneButton} onPress={onClose}>
            <Text style={styles.modalDoneText}>Done</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '80%',
    paddingBottom: 20,
    zIndex: 201,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  closeButton: {
    padding: 4,
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
