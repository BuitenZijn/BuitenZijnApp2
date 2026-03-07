import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "../../contexts/AuthContext";
import { YouTubePlayer } from "../../components/ui";
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
  shadows,
} from "../../styles/theme";

// ==========================================
// TYPES
// ==========================================

type SortField =
  | "dance_name"
  | "song_artist"
  | "song_name"
  | "lesson_year"
  | "lesson_period";
type SortDir = "asc" | "desc";

interface Dance {
  _id: Id<"linedance_dances">;
  dance_name: string;
  song_artist?: string;
  song_name: string;
  video_url: string;
  lesson_period?: string;
  lesson_year?: number;
}

// ==========================================
// SORT OPTIONS
// ==========================================

const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: "dance_name", label: "Dansnaam" },
  { field: "song_artist", label: "Artiest" },
  { field: "song_name", label: "Liedje" },
  { field: "lesson_year", label: "Jaar" },
  { field: "lesson_period", label: "Periode" },
];

// ==========================================
// MAIN SCREEN
// ==========================================

export default function DancesScreen() {
  const { user } = useAuth();
  const dances = useQuery(api.lijndances.getAllDances);
  const updateDance = useMutation(api.lijndances.updateDance);

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("dance_name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [editModal, setEditModal] = useState<Dance | null>(null);
  const [sortPickerVisible, setSortPickerVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>("");

  const isAdmin = user?.roles?.includes("admin") ?? false;

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir("asc");
      }
      setSortPickerVisible(false);
    },
    [sortField],
  );

  const filtered = useMemo(() => {
    if (!dances) return [];
    const q = search.toLowerCase().trim();
    let result = dances as Dance[];
    if (q) {
      result = result.filter(
        (d) =>
          d.dance_name.toLowerCase().includes(q) ||
          (d.song_artist && d.song_artist.toLowerCase().includes(q)) ||
          d.song_name.toLowerCase().includes(q) ||
          (d.lesson_period && d.lesson_period.toLowerCase().includes(q)) ||
          String(d.lesson_year).includes(q),
      );
    }
    return [...result].sort((a, b) => {
      const aVal = String((a as any)[sortField] ?? "").toLowerCase();
      const bVal = String((b as any)[sortField] ?? "").toLowerCase();
      const cmp = aVal.localeCompare(bVal, "nl");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [dances, search, sortField, sortDir]);

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.field === sortField)?.label ?? "";

  if (!dances) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.green[500]} />
          <Text style={styles.loadingText}>Dansen laden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderDance = ({ item }: { item: Dance }) => (
    <View style={styles.danceCard}>
      <View style={styles.danceHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.danceName}>{item.dance_name}</Text>
          <Text style={styles.danceArtist}>
            {item.song_artist ? `${item.song_artist} — ` : ""}
            {item.song_name}
          </Text>
        </View>
        <View style={styles.danceActions}>
          <TouchableOpacity
            onPress={() => {
              setVideoUrl(item.video_url);
              setVideoTitle(item.dance_name);
            }}
            style={styles.playBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.playBtnText}>▶</Text>
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity
              onPress={() => setEditModal(item)}
              style={styles.editBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.editBtnText}>✏️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.danceMeta}>
        <View style={styles.metaBadge}>
          <Text style={styles.metaText}>{item.lesson_period}</Text>
        </View>
        <View style={styles.metaBadge}>
          <Text style={styles.metaText}>{item.lesson_year}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Dansen</Text>
            <Text style={styles.subtitle}>
              {filtered.length} van {dances.length}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.spotifyBtn}
            onPress={() =>
              Linking.openURL(
                "https://open.spotify.com/playlist/1Is82VwEXe8Q0DSsoHpsVE",
              )
            }
            activeOpacity={0.7}
          >
            <Text style={styles.spotifyText}>🎵 Spotify</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Zoek dans, artiest, liedje..."
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          {search !== "" && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              style={styles.clearBtn}
            >
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sort */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sorteer op:</Text>
        <TouchableOpacity
          onPress={() => setSortPickerVisible(true)}
          style={styles.sortButton}
          activeOpacity={0.7}
        >
          <Text style={styles.sortButtonText}>
            {currentSortLabel} {sortDir === "asc" ? "↑" : "↓"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dance list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={renderDance}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💃</Text>
            <Text style={styles.emptyText}>
              {search ? "Geen dansen gevonden" : "Nog geen dansen"}
            </Text>
          </View>
        }
      />

      {/* Sort picker modal */}
      <Modal visible={sortPickerVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSortPickerVisible(false)}
        >
          <View style={styles.sortPickerContainer}>
            <Text style={styles.sortPickerTitle}>Sorteer op</Text>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.field}
                style={[
                  styles.sortPickerOption,
                  sortField === opt.field && styles.sortPickerOptionActive,
                ]}
                onPress={() => handleSort(opt.field)}
              >
                <Text
                  style={[
                    styles.sortPickerText,
                    sortField === opt.field && styles.sortPickerTextActive,
                  ]}
                >
                  {opt.label}
                  {sortField === opt.field && (sortDir === "asc" ? " ↑" : " ↓")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit modal (admin only) */}
      {editModal && (
        <EditDanceModal
          dance={editModal}
          onClose={() => setEditModal(null)}
          onSave={async (data) => {
            try {
              await updateDance({
                id: data.id,
                lesson_period: data.lesson_period,
                lesson_year: data.lesson_year,
                dance_name: data.dance_name,
                song_artist: data.song_artist || undefined,
                song_name: data.song_name,
                video_url: data.video_url,
              });
              setEditModal(null);
            } catch (e) {
              Alert.alert("Fout", "Kon de dans niet bijwerken.");
            }
          }}
        />
      )}
      {/* In-app YouTube Player */}
      <YouTubePlayer
        url={videoUrl || ""}
        visible={!!videoUrl}
        onClose={() => setVideoUrl(null)}
        title={videoTitle}
      />
    </SafeAreaView>
  );
}

