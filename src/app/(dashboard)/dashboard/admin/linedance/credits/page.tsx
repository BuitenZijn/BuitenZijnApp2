"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { useAuth } from "@/app/providers";
import { Id } from "../../../../../../../convex/_generated/dataModel";

export default function AdminCreditsPage() {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState(1);
  const [creditNote, setCreditNote] = useState("");
  const [action, setAction] = useState<"add" | "remove">("add");
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [userFilter, setUserFilter] = useState<"credits" | "all">("all");
  const [newPkg, setNewPkg] = useState({
    name: "",
    credits: 1,
    priceInCents: 600,
  });

  const balances = useQuery(api.danceCredits.getAllBalances);
  const allLijndansUsers = useQuery(api.danceCredits.getAllLijndansUsers);
  const purchases = useQuery(api.danceCredits.getAllPurchases, { limit: 100 });
  const packages = useQuery(api.creditPackages.listAll);

  const addCredits = useMutation(api.danceCredits.addCredits);
  const removeCredits = useMutation(api.danceCredits.removeCredits);
  const createPackage = useMutation(api.creditPackages.create);
  const updatePackage = useMutation(api.creditPackages.update);

  // Choose which list to display based on filter
  const displayedUsers =
    userFilter === "all"
      ? allLijndansUsers
      : balances?.filter((b) => b.balance > 0);

  if (!user?.roles?.includes("admin")) {
    return <div className="text-center py-12 text-gray-500">Geen toegang</div>;
  }

  const handleCreditAction = async () => {
    if (!selectedUserId || creditAmount <= 0) return;

    try {
      if (action === "add") {
        await addCredits({
          userId: selectedUserId as Id<"users">,
          credits: creditAmount,
          paymentMethod: "manual",
          note: creditNote || "Manueel toegevoegd door admin",
        });
      } else {
        await removeCredits({
          userId: selectedUserId as Id<"users">,
          credits: creditAmount,
          note: creditNote || "Verwijderd door admin",
        });
      }
      setSelectedUserId(null);
      setCreditAmount(1);
      setCreditNote("");
    } catch (err: any) {
      alert(err.message || "Er ging iets mis");
    }
  };

  const handleCreatePackage = async () => {
    if (!newPkg.name || newPkg.credits < 1 || newPkg.priceInCents < 0) return;
    await createPackage(newPkg);
    setNewPkg({ name: "", credits: 1, priceInCents: 600 });
    setShowPackageForm(false);
  };

  const togglePackageActive = async (id: string, isActive: boolean) => {
    await updatePackage({
      packageId: id as Id<"linedance_credit_packages">,
      isActive: !isActive,
    });
  };

  const formatPrice = (cents: number) => `€${(cents / 100).toFixed(2)}`;

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("nl-BE", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Calculate total revenue
  const totalRevenue =
    purchases
      ?.filter((p) => p.amountPaidInCents > 0)
      .reduce((sum, p) => sum + p.amountPaidInCents, 0) ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          💃 Danskrediet Beheer
        </h1>
        <p className="text-gray-600">
          Overzicht van alle danskrediet, pakketten en transacties voor lijndans
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Totaal uitstaand krediet</p>
          <p className="text-3xl font-bold text-green-700">
            {balances?.reduce((sum, b) => sum + b.balance, 0) ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Gebruikers met krediet</p>
          <p className="text-3xl font-bold text-blue-700">
            {balances?.filter((b) => b.balance > 0).length ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Lijndansers totaal</p>
          <p className="text-3xl font-bold text-purple-700">
            {allLijndansUsers?.length ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Totale omzet</p>
          <p className="text-3xl font-bold text-navy-700">
            {formatPrice(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Danskrediet Pakketten */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Danskrediet Pakketten
          </h2>
          <button
            onClick={() => setShowPackageForm(!showPackageForm)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition"
          >
            {showPackageForm ? "Annuleer" : "+ Nieuw Pakket"}
          </button>
        </div>

        {showPackageForm && (
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Naam
              </label>
              <input
                type="text"
                value={newPkg.name}
                onChange={(e) => setNewPkg({ ...newPkg, name: e.target.value })}
                placeholder="5-beurtenkaart"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Krediet
              </label>
              <input
                type="number"
                value={newPkg.credits}
                onChange={(e) =>
                  setNewPkg({
                    ...newPkg,
                    credits: parseInt(e.target.value) || 1,
                  })
                }
                min={1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Prijs (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={(newPkg.priceInCents / 100).toFixed(2)}
                onChange={(e) =>
                  setNewPkg({
                    ...newPkg,
                    priceInCents:
                      Math.round(parseFloat(e.target.value) * 100) || 0,
                  })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-24"
              />
            </div>
            <button
              onClick={handleCreatePackage}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Aanmaken
            </button>
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {packages?.map((pkg) => (
            <div
              key={pkg._id}
              className="px-6 py-4 flex items-center justify-between"
            >
              <div>
                <span className="font-medium text-gray-900">{pkg.name}</span>
                <span className="ml-2 text-sm text-gray-500">
                  {pkg.credits} krediet{pkg.credits > 1 ? "en" : ""} —{" "}
                  {formatPrice(pkg.priceInCents)}
                </span>
              </div>
              <button
                onClick={() => togglePackageActive(pkg._id, pkg.isActive)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  pkg.isActive
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {pkg.isActive ? "Actief" : "Inactief"}
              </button>
            </div>
          ))}
          {(!packages || packages.length === 0) && (
            <div className="px-6 py-8 text-center text-gray-500 text-sm">
              Nog geen pakketten. Maak er een aan om te beginnen.
            </div>
          )}
        </div>
      </div>

      {/* User Balances */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Danskrediet per Gebruiker
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Toon:</span>
            <button
              onClick={() => setUserFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                userFilter === "all"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Alle lijndansers
            </button>
            <button
              onClick={() => setUserFilter("credits")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                userFilter === "credits"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Met krediet
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Naam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rollen
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Krediet
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedUsers?.map((b) => (
                <tr key={b.userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {b.userName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {b.userEmail}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {(b.userRoles ?? [b.userRole]).map((role: string) => (
                        <span
                          key={role}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            role === "lijndans"
                              ? "bg-green-100 text-green-700"
                              : role === "admin"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`text-lg font-bold ${
                        b.balance > 0 ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {b.balance}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedUserId(b.userId);
                        setAction("add");
                      }}
                      className="text-green-600 hover:text-green-800 text-sm font-medium mr-3"
                    >
                      + Toevoegen
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUserId(b.userId);
                        setAction("remove");
                      }}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      − Verwijderen
                    </button>
                  </td>
                </tr>
              ))}
              {(!displayedUsers || displayedUsers.length === 0) && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500 text-sm"
                  >
                    {userFilter === "credits"
                      ? "Geen gebruikers met danskrediet"
                      : "Geen lijndansers gevonden. Wijs de rol 'lijndans' toe aan gebruikers."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credit Action Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {action === "add"
                ? "Danskrediet Toevoegen"
                : "Danskrediet Verwijderen"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Voor:{" "}
              <strong>
                {displayedUsers?.find((b) => b.userId === selectedUserId)
                  ?.userName ??
                  balances?.find((b) => b.userId === selectedUserId)?.userName}
              </strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aantal krediet
                </label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) =>
                    setCreditAmount(parseInt(e.target.value) || 1)
                  }
                  min={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notitie (optioneel)
                </label>
                <input
                  type="text"
                  value={creditNote}
                  onChange={(e) => setCreditNote(e.target.value)}
                  placeholder="Reden..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedUserId(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Annuleer
              </button>
              <button
                onClick={handleCreditAction}
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-white ${
                  action === "add"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {action === "add" ? "Toevoegen" : "Verwijderen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Transactiehistoriek
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Gebruiker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pakket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Methode
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Krediet
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Bedrag
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {purchases?.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {p.userName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {p.packageName}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.paymentMethod === "stripe"
                          ? "bg-purple-100 text-purple-700"
                          : p.paymentMethod === "cash"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {p.paymentMethod === "stripe"
                        ? "Stripe"
                        : p.paymentMethod === "cash"
                          ? "Cash"
                          : "Manueel"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`font-semibold ${
                        p.credits > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {p.credits > 0 ? "+" : ""}
                      {p.credits}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-500">
                    {p.amountPaidInCents > 0
                      ? formatPrice(p.amountPaidInCents)
                      : "—"}
                  </td>
                </tr>
              ))}
              {(!purchases || purchases.length === 0) && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500 text-sm"
                  >
                    Nog geen transacties
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
