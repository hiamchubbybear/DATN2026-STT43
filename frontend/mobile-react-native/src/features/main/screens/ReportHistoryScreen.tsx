import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { reportService, UserReport } from '../../../services/api/reportService';
import { normalizeFont, spacing, radius } from '../../../shared/utils/responsive';

export const ReportHistoryScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await reportService.getMyReports();
      setReports(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return '#F59E0B'; // Pending
      case 1: return '#10B981'; // Resolved
      case 2: return '#EF4444'; // Dismissed
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return t('report.status.pending');
      case 1: return t('report.status.resolved');
      case 2: return t('report.status.dismissed');
      default: return t('report.status.unknown');
    }
  };

  const renderReportItem = ({ item }: { item: UserReport }) => (
    <View style={styles.reportCard}>
      <View style={styles.cardHeader}>
        <View style={styles.reasonContainer}>
          <Text style={styles.reasonText}>{item.reason}</Text>
          <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>

      <Text style={styles.descriptionText} numberOfLines={2}>{item.description}</Text>

      {item.adminFeedback && (
        <View style={styles.feedbackContainer}>
          <View style={styles.feedbackHeader}>
            <Ionicons name="chatbubble-ellipses-outline" size={14} color="#EE3F57" />
            <Text style={styles.feedbackTitle}>{t('report.admin_feedback')}</Text>
          </View>
          <Text style={styles.feedbackText}>{item.adminFeedback}</Text>
          {item.actionTaken && (
            <View style={styles.actionBadge}>
              <Text style={styles.actionText}>{t('report.action')}: {item.actionTaken}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('report.history_title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#EE3F57" />
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderReportItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EE3F57']} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>{t('report.no_history')}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(20),
    paddingVertical: spacing(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: { padding: spacing(8), marginLeft: -spacing(8) },
  headerTitle: { fontSize: normalizeFont(18), fontWeight: '700', color: '#111827' },
  listContent: { padding: spacing(16) },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius(16),
    padding: spacing(16),
    marginBottom: spacing(16),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing(12) },
  reasonContainer: { flex: 1 },
  reasonText: { fontSize: normalizeFont(16), fontWeight: '700', color: '#111827' },
  dateText: { fontSize: normalizeFont(12), color: '#9CA3AF', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: normalizeFont(11), fontWeight: '700', textTransform: 'uppercase' },
  descriptionText: { fontSize: normalizeFont(14), color: '#4B5563', lineHeight: 20 },
  feedbackContainer: {
    marginTop: spacing(16),
    padding: spacing(12),
    backgroundColor: '#F9FAFB',
    borderRadius: radius(12),
    borderLeftWidth: 3,
    borderLeftColor: '#EE3F57',
  },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  feedbackTitle: { fontSize: normalizeFont(12), fontWeight: '700', color: '#EE3F57', textTransform: 'uppercase' },
  feedbackText: { fontSize: normalizeFont(14), color: '#1F2937', fontStyle: 'italic' },
  actionBadge: { marginTop: 8, alignSelf: 'flex-start', backgroundColor: '#E5E7EB', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  actionText: { fontSize: normalizeFont(11), fontWeight: '600', color: '#4B5563' },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { fontSize: normalizeFont(16), color: '#9CA3AF', marginTop: 16 },
});
