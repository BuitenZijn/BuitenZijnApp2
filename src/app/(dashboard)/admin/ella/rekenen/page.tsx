"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useAuth } from "@/app/providers";
import { Id } from "../../../../../../convex/_generated/dataModel";

interface Difficulty {
  id: string;
  label: string;
  emoji: string;
  minNumber: number;
  maxNumber: number;
  addition: boolean;
  subtraction: boolean;
  multiplication: boolean;
  division: boolean;
  fractions: boolean;
  questionsPerRound: number;
  timeLimitSeconds: number;
  pointsPerCorrect: number;
  speedBonus: number;
  star1Threshold: number;
  star2Threshold: number;
  star3Threshold: number;
}

export default function AdminEllaRekenenPage() {
  const { user } = useAuth();

  // â”€â”€ Puzzle images â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const puzzleImages = useQuery(api.rekenen.getAllPuzzleImages);
  const generateUploadUrl = useMutation(api.rekenen.generateUploadUrl);
  const addPuzzleImage = useMutation(api.rekenen.addPuzzleImage);
  const toggleImage = useMutation(api.rekenen.togglePuzzleImage);
  const deleteImage = useMutation(api.rekenen.deletePuzzleImage);

  // â”€â”€ Game settings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const gameSettings = useQuery(api.rekenen.getGameSettings, {
    game: "multiplication_grid",
  });
  const updateSettings = useMutation(api.rekenen.updateGameSettings);

  // â”€â”€ Rekenoefeningen settings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const rekenoefSettings = useQuery(api.rekenoefeningen.getSettings);
  const updateRekenoefSettings = useMutation(
    api.rekenoefeningen.updateSettings,
  );

  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<{
    gridSize: number;
    blanksPerRound: number;
    bombChance: number;
  } | null>(null);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Rekenoefeningen form state
  const [rekenoefForm, setRekenoefForm] = useState<Difficulty[] | null>(null);
  const [rekenoefSaved, setRekenoefSaved] = useState(false);

  // Initialize settings form when data loads
  const currentSettings = settingsForm ?? gameSettings;

  if (!user?.roles?.includes("admin")) {
    return <div className="text-center py-12 text-gray-500">Geen toegang</div>;
  }

  // â”€â”€ Upload handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleUpload = async (files: FileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        // Get upload URL from Convex
        const uploadUrl = await generateUploadUrl();

        // Upload to Convex storage
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();

        // Register in database
        await addPuzzleImage({
          storageId,
          name: file.name,
        });
      }
    } catch (err: any) {
      alert(err.message || "Upload mislukt");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteImage({ id: id as Id<"ella_puzzle_images"> });
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message || "Verwijderen mislukt");
    }
  };

  const handleSettingsSave = async () => {
    if (!currentSettings) return;
    try {
      await updateSettings({
        game: "multiplication_grid",
        settings: {
          gridSize: currentSettings.gridSize,
          blanksPerRound: currentSettings.blanksPerRound,
          bombChance: currentSettings.bombChance,
        },
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch (err: any) {
      alert(err.message || "Opslaan mislukt");
    }
  };

  const activeCount = puzzleImages?.filter((img) => img.isActive).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          ðŸ”¢ ELLA â€“ Rekenen Beheer
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Beheer puzzelplaatjes en spelinstellingen voor de maaltafel puzzel
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="text-2xl font-bold text-purple-600">
            {puzzleImages?.length ?? 0}
          </div>
          <div className="text-sm text-gray-500">Totaal plaatjes</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          <div className="text-sm text-gray-500">Actief in het spel</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="text-2xl font-bold text-violet-600">
            {currentSettings?.gridSize ?? 10}Ã—{currentSettings?.gridSize ?? 10}
          </div>
          <div className="text-sm text-gray-500">Grid grootte</div>
        </div>
      </div>

      {/* Upload section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            ðŸ–¼ï¸ Puzzelplaatjes
          </h2>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              {uploading ? "Uploaden..." : "+ Plaatje uploaden"}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-4">
          Upload vierkante afbeeldingen (bijv. 1000Ã—1000 px) voor het beste
          resultaat. Het spel kiest willekeurig een actief plaatje.
        </p>

        {/* Images grid */}
        {puzzleImages === undefined ? (
          <div className="text-center py-8 text-gray-400">Laden...</div>
        ) : puzzleImages.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <span className="text-4xl block mb-2">ðŸ–¼ï¸</span>
            Nog geen puzzelplaatjes geÃ¼pload
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {puzzleImages.map((img) => (
              <div
                key={img._id}
                className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                  img.isActive
                    ? "border-green-400 shadow-md"
                    : "border-gray-200 opacity-60"
                }`}
              >
                {img.url ? (
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-300 text-3xl">
                    ðŸ–¼ï¸
                  </div>
                )}

                {/* Active badge */}
                <div
                  className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    img.isActive
                      ? "bg-green-500 text-white"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {img.isActive ? "Actief" : "Inactief"}
                </div>

                {/* Controls */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 flex items-end justify-between">
                  <button
                    onClick={() =>
                      toggleImage({
                        id: img._id as Id<"ella_puzzle_images">,
                        isActive: !img.isActive,
                      })
                    }
                    className="text-[10px] bg-white/90 text-gray-700 px-2 py-1 rounded-md font-medium hover:bg-white transition"
                  >
                    {img.isActive ? "Deactiveer" : "Activeer"}
                  </button>

                  {deleteConfirm === img._id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(img._id)}
                        className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-md font-medium"
                      >
                        Bevestig
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-[10px] bg-gray-400 text-white px-2 py-1 rounded-md font-medium"
                      >
                        âœ•
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(img._id)}
                      className="text-[10px] bg-red-500/80 text-white px-2 py-1 rounded-md font-medium hover:bg-red-600 transition"
                    >
                      ðŸ—‘ï¸
                    </button>
                  )}
                </div>

                {/* Name */}
                <div className="absolute top-2 right-2 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded max-w-[80%] truncate">
                  {img.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Game Settings */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          âš™ï¸ Spelinstellingen â€“ Maaltafel Puzzel
        </h2>

        {currentSettings ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Grid Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grid grootte
              </label>
              <input
                type="number"
                min={3}
                max={12}
                value={currentSettings.gridSize}
                onChange={(e) =>
                  setSettingsForm({
                    ...currentSettings,
                    gridSize: parseInt(e.target.value) || 10,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-300 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Bijv. 10 = maaltafels 1-10 (10Ã—10 rooster)
              </p>
            </div>

            {/* Blanks per round */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lege vakjes per ronde
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={currentSettings.blanksPerRound}
                onChange={(e) =>
                  setSettingsForm({
                    ...currentSettings,
                    blanksPerRound: parseInt(e.target.value) || 10,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-300 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Hoeveel vakjes moeten ingevuld worden per ronde
              </p>
            </div>

            {/* Bomb chance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bomkans (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={Math.round(currentSettings.bombChance * 100)}
                onChange={(e) =>
                  setSettingsForm({
                    ...currentSettings,
                    bombChance: (parseInt(e.target.value) || 0) / 100,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-300 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Kans dat omliggende vakjes ook onthuld worden (ðŸ’¥)
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400">Laden...</div>
        )}

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleSettingsSave}
            disabled={!settingsForm}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            Instellingen opslaan
          </button>
          {settingsSaved && (
            <span className="text-green-600 text-sm font-medium">
              âœ“ Opgeslagen!
            </span>
          )}
        </div>
      </div>

      {/* â”€â”€ Rekenoefeningen Settings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          âž• Rekenoefeningen â€“ Moeilijkheidsgraden
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Configureer de moeilijkheidsgraden voor rekenoefeningen (+, âˆ’, Ã—, Ã·,
          breuken). Kinderen kiezen een niveau voordat ze beginnen.
        </p>

        {(() => {
          const difficulties: Difficulty[] =
            rekenoefForm ?? rekenoefSettings?.difficulties ?? [];

          if (difficulties.length === 0) {
            return (
              <div className="text-center py-4 text-gray-400">Laden...</div>
            );
          }

          const updateDifficulty = (
            index: number,
            field: keyof Difficulty,
            value: any,
          ) => {
            const updated = difficulties.map((d, i) =>
              i === index ? { ...d, [field]: value } : d,
            );
            setRekenoefForm(updated);
          };

          const handleRekenoefSave = async () => {
            try {
              await updateRekenoefSettings({ difficulties });
              setRekenoefSaved(true);
              setTimeout(() => setRekenoefSaved(false), 2000);
            } catch (err: any) {
              alert(err.message || "Opslaan mislukt");
            }
          };

          return (
            <>
              <div className="space-y-6">
                {difficulties.map((diff, idx) => (
                  <div
                    key={diff.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">{diff.emoji}</span>
                      <h3 className="text-md font-semibold text-gray-800">
                        {diff.label}
                      </h3>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        {diff.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {/* Number range */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Min getal
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={diff.minNumber}
                          onChange={(e) =>
                            updateDifficulty(
                              idx,
                              "minNumber",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Max getal
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={diff.maxNumber}
                          onChange={(e) =>
                            updateDifficulty(
                              idx,
                              "maxNumber",
                              parseInt(e.target.value) || 10,
                            )
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                        />
                      </div>

                      {/* Questions per round */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Vragen per ronde
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={diff.questionsPerRound}
                          onChange={(e) =>
                            updateDifficulty(
                              idx,
                              "questionsPerRound",
                              parseInt(e.target.value) || 10,
                            )
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                        />
                      </div>

                      {/* Time limit */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Tijdslimiet (sec)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={120}
                          value={diff.timeLimitSeconds}
                          onChange={(e) =>
                            updateDifficulty(
                              idx,
                              "timeLimitSeconds",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                        />
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          0 = geen limiet
                        </p>
                      </div>
                    </div>

                    {/* Operations */}
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Bewerkingen
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {(
                          [
                            ["addition", "âž• Optellen"],
                            ["subtraction", "âž– Aftrekken"],
                            ["multiplication", "âœ–ï¸ Vermenigvuldigen"],
                            ["division", "âž— Delen"],
                            ["fractions", "Â½ Breuken"],
                          ] as const
                        ).map(([key, label]) => (
                          <label
                            key={key}
                            className="flex items-center gap-1.5 text-sm cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={diff[key as keyof Difficulty] as boolean}
                              onChange={(e) =>
                                updateDifficulty(idx, key, e.target.checked)
                              }
                              className="rounded border-gray-300 text-blue-500 focus:ring-blue-300"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Points & stars */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Punten/juist
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={diff.pointsPerCorrect}
                          onChange={(e) =>
                            updateDifficulty(
                              idx,
                              "pointsPerCorrect",
                              parseInt(e.target.value) || 10,
                            )
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Snelheidsbonus
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={diff.speedBonus}
                          onChange={(e) =>
                            updateDifficulty(
                              idx,
                              "speedBonus",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          â­ (% juist)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={diff.star1Threshold}
                          onChange={(e) =>
                            updateDifficulty(
                              idx,
                              "star1Threshold",
                              parseInt(e.target.value) || 50,
                            )
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          â­â­ (% juist)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={diff.star2Threshold}
                          onChange={(e) =>
                            updateDifficulty(
                              idx,
                              "star2Threshold",
                              parseInt(e.target.value) || 75,
                            )
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          â­â­â­ (% juist)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={diff.star3Threshold}
                          onChange={(e) =>
                            updateDifficulty(
                              idx,
                              "star3Threshold",
                              parseInt(e.target.value) || 90,
                            )
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleRekenoefSave}
                  disabled={!rekenoefForm}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                >
                  Rekenoefeningen opslaan
                </button>
                {rekenoefSaved && (
                  <span className="text-green-600 text-sm font-medium">
                    âœ“ Opgeslagen!
                  </span>
                )}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}

