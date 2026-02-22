"use client";

import { useAuth } from "@/app/providers";
import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import {
  ArrowTopRightOnSquareIcon,
  PlayIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
  PencilSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// ==========================================
// TYPES
// ==========================================

type SortField =
  | "lesson_period"
  | "lesson_year"
  | "dance_name"
  | "song_artist"
  | "song_name";
type SortDirection = "asc" | "desc";

interface DanceFormData {
  lesson_period: string;
  lesson_year: number;
  dance_name: string;
  song_artist: string;
  song_name: string;
  video_url: string;
}

const emptyFormData: DanceFormData = {
  lesson_period: "Voorjaar",
  lesson_year: new Date().getFullYear(),
  dance_name: "",
  song_artist: "",
  song_name: "",
  video_url: "",
};

// ==========================================
// YOUTUBE HELPERS
// ==========================================

function extractYouTubeId(url: string): string | null {
  // Handle youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  // Handle youtube.com/watch?v=ID
  const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (longMatch) return longMatch[1];
  // Handle youtube.com/embed/ID
  const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  return null;
}

// ==========================================
// YOUTUBE OVERLAY
// ==========================================

function YouTubeOverlay({
  videoUrl,
  danceName,
  onClose,
}: {
  videoUrl: string;
  danceName: string;
  onClose: () => void;
}) {
  const videoId = extractYouTubeId(videoUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-lg font-semibold truncate pr-4">
            {danceName}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              <p>Ongeldige video URL</p>
            </div>
          )}
        </div>
        <div className="mt-3 text-center">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-gray-300 hover:text-white transition-colors"
          >
            Bekijk op YouTube
            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// EDIT MODAL
// ==========================================

function EditDanceModal({
  dance,
  onClose,
  onSave,
}: {
  dance: {
    _id: Id<"linedances_dances">;
    lesson_period?: string;
    lesson_year?: number;
    dance_name: string;
    song_artist?: string;
    song_name: string;
    video_url: string;
  };
  onClose: () => void;
  onSave: (data: DanceFormData & { id: Id<"linedances_dances"> }) => void;
}) {
  const [formData, setFormData] = useState<DanceFormData>({
    lesson_period: dance.lesson_period || "Voorjaar",
    lesson_year: dance.lesson_year || new Date().getFullYear(),
    dance_name: dance.dance_name,
    song_artist: dance.song_artist || "",
    song_name: dance.song_name,
    video_url: dance.video_url,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: dance._id });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-navy-800">Dans bewerken</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Periode
              </label>
              <select
                value={formData.lesson_period}
                onChange={(e) =>
                  setFormData({ ...formData, lesson_period: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-navy-400 focus:border-transparent"
              >
                <option value="Voorjaar">Voorjaar</option>
                <option value="Najaar">Najaar</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Jaar
              </label>
              <input
                type="number"
                value={formData.lesson_year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lesson_year: parseInt(e.target.value),
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-navy-400 focus:border-transparent"
                required
              />
            </div>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Dansnaam
            </label>
            <input
              type="text"
              value={formData.dance_name}
              onChange={(e) =>
                setFormData({ ...formData, dance_name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-navy-400 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Artiest
            </label>
            <input
              type="text"
              value={formData.song_artist}
              onChange={(e) =>
                setFormData({ ...formData, song_artist: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-navy-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Liedje
            </label>
            <input
              type="text"
              value={formData.song_name}
              onChange={(e) =>
                setFormData({ ...formData, song_name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-navy-400 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              YouTube demo URL
            </label>
            <input
              type="url"
              value={formData.video_url}
              onChange={(e) =>
                setFormData({ ...formData, video_url: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-navy-400 focus:border-transparent"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-navy-700 text-white px-4 py-2.5 rounded-lg hover:bg-navy-800 font-medium transition-colors"
            >
              Opslaan
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Annuleren
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// SORT HEADER COMPONENT
// ==========================================

function SortableHeader({
  label,
  field,
  currentSort,
  currentDirection,
  onSort,
}: {
  label: string;
  field: SortField;
  currentSort: SortField;
  currentDirection: SortDirection;
  onSort: (field: SortField) => void;
}) {
  const isActive = currentSort === field;

  return (
    <th
      className="py-3 px-4 text-left cursor-pointer select-none hover:bg-beige-300/50 transition-colors"
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive ? (
          currentDirection === "asc" ? (
            <ChevronUpIcon className="w-4 h-4 text-navy-700" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-navy-700" />
          )
        ) : (
          <ChevronUpDownIcon className="w-4 h-4 text-gray-400" />
        )}
      </span>
    </th>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

export default function LijndansenBeheerPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<DanceFormData>({ ...emptyFormData });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("dance_name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [videoOverlay, setVideoOverlay] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [editingDance, setEditingDance] = useState<{
    _id: Id<"linedances_dances">;
    lesson_period?: string;
    lesson_year?: number;
    dance_name: string;
    song_artist?: string;
    song_name: string;
    video_url: string;
  } | null>(null);

  const dances = useQuery(api.lijndances.getAllDances) || [];
  const addDance = useMutation(api.lijndances.addDance);
  const updateDance = useMutation(api.lijndances.updateDance);

  const isAdmin = user?.roles?.includes("admin") ?? false;

  // Sort handler
  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField],
  );

  // Filtered + sorted dances
  const filteredDances = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let result = dances;

    if (q) {
      result = result.filter(
        (d) =>
          d.dance_name.toLowerCase().includes(q) ||
          (d.song_artist && d.song_artist.toLowerCase().includes(q)) ||
          d.song_name.toLowerCase().includes(q) ||
          (d.lesson_period && d.lesson_period.toLowerCase().includes(q)) ||
          String(d.lesson_year).includes(q),
      );
    }

    return [...result].sort((a, b) => {
      const aVal = String(a[sortField] ?? "").toLowerCase();
      const bVal = String(b[sortField] ?? "").toLowerCase();
      const cmp = aVal.localeCompare(bVal, "nl");
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [dances, searchQuery, sortField, sortDirection]);

  // Wait for auth to load before checking access
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Laden...</p>
      </div>
    );
  }

  // Only allow access for lijndans or admin role
  if (
    !isAuthenticated ||
    !(user?.roles?.includes("admin") || user?.roles?.includes("lijndans"))
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Toegang geweigerd</h2>
          <p>Je hebt geen rechten om deze pagina te bekijken.</p>
          <Link href="/" className="mt-4 inline-block text-green-600 underline">
            Terug naar home
          </Link>
        </div>
      </div>
    );
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDance({
        lesson_period: formData.lesson_period,
        lesson_year: formData.lesson_year,
        dance_name: formData.dance_name,
        song_artist: formData.song_artist || undefined,
        song_name: formData.song_name,
        video_url: formData.video_url,
      });
      setFormData({ ...emptyFormData });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding dance:", error);
    }
  };

  const handleEditSave = async (
    data: DanceFormData & { id: Id<"linedances_dances"> },
  ) => {
    try {
      await updateDance({
        id: data.id,
        lesson_period: data.lesson_period,
        lesson_year: data.lesson_year,
        dance_name: data.dance_name,
        song_artist: data.song_artist || undefined,
        song_name: data.song_name,
        video_url: data.video_url,
      });
      setEditingDance(null);
    } catch (error) {
      console.error("Error updating dance:", error);
    }
  };

  return (
    <div className="min-h-screen bg-beige-100 py-12">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-navy-800">
          Lijndansen - Dances
        </h1>

        {/* Spotify embed */}
        <div className="mb-8">
          <iframe
            src="https://open.spotify.com/embed/playlist/1Is82VwEXe8Q0DSsoHpsVE?utm_source=generator&theme=0"
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
          ></iframe>
        </div>

        {/* Admin add form */}
        {isAdmin && (
          <div className="mb-8">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-lg mb-4 hover:bg-green-700 font-medium transition-colors"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? "Sluit formulier" : "+ Voeg nieuwe dans toe"}
            </button>

            {showAddForm && (
              <form
                onSubmit={handleAddSubmit}
                className="bg-beige-50 p-5 rounded-xl shadow border border-beige-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Periode
                    </label>
                    <select
                      value={formData.lesson_period}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lesson_period: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-navy-400 focus:border-transparent"
                      required
                    >
                      <option value="Voorjaar">Voorjaar</option>
                      <option value="Najaar">Najaar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Jaar
                    </label>
                    <input
                      type="number"
                      value={formData.lesson_year}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lesson_year: parseInt(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-navy-400 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Dansnaam
                    </label>
                    <input
                      type="text"
                      value={formData.dance_name}
                      onChange={(e) =>
                        setFormData({ ...formData, dance_name: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-navy-400 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Artiest
                    </label>
                    <input
                      type="text"
                      value={formData.song_artist}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          song_artist: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-navy-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Liedje
                    </label>
                    <input
                      type="text"
                      value={formData.song_name}
                      onChange={(e) =>
                        setFormData({ ...formData, song_name: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-navy-400 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      YouTube demo URL
                    </label>
                    <input
                      type="url"
                      value={formData.video_url}
                      onChange={(e) =>
                        setFormData({ ...formData, video_url: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-navy-400 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="submit"
                    className="bg-navy-700 text-white px-5 py-2 rounded-lg hover:bg-navy-800 font-medium transition-colors"
                  >
                    Opslaan
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Search bar + count */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zoek op dansnaam, artiest, liedje, periode of jaar..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-400 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 whitespace-nowrap">
            {filteredDances.length} van {dances.length} dansen
          </p>
        </div>

        {/* Dances table */}
        <div className="mb-8">
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full">
              <thead className="bg-beige-200 text-sm font-semibold text-navy-800">
                <tr>
                  <SortableHeader
                    label="Periode"
                    field="lesson_period"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Jaar"
                    field="lesson_year"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Dansnaam"
                    field="dance_name"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Artiest"
                    field="song_artist"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Liedje"
                    field="song_name"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <th className="py-3 px-4 text-left">Demo</th>
                  {isAdmin && <th className="py-3 px-4 text-left">Acties</th>}
                </tr>
              </thead>
              <tbody>
                {filteredDances.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isAdmin ? 7 : 6}
                      className="py-8 text-center text-gray-500"
                    >
                      {searchQuery
                        ? "Geen dansen gevonden voor deze zoekopdracht."
                        : "Nog geen dansen toegevoegd."}
                    </td>
                  </tr>
                ) : (
                  filteredDances.map((dance) => (
                    <tr
                      key={dance._id}
                      className="border-t border-gray-100 hover:bg-beige-50/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm">
                        {dance.lesson_period}
                      </td>
                      <td className="py-3 px-4 text-sm">{dance.lesson_year}</td>
                      <td className="py-3 px-4 font-medium text-navy-800">
                        {dance.dance_name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {dance.song_artist || "-"}
                      </td>
                      <td className="py-3 px-4 text-sm">{dance.song_name}</td>
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() =>
                              setVideoOverlay({
                                url: dance.video_url,
                                name: dance.dance_name,
                              })
                            }
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Bekijk demo video"
                          >
                            <PlayIcon className="w-5 h-5" />
                          </button>
                          <a
                            href={dance.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Open op YouTube"
                          >
                            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setEditingDance(dance)}
                            className="text-navy-600 hover:text-navy-800 transition-colors"
                            title="Bewerk dans"
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* YouTube overlay */}
      {videoOverlay && (
        <YouTubeOverlay
          videoUrl={videoOverlay.url}
          danceName={videoOverlay.name}
          onClose={() => setVideoOverlay(null)}
        />
      )}

      {/* Edit modal */}
      {editingDance && (
        <EditDanceModal
          dance={editingDance}
          onClose={() => setEditingDance(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}
