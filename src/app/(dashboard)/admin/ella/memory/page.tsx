"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useAuth } from "@/app/providers";
import type { Id } from "../../../../../../convex/_generated/dataModel";

const EMOJI_PICKER_SUGGESTIONS = [
  "ðŸ¶",
  "ðŸ±",
  "ðŸ­",
  "ðŸ¹",
  "ðŸ°",
  "ðŸ¦Š",
  "ðŸ»",
  "ðŸ¼",
  "ðŸ¨",
  "ðŸ¯",
  "ðŸ¦",
  "ðŸ®",
  "ðŸ·",
  "ðŸ¸",
  "ðŸµ",
  "ðŸ”",
  "ðŸ§",
  "ðŸ¦",
  "ðŸ¦†",
  "ðŸ¦…",
  "ðŸ¦‰",
  "ðŸ´",
  "ðŸ¦„",
  "ðŸ",
  "ðŸ›",
  "ðŸ¦‹",
  "ðŸŒ",
  "ðŸž",
  "ðŸ™",
  "ðŸ ",
  "ðŸ¬",
  "ðŸ³",
  "ðŸŽ",
  "ðŸ",
  "ðŸŠ",
  "ðŸ‹",
  "ðŸŒ",
  "ðŸ‰",
  "ðŸ‡",
  "ðŸ“",
  "ðŸ«",
  "ðŸ’",
  "ðŸ‘",
  "ðŸ¥­",
  "ðŸ",
  "ðŸ¥",
  "ðŸ…",
  "ðŸ¥‘",
  "ðŸ¥•",
  "ðŸŒ½",
  "ðŸ¥¦",
  "ðŸ§",
  "ðŸ©",
  "ðŸª",
  "ðŸŽ‚",
  "ðŸ«",
  "ðŸ¬",
  "ðŸ­",
  "ðŸ•",
  "ðŸ”",
  "âš½",
  "ðŸ€",
  "ðŸˆ",
  "âš¾",
  "ðŸŽ¾",
  "ðŸ",
  "ðŸ“",
  "ðŸ¸",
  "ðŸ¥Š",
  "ðŸŽ¯",
  "ðŸ„",
  "ðŸš´",
  "ðŸŒ¸",
  "ðŸŒº",
  "ðŸŒ»",
  "ðŸŒ¹",
  "ðŸŒ·",
  "ðŸŒµ",
  "ðŸŽ„",
  "ðŸŒ²",
  "ðŸŒ³",
  "ðŸ€",
  "ðŸ",
  "ðŸ‚",
  "â˜€ï¸",
  "ðŸŒˆ",
  "â­",
  "ðŸŒ™",
  "â„ï¸",
  "ðŸ”¥",
  "ðŸ’§",
  "ðŸŒŠ",
  "ðŸš—",
  "ðŸš•",
  "ðŸš™",
  "ðŸšŒ",
  "ðŸŽï¸",
  "ðŸš“",
  "ðŸš‘",
  "ðŸš’",
  "ðŸšœ",
  "ðŸï¸",
  "ðŸš²",
  "ðŸš‚",
  "âœˆï¸",
  "ðŸš€",
  "ðŸ›¸",
  "â›µ",
];

