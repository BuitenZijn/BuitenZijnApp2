"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuth } from "@/app/providers";
import { Card } from "@/components/ui";
import type { Id } from "../../../../../convex/_generated/dataModel";

type QuestionType =
  | "multiple_choice"
  | "multiple_choice_picture"
  | "open"
  | "estimation"
  | "ranking"
  | "geo"
  | "matching";

interface QuestionForm {
  questionText: string;
  questionType: QuestionType;
  options: string[];
  optionImageUrls: string[];
  correctAnswer: string;
  points: number;
  timeLimitSeconds: number;
  estimationUnit: string;
  geoLat: string;
  geoLng: string;
  geoZoom: number;
  matchingPairs: { left: string; right: string }[];
  rankingItems: string[];
}

const emptyQuestion: QuestionForm = {
  questionText: "",
  questionType: "multiple_choice",
  options: ["", "", "", ""],
  optionImageUrls: ["", "", "", ""],
  correctAnswer: "",
  points: 100,
  timeLimitSeconds: 30,
  estimationUnit: "",
  geoLat: "",
  geoLng: "",
  geoZoom: 4,
  matchingPairs: [
    { left: "", right: "" },
    { left: "", right: "" },
    { left: "", right: "" },
    { left: "", right: "" },
  ],
  rankingItems: ["", "", "", ""],
};

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const quizId = params.id as Id<"quizzes">;

  const quiz = useQuery(api.quizzes.getQuiz, { id: quizId });
  const questions = useQuery(api.quizzes.getQuestions, { quizId });
  const updateQuiz = useMutation(api.quizzes.updateQuiz);
  const addQuestion = useMutation(api.quizzes.addQuestion);
  const updateQuestion = useMutation(api.quizzes.updateQuestion);
  const deleteQuestion = useMutation(api.quizzes.deleteQuestion);
  const generateUploadUrl = useMutation(api.quizzes.generateUploadUrl);
  const getStorageUrl = useMutation(api.quizzes.getStorageUrl);

  const [editingQuiz, setEditingQuiz] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDesc, setQuizDesc] = useState("");
  const [quizActive, setQuizActive] = useState(false);
  const [reactionTimeScoring, setReactionTimeScoring] = useState(false);
  const [scoringMode, setScoringMode] = useState<"linear" | "tiered" | "flat">(
    "linear",
  );
  const [linearMinMultiplier, setLinearMinMultiplier] = useState(0.5);
  const [tieredBrackets, setTieredBrackets] = useState<
    { withinMs: number; bonusPoints: number }[]
  >([
    { withinMs: 3000, bonusPoints: 50 },
    { withinMs: 7000, bonusPoints: 25 },
    { withinMs: 15000, bonusPoints: 10 },
  ]);

  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [form, setForm] = useState<QuestionForm>({ ...emptyQuestion });
  const [editingQuestionId, setEditingQuestionId] =
    useState<Id<"quiz_questions"> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleImageUpload = async (file: File, optionIndex: number) => {
    setUploadingIndex(optionIndex);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      const url = await getStorageUrl({ storageId });
      if (url) {
        const newUrls = [...form.optionImageUrls];
        newUrls[optionIndex] = url;
        setForm({ ...form, optionImageUrls: newUrls });
      }
    } catch (err: any) {
      alert(err.message || "Upload mislukt");
    } finally {
      setUploadingIndex(null);
    }
  };

  const isAdmin = user?.roles?.includes("admin");

  // Initialize edit form when quiz loads
  const startEditQuiz = () => {
    if (quiz) {
      setQuizTitle(quiz.title);
      setQuizDesc(quiz.description || "");
      setQuizActive(quiz.isActive);
      setReactionTimeScoring(quiz.reactionTimeScoring ?? false);
      setScoringMode(quiz.scoringMode ?? "linear");
      setLinearMinMultiplier(quiz.linearMinMultiplier ?? 0.5);
      setTieredBrackets(
        quiz.tieredBrackets ?? [
          { withinMs: 3000, bonusPoints: 50 },
          { withinMs: 7000, bonusPoints: 25 },
          { withinMs: 15000, bonusPoints: 10 },
        ],
      );
      setEditingQuiz(true);
    }
  };

  const handleUpdateQuiz = async () => {
    if (!quiz) return;
    await updateQuiz({
      id: quizId,
      title: quizTitle,
      description: quizDesc || undefined,
      isActive: quizActive,
      reactionTimeScoring,
      scoringMode,
      linearMinMultiplier,
      tieredBrackets,
    });
    setEditingQuiz(false);
  };

  const startEditQuestion = (q: NonNullable<typeof questions>[number]) => {
    // Parse geo coordinates from correctAnswer if geo type
    let geoLat = "";
    let geoLng = "";
    if (q.questionType === "geo" && q.correctAnswer) {
      const parts = q.correctAnswer.split(",");
      geoLat = parts[0] || "";
      geoLng = parts[1] || "";
    }
    // Parse ranking items from correctAnswer
    let rankingItems = ["", "", "", ""];
    if (q.questionType === "ranking" && q.correctAnswer) {
      try {
        rankingItems = JSON.parse(q.correctAnswer);
      } catch {
        rankingItems = q.options || ["", "", "", ""];
      }
    }
    setForm({
      questionText: q.questionText,
      questionType: q.questionType as QuestionType,
      options: q.options || ["", "", "", ""],
      optionImageUrls: q.optionImageUrls || ["", "", "", ""],
      correctAnswer: q.correctAnswer,
      points: q.points,
      timeLimitSeconds: q.timeLimitSeconds,
      estimationUnit: q.estimationUnit || "",
      geoLat,
      geoLng,
      geoZoom: q.geoZoom || 4,
      matchingPairs: q.matchingPairs || [
        { left: "", right: "" },
        { left: "", right: "" },
        { left: "", right: "" },
        { left: "", right: "" },
      ],
      rankingItems,
    });
    setEditingQuestionId(q._id);
    setShowAddQuestion(true);
  };

  const handleSaveQuestion = async () => {
    setSaving(true);
    try {
      const isMC =
        form.questionType === "multiple_choice" ||
        form.questionType === "multiple_choice_picture";

      // Build correctAnswer based on type
      let correctAnswer = form.correctAnswer;
      let options = isMC
        ? form.options.filter((o) => o.trim() !== "")
        : undefined;
      let matchingPairs: { left: string; right: string }[] | undefined;
      let estimationUnit: string | undefined;
      let geoZoom: number | undefined;

      if (form.questionType === "estimation") {
        correctAnswer = form.correctAnswer; // number as string
        estimationUnit = form.estimationUnit || undefined;
      } else if (form.questionType === "ranking") {
        const items = form.rankingItems.filter((i) => i.trim() !== "");
        correctAnswer = JSON.stringify(items);
        options = items; // store items in options as well for display
      } else if (form.questionType === "geo") {
        correctAnswer = `${form.geoLat},${form.geoLng}`;
        geoZoom = form.geoZoom;
      } else if (form.questionType === "matching") {
        const pairs = form.matchingPairs.filter(
          (p) => p.left.trim() !== "" && p.right.trim() !== "",
        );
        matchingPairs = pairs;
        // correctAnswer = JSON mapping of left→right
        const mapping: Record<string, string> = {};
        pairs.forEach((p) => {
          mapping[p.left] = p.right;
        });
        correctAnswer = JSON.stringify(mapping);
      }

      const data = {
        questionText: form.questionText,
        questionType: form.questionType,
        options,
        optionImageUrls:
          form.questionType === "multiple_choice_picture"
            ? form.optionImageUrls.filter((u) => u.trim() !== "")
            : undefined,
        correctAnswer,
        points: form.points,
        timeLimitSeconds: form.timeLimitSeconds,
        estimationUnit,
        geoZoom,
        matchingPairs,
      };

      if (editingQuestionId) {
        await updateQuestion({
          id: editingQuestionId,
          ...data,
          order:
            questions?.find((q) => q._id === editingQuestionId)?.order ?? 0,
        });
      } else {
        await addQuestion({
          quizId,
          ...data,
          order: questions?.length ?? 0,
        });
      }

      setForm({ ...emptyQuestion });
      setEditingQuestionId(null);
      setShowAddQuestion(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (id: Id<"quiz_questions">) => {
    if (!confirm("Vraag verwijderen?")) return;
    await deleteQuestion({ id });
  };

  const cancelEdit = () => {
    setForm({ ...emptyQuestion });
    setEditingQuestionId(null);
    setShowAddQuestion(false);
  };

  if (quiz === undefined || questions === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-100 to-purple-50 flex items-center justify-center">
        <p className="text-gray-500">Laden...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-100 to-purple-50 flex items-center justify-center">
        <p className="text-red-500">Quiz niet gevonden.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-100 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back link */}
        <button
          onClick={() => router.push("/activiteiten/quizzen")}
          className="text-purple-600 hover:text-purple-800 mb-4 inline-flex items-center gap-1 text-sm font-medium"
        >
          ← Terug naar Quizzen
        </button>

        {/* Quiz info */}
        <Card className="mb-8">
          {editingQuiz ? (
            <div className="space-y-3">
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-xl font-bold focus:ring-2 focus:ring-purple-400"
              />
              <textarea
                value={quizDesc}
                onChange={(e) => setQuizDesc(e.target.value)}
                placeholder="Beschrijving"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
                rows={2}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={quizActive}
                  onChange={(e) => setQuizActive(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600"
                />
                Actief (zichtbaar voor spelers)
              </label>

              {/* Scoring configuration */}
              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50/50 space-y-3">
                <h3 className="text-sm font-semibold text-purple-800">
                  ⏱️ Scoring Instellingen
                </h3>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={reactionTimeScoring}
                    onChange={(e) => setReactionTimeScoring(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600"
                  />
                  Reactietijd-scoring inschakelen
                </label>
                <p className="text-xs text-gray-500 -mt-1 ml-6">
                  Snellere antwoorden leveren meer punten op
                </p>

                {reactionTimeScoring && (
                  <div className="space-y-3 mt-2 pl-2 border-l-2 border-purple-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Scoring modus
                      </label>
                      <select
                        value={scoringMode}
                        onChange={(e) =>
                          setScoringMode(
                            e.target.value as "linear" | "tiered" | "flat",
                          )
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 text-sm"
                      >
                        <option value="linear">
                          Lineair (sneller = hogere multiplier)
                        </option>
                        <option value="tiered">
                          Schijven (tijdslimieten met bonuspunten)
                        </option>
                        <option value="flat">
                          Vlak (alleen juist/fout, geen snelheidsbonus)
                        </option>
                      </select>
                    </div>

                    {scoringMode === "linear" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum multiplier (0.1 – 1.0)
                        </label>
                        <p className="text-xs text-gray-500 mb-1">
                          Bij tijdslimiet krijgt het langzaamste correcte
                          antwoord dit percentage van de punten. Bijv. 0.5 =
                          minimaal 50%.
                        </p>
                        <input
                          type="number"
                          value={linearMinMultiplier}
                          onChange={(e) =>
                            setLinearMinMultiplier(
                              Math.max(
                                0.1,
                                Math.min(1, Number(e.target.value)),
                              ),
                            )
                          }
                          step={0.05}
                          min={0.1}
                          max={1}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 text-sm"
                        />
                      </div>
                    )}

                    {scoringMode === "tiered" && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Tijdsschijven
                        </label>
                        <p className="text-xs text-gray-500">
                          Antwoord binnen X ms → krijgt basispunten +
                          bonuspunten. Snelste schijf wint.
                        </p>
                        {tieredBrackets.map((bracket, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-16">
                              Binnen
                            </span>
                            <input
                              type="number"
                              value={bracket.withinMs}
                              onChange={(e) => {
                                const next = [...tieredBrackets];
                                next[i] = {
                                  ...next[i],
                                  withinMs: Number(e.target.value),
                                };
                                setTieredBrackets(next);
                              }}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              min={0}
                            />
                            <span className="text-xs text-gray-500">ms →</span>
                            <span className="text-xs text-gray-500">+</span>
                            <input
                              type="number"
                              value={bracket.bonusPoints}
                              onChange={(e) => {
                                const next = [...tieredBrackets];
                                next[i] = {
                                  ...next[i],
                                  bonusPoints: Number(e.target.value),
                                };
                                setTieredBrackets(next);
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              min={0}
                            />
                            <span className="text-xs text-gray-500">bonus</span>
                            {tieredBrackets.length > 1 && (
                              <button
                                onClick={() =>
                                  setTieredBrackets(
                                    tieredBrackets.filter(
                                      (_, idx) => idx !== i,
                                    ),
                                  )
                                }
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() =>
                            setTieredBrackets([
                              ...tieredBrackets,
                              { withinMs: 10000, bonusPoints: 10 },
                            ])
                          }
                          className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                        >
                          + Schijf toevoegen
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateQuiz}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  Opslaan
                </button>
                <button
                  onClick={() => setEditingQuiz(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Annuleren
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-navy-800 flex items-center gap-2">
                  {quiz.title}
                  {quiz.isActive && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Actief
                    </span>
                  )}
                </h1>
                {quiz.description && (
                  <p className="text-gray-600 mt-1">{quiz.description}</p>
                )}
                <p className="text-sm text-gray-400 mt-2">
                  {questions.length}{" "}
                  {questions.length === 1 ? "vraag" : "vragen"}
                </p>
                {/* Scoring badge */}
                <div className="flex items-center gap-2 mt-2">
                  {quiz.reactionTimeScoring ? (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      ⏱️ Reactietijd:{" "}
                      {quiz.scoringMode === "tiered"
                        ? "Schijven"
                        : quiz.scoringMode === "flat"
                          ? "Vlak"
                          : "Lineair"}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      Standaard scoring
                    </span>
                  )}
                </div>
              </div>
              {isAdmin && (
                <button
                  onClick={startEditQuiz}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                >
                  Bewerken
                </button>
              )}
            </div>
          )}
        </Card>

        {/* Questions section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-navy-800">Vragen</h2>
          {isAdmin && !showAddQuestion && (
            <button
              onClick={() => setShowAddQuestion(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm"
            >
              + Vraag Toevoegen
            </button>
          )}
        </div>

        {/* Add/Edit question form */}
        {showAddQuestion && isAdmin && (
          <Card className="mb-6 border-purple-200 bg-purple-50">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">
              {editingQuestionId ? "Vraag Bewerken" : "Nieuwe Vraag"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vraag
                </label>
                <textarea
                  value={form.questionText}
                  onChange={(e) =>
                    setForm({ ...form, questionText: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
                  rows={2}
                  placeholder="Stel je vraag..."
                />
              </div>

              <div className="flex gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={form.questionType}
                    onChange={(e) => {
                      const newType = e.target.value as QuestionType;
                      const newForm = { ...form, questionType: newType };
                      // Reset to 4 options when switching to an MC type
                      if (
                        (newType === "multiple_choice" ||
                          newType === "multiple_choice_picture") &&
                        form.questionType !== "multiple_choice" &&
                        form.questionType !== "multiple_choice_picture"
                      ) {
                        newForm.options = ["", "", "", ""];
                        newForm.optionImageUrls = ["", "", "", ""];
                      }
                      setForm(newForm);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="multiple_choice">Meerkeuze</option>
                    <option value="multiple_choice_picture">
                      Meerkeuze met afbeeldingen
                    </option>
                    <option value="open">Open vraag</option>
                    <option value="estimation">📊 Schatting</option>
                    <option value="ranking">🔢 Rangschikken</option>
                    <option value="geo">🗺️ Kaart / Locatie</option>
                    <option value="matching">🔗 Koppelvraag</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Punten
                  </label>
                  <input
                    type="number"
                    value={form.points}
                    onChange={(e) =>
                      setForm({ ...form, points: Number(e.target.value) })
                    }
                    className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tijdslimiet (sec)
                  </label>
                  <input
                    type="number"
                    value={form.timeLimitSeconds}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        timeLimitSeconds: Number(e.target.value),
                      })
                    }
                    className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
                    min={0}
                  />
                </div>
              </div>

              {(form.questionType === "multiple_choice" ||
                form.questionType === "multiple_choice_picture") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Antwoordopties
                  </label>
                  {form.questionType === "multiple_choice_picture" && (
                    <p className="text-xs text-gray-500 mb-2">
                      Upload een afbeelding per optie, of plak een URL.
                    </p>
                  )}
                  <div className="space-y-2">
                    {form.options.map((opt, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500 w-6">
                            {String.fromCharCode(65 + i)}.
                          </span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOptions = [...form.options];
                              newOptions[i] = e.target.value;
                              setForm({ ...form, options: newOptions });
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
                            placeholder={`Optie ${String.fromCharCode(65 + i)}`}
                          />
                          {form.options.length > 2 && (
                            <button
                              onClick={() => {
                                const newOptions = form.options.filter(
                                  (_, idx) => idx !== i,
                                );
                                const newImageUrls =
                                  form.optionImageUrls.filter(
                                    (_, idx) => idx !== i,
                                  );
                                setForm({
                                  ...form,
                                  options: newOptions,
                                  optionImageUrls: newImageUrls,
                                });
                              }}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        {form.questionType === "multiple_choice_picture" && (
                          <div className="flex items-center gap-2 ml-8">
                            <span className="text-xs text-gray-400">🖼️</span>
                            <input
                              type="file"
                              accept="image/*"
                              ref={(el) => {
                                fileInputRefs.current[i] = el;
                              }}
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file, i);
                                e.target.value = "";
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRefs.current[i]?.click()}
                              disabled={uploadingIndex === i}
                              className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 whitespace-nowrap"
                            >
                              {uploadingIndex === i
                                ? "Uploaden..."
                                : "📤 Upload"}
                            </button>
                            <input
                              type="text"
                              value={form.optionImageUrls[i] || ""}
                              onChange={(e) => {
                                const newUrls = [...form.optionImageUrls];
                                newUrls[i] = e.target.value;
                                setForm({ ...form, optionImageUrls: newUrls });
                              }}
                              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 text-sm"
                              placeholder="of plak een URL"
                            />
                            {form.optionImageUrls[i]?.trim() && (
                              <div className="relative">
                                <img
                                  src={form.optionImageUrls[i]}
                                  alt={`Preview ${String.fromCharCode(65 + i)}`}
                                  className="w-12 h-12 rounded object-cover border border-gray-200"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newUrls = [...form.optionImageUrls];
                                    newUrls[i] = "";
                                    setForm({
                                      ...form,
                                      optionImageUrls: newUrls,
                                    });
                                  }}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-red-600"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {form.options.length < 6 && (
                      <button
                        onClick={() =>
                          setForm({
                            ...form,
                            options: [...form.options, ""],
                            optionImageUrls: [...form.optionImageUrls, ""],
                          })
                        }
                        className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                      >
                        + Optie toevoegen
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ESTIMATION fields */}
              {form.questionType === "estimation" && (
                <div className="space-y-3 border border-orange-200 rounded-lg p-4 bg-orange-50/50">
                  <h4 className="text-sm font-semibold text-orange-800">
                    📊 Schatting-instellingen
                  </h4>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correct getal
                      </label>
                      <input
                        type="number"
                        value={form.correctAnswer}
                        onChange={(e) =>
                          setForm({ ...form, correctAnswer: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                        placeholder="bijv. 11000000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Eenheid (optioneel)
                      </label>
                      <input
                        type="text"
                        value={form.estimationUnit}
                        onChange={(e) =>
                          setForm({ ...form, estimationUnit: e.target.value })
                        }
                        className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                        placeholder="bijv. km, jaar"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Spelers raden een getal. Hoe dichter bij, hoe meer punten
                    (100% bij exact, 0% bij ≥100% afwijking).
                  </p>
                </div>
              )}

              {/* RANKING fields */}
              {form.questionType === "ranking" && (
                <div className="space-y-3 border border-teal-200 rounded-lg p-4 bg-teal-50/50">
                  <h4 className="text-sm font-semibold text-teal-800">
                    🔢 Rangschikken — items in correcte volgorde
                  </h4>
                  <p className="text-xs text-gray-500">
                    Voer de items in de JUISTE volgorde in (1 = bovenaan). De
                    speler ziet ze geschud.
                  </p>
                  <div className="space-y-2">
                    {form.rankingItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-sm font-bold text-teal-700 w-6">
                          {i + 1}.
                        </span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const newItems = [...form.rankingItems];
                            newItems[i] = e.target.value;
                            setForm({ ...form, rankingItems: newItems });
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400"
                          placeholder={`Item ${i + 1}`}
                        />
                        {form.rankingItems.length > 2 && (
                          <button
                            onClick={() =>
                              setForm({
                                ...form,
                                rankingItems: form.rankingItems.filter(
                                  (_, idx) => idx !== i,
                                ),
                              })
                            }
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {form.rankingItems.length < 8 && (
                      <button
                        onClick={() =>
                          setForm({
                            ...form,
                            rankingItems: [...form.rankingItems, ""],
                          })
                        }
                        className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                      >
                        + Item toevoegen
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* GEO fields */}
              {form.questionType === "geo" && (
                <div className="space-y-3 border border-emerald-200 rounded-lg p-4 bg-emerald-50/50">
                  <h4 className="text-sm font-semibold text-emerald-800">
                    🗺️ Kaart / Locatie
                  </h4>
                  <div className="flex gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Breedtegraad (lat)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={form.geoLat}
                        onChange={(e) =>
                          setForm({ ...form, geoLat: e.target.value })
                        }
                        className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400"
                        placeholder="bijv. 51.05"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lengtegraad (lng)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={form.geoLng}
                        onChange={(e) =>
                          setForm({ ...form, geoLng: e.target.value })
                        }
                        className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400"
                        placeholder="bijv. 3.72"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zoom (1-18)
                      </label>
                      <input
                        type="number"
                        value={form.geoZoom}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            geoZoom: Math.max(
                              1,
                              Math.min(18, Number(e.target.value)),
                            ),
                          })
                        }
                        className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400"
                        min={1}
                        max={18}
                      />
                    </div>
                  </div>
                  {form.geoLat && form.geoLng && (
                    <div className="mt-2">
                      <iframe
                        title="Kaart preview"
                        width="100%"
                        height="200"
                        style={{ border: "1px solid #ccc", borderRadius: 8 }}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(form.geoLng) - 2},${Number(form.geoLat) - 1},${Number(form.geoLng) + 2},${Number(form.geoLat) + 1}&layer=mapnik&marker=${form.geoLat},${form.geoLng}`}
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Spelers tikken op een kaart. Punten op basis van afstand
                    (volle score &lt;50km, 0 punten bij ≥2000km).
                  </p>
                </div>
              )}

              {/* MATCHING fields */}
              {form.questionType === "matching" && (
                <div className="space-y-3 border border-violet-200 rounded-lg p-4 bg-violet-50/50">
                  <h4 className="text-sm font-semibold text-violet-800">
                    🔗 Koppelvraag — paren
                  </h4>
                  <p className="text-xs text-gray-500">
                    Voeg links-rechts paren toe. De speler ziet de rechterkolom
                    geschud.
                  </p>
                  <div className="space-y-2">
                    {form.matchingPairs.map((pair, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-sm font-bold text-violet-700 w-6">
                          {i + 1}.
                        </span>
                        <input
                          type="text"
                          value={pair.left}
                          onChange={(e) => {
                            const newPairs = [...form.matchingPairs];
                            newPairs[i] = {
                              ...newPairs[i],
                              left: e.target.value,
                            };
                            setForm({ ...form, matchingPairs: newPairs });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-400"
                          placeholder="Links (bijv. Frankrijk)"
                        />
                        <span className="text-gray-400">→</span>
                        <input
                          type="text"
                          value={pair.right}
                          onChange={(e) => {
                            const newPairs = [...form.matchingPairs];
                            newPairs[i] = {
                              ...newPairs[i],
                              right: e.target.value,
                            };
                            setForm({ ...form, matchingPairs: newPairs });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-400"
                          placeholder="Rechts (bijv. Parijs)"
                        />
                        {form.matchingPairs.length > 2 && (
                          <button
                            onClick={() =>
                              setForm({
                                ...form,
                                matchingPairs: form.matchingPairs.filter(
                                  (_, idx) => idx !== i,
                                ),
                              })
                            }
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {form.matchingPairs.length < 8 && (
                      <button
                        onClick={() =>
                          setForm({
                            ...form,
                            matchingPairs: [
                              ...form.matchingPairs,
                              { left: "", right: "" },
                            ],
                          })
                        }
                        className="text-sm text-violet-600 hover:text-violet-800 font-medium"
                      >
                        + Paar toevoegen
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Correct answer — only shown for MC and open types */}
              {(form.questionType === "multiple_choice" ||
                form.questionType === "multiple_choice_picture" ||
                form.questionType === "open") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correct antwoord
                  </label>
                  {form.questionType === "multiple_choice" ||
                  form.questionType === "multiple_choice_picture" ? (
                    <select
                      value={form.correctAnswer}
                      onChange={(e) =>
                        setForm({ ...form, correctAnswer: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="">-- Selecteer correct antwoord --</option>
                      {form.options
                        .filter((o) => o.trim() !== "")
                        .map((opt, i) => (
                          <option key={i} value={opt}>
                            {String.fromCharCode(65 + i)}. {opt}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={form.correctAnswer}
                      onChange={(e) =>
                        setForm({ ...form, correctAnswer: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
                      placeholder="Het correcte antwoord"
                    />
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveQuestion}
                  disabled={
                    saving ||
                    !form.questionText.trim() ||
                    // Validate based on type
                    (form.questionType === "estimation"
                      ? !form.correctAnswer.trim()
                      : form.questionType === "ranking"
                        ? form.rankingItems.filter((i) => i.trim()).length < 2
                        : form.questionType === "geo"
                          ? !form.geoLat || !form.geoLng
                          : form.questionType === "matching"
                            ? form.matchingPairs.filter(
                                (p) => p.left.trim() && p.right.trim(),
                              ).length < 2
                            : !form.correctAnswer.trim())
                  }
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                >
                  {saving
                    ? "Opslaan..."
                    : editingQuestionId
                      ? "Bijwerken"
                      : "Toevoegen"}
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Questions list */}
        {questions.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-gray-500">
              Nog geen vragen. Voeg je eerste vraag toe!
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {questions.map((q, index) => (
              <Card key={q._id} className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-navy-800">
                      {q.questionText}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          q.questionType === "multiple_choice"
                            ? "bg-blue-100 text-blue-700"
                            : q.questionType === "multiple_choice_picture"
                              ? "bg-indigo-100 text-indigo-700"
                              : q.questionType === "estimation"
                                ? "bg-orange-100 text-orange-700"
                                : q.questionType === "ranking"
                                  ? "bg-teal-100 text-teal-700"
                                  : q.questionType === "geo"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : q.questionType === "matching"
                                      ? "bg-violet-100 text-violet-700"
                                      : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {q.questionType === "multiple_choice"
                          ? "Meerkeuze"
                          : q.questionType === "multiple_choice_picture"
                            ? "🖼️ Meerkeuze foto"
                            : q.questionType === "estimation"
                              ? "📊 Schatting"
                              : q.questionType === "ranking"
                                ? "🔢 Rangschikken"
                                : q.questionType === "geo"
                                  ? "🗺️ Locatie"
                                  : q.questionType === "matching"
                                    ? "🔗 Koppelvraag"
                                    : "Open"}
                      </span>
                      <span>{q.points} punten</span>
                      <span>{q.timeLimitSeconds}s</span>
                    </div>
                    {(q.questionType === "multiple_choice" ||
                      q.questionType === "multiple_choice_picture") &&
                      q.options && (
                        <div className="mt-2 grid grid-cols-2 gap-1">
                          {q.options.map((opt, i) => (
                            <div
                              key={i}
                              className={`text-sm px-2 py-1 rounded flex items-center gap-2 ${
                                opt === q.correctAnswer
                                  ? "bg-green-100 text-green-700 font-medium"
                                  : "bg-gray-50 text-gray-600"
                              }`}
                            >
                              {q.questionType === "multiple_choice_picture" &&
                                q.optionImageUrls?.[i] && (
                                  <img
                                    src={q.optionImageUrls[i]}
                                    alt={opt}
                                    className="w-8 h-8 rounded object-cover"
                                  />
                                )}
                              {String.fromCharCode(65 + i)}. {opt}
                              {opt === q.correctAnswer && " ✓"}
                            </div>
                          ))}
                        </div>
                      )}
                    {q.questionType === "open" && (
                      <p className="mt-1 text-sm text-green-600">
                        Antwoord: {q.correctAnswer}
                      </p>
                    )}
                    {q.questionType === "estimation" && (
                      <p className="mt-1 text-sm text-orange-600">
                        Correct: {q.correctAnswer}
                        {q.estimationUnit && ` ${q.estimationUnit}`}
                      </p>
                    )}
                    {q.questionType === "ranking" && q.options && (
                      <div className="mt-1 text-sm text-teal-600">
                        Volgorde:{" "}
                        {q.options.map((item, i) => (
                          <span key={i}>
                            {i > 0 && " → "}
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                    {q.questionType === "geo" && (
                      <p className="mt-1 text-sm text-emerald-600">
                        📍 {q.correctAnswer}
                      </p>
                    )}
                    {q.questionType === "matching" && q.matchingPairs && (
                      <div className="mt-1 space-y-0.5">
                        {q.matchingPairs.map((pair, i) => (
                          <p key={i} className="text-sm text-violet-600">
                            {pair.left} → {pair.right}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditQuestion(q)}
                        className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
