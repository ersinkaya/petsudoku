import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PET_CONFIGS } from '../assets/petConfig';
import {
  getLeaderboardData,
  LeaderboardPlayer,
} from '../services/leaderboardService';
import { useProfileStore } from '../state/profileStore';
import { Feedback } from '../utils/feedback';

export interface LeaderboardModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  visible,
  onClose,
}) => {
  const pet = useProfileStore((state) => state.pet) || 'cat';
  const rewards = useProfileStore((state) => state.rewards);
  const currentLevel = useProfileStore((state) => state.currentLevel);
  const hapticsEnabled = useProfileStore((state) => state.settings.haptics);
  const soundEnabled = useProfileStore((state) => state.settings.sound);

  const petConfig = PET_CONFIGS[pet];
  const userTreats = rewards[petConfig.rewardId] || 0;

  const [leaderboard, setLeaderboard] = useState(() =>
    getLeaderboardData(pet, userTreats, currentLevel)
  );

  const [cheeredPlayers, setCheeredPlayers] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState('🐾 ST0CR6 seni destekliyor...');

  useEffect(() => {
    if (visible) {
      setLeaderboard(getLeaderboardData(pet, userTreats, currentLevel));
    }
  }, [visible, pet, userTreats, currentLevel]);

  const formatCountdown = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCheer = (playerId: string, playerName: string) => {
    Feedback.buttonPress(hapticsEnabled, soundEnabled);
    setCheeredPlayers((prev) => ({
      ...prev,
      [playerId]: (prev[playerId] || 0) + 1,
    }));
    setToastMessage(`❤️ ${playerName} oyuncusuna destek gönderdin!`);
    setTimeout(() => {
      setToastMessage('🐾 ST0CR6 seni destekliyor...');
    }, 3000);
  };

  const { podium, rankings, userRank, tournament } = leaderboard;
  const p1 = podium.find((p) => p.rank === 1) || podium[0];
  const p2 = podium.find((p) => p.rank === 2) || podium[1];
  const p3 = podium.find((p) => p.rank === 3) || podium[2];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={{ width: 36 }} />
            <View style={styles.titleWrapper}>
              <Text style={styles.titleShadow}>Liderlik Tablosu</Text>
              <Text style={styles.titleText}>Liderlik Tablosu</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Tournament Multiplier Progress & Timer Bar */}
          <View style={styles.tournamentBar}>
            <View style={styles.multiplierTrack}>
              <View style={styles.multiplierNode}>
                <Text style={styles.multiplierLabel}>x1</Text>
              </View>
              <View style={[styles.multiplierNode, styles.multiplierActive]}>
                <Text style={styles.multiplierLabelActive}>x3</Text>
                <View style={styles.bonusBadge}>
                  <Text style={styles.bonusText}>{tournament.bonusRewardText}</Text>
                </View>
              </View>
              <View style={styles.multiplierNode}>
                <Text style={styles.multiplierLabel}>x4</Text>
              </View>
              <View style={styles.multiplierNode}>
                <Text style={styles.multiplierLabel}>x5</Text>
              </View>
            </View>

            <View style={styles.timerBadge}>
              <Text style={styles.timerText}>
                ⏳ {formatCountdown(tournament.timeLeftSeconds)}
              </Text>
            </View>
          </View>

          {/* Cheering Toast Notification Bubble */}
          <View style={styles.toastBubble}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* 3D Podium Stage (Podyum) */}
            <View style={styles.podiumStage}>
              {/* #2 Place Pedestal (Lavender / Left) */}
              {p2 && (
                <View style={styles.podiumColumn}>
                  <View style={[styles.avatarBox, { backgroundColor: p2.avatarBgColor }]}>
                    <Text style={styles.avatarEmoji}>{p2.petEmoji}</Text>
                    <View style={styles.levelTag}>
                      <Text style={styles.levelTagText}>Sv.{p2.level}</Text>
                    </View>
                  </View>
                  <View style={[styles.pedestal, styles.pedestal2]}>
                    <View style={styles.rankBadge2}>
                      <Text style={styles.rankBadgeText}>2</Text>
                    </View>
                    <Text style={styles.podiumName} numberOfLines={1}>
                      {p2.name}
                    </Text>
                    <View style={styles.podiumStatsRow}>
                      <Text style={styles.podiumTreatPill}>
                        {p2.treatEmoji} {p2.treatCount}
                      </Text>
                      <Text style={styles.podiumHeartText}>
                        ❤️ {p2.cheerHearts + (cheeredPlayers[p2.id] || 0)}
                      </Text>
                    </View>
                    <Text style={styles.podiumTimeText}>{p2.activityTimeTr}</Text>
                  </View>
                </View>
              )}

              {/* #1 Place Pedestal (Gold / Center / Tallest) */}
              {p1 && (
                <View style={[styles.podiumColumn, styles.podiumCenter]}>
                  <View style={[styles.avatarBox, styles.avatarBox1, { backgroundColor: p1.avatarBgColor }]}>
                    <View style={styles.crownWrapper}>
                      <Text style={styles.crownEmoji}>👑</Text>
                    </View>
                    <Text style={styles.avatarEmoji}>{p1.petEmoji}</Text>
                    <View style={styles.levelTag}>
                      <Text style={styles.levelTagText}>Sv.{p1.level}</Text>
                    </View>
                  </View>
                  <View style={[styles.pedestal, styles.pedestal1]}>
                    <View style={styles.rankBadge1}>
                      <Text style={styles.rankBadgeText}>1</Text>
                    </View>
                    <Text style={styles.podiumName1} numberOfLines={1}>
                      {p1.name}
                    </Text>
                    <View style={styles.podiumStatsRow}>
                      <Text style={styles.podiumTreatPill}>
                        {p1.treatEmoji} {p1.treatCount}
                      </Text>
                      <Text style={styles.podiumHeartText}>
                        ❤️ {p1.cheerHearts + (cheeredPlayers[p1.id] || 0)}
                      </Text>
                    </View>
                    <Text style={styles.podiumTimeText}>{p1.activityTimeTr}</Text>
                  </View>
                </View>
              )}

              {/* #3 Place Pedestal (Bronze / Right) */}
              {p3 && (
                <View style={styles.podiumColumn}>
                  <View style={[styles.avatarBox, { backgroundColor: p3.avatarBgColor }]}>
                    <Text style={styles.avatarEmoji}>{p3.petEmoji}</Text>
                    <View style={styles.levelTag}>
                      <Text style={styles.levelTagText}>Sv.{p3.level}</Text>
                    </View>
                  </View>
                  <View style={[styles.pedestal, styles.pedestal3]}>
                    <View style={styles.rankBadge3}>
                      <Text style={styles.rankBadgeText}>3</Text>
                    </View>
                    <Text style={styles.podiumName} numberOfLines={1}>
                      {p3.name}
                    </Text>
                    <View style={styles.podiumStatsRow}>
                      <Text style={styles.podiumTreatPill}>
                        {p3.treatEmoji} {p3.treatCount}
                      </Text>
                      <Text style={styles.podiumHeartText}>
                        ❤️ {p3.cheerHearts + (cheeredPlayers[p3.id] || 0)}
                      </Text>
                    </View>
                    <Text style={styles.podiumTimeText}>{p3.activityTimeTr}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Rankings List */}
            <View style={styles.listContainer}>
              {rankings.map((player) => {
                const isUser = player.isCurrentUser;
                const hearts = player.cheerHearts + (cheeredPlayers[player.id] || 0);

                return (
                  <View
                    key={player.id}
                    style={[
                      styles.rankRow,
                      isUser && styles.rankRowUser,
                    ]}
                  >
                    <Text style={[styles.rankNumber, isUser && styles.rankNumberUser]}>
                      {player.rank}
                    </Text>

                    <View style={[styles.listAvatar, { backgroundColor: player.avatarBgColor }]}>
                      <Text style={styles.listAvatarEmoji}>{player.petEmoji}</Text>
                      <View style={styles.listLevelTag}>
                        <Text style={styles.listLevelText}>Sv.{player.level}</Text>
                      </View>
                    </View>

                    <View style={styles.playerInfoCol}>
                      <Text style={[styles.playerName, isUser && styles.playerNameUser]}>
                        {player.name}
                      </Text>
                      <Text
                        style={[
                          styles.playerStatus,
                          player.activityTimeTr.includes('Şimdi') && styles.playerStatusOnline,
                        ]}
                      >
                        {player.activityTimeTr}
                      </Text>
                    </View>

                    {/* Treats Count Pill */}
                    <View style={styles.treatPill}>
                      <Text style={styles.treatPillEmoji}>{player.treatEmoji}</Text>
                      <Text style={styles.treatPillCount}>{player.treatCount}</Text>
                    </View>

                    {/* Cheer Heart Button */}
                    <TouchableOpacity
                      style={styles.cheerBtn}
                      onPress={() => handleCheer(player.id, player.name)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cheerHeartIcon}>❤️</Text>
                      <Text style={styles.cheerHeartCount}>{hearts}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* User Status Bar in Bottom Sheet */}
          <View style={styles.userFooter}>
            <Text style={styles.userFooterText}>
              🏆 Sıralaman: <Text style={styles.userFooterRank}>#{userRank}</Text> • Toplam: {userTreats} {petConfig.rewardNameTr}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 14, 26, 0.85)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FAF5FF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '92%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 10,
  },
  titleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleShadow: {
    position: 'absolute',
    top: 2,
    fontSize: 26,
    fontWeight: '900',
    color: '#7B341E',
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFB800',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#4A5568',
  },
  tournamentBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F3E8FF',
  },
  multiplierTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  multiplierNode: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  multiplierActive: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  multiplierLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
  },
  multiplierLabelActive: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  bonusBadge: {
    backgroundColor: '#047857',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  bonusText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FDE68A',
  },
  timerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B21A8',
  },
  toastBubble: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 20,
    marginVertical: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
  },
  toastText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  podiumStage: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    gap: 10,
  },
  podiumColumn: {
    flex: 1,
    alignItems: 'center',
  },
  podiumCenter: {
    zIndex: 2,
  },
  avatarBox: {
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    position: 'relative',
    marginBottom: -16,
    zIndex: 3,
  },
  avatarBox1: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#F59E0B',
    marginBottom: -20,
  },
  crownWrapper: {
    position: 'absolute',
    top: -16,
  },
  crownEmoji: {
    fontSize: 22,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  levelTag: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: '#4B5563',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  levelTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pedestal: {
    width: '100%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 14,
    paddingHorizontal: 6,
  },
  pedestal1: {
    height: 150,
    backgroundColor: '#FDE68A',
    borderWidth: 2,
    borderColor: '#F59E0B',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  pedestal2: {
    height: 130,
    backgroundColor: '#DDD6FE',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  pedestal3: {
    height: 110,
    backgroundColor: '#FED7AA',
    borderWidth: 2,
    borderColor: '#F97316',
  },
  rankBadge1: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  rankBadge2: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  rankBadge3: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  rankBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  podiumName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
  },
  podiumName1: {
    fontSize: 15,
    fontWeight: '900',
    color: '#78350F',
    textAlign: 'center',
  },
  podiumStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  podiumTreatPill: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  podiumHeartText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  podiumTimeText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  rankRowUser: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
    borderWidth: 2,
  },
  rankNumber: {
    width: 26,
    fontSize: 16,
    fontWeight: '900',
    color: '#6B7280',
  },
  rankNumberUser: {
    color: '#B45309',
  },
  listAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  listAvatarEmoji: {
    fontSize: 24,
  },
  listLevelTag: {
    position: 'absolute',
    bottom: -3,
    backgroundColor: '#374151',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  listLevelText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  playerInfoCol: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
  },
  playerNameUser: {
    color: '#92400E',
    fontWeight: '900',
  },
  playerStatus: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    marginTop: 1,
  },
  playerStatusOnline: {
    color: '#10B981',
    fontWeight: '700',
  },
  treatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginRight: 8,
  },
  treatPillEmoji: {
    fontSize: 14,
  },
  treatPillCount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2937',
  },
  cheerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 3,
  },
  cheerHeartIcon: {
    fontSize: 13,
  },
  cheerHeartCount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },
  userFooter: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  userFooterText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  userFooterRank: {
    fontSize: 16,
    fontWeight: '900',
    color: '#D97706',
  },
});
