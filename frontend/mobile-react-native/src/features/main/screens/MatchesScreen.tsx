import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const matchCards = [
  { id: 'm-1', name: 'Leilani, 19', image: require('../../../../assets/images/anh1.jpg'), section: 'Today' },
  { id: 'm-2', name: 'Annabelle, 20', image: require('../../../../assets/images/anh2.jpg'), section: 'Today' },
  { id: 'm-3', name: 'Reagan, 24', image: require('../../../../assets/images/anh3.jpg'), section: 'Today' },
  { id: 'm-4', name: 'Adry, 25', image: require('../../../../assets/images/anh1.jpg'), section: 'Today' },
  { id: 'm-5', name: 'Sofia, 21', image: require('../../../../assets/images/anh2.jpg'), section: 'Yesterday' },
  { id: 'm-6', name: 'Cassie, 23', image: require('../../../../assets/images/anh3.jpg'), section: 'Yesterday' },
];

export const MatchesScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Matches</Text>
            <Text style={styles.subtitle}>This is a list of people who have liked you and your matches.</Text>
          </View>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.85}>
            <Ionicons name="options-outline" size={18} color="#EE3F57" />
          </TouchableOpacity>
        </View>

        {(['Today', 'Yesterday'] as const).map((section) => (
          <View key={section}>
            <Text style={styles.sectionLabel}>{section}</Text>

            <View style={styles.grid}>
              {matchCards
                .filter((item) => item.section === section)
                .map((item) => (
                  <View key={item.id} style={styles.card}>
                    <Image source={item.image} style={styles.cardImage} />
                    <View style={styles.overlay}>
                      <Text style={styles.name}>{item.name}</Text>

                      <View style={styles.iconRow}>
                        <View style={styles.roundIconDark}>
                          <Ionicons name="close" size={14} color="#FFFFFF" />
                        </View>
                        <View style={styles.roundIconLight}>
                          <Ionicons name="heart" size={13} color="#EE3F57" />
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
            </View>
          </View>
        ))}

        <View style={styles.bottomSpacer} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F7F8' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 4 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  title: { fontSize: 34, fontWeight: '800', color: '#111111' },
  subtitle: { marginTop: 6, fontSize: 13, color: '#71717A', maxWidth: 248, lineHeight: 18 },
  filterBtn: {
    marginTop: 8,
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECECF1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 12,
    color: '#A1A1AA',
    fontWeight: '600',
    alignSelf: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  card: {
    width: '48%',
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#D4D4D8',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 22,
    backgroundColor: 'rgba(0,0,0,0.34)',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  iconRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roundIconDark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundIconLight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacer: {
    height: 84,
  },
});
