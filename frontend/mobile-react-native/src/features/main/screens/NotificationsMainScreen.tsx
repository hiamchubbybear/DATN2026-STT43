import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, RefreshControl, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { normalizeFont, radius, scale, spacing, verticalScale } from '../../../shared/utils/responsive';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService, type NotificationDto } from '../../../services/api/notificationService';
import { useTranslation } from 'react-i18next';

function formatTime(iso: string, t: any) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return t('notifications.just_now');
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function toneForType(type?: string) {
  switch ((type || '').toLowerCase()) {
    case 'match':
      return { icon: 'heart' as const, tone: '#8A2387', bg: '#F5E9FF' };
    case 'message':
      return { icon: 'chatbubble' as const, tone: '#3B82F6', bg: '#EFF6FF' };
    case 'warning':
      return { icon: 'warning' as const, tone: '#F59E0B', bg: '#FFFBEB' };
    case 'admin':
      return { icon: 'shield-checkmark' as const, tone: '#EE3F57', bg: '#FDECEF' };
    default:
      return { icon: 'information-circle' as const, tone: '#6B7280', bg: '#F3F4F6' };
  }
}

export const NotificationsMainScreen = () => {
  const qc = useQueryClient();
  const { t } = useTranslation();
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.list,
  });

  const del = useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['notifications'] });
      const prev = qc.getQueryData<NotificationDto[]>(['notifications']);
      qc.setQueryData<NotificationDto[]>(['notifications'], (cur) => (cur || []).filter((x) => x.id !== id));
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['notifications'], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
      >
        <Text style={styles.title}>{t('notifications.title')}</Text>

        <Text style={styles.sectionTitle}>{t('notifications.section_title')}</Text>
        <View style={styles.list}>
          {!isLoading && (!data || data.length === 0) ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="notifications-off-outline" size={normalizeFont(22)} color="#9CA3AF" />
              <Text style={styles.emptyText}>{t('notifications.empty')}</Text>
            </View>
          ) : null}

          {(data || []).map((item) => {
            const t = toneForType(item.type);
            return (
            <TouchableOpacity
              key={item.id}
              style={styles.listRow}
              activeOpacity={0.85}
              onLongPress={() =>
                Alert.alert(t('notifications.delete_title'), t('notifications.delete_confirm'), [
                  { text: t('common.cancel'), style: 'cancel' },
                  { text: t('common.delete', 'Delete'), style: 'destructive', onPress: () => del.mutate(item.id) },
                ])
              }
            >
              <View style={styles.leading}>
                <View style={[styles.alertIconWrap, { backgroundColor: t.bg }]}>
                  <Ionicons
                    name={t.icon}
                    size={normalizeFont(18)}
                    color={t.tone}
                  />
                </View>
              </View>

              <View style={styles.listBody}>
                <Text style={styles.listTitle}>{item.title}</Text>
                <Text style={styles.listMessage} numberOfLines={1}>{item.content}</Text>
                <Text style={styles.typeText}>{(item.type || 'info').toUpperCase()}</Text>
              </View>

              <View style={styles.listMeta}>
                <Text style={styles.timeText}>{formatTime(item.createdAt, t)}</Text>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(t('notifications.delete_title'), t('notifications.delete_confirm'), [
                      { text: t('common.cancel'), style: 'cancel' },
                      { text: t('common.delete', 'Delete'), style: 'destructive', onPress: () => del.mutate(item.id) },
                    ])
                  }
                  hitSlop={10}
                  style={styles.trashBtn}
                >
                  <Ionicons name="trash-outline" size={normalizeFont(18)} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )})}
        </View>
      </ScrollView>
      <View style={styles.homeIndicator} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing(20),
    paddingTop: spacing(10),
    paddingBottom: spacing(120),
  },
  title: {
    fontSize: normalizeFont(32),
    fontWeight: '800',
    color: '#333333',
    marginBottom: spacing(10),
  },
  sectionTitle: {
    marginTop: spacing(8),
    marginBottom: spacing(6),
    fontSize: normalizeFont(13),
    fontWeight: '700',
    color: '#333333',
  },
  list: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  emptyWrap: {
    paddingVertical: spacing(18),
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(8),
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  emptyText: {
    fontSize: normalizeFont(13),
    color: '#9CA3AF',
    fontWeight: '600',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(12),
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  leading: {
    width: scale(54),
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertIconWrap: {
    width: scale(40),
    height: scale(40),
    borderRadius: radius(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  listBody: {
    flex: 1,
    paddingRight: spacing(12),
  },
  listTitle: {
    fontSize: normalizeFont(14),
    fontWeight: '600',
    color: '#333333',
  },
  listMessage: {
    marginTop: spacing(4),
    fontSize: normalizeFont(12),
    color: '#ADAFBB',
  },
  typeText: {
    marginTop: spacing(6),
    fontSize: normalizeFont(10),
    color: '#9CA3AF',
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  listMeta: {
    alignItems: 'flex-end',
    gap: spacing(4),
  },
  timeText: {
    fontSize: normalizeFont(11),
    color: '#ADAFBB',
  },
  trashBtn: {
    padding: spacing(6),
    borderRadius: radius(10),
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: verticalScale(70),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: spacing(10),
  },
  navItem: {
    width: scale(44),
    height: scale(44),
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: spacing(6),
    left: '50%',
    marginLeft: -scale(60),
    width: scale(120),
    height: verticalScale(4),
    borderRadius: radius(3),
    backgroundColor: '#E2E8F0',
  },
});
