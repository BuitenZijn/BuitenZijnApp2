"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useAuth } from "@/app/providers";
import { Id } from "../../../../../../convex/_generated/dataModel";

type Categorie =
  | "tekenen"
  | "vouwen"
  | "schilderen"
  | "verven"
  | "slijm maken"
  | "boetseren"
  | "stempelen";

const CATEGORIES: { value: Categorie; label: string; emoji: string }[] = [
  { value: "tekenen", label: "Tekenen", emoji: "✏️" },
  { value: "vouwen", label: "Vouwen", emoji: "🦢" },
  { value: "schilderen", label: "Schilderen", emoji: "🎨" },
  { value: "verven", label: "Verven", emoji: "🖌️" },
  { value: "slijm maken", label: "Slijm Maken", emoji: "🧪" },
  { value: "boetseren", label: "Boetseren", emoji: "🏺" },
  { value: "stempelen", label: "Stempelen", emoji: "⭐" },
];

const EMPTY_FORM = {
  categorie: "tekenen" as Categorie,
  titel: "",
  youtube_url: "",
  beschrijving: "",
};

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

export default function AdminEllaPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const allVideos = useQuery(api.knutselen.getAll);
  const categoryCounts = useQuery(api.knutselen.getCategoryCounts);

  const addVideo = useMutation(api.knutselen.add);
  const updateVideo = useMutation(api.knutselen.update);
  const removeVideo = useMutation(api.knutselen.remove);

  if (!user?.roles?.includes("admin")) {
    return <div className="text-center py-12 text-gray-500">Geen toegang</div>;
  }

  const filteredVideos =
    filterCat === "all"
      ? allVideos
      : allVideos?.filter((v) => v.categorie === filterCat);

  const handleSubmit = async () => {
    if (!form.titel.trim() || !form.youtube_url.trim()) return;

    try {
      if (editId) {
        await updateVideo({
          id: editId as Id<"ella_knutselen">,
          categorie: form.categorie,
          titel: form.titel.trim(),
          youtube_url: form.youtube_url.trim(),
          beschrijving: form.beschrijving.trim() || undefined,
        });
      } else {
        await addVideo({
          categorie: form.categorie,
          titel: form.titel.trim(),
          youtube_url: form.youtube_url.trim(),
          beschrijving: form.beschrijving.trim() || undefined,
        });
      }
      resetForm();
    } catch (err: any) {
      alert(err.message || "Er ging iets mis");
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
  };

  const startEdit = (video: any) => {
    setForm({
      categorie: video.categorie,
      titel: video.titel,
      youtube_url: video.youtube_url,
      beschrijving: video.beschrijving || "",
    });
    setEditId(video._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await removeVideo({ id: id as Id<"ella_knutselen"> });
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message || "Er ging iets mis");
    }
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("nl-BE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            🎀 ELLA – Knutselen Beheer
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Beheer de YouTube knutselfilmpjes per categorie
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium text-sm"
        >
          + Filmpje toevoegen
        </button>
      </div>

      {/* Category overview */}
      {categoryCounts && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.value] ?? 0;
            return (
              <button
                key={cat.value}
                onClick={() =>
                  setFilterCat(filterCat === cat.value ? "all" : cat.value)
                }
                className={`p-3 rounded-xl text-center transition-all ${
                  filterCat === cat.value
                    ? "bg-pink-100 border-2 border-pink-400 shadow"
                    : "bg-white border border-gray-200 hover:border-pink-300"
                }`}
              >
                <span className="text-2xl block">{cat.emoji}</span>
                <span className="text-xs font-medium text-gray-600 block mt-1">
                  {cat.label}
                </span>
                <span className="text-xs text-gray-400">{count} video's</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-pink-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {editId ? "Filmpje bewerken" : "Nieuw filmpje toevoegen"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categorie *
              </label>
              <select
                value={form.categorie}
                onChange={(e) =>
                  setForm({ ...form, categorie: e.target.value as Categorie })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Titel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titel *
              </label>
              <input
                type="text"
                value={form.titel}
                onChange={(e) => setForm({ ...form, titel: e.target.value })}
                placeholder="Naam van het filmpje"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none"
              />
            </div>

            {/* YouTube URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YouTube URL *
              </label>
              <input
                type="text"
                value={form.youtube_url}
                onChange={(e) =>
                  setForm({ ...form, youtube_url: e.target.value })
                }
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none"
              />
              {form.youtube_url && getYouTubeId(form.youtube_url) && (
                <div className="mt-2">
                  <img
                    src={`https://img.youtube.com/vi/${getYouTubeId(form.youtube_url)}/mqdefault.jpg`}
                    alt="Preview"
                    className="w-40 rounded-lg shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Beschrijving */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschrijving
              </label>
              <textarea
                value={form.beschrijving}
                onChange={(e) =>
                  setForm({ ...form, beschrijving: e.target.value })
                }
                placeholder="Optionele beschrijving"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              disabled={!form.titel.trim() || !form.youtube_url.trim()}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              {editId ? "Opslaan" : "Toevoegen"}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      {/* Videos Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">
            Filmpjes{" "}
            <span className="text-gray-400 font-normal">
              ({filteredVideos?.length ?? 0})
            </span>
          </h2>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none"
          >
            <option value="all">Alle categorieën</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.emoji} {cat.label}
              </option>
            ))}
          </select>
        </div>

        {filteredVideos === undefined ? (
          <div className="p-8 text-center text-gray-400">Laden...</div>
        ) : filteredVideos.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <span className="text-4xl block mb-2">🎬</span>
            Geen filmpjes gevonden
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Video</th>
                  <th className="px-6 py-3">Categorie</th>
                  <th className="px-6 py-3">Titel</th>
                  <th className="px-6 py-3">Datum</th>
                  <th className="px-6 py-3 text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVideos.map((video) => {
                  const ytId = getYouTubeId(video.youtube_url);
                  const catInfo = CATEGORIES.find(
                    (c) => c.value === video.categorie,
                  );
                  return (
                    <tr key={video._id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        {ytId ? (
                          <img
                            src={`https://img.youtube.com/vi/${ytId}/default.jpg`}
                            alt=""
                            className="w-20 rounded shadow-sm"
                          />
                        ) : (
                          <span className="text-gray-300">🎥</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium">
                          {catInfo?.emoji} {catInfo?.label}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <a
                          href={video.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-800 hover:text-pink-600 font-medium"
                        >
                          {video.titel}
                        </a>
                        {video.beschrijving && (
                          <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">
                            {video.beschrijving}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-3 text-gray-400 text-xs">
                        {formatDate(video.createdAt)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(video)}
                            className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                          >
                            Bewerken
                          </button>
                          {deleteConfirm === video._id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(video._id)}
                                className="text-red-600 hover:text-red-800 text-xs font-medium"
                              >
                                Bevestig
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-gray-400 hover:text-gray-600 text-xs"
                              >
                                Annuleer
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(video._id)}
                              className="text-red-400 hover:text-red-600 text-xs font-medium"
                            >
                              Verwijder
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
