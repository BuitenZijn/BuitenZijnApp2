"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useAuth } from "@/app/providers";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import type { Id } from "../../../../../../convex/_generated/dataModel";

export default function AdminQuizzenPage() {
  const { user } = useAuth();
  const quizzes = useQuery(api.quizzes.listQuizzes);
  const createQuiz = useMutation(api.quizzes.createQuiz);
  const deleteQuiz = useMutation(api.quizzes.deleteQuiz);
  const updateQuiz = useMutation(api.quizzes.updateQuiz);
  const createSession = useMutation(api.quizzes.createSession);

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  if (!user?.roles?.includes("admin")) {
    return <div className="text-center py-12 text-gray-500">Geen toegang</div>;
  }

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await createQuiz({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        createdBy: user.id as Id<"users">,
      });
      setNewTitle("");
      setNewDescription("");
      setShowCreate(false);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: Id<"quizzes">) => {
    if (!confirm("Weet je zeker dat je deze quiz wilt verwijderen? Alle vragen worden ook verwijderd."))
      return;
    await deleteQuiz({ id });
  };

  const handleToggleActive = async (quiz: NonNullable<typeof quizzes>[number]) => {
    await updateQuiz({
      id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      isActive: !quiz.isActive,
    });
  };

  const handleStartSession = async (quizId: Id<"quizzes">) => {
    const sessionId = await createSession({
      quizId,
      createdBy: user.id as Id<"users">,
    });
    window.location.href = `/activiteiten/quizzen/live/${sessionId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎯 Buzz Quizzen</h1>
          <p className="text-gray-600">
            Beheer je quizzen, voeg vragen toe en start live sessies
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          + Nieuwe Quiz
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent>
            <h2 className="text-lg font-semibold mb-4 text-purple-800">
              Nieuwe Quiz Aanmaken
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titel
                </label>
                <input
                  type="text"
                  placeholder="Quiz titel"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschrijving (optioneel)
                </label>
                <textarea
                  placeholder="Beschrijving"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={creating || !newTitle.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                >
                  {creating ? "Aanmaken..." : "Aanmaken"}
                </button>
                <button
                  onClick={() => {
                    setShowCreate(false);
                    setNewTitle("");
                    setNewDescription("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz list */}
      {quizzes === undefined ? (
        <div className="text-center py-12 text-gray-500">Laden...</div>
      ) : quizzes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-gray-500 text-lg">
              Nog geen quizzen aangemaakt.
            </p>
            <p className="text-gray-400 mt-1">
              Klik op &quot;Nieuwe Quiz&quot; om te beginnen!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <Card key={quiz._id} hover>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-900 truncate">
                        {quiz.title}
                      </h2>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          quiz.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {quiz.isActive ? "Actief" : "Inactief"}
                      </span>
                    </div>
                    {quiz.description && (
                      <p className="text-gray-600 text-sm mt-1 truncate">
                        {quiz.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Aangemaakt op{" "}
                      {new Date(quiz.createdAt).toLocaleDateString("nl-BE")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => handleToggleActive(quiz)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        quiz.isActive
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                      title={quiz.isActive ? "Deactiveren" : "Activeren"}
                    >
                      {quiz.isActive ? "Deactiveren" : "Activeren"}
                    </button>
                    <Link
                      href={`/dashboard/admin/quizzen/${quiz._id}`}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium transition-colors"
                    >
                      Vragen bewerken
                    </Link>
                    <button
                      onClick={() => handleStartSession(quiz._id)}
                      className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium transition-colors"
                    >
                      ▶ Start Live
                    </button>
                    <button
                      onClick={() => handleDelete(quiz._id)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition-colors"
                    >
                      Verwijderen
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
