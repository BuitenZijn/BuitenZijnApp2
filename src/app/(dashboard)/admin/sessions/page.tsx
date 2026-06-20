"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuth } from "@/app/providers";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function AdminSessionsPage() {
  const { user } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showCreate, setShowCreate] = useState(false);
  const [viewSessionId, setViewSessionId] = useState<string | null>(null);
  const [newSession, setNewSession] = useState({
    date: now.toISOString().split("T")[0],
    startTime: "15:00",
    endTime: "16:00",
    location: "Buurthuis",
  });

  const sessions = useQuery(api.danceSessions.list, { month, year, limit: 50 });
  const createSession = useMutation(api.danceSessions.create);
  const regenerateQr = useMutation(api.danceSessions.regenerateQr);
  const removeSession = useMutation(api.danceSessions.remove);

  // Attendance for selected session
  const attendees = useQuery(
    api.danceSessions.getAttendees,
    viewSessionId
      ? { sessionId: viewSessionId as Id<"linedance_sessions"> }
      : "skip",
  );

  const checkinCount = useQuery(
    api.danceSessions.getCheckinCount,
    viewSessionId
      ? { sessionId: viewSessionId as Id<"linedance_sessions"> }
      : "skip",
  );

  if (!user?.roles?.includes("admin")) {
    return <div className="text-center py-12 text-gray-500">Geen toegang</div>;
  }

  const handleCreate = async () => {
    try {
      await createSession(newSession);
      setShowCreate(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (
      !confirm("Sessie verwijderen? Dit kan alleen als er geen check-ins zijn.")
    )
      return;
    try {
      await removeSession({ sessionId: sessionId as Id<"linedance_sessions"> });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRegenerate = async (sessionId: string) => {
    if (!confirm("Nieuwe QR-code genereren? De oude wordt ongeldig.")) return;
    try {
      await regenerateQr({
        sessionId: sessionId as Id<"linedance_sessions">,
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const dutchMonths = [
    "Januari",
    "Februari",
    "Maart",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Augustus",
    "September",
    "Oktober",
    "November",
    "December",
  ];

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString("nl-BE", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sessies & Aanwezigheid
          </h1>
          <p className="text-gray-600">
            Beheer lijndanssessies en bekijk aanwezigheid
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition"
        >
          {showCreate ? "Annuleer" : "+ Nieuwe Sessie"}
        </button>
      </div>

      {/* Create Session Form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Nieuwe Sessie</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Datum
              </label>
              <input
                type="date"
                value={newSession.date}
                onChange={(e) =>
                  setNewSession({ ...newSession, date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Start
              </label>
              <input
                type="time"
                value={newSession.startTime}
                onChange={(e) =>
                  setNewSession({ ...newSession, startTime: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Einde
              </label>
              <input
                type="time"
                value={newSession.endTime}
                onChange={(e) =>
                  setNewSession({ ...newSession, endTime: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Locatie
              </label>
              <input
                type="text"
                value={newSession.location}
                onChange={(e) =>
                  setNewSession({ ...newSession, location: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Sessie Aanmaken
          </button>
        </div>
      )}

      {/* Month Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            if (month === 1) {
              setMonth(12);
              setYear(year - 1);
            } else {
              setMonth(month - 1);
            }
          }}
          className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
        >
          â†
        </button>
        <span className="text-lg font-semibold text-gray-900">
          {dutchMonths[month - 1]} {year}
        </span>
        <button
          onClick={() => {
            if (month === 12) {
              setMonth(1);
              setYear(year + 1);
            } else {
              setMonth(month + 1);
            }
          }}
          className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
        >
          â†’
        </button>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="divide-y divide-gray-100">
          {sessions && sessions.length > 0 ? (
            sessions.map((session) => (
              <div key={session._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">ðŸ“…</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {session.date}
                      </p>
                      <p className="text-sm text-gray-500">
                        {session.startTime} - {session.endTime} â€¢{" "}
                        {session.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setViewSessionId(
                          viewSessionId === session._id ? null : session._id,
                        )
                      }
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100"
                    >
                      ðŸ‘¥ Aanwezigheid
                    </button>
                    <button
                      onClick={() => handleRegenerate(session._id)}
                      className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100"
                    >
                      ðŸ”„ QR
                    </button>
                    <button
                      onClick={() => handleDelete(session._id)}
                      className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100"
                    >
                      ðŸ—‘ï¸
                    </button>
                  </div>
                </div>

                {/* QR Token */}
                <div className="mt-3 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">
                    QR Token (maak hier een QR-code van voor de poster):
                  </p>
                  <code className="text-sm text-gray-800 font-mono break-all select-all">
                    {session.qrToken}
                  </code>
                </div>

                {/* Attendance Detail */}
                {viewSessionId === session._id && attendees && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="text-sm font-semibold text-gray-900 mb-3">
                      Aanwezigen: {checkinCount ?? attendees.length}
                    </p>
                    {attendees.length > 0 ? (
                      <div className="space-y-2">
                        {attendees.map((a, idx) => (
                          <div
                            key={a.checkinId}
                            className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                              </span>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {a.userName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {a.userEmail}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">
                              {formatTime(a.checkedInAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Nog geen check-ins
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              Geen sessies in {dutchMonths[month - 1]} {year}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