export default function AdminMemoryPage() {
  const { user } = useAuth();
  const themes = useQuery(api.memoryGame.getAllThemes);
  const addTheme = useMutation(api.memoryGame.addTheme);
  const updateTheme = useMutation(api.memoryGame.updateTheme);
  const deleteTheme = useMutation(api.memoryGame.deleteTheme);
  const seedThemes = useMutation(api.memoryGame.seedThemes);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmoji, setFormEmoji] = useState("");
  const [formEmojis, setFormEmojis] = useState<string[]>([]);
  const [emojiInput, setEmojiInput] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null);

  if (!user?.roles?.includes("admin")) {
    return <div className="text-center py-12 text-gray-500">Geen toegang</div>;
  }

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormName("");
    setFormEmoji("");
    setFormEmojis([]);
    setEmojiInput("");
  };

  const startEdit = (theme: NonNullable<typeof themes>[number]) => {
    setEditingId(theme._id);
    setFormName(theme.name);
    setFormEmoji(theme.emoji);
    setFormEmojis([...theme.emojis]);
    setShowForm(true);
  };

  const handleAddEmoji = () => {
    const trimmed = emojiInput.trim();
    if (trimmed && !formEmojis.includes(trimmed)) {
      setFormEmojis([...formEmojis, trimmed]);
    }
    setEmojiInput("");
  };

  const handleRemoveEmoji = (emoji: string) => {
    setFormEmojis(formEmojis.filter((e) => e !== emoji));
  };

  const handleSubmit = async () => {
    if (!formName.trim() || !formEmoji.trim() || formEmojis.length < 3) return;

    try {
      if (editingId) {
        await updateTheme({
          id: editingId as Id<"ella_memory_themes">,
          name: formName.trim(),
          emoji: formEmoji.trim(),
          emojis: formEmojis,
        });
      } else {
        await addTheme({
          name: formName.trim(),
          emoji: formEmoji.trim(),
          emojis: formEmojis,
        });
      }
      resetForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Er ging iets mis";
      alert(message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTheme({ id: id as Id<"ella_memory_themes"> });
      setDeleteConfirm(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Verwijderen mislukt";
      alert(message);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    await updateTheme({
      id: id as Id<"ella_memory_themes">,
      isActive: !currentActive,
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            ðŸ§  Memory Thema&apos;s
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Beheer de thema&apos;s en emoji&apos;s voor het Memory spel
          </p>
        </div>
        <div className="flex gap-2">
          {themes?.length === 0 && (
            <button
              onClick={() => seedThemes({})}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors"
            >
              ðŸŒ± Standaard thema&apos;s laden
            </button>
          )}
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-fuchsia-500 text-white rounded-lg text-sm hover:bg-fuchsia-600 transition-colors"
          >
            + Nieuw thema
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-md border p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">
            {editingId ? "Thema bewerken" : "Nieuw thema"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Naam
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="bv. Dieren"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thema-icoon (emoji)
              </label>
              <input
                type="text"
                value={formEmoji}
                onChange={(e) => setFormEmoji(e.target.value)}
                placeholder="bv. ðŸ¾"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300"
              />
            </div>
          </div>

          {/* Emoji list */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emoji&apos;s ({formEmojis.length}) â€” minimaal 3 nodig
            </label>
            <div className="flex flex-wrap gap-2 mb-3 min-h-[2.5rem] bg-gray-50 rounded-lg p-3 border">
              {formEmojis.map((emoji, idx) => (
                <button
                  key={`${emoji}-${idx}`}
                  onClick={() => handleRemoveEmoji(emoji)}
                  className="text-2xl hover:bg-red-100 rounded-lg px-1 transition-colors"
                  title="Klik om te verwijderen"
                >
                  {emoji}
                </button>
              ))}
              {formEmojis.length === 0 && (
                <span className="text-gray-400 text-sm">
                  Voeg emoji&apos;s toe...
                </span>
              )}
            </div>

            {/* Add emoji input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={emojiInput}
                onChange={(e) => setEmojiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddEmoji();
                  }
                }}
                placeholder="Type een emoji en druk Enter"
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-fuchsia-300 focus:border-fuchsia-300"
              />
              <button
                onClick={handleAddEmoji}
                className="px-4 py-2 bg-fuchsia-100 text-fuchsia-700 rounded-lg hover:bg-fuchsia-200 text-sm font-medium"
              >
                Toevoegen
              </button>
            </div>

            {/* Quick add from suggestions */}
            <div>
              <p className="text-xs text-gray-400 mb-2">
                Klik om snel toe te voegen:
              </p>
              <div className="flex flex-wrap gap-1">
                {EMOJI_PICKER_SUGGESTIONS.filter((e) => !formEmojis.includes(e))
                  .slice(0, 60)
                  .map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setFormEmojis([...formEmojis, emoji])}
                      className="text-xl hover:bg-fuchsia-100 rounded p-0.5 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={resetForm}
              className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Annuleren
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                !formName.trim() || !formEmoji.trim() || formEmojis.length < 3
              }
              className="px-6 py-2 bg-fuchsia-500 text-white rounded-lg hover:bg-fuchsia-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {editingId ? "Opslaan" : "Toevoegen"}
            </button>
          </div>
        </div>
      )}

      {/* Themes list */}
      {!themes ? (
        <div className="text-center py-12 text-gray-400 animate-pulse">
          Laden...
        </div>
      ) : themes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">ðŸŽ¨</div>
          <p className="text-gray-500">Nog geen thema&apos;s.</p>
          <p className="text-gray-400 text-sm">
            Klik op &quot;Standaard thema&apos;s laden&quot; om te beginnen.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {themes.map((theme) => (
            <div
              key={theme._id}
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${
                !theme.isActive ? "opacity-60" : ""
              }`}
            >
              {/* Theme header */}
              <div className="flex items-center justify-between p-4">
                <button
                  onClick={() =>
                    setExpandedTheme(
                      expandedTheme === theme._id ? null : theme._id,
                    )
                  }
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <span className="text-3xl">{theme.emoji}</span>
                  <div>
                    <h3 className="font-bold text-gray-800">{theme.name}</h3>
                    <p className="text-xs text-gray-400">
                      {theme.emojis.length} emoji&apos;s
                      {!theme.isActive && (
                        <span className="ml-2 text-red-400">
                          (uitgeschakeld)
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="ml-auto text-gray-300 text-sm">
                    {expandedTheme === theme._id ? "â–²" : "â–¼"}
                  </span>
                </button>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() =>
                      handleToggleActive(theme._id, theme.isActive)
                    }
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      theme.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {theme.isActive ? "Actief" : "Inactief"}
                  </button>
                  <button
                    onClick={() => startEdit(theme)}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100"
                  >
                    âœï¸ Bewerken
                  </button>
                  {deleteConfirm === theme._id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(theme._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs"
                      >
                        Bevestig
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs"
                      >
                        Annuleer
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(theme._id)}
                      className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-xs hover:bg-red-100"
                    >
                      ðŸ—‘ï¸
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded emoji overview */}
              {expandedTheme === theme._id && (
                <div className="border-t px-4 py-4 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-2">
                    Emoji overzicht ({theme.emojis.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {theme.emojis.map((emoji, idx) => (
                      <span
                        key={`${emoji}-${idx}`}
                        className="text-2xl bg-white rounded-lg p-1.5 shadow-sm border"
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

