import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../navigation/types";
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
  borderRadius,
  shadows,
} from "../../styles/theme";
import type { Id } from "../../../../convex/_generated/dataModel";
import DraggableRankingList from "../../components/ui/DraggableRankingList";

type PlayRoute = RouteProp<MainStackParamList, "QuizPlay">;
type NavProp = NativeStackNavigationProp<MainStackParamList>;

const MC_COLORS = [
  { bg: "#e74c3c", text: "#fff" },
  { bg: "#3498db", text: "#fff" },
  { bg: "#f39c12", text: "#fff" },
  { bg: "#2ecc71", text: "#fff" },
  { bg: "#e91e8a", text: "#fff" },
  { bg: "#00bcd4", text: "#fff" },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function buildGeoMapHtml(
  zoom: number,
  marker: { lat: number; lng: number } | null,
): string {
  const markerJs = marker
    ? `L.marker([${marker.lat}, ${marker.lng}]).addTo(map);`
    : "";
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
  <style>
    *{margin:0;padding:0}
    html,body,#map{width:100%;height:100%}
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([30, 10], ${zoom});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OSM',
      maxZoom: 18
    }).addTo(map);
    var currentMarker = null;
    ${markerJs}
    map.on('click', function(e) {
      if (currentMarker) map.removeLayer(currentMarker);
      currentMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'mapTap',
        lat: Math.round(e.latlng.lat * 10000) / 10000,
        lng: Math.round(e.latlng.lng * 10000) / 10000
      }));
    });
  <\/script>
