"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Card } from "@/components/ui";
import type { Id } from "../../../../../../convex/_generated/dataModel";

export default function LiveQuizPage() {
  const params = useParams();
  const sessionId = params.sessionId as Id<"quiz_sessions">;

  const session = useQuery(api.quizzes.getSession, { id: sessionId });
  const participants = useQuery(
    api.quizzes.getParticipants,
    session ? { sessionId: session._id } : "skip",
  );
  const leaderboard = useQuery(
    api.quizzes.getLeaderboard,
    session ? { sessionId: session._id } : "skip",
  );
  const currentQuestion = useQuery(
    api.quizzes.getCurrentQuestion,
    session ? { sessionId: session._id } : "skip",
  );
  const answers = useQuery(
    api.quizzes.getAnswersForQuestion,
    session && currentQuestion
      ? {
          sessionId: session._id,
          questionId: currentQuestion._id as Id<"quiz_questions">,
        }
      : "skip",
  );
  const quiz = useQuery(
    api.quizzes.getQuiz,
    session ? { id: session.quizId } : "skip",
  );

  const startSession = useMutation(api.quizzes.startSession);
  const nextQuestion = useMutation(api.quizzes.nextQuestion);
  const revealAnswer = useMutation(api.quizzes.revealAnswer);
  const endSession = useMutation(api.quizzes.endSession);

  if (!session || !quiz) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Laden...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{quiz.title}</h1>
            <p className="text-purple-300 mt-1">
              Status:{" "}
              <span className="font-semibold capitalize">{session.status}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-300">Deelnamecode</p>
            <p className="text-4xl font-mono font-bold tracking-wider text-yellow-400">
              {session.joinCode}
            </p>
          </div>
        </div>

        {/* LOBBY */}
        {session.status === "lobby" && (
          <div className="text-center py-12">
            <Card className="bg-white/10 border-white/20 backdrop-blur max-w-lg mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">
                🎯 Wachten op spelers...
              </h2>
              <p className="text-purple-200 mb-2">
                Deel de code{" "}
                <span className="font-mono font-bold text-yellow-400 text-2xl">
                  {session.joinCode}
                </span>
              </p>
              <p className="text-purple-300 mb-6">
                {participants?.length ?? 0} speler(s) aangemeld
              </p>
              {participants && participants.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {participants.map((p) => (
                    <span
                      key={p._id}
                      className="px-3 py-1 bg-purple-500/30 rounded-full text-sm"
                    >
                      {p.displayName}
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => startSession({ sessionId })}
                disabled={!participants?.length}
                className="px-8 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 font-bold text-lg transition-colors"
              >
                🚀 Start Quiz!
              </button>
            </Card>
          </div>
        )}

        {/* QUESTION */}
        {(session.status === "question" || session.status === "revealing") &&
          currentQuestion && (
            <div>
              <Card className="bg-white/10 border-white/20 backdrop-blur mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-purple-300">
                    Vraag {currentQuestion.currentIndex + 1} /{" "}
                    {currentQuestion.totalQuestions}
                  </span>
                  <span className="text-sm text-purple-300">
                    {currentQuestion.points} punten •{" "}
                    {currentQuestion.timeLimitSeconds}s
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  {currentQuestion.questionText}
                </h2>

                {(currentQuestion.questionType === "multiple_choice" ||
                  currentQuestion.questionType === "multiple_choice_picture") &&
                  currentQuestion.options && (
                    <div className="grid grid-cols-2 gap-3">
                      {currentQuestion.options.map((opt, i) => {
                        const isCorrect =
                          session.status === "revealing" &&
                          opt === currentQuestion.correctAnswer;
                        const isPicture =
                          currentQuestion.questionType ===
                          "multiple_choice_picture";
                        const imageUrl = currentQuestion.optionImageUrls?.[i];
                        const colors = [
                          "bg-red-500/80",
                          "bg-blue-500/80",
                          "bg-yellow-500/80",
                          "bg-green-500/80",
                          "bg-pink-500/80",
                          "bg-cyan-500/80",
                        ];
                        return (
                          <div
                            key={i}
                            className={`p-4 rounded-xl text-center font-semibold text-lg ${
                              isCorrect
                                ? "bg-green-500 ring-4 ring-green-300"
                                : colors[i % colors.length]
                            }`}
                          >
                            {isPicture && imageUrl && (
                              <img
                                src={imageUrl}
                                alt={opt}
                                className="w-full h-40 object-cover rounded-lg mb-2"
                              />
                            )}
                            {String.fromCharCode(65 + i)}. {opt}
                            {isCorrect && " ✓"}
                          </div>
                        );
                      })}
                    </div>
                  )}

                {currentQuestion.questionType === "open" && (
                  <div className="text-center py-4">
                    <p className="text-purple-300 text-lg">
                      Open vraag - spelers typen hun antwoord
                    </p>
                    {session.status === "revealing" && (
                      <p className="text-green-400 text-xl font-bold mt-2">
                        Correct: {currentQuestion.correctAnswer}
                      </p>
                    )}
                  </div>
                )}

                {/* ESTIMATION on host */}
                {currentQuestion.questionType === "estimation" && (
                  <div className="text-center py-4">
                    <p className="text-purple-300 text-lg">
                      📊 Schattingsvraag — spelers voeren een getal in
                      {currentQuestion.estimationUnit &&
                        ` (${currentQuestion.estimationUnit})`}
                    </p>
                    {session.status === "revealing" && (
                      <p className="text-green-400 text-2xl font-bold mt-2">
                        Correct:{" "}
                        {Number(currentQuestion.correctAnswer).toLocaleString(
                          "nl-BE",
                        )}
                        {currentQuestion.estimationUnit &&
                          ` ${currentQuestion.estimationUnit}`}
                      </p>
                    )}
                  </div>
                )}

                {/* RANKING on host */}
                {currentQuestion.questionType === "ranking" &&
                  currentQuestion.options && (
                    <div className="py-4">
                      <p className="text-purple-300 text-lg text-center mb-3">
                        🔢 Rangschikken — spelers zetten items in de juiste
                        volgorde
                      </p>
                      {session.status === "revealing" && (
                        <div className="space-y-2 max-w-md mx-auto">
                          {currentQuestion.options.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 bg-green-500/20 rounded-lg px-4 py-2"
                            >
                              <span className="text-green-400 font-bold text-lg">
                                {i + 1}.
                              </span>
                              <span className="text-white font-medium">
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                {/* GEO on host */}
                {currentQuestion.questionType === "geo" && (
                  <div className="text-center py-4">
                    <p className="text-purple-300 text-lg mb-3">
                      🗺️ Locatievraag — spelers tikken op de kaart
                    </p>
                    {session.status === "revealing" &&
                      currentQuestion.correctAnswer && (
                        <div>
                          <p className="text-green-400 text-lg font-bold mb-2">
                            📍 Correcte locatie: {currentQuestion.correctAnswer}
                          </p>
                          <iframe
                            title="Correct location"
                            width="100%"
                            height="250"
                            style={{
                              border: "1px solid rgba(255,255,255,0.2)",
                              borderRadius: 12,
                            }}
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(currentQuestion.correctAnswer.split(",")[1]) - 1},${Number(currentQuestion.correctAnswer.split(",")[0]) - 0.5},${Number(currentQuestion.correctAnswer.split(",")[1]) + 1},${Number(currentQuestion.correctAnswer.split(",")[0]) + 0.5}&layer=mapnik&marker=${currentQuestion.correctAnswer}`}
                          />
                        </div>
                      )}
                  </div>
                )}

                {/* MATCHING on host */}
                {currentQuestion.questionType === "matching" &&
                  currentQuestion.matchingPairs && (
                    <div className="py-4">
                      <p className="text-purple-300 text-lg text-center mb-3">
                        🔗 Koppelvraag — spelers verbinden paren
                      </p>
                      {session.status === "revealing" && (
                        <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto items-center">
                          {currentQuestion.matchingPairs.map((pair, i) => (
                            <React.Fragment key={i}>
                              <div className="bg-blue-500/30 rounded-lg px-3 py-2 text-center text-white font-medium">
                                {pair.left}
                              </div>
                              <div className="text-center text-green-400 font-bold">
                                →
                              </div>
                              <div className="bg-green-500/30 rounded-lg px-3 py-2 text-center text-white font-medium">
                                {pair.right}
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
              </Card>

              {/* Answer stats */}
              <Card className="bg-white/10 border-white/20 backdrop-blur mb-6">
                <div className="flex items-center justify-between">
                  <p className="text-purple-200">
                    {answers?.length ?? 0} / {participants?.length ?? 0}{" "}
                    antwoorden ontvangen
                  </p>
                  {session.status === "revealing" && (
                    <p className="text-green-400 font-medium">
                      {answers?.filter((a) => a.isCorrect).length ?? 0} correct
                    </p>
                  )}
                </div>

                {/* Show individual answers during reveal */}
                {session.status === "revealing" &&
                  answers &&
                  answers.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {answers
                        .sort((a, b) => a.responseTimeMs - b.responseTimeMs)
                        .map((a) => {
                          const participant = participants?.find(
                            (p) => p._id === a.participantId,
                          );
                          return (
                            <div
                              key={a._id}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                                a.isCorrect
                                  ? "bg-green-500/20"
                                  : "bg-red-500/20"
                              }`}
                            >
                              <span className="text-sm">
                                {participant?.displayName ?? "?"} —{" "}
                                <span className="text-purple-300">
                                  {a.answer}
                                </span>
                              </span>
                              <span className="text-sm text-purple-300">
                                {(a.responseTimeMs / 1000).toFixed(1)}s •{" "}
                                {a.pointsAwarded}pt
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  )}
              </Card>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                {session.status === "question" && (
                  <button
                    onClick={() => revealAnswer({ sessionId })}
                    className="px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition-colors"
                  >
                    👁 Toon Antwoord
                  </button>
                )}
                {session.status === "revealing" && (
                  <button
                    onClick={() => nextQuestion({ sessionId })}
                    className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors"
                  >
                    ➡ Volgende Vraag
                  </button>
                )}
                <button
                  onClick={() => endSession({ sessionId })}
                  className="px-6 py-3 bg-red-500/80 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  ⏹ Stop Quiz
                </button>
              </div>
            </div>
          )}

        {/* FINISHED */}
        {session.status === "finished" && (
          <div className="text-center py-8">
            <h2 className="text-3xl font-bold mb-8">🏆 Resultaten</h2>
            <Card className="bg-white/10 border-white/20 backdrop-blur max-w-lg mx-auto">
              <div className="space-y-3">
                {leaderboard?.map((p, i) => (
                  <div
                    key={p._id}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                      i === 0
                        ? "bg-yellow-500/30 text-yellow-200"
                        : i === 1
                          ? "bg-gray-300/20 text-gray-200"
                          : i === 2
                            ? "bg-amber-700/30 text-amber-300"
                            : "bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold w-8">
                        {i === 0
                          ? "🥇"
                          : i === 1
                            ? "🥈"
                            : i === 2
                              ? "🥉"
                              : `${i + 1}.`}
                      </span>
                      <span className="font-semibold">{p.displayName}</span>
                    </div>
                    <span className="font-bold text-lg">{p.totalScore} pt</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Leaderboard sidebar (always visible except lobby) */}
        {session.status !== "lobby" &&
          session.status !== "finished" &&
          leaderboard && (
            <Card className="mt-6 bg-white/10 border-white/20 backdrop-blur">
              <h3 className="text-lg font-bold text-purple-200 mb-3">
                🏆 Stand
              </h3>
              <div className="space-y-1">
                {leaderboard.slice(0, 10).map((p, i) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between px-3 py-1 text-sm"
                  >
                    <span>
                      {i + 1}. {p.displayName}
                    </span>
                    <span className="font-mono">{p.totalScore}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
      </div>
    </div>
  );
}
