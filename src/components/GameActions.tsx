import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GameActionsProps {
  canUndo: boolean;
  hintsLeft: number;
  canAdHint: boolean;
  onUndo: () => void;
  onHint: () => void;
  onAdHint: () => void;
}

export const GameActions: React.FC<GameActionsProps> = ({
  canUndo,
  hintsLeft,
  canAdHint,
  onUndo,
  onHint,
  onAdHint,
}) => {
  return (
    <View style={styles.container}>
      {/* Undo Button */}
      <TouchableOpacity
        style={[styles.actionBtn, !canUndo && styles.disabledBtn]}
        onPress={onUndo}
        disabled={!canUndo}
        activeOpacity={0.7}
      >
        <Text style={styles.btnEmoji}>↩️</Text>
        <Text style={[styles.btnText, !canUndo && styles.disabledText]}>Geri Al</Text>
      </TouchableOpacity>

      {/* Hint Button */}
      {hintsLeft > 0 ? (
        <TouchableOpacity style={styles.actionBtn} onPress={onHint} activeOpacity={0.7}>
          <Text style={styles.btnEmoji}>💡</Text>
          <Text style={styles.btnText}>İpucu ({hintsLeft})</Text>
        </TouchableOpacity>
      ) : canAdHint ? (
        <TouchableOpacity style={[styles.actionBtn, styles.adHintBtn]} onPress={onAdHint} activeOpacity={0.7}>
          <Text style={styles.btnEmoji}>🎬</Text>
          <Text style={styles.btnText}>+1 İpucu</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.actionBtn, styles.disabledBtn]} disabled activeOpacity={1}>
          <Text style={styles.btnEmoji}>💡</Text>
          <Text style={[styles.btnText, styles.disabledText]}>İpucu (0)</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E0',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  adHintBtn: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  disabledBtn: {
    opacity: 0.45,
    borderColor: '#E2E8F0',
    backgroundColor: '#F7FAFC',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnEmoji: {
    fontSize: 18,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3748',
  },
  disabledText: {
    color: '#A0AEC0',
  },
});
