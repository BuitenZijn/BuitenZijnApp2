"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuth } from "@/app/providers";
import { Card } from "@/components/ui";
import type { Id } from "../../../../../convex/_generated/dataModel";

type QuestionType = "multiple_choice" | "open";

interface QuestionForm {
  questionText: string;
  questionType: QuestionType;
  options: string[];
  correctAnswer: string;
  points: number;
  timeLimitSeconds: number;
}

const emptyQuestion: QuestionForm = {
  questionText: "",
  questionType: "multiple_choice",
  options: ["", "", "", ""],
  correctAnswer: "",
  points: 100,
  timeLimitSeconds: 30,
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

  const [editingQuiz, setEditingQuiz] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDesc, setQuizDesc] = useState("");
  const [quizActive, setQuizActive] = useState(false);

  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [form, setForm] = useState<QuestionForm>({ ...emptyQuestion });
  const [editingQuestionId, setEditingQuestionId] =
    useState<Id<"quiz_questions"> | null>(null);
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.roles?.includes("admin");

  // Initialize edit form when quiz loads
  const startEditQuiz = () => {
    if (quiz) {
      setQuizTitle(quiz.title);
      setQuizDesc(quiz.description || "");
      setQuizActive(quiz.isActive);
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
    });
    setEditingQuiz(false);
  };

  const startEditQuestion = (q: NonNullable<typeof questions>[number]) => {
    setForm({
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options || ["", "", "", ""],
      correctAnswer: q.correctAnswer,
      points: q.points,
      timeLimitSeconds: q.timeLimitSeconds,
    });
    setEditingQuestionId(q._id);
    setShowAddQuestion(true);
  };

  const handleSaveQuestion = async () => {
    setSaving(true);
    try {
      const data = {
        questionText: form.questionText,
        questionType: form.questionType,
        options:
          form.questionType === "multiple_choice"
            ? form.options.filter((o) => o.trim() !== "")
            : undefined,
        correctAnswer: form.correctAnswer,
        points: form.points,
        timeLimitSeconds: form.timeLimitSeconds,
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
                    onChange={(e) =>
                      setForm({
                        ...form,
                        questionType: e.target.value as QuestionType,
                      })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="multiple_choice">Meerkeuze</option>
                    <option value="open">Open vraag</option>
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

              {form.questionType === "multiple_choice" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Antwoordopties
                  </label>
                  <div className="space-y-2">
                    {form.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
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
                              setForm({ ...form, options: newOptions });
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {form.options.length < 6 && (
                      <button
                        onClick={() =>
                          setForm({ ...form, options: [...form.options, ""] })
                        }
                        className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                      >
                        + Optie toevoegen
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correct antwoord
                </label>
                {form.questionType === "multiple_choice" ? (
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

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveQuestion}
                  disabled={
                    saving ||
                    !form.questionText.trim() ||
                    !form.correctAnswer.trim()
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
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {q.questionType === "multiple_choice"
                          ? "Meerkeuze"
                          : "Open"}
                      </span>
                      <span>{q.points} punten</span>
                      <span>{q.timeLimitSeconds}s</span>
                    </div>
                    {q.questionType === "multiple_choice" && q.options && (
                      <div className="mt-2 grid grid-cols-2 gap-1">
                        {q.options.map((opt, i) => (
                          <div
                            key={i}
                            className={`text-sm px-2 py-1 rounded ${
                              opt === q.correctAnswer
                                ? "bg-green-100 text-green-700 font-medium"
                                : "bg-gray-50 text-gray-600"
                            }`}
                          >
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
