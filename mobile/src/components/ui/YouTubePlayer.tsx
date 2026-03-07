import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";

/**
 * Shared YouTube player overlay for the mobile app.
 *
 * Uses an inline HTML page with the YouTube IFrame Player API to avoid
 * error 153 ("playback on other websites has been disabled by the video owner").
 *
 * Usage:
 *   <YouTubePlayer
 *     url="https://www.youtube.com/watch?v=XYZ"
 *     visible={isVisible}
 *     onClose={() => setVisible(false)}
 *   />
 */

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

function buildPlayerHtml(videoId: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
    #player { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="player"></div>
  <script src="https://www.youtube.com/iframe_api"></script>
  <script>
    function onYouTubeIframeAPIReady() {
      new YT.Player('player', {
        videoId: '${videoId}',
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          fs: 1,
        },
      });
    }
  </script>
</body>
</html>`;
}

interface YouTubePlayerProps {
  url: string;
  visible: boolean;
  onClose: () => void;
  title?: string;
}

export default function YouTubePlayer({
  url,
  visible,
  onClose,
  title,
}: YouTubePlayerProps) {
  const videoId = getYouTubeId(url);
  const { width: screenWidth } = Dimensions.get("window");
  const playerHeight = (screenWidth * 9) / 16; // 16:9 aspect ratio

  if (!videoId) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {title || "Video"}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* WebView with YouTube IFrame API */}
          <View style={[styles.playerWrapper, { height: playerHeight }]}>
            <WebView
              source={{ html: buildPlayerHtml(videoId) }}
              style={styles.webview}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
              domStorageEnabled
              allowsFullscreenVideo
              startInLoadingState
              originWhitelist={["*"]}
              renderLoading={() => (
                <View style={styles.loading}>
                  <Text style={styles.loadingText}>▶ Laden...</Text>
                </View>
              )}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  container: {
    backgroundColor: "#000",
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#111",
  },
  title: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  playerWrapper: {
    width: "100%",
    backgroundColor: "#000",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    color: "#666",
    fontSize: 16,
  },
});
