"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useAuth } from "@/app/providers";
import { Id } from "../../../../../../convex/_generated/dataModel";

type RoleType = "admin" | "member" | "guest" | "lijndans" | "ella";

type User = {
  id: Id<"users">;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roles: RoleType[];
  isActive: boolean;
  emailVerified: boolean;
  createdAt: number;
  updatedAt?: number;
  lastLoginAt?: number;
};

type EditForm = {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roles: RoleType[];
  isActive: boolean;
};

const ALL_ROLES: { value: RoleType; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Lid" },
  { value: "guest", label: "Gast" },
  { value: "lijndans", label: "Lijndans" },
  { value: "ella", label: "Ella" },
];

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  member: "Lid",
  guest: "Gast",
  lijndans: "Lijndans",
  ella: "Ella",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-800",
  member: "bg-green-100 text-green-800",
  guest: "bg-gray-100 text-gray-800",
  lijndans: "bg-blue-100 text-blue-800",
  ella: "bg-pink-100 text-pink-800",
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const users = useQuery(api.users.listUsers, {}) as User[] | undefined;
  const adminUpdate = useMutation(api.users.adminUpdateUser);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    roles: ["guest"],
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        (u.name?.toLowerCase().includes(q) ?? false) ||
        (u.firstName?.toLowerCase().includes(q) ?? false) ||
        (u.lastName?.toLowerCase().includes(q) ?? false) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone?.toLowerCase().includes(q) ?? false);

      const matchesRole =
        roleFilter === "all" || u.roles?.includes(roleFilter as RoleType);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && u.isActive) ||
        (statusFilter === "inactive" && !u.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  if (!currentUser?.roles?.includes("admin")) {
    return <div className="text-center py-12 text-gray-500">Geen toegang</div>;
  }

  const openEdit = (u: User) => {
    setEditingUser(u);
    setEditForm({
      name: u.name ?? "",
      firstName: u.firstName ?? "",
      lastName: u.lastName ?? "",
      email: u.email,
      phone: u.phone ?? "",
      roles: u.roles ?? ["member"],
      isActive: u.isActive,
    });
  };

  const toggleRole = (role: RoleType) => {
    setEditForm((prev) => {
      const has = prev.roles.includes(role);
      const next = has
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role];
      // Ensure at least one role
      return { ...prev, roles: next.length > 0 ? next : prev.roles };
    });
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      await adminUpdate({
        userId: editingUser.id,
        name: editForm.name || undefined,
        firstName: editForm.firstName || undefined,
        lastName: editForm.lastName || undefined,
        phone: editForm.phone || undefined,
        roles: editForm.roles,
        isActive: editForm.isActive,
      });
      setEditingUser(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Er ging iets mis";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (ts?: number) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("nl-BE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (ts?: number) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleString("nl-BE", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalActive = users?.filter((u) => u.isActive).length ?? 0;
  const totalInactive = users?.filter((u) => !u.isActive).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gebruikersbeheer</h1>
        <span className="text-sm text-gray-500">
          {users?.length ?? 0} gebruikers
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Totaal</p>
          <p className="text-2xl font-bold">{users?.length ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Actief</p>
          <p className="text-2xl font-bold text-green-600">{totalActive}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Inactief</p>
          <p className="text-2xl font-bold text-red-600">{totalInactive}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Admins</p>
          <p className="text-2xl font-bold text-purple-600">
            {users?.filter((u) => u.roles?.includes("admin")).length ?? 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Zoek op naam, email of telefoon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">Alle rollen</option>
          <option value="admin">Admin</option>
          <option value="member">Lid</option>
          <option value="guest">Gast</option>
          <option value="lijndans">Lijndans</option>
          <option value="ella">Ella</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">Alle statussen</option>
          <option value="active">Actief</option>
          <option value="inactive">Inactief</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-600 text-xs uppercase tracking-wide">
                <th className="px-4 py-3">Naam</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Telefoon</th>
                <th className="px-4 py-3">Rollen</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aangemaakt</th>
                <th className="px-4 py-3">Laatste login</th>
                <th className="px-4 py-3 text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!users && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    Laden...
                  </td>
                </tr>
              )}
              {filteredUsers.length === 0 && users && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    Geen gebruikers gevonden
                  </td>
                </tr>
              )}
              {filteredUsers.map((u) => {
                const displayName =
                  u.firstName || u.lastName
                    ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
                    : (u.name ?? "—");

                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {displayName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {u.phone || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles?.map((r) => (
                          <span
                            key={r}
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[r] ?? "bg-gray-100 text-gray-800"}`}
                          >
                            {ROLE_LABELS[r] ?? r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive ? (
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />
                      ) : (
                        <span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-1" />
                      )}
                      <span className="text-gray-600 text-xs">
                        {u.isActive ? "Actief" : "Inactief"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDateTime(u.lastLoginAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(u)}
                        className="text-green-600 hover:text-green-800 font-medium text-xs"
                      >
                        Bewerken
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Gebruiker bewerken
              </h2>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-500">{editingUser.email}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Voornaam
                </label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, firstName: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Achternaam
                </label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lastName: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Weergavenaam
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Telefoon
              </label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Rollen
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_ROLES.map((r) => {
                  const active = editForm.roles.includes(r.value);
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => toggleRole(r.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? `${ROLE_COLORS[r.value]} border-transparent ring-2 ring-offset-1 ring-green-400`
                          : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Klik om rollen toe te voegen of te verwijderen
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Status
              </label>
              <select
                value={editForm.isActive ? "active" : "inactive"}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    isActive: e.target.value === "active",
                  })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="active">Actief</option>
                <option value="inactive">Inactief</option>
              </select>
            </div>

            <div className="text-xs text-gray-400 space-y-0.5">
              <p>
                E-mail geverifieerd: {editingUser.emailVerified ? "Ja" : "Nee"}
              </p>
              <p>Aangemaakt: {formatDateTime(editingUser.createdAt)}</p>
              <p>Laatste login: {formatDateTime(editingUser.lastLoginAt)}</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Annuleren
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "Opslaan..." : "Opslaan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
