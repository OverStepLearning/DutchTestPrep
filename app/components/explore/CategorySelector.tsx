import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { FeedbackCategory } from '../../types/feedback';

interface CategorySelectorProps {
  categories: FeedbackCategory[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <View>
      <ThemedText style={styles.label}>Category *</ThemedText>
      <View style={styles.categoryContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryButton,
              selectedCategory === cat.id && styles.categoryButtonSelected
            ]}
            onPress={() => onSelectCategory(cat.id)}
          >
            <Ionicons 
              name={cat.icon as any} 
              size={22} 
              color={selectedCategory === cat.id ? '#4f86f7' : '#666'} 
            />
            <ThemedText
              style={[
                styles.categoryText,
                selectedCategory === cat.id && styles.categoryTextSelected
              ]}
            >
              {cat.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  categoryButtonSelected: {
    borderColor: '#4f86f7',
    backgroundColor: '#ebf1ff',
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  categoryTextSelected: {
    color: '#4f86f7',
    fontWeight: '500',
  },
}); 