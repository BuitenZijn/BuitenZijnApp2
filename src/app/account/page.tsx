"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AuthGuard } from "@/components/auth";
import { useAuth } from "@/app/providers";
import { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountContent />
    </AuthGuard>
  );
}

function AccountContent() {
  const router = useRouter();
  const { user, sessionToken, logout } = useAuth();
  const deleteAccount = useMutation(api.users.deleteAccount);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CONFIRM_PHRASE = "account verwijderen";

  const handleDeleteAccount = async () => {
    if (confirmText.toLowerCase() !== CONFIRM_PHRASE) return;
    if (!user?.id || !sessionToken) return;

    setLoading(true);
    setError(null);
    try {
      await deleteAccount({
        sessionToken,
        userId: user.id as Id<"users">,
      });
      // Log out and send to homepage
      logout();
      router.push("/?accountDeleted=1");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Er is iets misgegaan. Probeer opnieuw.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Mijn account</h1>
      <p className="text-gray-500 text-sm mb-10">
        Ingelogd als{" "}
        <span className="font-medium text-gray-700">{user?.email}</span>
      </p>

      {/* Account info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Gegevens</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Naam</span>
            <span className="font-medium text-gray-800">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.name || "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">E-mail</span>
            <span className="font-medium text-gray-800">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Rollen</span>
            <span className="font-medium text-gray-800 capitalize">
              {user?.roles?.join(", ") || "member"}
            </span>
          </div>
        </div>
      </div>

      {/* Legal links */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Juridisch
        </h2>
        <div className="flex flex-col gap-3 text-sm">
          <Link
            href="/privacy-policy"
            className="text-green-700 hover:text-green-900 underline underline-offset-2"
          >
            Privacybeleid
          </Link>
          <a
            href="mailto:info@buitenzijnvzw.be"
            className="text-green-700 hover:text-green-900 underline underline-offset-2"
          >
            Contact — info@buitenzijnvzw.be
          </a>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <h2 className="text-base font-semibold text-red-700 mb-1">
          Gevarenzone
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Het verwijderen van uw account is <strong>permanent</strong>. Uw
          persoonlijke gegevens worden geanonimiseerd. Transactiehistorie wordt
          bewaard voor boekhoudkundige verplichtingen (max. 7 jaar).
        </p>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 bg-red-50 text-red-700 border border-red-300 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            Account verwijderen
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Typ{" "}
              <span className="font-mono font-semibold text-red-700">
                {CONFIRM_PHRASE}
              </span>{" "}
              om te bevestigen:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_PHRASE}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent"
              autoFocus
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={
                  loading || confirmText.toLowerCase() !== CONFIRM_PHRASE
                }
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Verwijderen..." : "Definitief verwijderen"}
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmText("");
                  setError(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Annuleren
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
