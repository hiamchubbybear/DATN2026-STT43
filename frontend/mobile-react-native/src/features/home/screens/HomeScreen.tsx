import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { usePosts } from '../api/usePosts';
import { normalizeFont, radius, spacing, verticalScale } from '../../../shared/utils/responsive';

export const HomeScreen = () => {
  const { data, isLoading, isError, error, refetch } = usePosts();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error: {error?.message}</Text>
        <TouchableOpacity style={styles.button} onPress={() => refetch()}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data || !Array.isArray(data)) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Invalid data received from server. Make sure the API endpoint is correct.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => refetch()}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Black & White minimal style as requested
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: spacing(16),
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: radius(8),
    padding: spacing(16),
    marginBottom: spacing(12),
  },
  title: {
    fontSize: normalizeFont(16),
    fontWeight: 'bold',
    marginBottom: spacing(8),
    color: '#000',
  },
  body: {
    fontSize: normalizeFont(14),
    color: '#666',
  },
  errorText: {
    fontSize: normalizeFont(16),
    color: '#d93025',
    marginBottom: spacing(16),
  },
  button: {
    backgroundColor: '#000',
    paddingHorizontal: spacing(24),
    paddingVertical: spacing(12),
    borderRadius: radius(8),
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: normalizeFont(14),
  },
});
