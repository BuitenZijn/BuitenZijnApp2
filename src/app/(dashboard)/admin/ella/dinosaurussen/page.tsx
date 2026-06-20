"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useAuth } from "@/app/providers";
import { Id } from "../../../../../../convex/_generated/dataModel";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("nl-BE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDinosaursPage() {
  const { user } = useAuth();
  const dinosaurs = useQuery(api.dinosaurs.getAll);
  const generateUploadUrl = useMutation(api.dinosaurs.generateUploadUrl);
  const setImage = useMutation(api.dinosaurs.setImage);
  const removeImage = useMutation(api.dinosaurs.removeImage);
  const updateDino = useMutation(api.dinosaurs.update);

  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    nederlandseNaam: "",
    wetenschappelijkeNaam: "",
    korteBeschrijving: "",
    leukWeetje: "",
  });
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);

  if (!user?.roles?.includes("admin")) {
    return <div className="text-center py-12 text-gray-500">Geen toegang</div>;
  }

  const startEdit = (dino: any) => {
    setEditId(dino._id);
    setEditForm({
      nederlandseNaam: dino.nederlandseNaam,
      wetenschappelijkeNaam: dino.wetenschappelijkeNaam,
      korteBeschrijving: dino.korteBeschrijving,
      leukWeetje: dino.leukWeetje,
    });
  };

  const saveEdit = async () => {
    if (!editId) return;
    try {
      await updateDino({
        id: editId as Id<"ella_dinosaurs">,
        nederlandseNaam: editForm.nederlandseNaam,
        wetenschappelijkeNaam: editForm.wetenschappelijkeNaam,
        korteBeschrijving: editForm.korteBeschrijving,
        leukWeetje: editForm.leukWeetje,
      });
      setEditId(null);
    } catch (err: any) {
      alert(err.message || "Er ging iets mis");
    }
  };

  const handleUpload = async (file: File) => {
    if (!uploadTargetId) return;
    setUploadingId(uploadTargetId);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await res.json();
      await setImage({
        id: uploadTargetId as Id<"ella_dinosaurs">,
        storageId,
      });
    } catch (err: any) {
      alert(err.message || "Upload mislukt");
    } finally {
      setUploadingId(null);
      setUploadTargetId(null);
    }
  };

  const handleRemoveImage = async (id: string) => {
    if (!confirm("Afbeelding verwijderen?")) return;
    try {
      await removeImage({ id: id as Id<"ella_dinosaurs"> });
    } catch (err: any) {
      alert(err.message || "Er ging iets mis");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          ðŸ¦• ELLA â€“ Dinosaurussen Beheer
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Bekijk, bewerk en upload foto&apos;s voor de {dinosaurs?.length ?? 0}{" "}
          dinosaurussen
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = "";
        }}
      />

      {/* Grid */}
      {dinosaurs === undefined ? (
        <div className="text-center py-12 text-gray-400">Laden...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {dinosaurs.map((dino) => {
            const isExpanded = expandedId === dino._id;
            const isEditing = editId === dino._id;
            const isUploading = uploadingId === dino._id;

            return (
              <div
                key={dino._id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image area */}
                <div className="relative h-48 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                  {dino.imageUrl ? (
                    <>
                      <img
                        src={dino.imageUrl}
                        alt={dino.nederlandseNaam}
                        className="w-full h-full object-cover"
                      />
                      {/* Remove image button */}
                      <button
                        onClick={() => handleRemoveImage(dino._id)}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow"
                        title="Verwijder afbeelding"
                      >
                        âœ•
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <span className="text-5xl block mb-2">ðŸ¦•</span>
                      <span className="text-emerald-400 text-xs">
                        Nog geen foto
                      </span>
                    </div>
                  )}

                  {/* Upload overlay button */}
                  <button
                    onClick={() => {
                      setUploadTargetId(dino._id);
                      fileInputRef.current?.click();
                    }}
                    disabled={isUploading}
                    className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/90 hover:bg-white text-emerald-700 rounded-lg text-xs font-medium shadow-sm border border-emerald-200 transition"
                  >
                    {isUploading ? "Uploaden..." : "ðŸ“· Foto uploaden"}
                  </button>

                  {/* Number badge */}
                  <div className="absolute top-2 left-2 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow">
                    {dino.nummer}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {isEditing ? (
                    /* Edit form */
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          Nederlandse naam
                        </label>
                        <input
                          type="text"
                          value={editForm.nederlandseNaam}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              nederlandseNaam: e.target.value,
                            })
                          }
                          className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          Wetenschappelijke naam
                        </label>
                        <input
                          type="text"
                          value={editForm.wetenschappelijkeNaam}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              wetenschappelijkeNaam: e.target.value,
                            })
                          }
                          className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          Korte beschrijving
                        </label>
                        <textarea
                          value={editForm.korteBeschrijving}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              korteBeschrijving: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 outline-none resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          Leuk weetje
                        </label>
                        <textarea
                          value={editForm.leukWeetje}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              leukWeetje: e.target.value,
                            })
                          }
                          rows={2}
                          className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 outline-none resize-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition"
                        >
                          Opslaan
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition"
                        >
                          Annuleren
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display */
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {dino.nederlandseNaam}
                          </h3>
                          <p className="text-xs text-emerald-600 italic">
                            {dino.wetenschappelijkeNaam}
                          </p>
                        </div>
                        <button
                          onClick={() => startEdit(dino)}
                          className="text-blue-500 hover:text-blue-700 text-xs font-medium shrink-0 ml-2"
                        >
                          âœï¸ Bewerken
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : dino._id)
                        }
                        className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition"
                      >
                        {isExpanded ? "â–² Minder info" : "â–¼ Meer info"}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 space-y-2">
                          <div>
                            <span className="text-xs font-medium text-gray-500">
                              Beschrijving:
                            </span>
                            <p className="text-sm text-gray-700 mt-0.5">
                              {dino.korteBeschrijving}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-500">
                              ðŸ’¡ Leuk weetje:
                            </span>
                            <p className="text-sm text-gray-700 mt-0.5">
                              {dino.leukWeetje}
                            </p>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            Toegevoegd: {formatDate(dino.createdAt)}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