// ==========================================
// EDIT MODAL
// ==========================================

function EditDanceModal({
  dance,
  onClose,
  onSave,
}: {
  dance: Dance;
  onClose: () => void;
  onSave: (data: {
    id: Id<"linedance_dances">;
    lesson_period: string;
    lesson_year: number;
    dance_name: string;
    song_artist?: string;
    song_name: string;
    video_url: string;
  }) => void;
}) {
  const [form, setForm] = useState({
    dance_name: dance.dance_name,
    song_artist: dance.song_artist || "",
    song_name: dance.song_name,
    video_url: dance.video_url,
    lesson_period: dance.lesson_period || "Voorjaar",
    lesson_year: String(dance.lesson_year || new Date().getFullYear()),
  });

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={editStyles.container}>
        <View style={editStyles.header}>
          <Text style={editStyles.title}>Dans bewerken</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={editStyles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={editStyles.form}>
          <EditField
            label="Dansnaam"
            value={form.dance_name}
            onChangeText={(v) => setForm({ ...form, dance_name: v })}
          />
          <EditField
            label="Artiest"
            value={form.song_artist}
            onChangeText={(v) => setForm({ ...form, song_artist: v })}
          />
          <EditField
            label="Liedje"
            value={form.song_name}
            onChangeText={(v) => setForm({ ...form, song_name: v })}
          />
          <EditField
            label="YouTube URL"
            value={form.video_url}
            onChangeText={(v) => setForm({ ...form, video_url: v })}
            keyboardType="url"
          />
          <View style={editStyles.row}>
            <View style={{ flex: 1 }}>
              <EditField
                label="Periode"
                value={form.lesson_period}
                onChangeText={(v) => setForm({ ...form, lesson_period: v })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <EditField
                label="Jaar"
                value={form.lesson_year}
                onChangeText={(v) => setForm({ ...form, lesson_year: v })}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={editStyles.actions}>
          <TouchableOpacity
            style={editStyles.saveBtn}
            onPress={() =>
              onSave({
                id: dance._id,
                dance_name: form.dance_name,
                song_artist: form.song_artist || undefined,
                song_name: form.song_name,
                video_url: form.video_url,
                lesson_period: form.lesson_period,
                lesson_year:
                  parseInt(form.lesson_year) || new Date().getFullYear(),
              })
            }
          >
            <Text style={editStyles.saveBtnText}>Opslaan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={editStyles.cancelBtn} onPress={onClose}>
            <Text style={editStyles.cancelBtnText}>Annuleren</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function EditField({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: "default" | "numeric" | "url";
}) {
  return (
    <View style={editStyles.field}>
      <Text style={editStyles.fieldLabel}>{label}</Text>
      <TextInput
        style={editStyles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: fontSize.base,
  },
  headerBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  spotifyBtn: {
    backgroundColor: "#1DB954",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  spotifyText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  title: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.navy[800],
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchRow: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.text,
  },
  clearBtn: {
    padding: spacing.xs,
  },
  clearText: {
    fontSize: 16,
    color: colors.textLight,
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  sortLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  sortButton: {
    backgroundColor: colors.navy[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  sortButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.navy[700],
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing["3xl"],
  },
  danceCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  danceHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  danceName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.navy[800],
    marginBottom: 2,
  },
  danceArtist: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  danceActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginLeft: spacing.sm,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF0000",
    justifyContent: "center",
    alignItems: "center",
  },
  playBtnText: {
    color: colors.white,
    fontSize: 16,
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.navy[50],
    justifyContent: "center",
    alignItems: "center",
  },
  editBtnText: {
    fontSize: 16,
  },
  danceMeta: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  metaBadge: {
    backgroundColor: colors.beige[200],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: spacing["4xl"],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  // Sort picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  sortPickerContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: "80%",
  },
  sortPickerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.navy[800],
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  sortPickerOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  sortPickerOptionActive: {
    backgroundColor: colors.navy[50],
  },
  sortPickerText: {
    fontSize: fontSize.base,
    color: colors.text,
  },
  sortPickerTextActive: {
    fontWeight: fontWeight.semibold,
    color: colors.navy[700],
  },
});

const editStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.navy[800],
  },
  closeText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  form: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  field: {},
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  fieldInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.text,
  },
  actions: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  saveBtn: {
    backgroundColor: colors.navy[700],
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  saveBtnText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  cancelBtn: {
    backgroundColor: colors.gray[100],
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
});