</body>
</html>`;
}

export default function QuizPlayScreen() {
  const route = useRoute<PlayRoute>();
  const navigation = useNavigation<NavProp>();
  const { sessionId, participantId } = route.params;

  const session = useQuery(api.quizzes.getSession, {
    id: sessionId as Id<"quiz_sessions">,
  });
  const currentQuestion = useQuery(
    api.quizzes.getCurrentQuestion,
    session ? { sessionId: session._id } : "skip",
  );
  const leaderboard = useQuery(
    api.quizzes.getLeaderboard,
    session ? { sessionId: session._id } : "skip",
  );
  const myAnswers = useQuery(api.quizzes.getMyAnswers, {
    participantId: participantId as Id<"quiz_participants">,
  });

  const submitAnswer = useMutation(api.quizzes.submitAnswer);

  const [openAnswer, setOpenAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [lastResponseTimeMs, setLastResponseTimeMs] = useState<number | null>(
    null,
  );

  // Estimation state
  const [estimationAnswer, setEstimationAnswer] = useState("");
  // Ranking state
  const [rankingOrder, setRankingOrder] = useState<string[]>([]);
  // Geo state
  const [geoAnswer, setGeoAnswer] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  // Matching state
  const [matchingSelections, setMatchingSelections] = useState<
    Record<string, string>
  >({});
  const [matchingSelectedLeft, setMatchingSelectedLeft] = useState<
    string | null
  >(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Track when a new question appears
  const lastQuestionId = useRef<string | null>(null);
  useEffect(() => {
    if (currentQuestion && currentQuestion._id !== lastQuestionId.current) {
      lastQuestionId.current = currentQuestion._id;
      setSubmitted(false);
      setSelectedOption(null);
      setOpenAnswer("");
      setQuestionStartTime(Date.now());
      setLastResponseTimeMs(null);
      setEstimationAnswer("");
      setGeoAnswer(null);
      setMatchingSelections({});
      setMatchingSelectedLeft(null);
      // Shuffle ranking items
      if (
        currentQuestion.questionType === "ranking" &&
        currentQuestion.options &&
        currentQuestion.options.length > 0
      ) {
        const shuffled = [...currentQuestion.options].sort(
          () => Math.random() - 0.5,
        );
        setRankingOrder(shuffled);
      } else {
        setRankingOrder([]);
      }
    }
  }, [currentQuestion?._id]);

  // Fallback: ensure ranking items are always visible
  const displayRankingOrder = useMemo(() => {
    if (rankingOrder.length > 0) return rankingOrder;
    if (
      currentQuestion?.questionType === "ranking" &&
      currentQuestion.options &&
      currentQuestion.options.length > 0
    ) {
      return [...currentQuestion.options];
    }
    return [];
  }, [rankingOrder, currentQuestion?.questionType, currentQuestion?.options]);

  // Timer countdown
  useEffect(() => {
    if (session?.status !== "question" || !currentQuestion?.timeLimitSeconds) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = (Date.now() - questionStartTime) / 1000;
      const remaining = Math.max(0, currentQuestion.timeLimitSeconds - elapsed);
      setTimeLeft(Math.ceil(remaining));
    }, 100);

    return () => clearInterval(interval);
  }, [session?.status, currentQuestion?.timeLimitSeconds, questionStartTime]);

  // Pulse animation for waiting
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  // Check if already answered current question
  useEffect(() => {
    if (myAnswers && currentQuestion) {
      const already = myAnswers.find(
        (a) => a.questionId === currentQuestion._id,
      );
      if (already) {
        setSubmitted(true);
        setSelectedOption(already.answer);
      }
    }
  }, [myAnswers, currentQuestion?._id]);

  const handleSubmit = async (answer: string) => {
    if (submitted || amEliminated) return;
    setSubmitted(true);
    setSelectedOption(answer);

    const responseTimeMs = Date.now() - questionStartTime;
    setLastResponseTimeMs(responseTimeMs);
    try {
      await submitAnswer({
        sessionId: sessionId as Id<"quiz_sessions">,
        questionId: currentQuestion!._id as Id<"quiz_questions">,
        participantId: participantId as Id<"quiz_participants">,
        answer,
        responseTimeMs,
      });
    } catch {
      // Already answered
    }
  };

  const handleOpenSubmit = () => {
    if (!openAnswer.trim()) return;
    handleSubmit(openAnswer.trim());
  };

  const handleEstimationSubmit = () => {
    if (!estimationAnswer.trim()) return;
    handleSubmit(estimationAnswer.trim());
  };

  const handleRankingSubmit = () => {
    const order = rankingOrder.length > 0 ? rankingOrder : displayRankingOrder;
    if (order.length === 0) return;
    // Ensure rankingOrder state is up to date before submitting
    if (rankingOrder.length === 0) setRankingOrder(order);
    handleSubmit(JSON.stringify(order));
  };

  const handleGeoSubmit = () => {
    if (!geoAnswer) return;
    handleSubmit(`${geoAnswer.lat},${geoAnswer.lng}`);
  };

  const handleMatchingSubmit = () => {
    handleSubmit(JSON.stringify(matchingSelections));
  };

  const moveRankingItem = (index: number, direction: "up" | "down") => {
    const currentOrder =
      rankingOrder.length > 0 ? rankingOrder : [...displayRankingOrder];
    const newOrder = [...currentOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [
      newOrder[targetIndex],
      newOrder[index],
    ];
    setRankingOrder(newOrder);
  };

  const handleMatchingTap = (item: string, side: "left" | "right") => {
    if (submitted) return;
    if (side === "left") {
      setMatchingSelectedLeft(matchingSelectedLeft === item ? null : item);
    } else if (matchingSelectedLeft) {
      // Pair the selected left with this right
      const newSelections = { ...matchingSelections };
      // Remove any existing assignment of this right value
      for (const key of Object.keys(newSelections)) {
        if (newSelections[key] === item) delete newSelections[key];
      }
      newSelections[matchingSelectedLeft] = item;
      setMatchingSelections(newSelections);
      setMatchingSelectedLeft(null);
    }
  };

  const onGeoMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === "mapTap") {
          setGeoAnswer({ lat: data.lat, lng: data.lng });
        }
      } catch {
        // ignore
      }
    },
    [],
  );

  // Find my rank
  const myRank = leaderboard?.findIndex((p) => p._id === participantId);
  const myScore = leaderboard?.find((p) => p._id === participantId)?.totalScore;
  const myParticipant = leaderboard?.find((p) => p._id === participantId);
  const amEliminated = myParticipant?.isEliminated === true;

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Laden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // LOBBY
  if (session.status === "lobby") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Text style={styles.lobbyEmoji}>🎯</Text>
          </Animated.View>
          <Text style={styles.lobbyTitle}>Wachten op de host...</Text>
          <Text style={styles.lobbySubtitle}>
            De quiz begint zodra de host op Start drukt
          </Text>
          <View style={styles.lobbyCodeBox}>
            <Text style={styles.lobbyCodeLabel}>Code</Text>
            <Text style={styles.lobbyCode}>{session.joinCode}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // FINISHED
  if (session.status === "finished") {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.finishedContent}>
          <Text style={styles.finishedEmoji}>🏆</Text>
          <Text style={styles.finishedTitle}>Quiz Voorbij!</Text>

          {myRank !== undefined && myRank >= 0 && (
            <View style={styles.myRankBox}>
              <Text style={styles.myRankLabel}>Jouw plaats</Text>
              <Text style={styles.myRankValue}>#{myRank + 1}</Text>
              <Text style={styles.myScoreValue}>{myScore ?? 0} punten</Text>
            </View>
          )}

          <Text style={styles.leaderboardTitle}>Scorebord</Text>
          {leaderboard?.map((p, i) => (
            <View
              key={p._id}
              style={[
                styles.leaderRow,
                p._id === participantId && styles.leaderRowMe,
              ]}
            >
              <Text style={styles.leaderRank}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
              </Text>
              <Text
                style={[
                  styles.leaderName,
                  p._id === participantId && styles.leaderNameMe,
                ]}
              >
                {p.displayName}
              </Text>
              <Text style={styles.leaderScore}>{p.totalScore}</Text>
            </View>
          ))}

          <TouchableOpacity
            style={styles.exitBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.exitBtnText}>Terug</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // QUESTION or REVEALING
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.questionContent}>
        {/* Eliminated banner */}
        {amEliminated && (
          <View
            style={{
              backgroundColor: "rgba(239,68,68,0.3)",
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#fca5a5",
                fontSize: 16,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              💀 Je bent uitgeschakeld!
            </Text>
            <Text
              style={{
                color: "#fca5a5",
                fontSize: 13,
                marginTop: 4,
                textAlign: "center",
                opacity: 0.8,
              }}
            >
              Je kunt nog meekijken maar niet meer antwoorden.
            </Text>
          </View>
        )}
        {/* Header */}
        <View style={styles.questionHeader}>
          <Text style={styles.questionCount}>
            Vraag {(currentQuestion?.currentIndex ?? 0) + 1} /{" "}
            {currentQuestion?.totalQuestions ?? "?"}
          </Text>
          {timeLeft !== null && session.status === "question" && (
            <View
              style={[
                styles.timerBadge,
                timeLeft <= 5 && styles.timerBadgeUrgent,
              ]}
            >
              <Text
                style={[
                  styles.timerText,
                  timeLeft <= 5 && styles.timerTextUrgent,
                ]}
              >
                {timeLeft}s
              </Text>
            </View>
          )}
          <Text style={styles.questionPoints}>
            {currentQuestion?.points ?? 0} pt
          </Text>
        </View>

        {/* Round info banner */}
        {(currentQuestion as any)?.roundInfo && (
          <View
            style={{
              backgroundColor:
                (currentQuestion as any).roundInfo.roundType === "sudden_death"
                  ? "rgba(239,68,68,0.2)"
                  : (currentQuestion as any).roundInfo.roundType ===
                      "eliminatie"
                    ? "rgba(249,115,22,0.2)"
                    : "rgba(34,197,94,0.2)",
              borderRadius: 8,
              paddingVertical: 6,
              paddingHorizontal: 12,
              marginBottom: 8,
              alignSelf: "center",
            }}
          >
            <Text
              style={{
                color:
                  (currentQuestion as any).roundInfo.roundType ===
                  "sudden_death"
                    ? "#fca5a5"
                    : (currentQuestion as any).roundInfo.roundType ===
                        "eliminatie"
                      ? "#fdba74"
                      : "#86efac",
                fontSize: 13,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              {(currentQuestion as any).roundInfo.roundType === "sudden_death"
                ? "💀 "
                : (currentQuestion as any).roundInfo.roundType === "eliminatie"
                  ? "🚫 "
                  : "🟢 "}
              {(currentQuestion as any).roundInfo.name}
            </Text>
          </View>
        )}

        {/* Question text */}
        <View style={styles.questionBox}>
          <Text style={styles.questionText}>
            {currentQuestion?.questionText ?? "..."}
          </Text>
        </View>

        {/* Multiple choice options */}
        {currentQuestion?.questionType === "multiple_choice" &&
          currentQuestion.options && (
            <View style={styles.optionsGrid}>
              {currentQuestion.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isRevealing = session.status === "revealing";
                const isCorrect =
                  isRevealing && opt === currentQuestion.correctAnswer;
                const isWrong = isRevealing && isSelected && !isCorrect;

                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.optionBtn,
                      { backgroundColor: MC_COLORS[i % MC_COLORS.length].bg },
                      isSelected && styles.optionSelected,
                      isCorrect && styles.optionCorrect,
                      isWrong && styles.optionWrong,
                      submitted &&
                        !isSelected &&
                        !isCorrect &&
                        styles.optionDimmed,
                    ]}
                    onPress={() => handleSubmit(opt)}
                    disabled={submitted || session.status !== "question"}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.optionLabel}>
                      {String.fromCharCode(65 + i)}
                    </Text>
                    <Text style={styles.optionText}>{opt}</Text>
                    {isCorrect && <Text style={styles.checkmark}>✓</Text>}
                    {isWrong && <Text style={styles.crossmark}>✗</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

        {/* Multiple choice with pictures */}
        {currentQuestion?.questionType === "multiple_choice_picture" &&
          currentQuestion.options && (
            <View style={styles.pictureGrid}>
              {currentQuestion.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isRevealing = session.status === "revealing";
                const isCorrect =
                  isRevealing && opt === currentQuestion.correctAnswer;
                const isWrong = isRevealing && isSelected && !isCorrect;
                const imageUrl = currentQuestion.optionImageUrls?.[i];

                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.pictureOptionBtn,
                      { borderColor: MC_COLORS[i % MC_COLORS.length].bg },
                      isSelected && {
                        borderColor: "#fff",
                        borderWidth: 3,
                      },
                      isCorrect && {
                        borderColor: "#2ecc71",
                        borderWidth: 4,
                      },
                      isWrong && {
                        borderColor: "#e74c3c",
                        borderWidth: 4,
                      },
                      submitted &&
                        !isSelected &&
                        !isCorrect && { opacity: 0.4 },
                    ]}
                    onPress={() => handleSubmit(opt)}
                    disabled={submitted || session.status !== "question"}
                    activeOpacity={0.7}
                  >
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.pictureImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.picturePlaceholder}>
                        <Text style={styles.picturePlaceholderText}>🖼️</Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.pictureLabel,
                        {
                          backgroundColor: MC_COLORS[i % MC_COLORS.length].bg,
                        },
                      ]}
                    >
                      <Text style={styles.pictureLabelText}>
                        {String.fromCharCode(65 + i)}. {opt}
                      </Text>
                    </View>
                    {isCorrect && (
                      <View style={styles.pictureBadge}>
                        <Text style={styles.pictureBadgeText}>✓</Text>
                      </View>
                    )}
                    {isWrong && (
                      <View
                        style={[
                          styles.pictureBadge,
                          { backgroundColor: "#e74c3c" },
                        ]}
                      >
                        <Text style={styles.pictureBadgeText}>✗</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

        {/* Open question */}
        {currentQuestion?.questionType === "open" && (
          <View style={styles.openSection}>
            {!submitted ? (
              <>
                <TextInput
                  style={styles.openInput}
                  value={openAnswer}
                  onChangeText={setOpenAnswer}
                  placeholder="Type je antwoord..."
                  placeholderTextColor={colors.textLight}
                  editable={session.status === "question"}
                  autoFocus
                  returnKeyType="send"
                  onSubmitEditing={handleOpenSubmit}
                />
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    (!openAnswer.trim() || session.status !== "question") &&
                      styles.submitBtnDisabled,
                  ]}
                  onPress={handleOpenSubmit}
                  disabled={!openAnswer.trim() || session.status !== "question"}
                >
                  <Text style={styles.submitBtnText}>Verstuur!</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.submittedBox}>
                <Text style={styles.submittedLabel}>Jouw antwoord:</Text>
                <Text style={styles.submittedAnswer}>{selectedOption}</Text>
                {session.status === "revealing" && (
                  <View style={styles.revealBox}>
                    <Text style={styles.revealLabel}>Correct antwoord:</Text>
                    <Text style={styles.revealAnswer}>
                      {currentQuestion.correctAnswer}
                    </Text>
                    {selectedOption?.toLowerCase().trim() ===
                    currentQuestion.correctAnswer?.toLowerCase().trim() ? (
                      <Text style={styles.correctFeedback}>✓ Correct!</Text>
                    ) : (
                      <Text style={styles.wrongFeedback}>✗ Fout</Text>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* ESTIMATION question */}
        {currentQuestion?.questionType === "estimation" && (
          <View style={styles.openSection}>
            {!submitted ? (
              <>
                <Text style={styles.estimationHint}>
                  📊 Geef je schatting
                  {currentQuestion.estimationUnit
                    ? ` (${currentQuestion.estimationUnit})`
                    : ""}
                </Text>
                <TextInput
                  style={styles.openInput}
                  value={estimationAnswer}
                  onChangeText={setEstimationAnswer}
                  placeholder="Voer een getal in..."
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
                  editable={session.status === "question"}
                  autoFocus
                  returnKeyType="send"
                  onSubmitEditing={handleEstimationSubmit}
                />
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    (!estimationAnswer.trim() ||
                      session.status !== "question") &&
                      styles.submitBtnDisabled,
                  ]}
                  onPress={handleEstimationSubmit}
                  disabled={
                    !estimationAnswer.trim() || session.status !== "question"
                  }
                >
                  <Text style={styles.submitBtnText}>Verstuur!</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.submittedBox}>
                <Text style={styles.submittedLabel}>Jouw schatting:</Text>
                <Text style={styles.submittedAnswer}>
                  {Number(selectedOption).toLocaleString("nl-BE")}
                  {currentQuestion.estimationUnit
                    ? ` ${currentQuestion.estimationUnit}`
                    : ""}
                </Text>
                {session.status === "revealing" && (
                  <View style={styles.revealBox}>
                    <Text style={styles.revealLabel}>Correct antwoord:</Text>
                    <Text style={styles.revealAnswer}>
                      {Number(currentQuestion.correctAnswer).toLocaleString(
                        "nl-BE",
                      )}
                      {currentQuestion.estimationUnit
                        ? ` ${currentQuestion.estimationUnit}`
                        : ""}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* RANKING question  */}
        {currentQuestion?.questionType === "ranking" && (
          <View style={styles.openSection}>
            {!submitted ? (
              <>
                <Text style={styles.estimationHint}>
                  🔢 Sleep de items in de juiste volgorde
                </Text>
                <DraggableRankingList
                  items={displayRankingOrder}
                  onReorder={(newOrder) => setRankingOrder(newOrder)}
                  disabled={session.status !== "question"}
                />
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    (displayRankingOrder.length === 0 ||
                      session.status !== "question") &&
                      styles.submitBtnDisabled,
                  ]}
                  onPress={handleRankingSubmit}
                  disabled={
                    displayRankingOrder.length === 0 ||
                    session.status !== "question"
                  }
                >
                  <Text style={styles.submitBtnText}>Bevestig volgorde!</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.submittedBox}>
                <Text style={styles.submittedLabel}>Jouw volgorde:</Text>
                {(() => {
                  try {
                    const order: string[] = JSON.parse(selectedOption || "[]");
                    return order.map((item, i) => (
                      <Text key={i} style={styles.submittedAnswer}>
                        {i + 1}. {item}
                      </Text>
                    ));
                  } catch {
                    return null;
                  }
                })()}
                {session.status === "revealing" && currentQuestion.options && (
                  <View style={styles.revealBox}>
                    <Text style={styles.revealLabel}>Correcte volgorde:</Text>
                    {currentQuestion.options.map((item, i) => (
                      <Text key={i} style={styles.revealAnswer}>
                        {i + 1}. {item}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* GEO question */}
        {currentQuestion?.questionType === "geo" && (
          <View style={styles.openSection}>
            {!submitted ? (
              <>
                <Text style={styles.estimationHint}>
                  🗺️ Tik op de kaart om je locatie te kiezen
                </Text>
                <View style={styles.geoMapContainer}>
                  <WebView
                    originWhitelist={["*"]}
                    source={{
                      html: buildGeoMapHtml(
                        currentQuestion.geoZoom ?? 3,
                        geoAnswer,
                      ),
                    }}
                    onMessage={onGeoMessage}
                    style={styles.geoMapWebView}
                    scrollEnabled={false}
                    javaScriptEnabled
                  />
                </View>
                {geoAnswer && (
                  <Text style={styles.geoCoordText}>
                    📍 {geoAnswer.lat.toFixed(4)}, {geoAnswer.lng.toFixed(4)}
                  </Text>
                )}
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    (!geoAnswer || session.status !== "question") &&
                      styles.submitBtnDisabled,
                  ]}
                  onPress={handleGeoSubmit}
                  disabled={!geoAnswer || session.status !== "question"}
                >
                  <Text style={styles.submitBtnText}>Bevestig locatie!</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.submittedBox}>
                <Text style={styles.submittedLabel}>Jouw locatie:</Text>
                <Text style={styles.submittedAnswer}>📍 {selectedOption}</Text>
                {session.status === "revealing" && (
                  <View style={styles.revealBox}>
                    <Text style={styles.revealLabel}>Correcte locatie:</Text>
                    <Text style={styles.revealAnswer}>
                      📍 {currentQuestion.correctAnswer}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* MATCHING question */}
        {currentQuestion?.questionType === "matching" && (
          <View style={styles.openSection}>
            {!submitted ? (
              <>
                <Text style={styles.estimationHint}>
                  🔗 Tik links, dan rechts om te koppelen
                </Text>
                <View style={styles.matchingContainer}>
                  {/* Left column */}
                  <View style={styles.matchingColumn}>
                    {currentQuestion.matchingPairs?.map((pair, i) => {
                      const isSelected = matchingSelectedLeft === pair.left;
                      const isMatched =
                        matchingSelections[pair.left] !== undefined;
                      return (
                        <TouchableOpacity
                          key={i}
                          style={[
                            styles.matchingItem,
                            styles.matchingItemLeft,
                            isSelected && styles.matchingItemActive,
                            isMatched && styles.matchingItemMatched,
                          ]}
                          onPress={() => handleMatchingTap(pair.left, "left")}
                          disabled={session.status !== "question"}
                        >
                          <Text style={styles.matchingItemText}>
                            {pair.left}
                          </Text>
                          {isMatched && (
                            <Text style={styles.matchingCheckText}>✓</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {/* Right column (shuffled) */}
                  <View style={styles.matchingColumn}>
                    {currentQuestion.shuffledRightOptions?.map((right, i) => {
                      const isUsed =
                        Object.values(matchingSelections).includes(right);
                      return (
                        <TouchableOpacity
                          key={i}
                          style={[
                            styles.matchingItem,
                            styles.matchingItemRight,
                            isUsed && styles.matchingItemMatched,
                            matchingSelectedLeft
                              ? styles.matchingItemHighlight
                              : undefined,
                          ]}
                          onPress={() => handleMatchingTap(right, "right")}
                          disabled={
                            !matchingSelectedLeft ||
                            session.status !== "question"
                          }
                        >
                          <Text style={styles.matchingItemText}>{right}</Text>
                          {isUsed && (
                            <Text style={styles.matchingCheckText}>✓</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
                {/* Show current matching */}
                {Object.keys(matchingSelections).length > 0 && (
                  <View style={styles.matchingSummary}>
                    {Object.entries(matchingSelections).map(([left, right]) => (
                      <Text key={left} style={styles.matchingSummaryText}>
                        {left} → {right}
                      </Text>
                    ))}
                  </View>
                )}
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    (Object.keys(matchingSelections).length === 0 ||
                      session.status !== "question") &&
                      styles.submitBtnDisabled,
                  ]}
                  onPress={handleMatchingSubmit}
                  disabled={
                    Object.keys(matchingSelections).length === 0 ||
                    session.status !== "question"
                  }
                >
                  <Text style={styles.submitBtnText}>Bevestig koppeling!</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.submittedBox}>
                <Text style={styles.submittedLabel}>Jouw koppelingen:</Text>
                {(() => {
                  try {
                    const pairs: Record<string, string> = JSON.parse(
                      selectedOption || "{}",
                    );
                    return Object.entries(pairs).map(([left, right]) => (
                      <Text key={left} style={styles.submittedAnswer}>
                        {left} → {right}
                      </Text>
                    ));
                  } catch {
                    return null;
                  }
                })()}
                {session.status === "revealing" &&
                  currentQuestion.matchingPairs && (
                    <View style={styles.revealBox}>
                      <Text style={styles.revealLabel}>
                        Correcte koppelingen:
                      </Text>
                      {currentQuestion.matchingPairs.map((pair, i) => (
                        <Text key={i} style={styles.revealAnswer}>
                          {pair.left} → {pair.right}
                        </Text>
                      ))}
                    </View>
                  )}
              </View>
            )}
          </View>
        )}

        {/* Submitted state for MC */}
        {(currentQuestion?.questionType === "multiple_choice" ||
          currentQuestion?.questionType === "multiple_choice_picture") &&
          submitted &&
          session.status === "question" && (
            <View style={styles.waitingBox}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Text style={styles.waitingEmoji}>⏳</Text>
              </Animated.View>
              <Text style={styles.waitingText}>
                Antwoord verstuurd! Wachten op resultaat...
              </Text>
              {lastResponseTimeMs !== null && (
                <Text style={styles.responseTimeText}>
                  ⏱️ {(lastResponseTimeMs / 1000).toFixed(2)}s
                </Text>
              )}
            </View>
          )}

        {/* Score display */}
        {myScore !== undefined && (
          <View style={styles.scoreBar}>
            <Text style={styles.scoreText}>
              Jouw score: {myScore} punten
              {myRank !== undefined &&
                myRank >= 0 &&
                ` (plaats #${myRank + 1})`}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1025",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing["2xl"],
  },
  loadingText: {
    color: "#fff",
    fontSize: fontSize.xl,
  },

  // Lobby
  lobbyEmoji: { fontSize: 64, marginBottom: spacing["2xl"] },
  lobbyTitle: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: "#fff",
    marginBottom: spacing.sm,
  },
  lobbySubtitle: {
    fontSize: fontSize.base,
    color: "#bbb",
    textAlign: "center",
    marginBottom: spacing["3xl"],
  },
  lobbyCodeBox: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: borderRadius.xl,
    padding: spacing["2xl"],
    alignItems: "center",
  },
  lobbyCodeLabel: {
    color: "#aaa",
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  lobbyCode: {
    color: "#f1c40f",
    fontSize: fontSize["4xl"],
    fontWeight: fontWeight.bold,
    letterSpacing: 4,
  },

  // Question
  questionContent: {
    padding: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  questionCount: {
    fontSize: fontSize.sm,
    color: "#bbb",
    fontWeight: fontWeight.medium,
  },
  timerBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  timerBadgeUrgent: {
    backgroundColor: "rgba(231,76,60,0.3)",
  },
  timerText: {
    color: "#fff",
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  timerTextUrgent: {
    color: "#e74c3c",
  },
  questionPoints: {
    fontSize: fontSize.sm,
    color: "#bbb",
    fontWeight: fontWeight.medium,
  },
  questionBox: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: borderRadius.xl,
    padding: spacing["2xl"],
    marginBottom: spacing["2xl"],
  },
  questionText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: "#fff",
    textAlign: "center",
    lineHeight: 28,
  },

  // MC Options
  optionsGrid: {
    gap: spacing.md,
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    minHeight: 60,
  },
  optionSelected: {
    borderWidth: 3,
    borderColor: "#fff",
  },
  optionCorrect: {
    backgroundColor: "#27ae60",
    borderWidth: 3,
    borderColor: "#2ecc71",
  },
  optionWrong: {
    backgroundColor: "#c0392b",
    borderWidth: 3,
    borderColor: "#e74c3c",
  },
  optionDimmed: {
    opacity: 0.4,
  },
  optionLabel: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: "#fff",
    marginRight: spacing.md,
    width: 30,
  },
  optionText: {
    fontSize: fontSize.lg,
    color: "#fff",
    fontWeight: fontWeight.semibold,
    flex: 1,
  },
  checkmark: {
    fontSize: fontSize["2xl"],
    color: "#fff",
    fontWeight: fontWeight.bold,
  },
  crossmark: {
    fontSize: fontSize["2xl"],
    color: "#fff",
    fontWeight: fontWeight.bold,
  },

  // Picture MC options
  pictureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  pictureOptionBtn: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: spacing.md,
  },
  pictureImage: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2 - 4,
    height: 130,
  },
  picturePlaceholder: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2 - 4,
    height: 130,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  picturePlaceholderText: {
    fontSize: 36,
  },
  pictureLabel: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
  },
  pictureLabelText: {
    color: "#fff",
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textAlign: "center",
  },
  pictureBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2ecc71",
    justifyContent: "center",
    alignItems: "center",
  },
  pictureBadgeText: {
    color: "#fff",
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },

  // Open question
  openSection: {
    gap: spacing.md,
  },
  openInput: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: fontSize.lg,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  submitBtn: {
    backgroundColor: colors.purple[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  submittedBox: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: borderRadius.xl,
    padding: spacing["2xl"],
    alignItems: "center",
  },
  submittedLabel: {
    color: "#aaa",
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  submittedAnswer: {
    color: "#fff",
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  revealBox: {
    marginTop: spacing.lg,
    alignItems: "center",
  },
  revealLabel: {
    color: "#aaa",
    fontSize: fontSize.sm,
  },
  revealAnswer: {
    color: "#2ecc71",
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.xs,
  },
  correctFeedback: {
    color: "#2ecc71",
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginTop: spacing.md,
  },
  wrongFeedback: {
    color: "#e74c3c",
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginTop: spacing.md,
  },

  // Waiting
  waitingBox: {
    alignItems: "center",
    marginTop: spacing["2xl"],
  },
  waitingEmoji: {
    fontSize: 48,
  },
  waitingText: {
    color: "#bbb",
    fontSize: fontSize.base,
    marginTop: spacing.md,
    textAlign: "center",
  },
  responseTimeText: {
    color: "#a78bfa",
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginTop: spacing.sm,
    textAlign: "center",
  },

  // Score
  scoreBar: {
    marginTop: spacing["2xl"],
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: "center",
  },
  scoreText: {
    color: "#f1c40f",
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },

  // Finished
  finishedContent: {
    padding: spacing["2xl"],
    alignItems: "center",
    paddingBottom: spacing["5xl"],
  },
  finishedEmoji: {
    fontSize: 72,
    marginBottom: spacing.lg,
  },
  finishedTitle: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    color: "#fff",
    marginBottom: spacing["2xl"],
  },
  myRankBox: {
    backgroundColor: "rgba(241,196,15,0.15)",
    borderRadius: borderRadius.xl,
    padding: spacing["2xl"],
    alignItems: "center",
    marginBottom: spacing["2xl"],
    width: "100%",
  },
  myRankLabel: {
    color: "#aaa",
    fontSize: fontSize.sm,
  },
  myRankValue: {
    color: "#f1c40f",
    fontSize: fontSize["4xl"],
    fontWeight: fontWeight.bold,
  },
  myScoreValue: {
    color: "#fff",
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xs,
  },
  leaderboardTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: "#fff",
    marginBottom: spacing.md,
    alignSelf: "flex-start",
  },
  leaderRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    width: "100%",
  },
  leaderRowMe: {
    backgroundColor: "rgba(155,89,182,0.2)",
    borderWidth: 1,
    borderColor: "rgba(155,89,182,0.4)",
  },
  leaderRank: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: "#fff",
    width: 36,
  },
  leaderName: {
    flex: 1,
    fontSize: fontSize.base,
    color: "#fff",
    fontWeight: fontWeight.medium,
  },
  leaderNameMe: {
    fontWeight: fontWeight.bold,
  },
  leaderScore: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: "#f1c40f",
  },
  exitBtn: {
    backgroundColor: colors.purple[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing["3xl"],
    marginTop: spacing["2xl"],
  },
  exitBtnText: {
    color: "#fff",
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },

  // Estimation
  estimationHint: {
    color: "#bbb",
    fontSize: fontSize.base,
    textAlign: "center",
    marginBottom: spacing.md,
  },

  // Ranking
  rankingRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rankingIndex: {
    color: "#f1c40f",
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold as "bold",
    width: 30,
  },
  rankingItemText: {
    flex: 1,
    color: "#fff",
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium as "500",
  },
  rankingArrows: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  rankingArrowBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  rankingArrowText: {
    color: "#fff",
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold as "bold",
  },

  // Geo
  geoMapContainer: {
    height: 280,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  geoMapWebView: {
    flex: 1,
  },
  geoCoordText: {
    color: "#2ecc71",
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold as "600",
    textAlign: "center",
    marginBottom: spacing.md,
  },

  // Matching
  matchingContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  matchingColumn: {
    flex: 1,
    gap: spacing.sm,
  },
  matchingItem: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  matchingItemLeft: {
    backgroundColor: "rgba(52,152,219,0.3)",
    borderWidth: 1,
    borderColor: "rgba(52,152,219,0.5)",
  },
  matchingItemRight: {
    backgroundColor: "rgba(46,204,113,0.3)",
    borderWidth: 1,
    borderColor: "rgba(46,204,113,0.5)",
  },
  matchingItemActive: {
    borderColor: "#f1c40f",
    borderWidth: 2,
    backgroundColor: "rgba(241,196,15,0.2)",
  },
  matchingItemMatched: {
    opacity: 0.7,
    borderStyle: "dashed" as "dashed",
  },
  matchingItemHighlight: {
    borderColor: "rgba(241,196,15,0.4)",
  },
  matchingItemText: {
    color: "#fff",
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium as "500",
    flex: 1,
  },
  matchingCheckText: {
    color: "#2ecc71",
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold as "bold",
    marginLeft: spacing.xs,
  },
  matchingSummary: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  matchingSummaryText: {
    color: "#f1c40f",
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium as "500",
    marginBottom: 2,
  },
});
