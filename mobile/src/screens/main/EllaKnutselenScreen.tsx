import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "../../contexts/AuthContext";
import { YouTubePlayer } from "../../components/ui";
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
} from "../../styles/theme";

type Categorie =
  | "tekenen"
  | "vouwen"
  | "schilderen"
  | "verven"
  | "slijm maken"
  | "boetseren"
  | "stempelen";

const CATEGORIES: {
  value: Categorie;
  label: string;
  emoji: string;
  color: string;
}[] = [
  { value: "tekenen", label: "Tekenen", emoji: "✏️", color: "#fce7f3" },
  { value: "vouwen", label: "Vouwen", emoji: "🦢", color: "#ede9fe" },
  { value: "schilderen", label: "Schilderen", emoji: "🎨", color: "#fef3c7" },
  { value: "verven", label: "Verven", emoji: "🖌️", color: "#dbeafe" },
  { value: "slijm maken", label: "Slijm Maken", emoji: "🧪", color: "#d1fae5" },
  { value: "boetseren", label: "Boetseren", emoji: "🏺", color: "#fee2e2" },
  { value: "stempelen", label: "Stempelen", emoji: "⭐", color: "#fef9c3" },
];

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
    /(?:youtu\.be\/)([^?\s]+)/,
    /(?:youtube\.com\/embed\/)([^?\s]+)/,
    /(?:youtube\.com\/shorts\/)([^?\s]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function EllaKnutselenScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<Categorie | null>(
    null,
  );
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>("");

  const categoryCounts = useQuery(api.knutselen.getCategoryCounts);
  const videos = useQuery(
    api.knutselen.getByCategorie,
    selectedCategory ? { categorie: selectedCategory } : "skip",
  );

  const hasAccess =
    user?.roles?.includes("admin") || user?.roles?.includes("ella");

  if (!hasAccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={{ fontSize: 48 }}>🔒</Text>
          <Text style={styles.noAccessText}>Geen toegang</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Category detail view
  if (selectedCategory) {
    const catInfo = CATEGORIES.find((c) => c.value === selectedCategory)!;
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setSelectedCategory(null)}>
            <Text style={styles.backBtn}>← Categorieën</Text>
          </TouchableOpacity>
          <Text style={styles.catTitle}>
            {catInfo.emoji} {catInfo.label}
          </Text>
          <Text style={styles.catSubtitle}>
            {videos?.length ?? 0} filmpje
            {(videos?.length ?? 0) !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Videos */}
        {videos === undefined ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#ec4899" />
          </View>
        ) : videos.length === 0 ? (
          <View style={styles.centered}>
            <Text style={{ fontSize: 48 }}>🎬</Text>
            <Text style={styles.emptyText}>Nog geen filmpjes</Text>
          </View>
        ) : (
          <FlatList
            data={videos}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
            renderItem={({ item }) => {
              const ytId = getYouTubeId(item.youtube_url);
              const thumbnailUrl = ytId
                ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
                : null;
              return (
                <TouchableOpacity
                  style={styles.videoCard}
                  onPress={() => {
                    setVideoUrl(item.youtube_url);
                    setVideoTitle(item.titel);
                  }}
                  activeOpacity={0.7}
                >
                  {thumbnailUrl ? (
                    <Image
                      source={{ uri: thumbnailUrl }}
                      style={styles.thumbnail}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.thumbnail, styles.noThumb]}>
                      <Text style={{ fontSize: 32 }}>🎥</Text>
                    </View>
                  )}
                  <View style={styles.videoInfo}>
                    <Text style={styles.videoTitle} numberOfLines={2}>
                      {item.titel}
                    </Text>
                    {item.beschrijving ? (
                      <Text style={styles.videoDesc} numberOfLines={2}>
                        {item.beschrijving}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
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

  // Categories grid
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← ELLA</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>✂️ Knutselen</Text>
          <Text style={styles.pageSubtitle}>Kies een categorie</Text>
        </View>

        {/* Category Cards */}
        <View style={styles.catGrid}>
          {CATEGORIES.map((cat) => {
            const count =
              categoryCounts && typeof categoryCounts === "object"
                ? ((categoryCounts as Record<string, number>)[cat.value] ?? 0)
                : 0;
            return (
              <TouchableOpacity
                key={cat.value}
                style={[styles.catCard, { backgroundColor: cat.color }]}
                onPress={() => setSelectedCategory(cat.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text style={styles.catName}>{cat.label}</Text>
                <Text style={styles.catCount}>
                  {count} video{count !== 1 ? "'s" : ""}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdf2f8",
  },
  scrollContent: {
    padding: spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    fontSize: fontSize.sm,
    color: "#ec4899",
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#be185d",
    textAlign: "center",
  },
  pageSubtitle: {
    fontSize: fontSize.sm,
    color: "#9d174d",
    textAlign: "center",
    marginTop: 4,
    opacity: 0.7,
  },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  catCard: {
    width: "47%",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fbcfe8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  catEmoji: {
    fontSize: 40,
    marginBottom: spacing.xs,
  },
  catName: {
    fontSize: fontSize.base,
    fontWeight: "700",
    color: "#831843",
  },
  catCount: {
    fontSize: fontSize.xs,
    color: "#9d174d",
    marginTop: 2,
    opacity: 0.6,
  },
  catTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#be185d",
    textAlign: "center",
  },
  catSubtitle: {
    fontSize: fontSize.sm,
    color: "#9d174d",
    textAlign: "center",
    marginTop: 4,
    opacity: 0.7,
  },
  videoCard: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbnail: {
    width: "100%",
    height: 180,
    backgroundColor: "#f3f4f6",
  },
  noThumb: {
    justifyContent: "center",
    alignItems: "center",
  },
  videoInfo: {
    padding: spacing.md,
  },
  videoTitle: {
    fontSize: fontSize.base,
    fontWeight: "700",
    color: "#1f2937",
  },
  videoDesc: {
    fontSize: fontSize.sm,
    color: "#9ca3af",
    marginTop: 4,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: "#9ca3af",
    marginTop: spacing.md,
  },
  noAccessText: {
    fontSize: fontSize.lg,
    color: colors.textLight,
    marginTop: spacing.md,
  },
});
