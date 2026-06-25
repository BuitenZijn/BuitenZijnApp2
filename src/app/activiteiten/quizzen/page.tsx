"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/app/providers";
import { Card } from "@/components/ui";
import type { Id } from "../../../../convex/_generated/dataModel";

export default function QuizzenPage() {
  const { user, sessionToken } = useAuth();
  const quizzes = useQuery(api.quizzes.listQuizzes);
  const createQuiz = useMutation(api.quizzes.createQuiz);
  const deleteQuiz = useMutation(api.quizzes.deleteQuiz);
  const createSession = useMutation(api.quizzes.createSession);

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const isAdmin = user?.roles?.includes("admin");

  const handleCreate = async () => {
    if (!newTitle.trim() || !user) return;
    setCreating(true);
    try {
      await createQuiz({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        createdBy: user.id as Id<"users">,
        sessionToken: sessionToken!,
      });
      setNewTitle("");
      setNewDescription("");
      setShowCreate(false);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: Id<"quizzes">) => {
    if (!confirm("Weet je zeker dat je deze quiz wilt verwijderen?")) return;
    await deleteQuiz({ id, sessionToken: sessionToken! });
  };

  const handleStartSession = async (quizId: Id<"quizzes">) => {
    if (!user) return;
    const sessionId = await createSession({
      quizId,
      createdBy: user.id as Id<"users">,
      sessionToken: sessionToken!,
    });
    window.location.href = `/activiteiten/quizzen/live/${sessionId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-100 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy-800 flex items-center gap-3">
              <span className="text-4xl">🎯</span> Buzz Quizzen
            </h1>
            <p className="text-gray-600 mt-1">
              Maak quizzen en speel ze live met vrienden!
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              + Nieuwe Quiz
            </button>
          )}
        </div>

        {/* Create form */}
        {showCreate && isAdmin && (
          <Card className="mb-8 border-purple-200 bg-purple-50">
            <h2 className="text-lg font-semibold mb-4 text-purple-800">
              Nieuwe Quiz Aanmaken
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Quiz titel"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />
              <textarea
                placeholder="Beschrijving (optioneel)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={creating || !newTitle.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                >
                  {creating ? "Aanmaken..." : "Aanmaken"}
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Quiz list */}
        {quizzes === undefined ? (
          <div className="text-center py-12 text-gray-500">Laden...</div>
        ) : quizzes.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Nog geen quizzen aangemaakt.
            </p>
            {isAdmin && (
              <p className="text-gray-400 mt-2">
                Klik op &quot;Nieuwe Quiz&quot; om te beginnen!
              </p>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <Card
                key={quiz._id}
                hover
                className="flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-navy-800">
                      {quiz.title}
                    </h2>
                    {quiz.isActive && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Actief
                      </span>
                    )}
                  </div>
                  {quiz.description && (
                    <p className="text-gray-600 mt-1">{quiz.description}</p>
                  )}
                  <p className="text-sm text-gray-400 mt-1">
                    Aangemaakt op{" "}
                    {new Date(quiz.createdAt).toLocaleDateString("nl-BE")}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {isAdmin && (
                    <>
                      <Link
                        href={`/activiteiten/quizzen/${quiz._id}`}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium transition-colors"
                      >
                        Bewerken
                      </Link>
                      <button
                        onClick={() => handleStartSession(quiz._id)}
                        className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium transition-colors"
                      >
                        ▶ Start Live
                      </button>
                      <button
                        onClick={() => handleDelete(quiz._id)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition-colors"
                      >
                        Verwijderen
                      </button>
                    </>
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
