"use client";

import { useAuth } from "@/app/providers";
import { useState } from "react";
import Link from "next/link";

// Placeholder for dances data
const dances = [];

export default function LijndansenBeheerPage() {
  const { user, isAuthenticated } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);

  // Only allow access for lijndans or admin role
  if (
    !isAuthenticated ||
    !(user?.role === "admin" || user?.role === "lijndans")
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

  return (
    <div className="min-h-screen bg-beige-100 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-navy-800">
          Lijndansen beheer
        </h1>
        {/* Spotify embed */}
        <div className="mb-8">
          <iframe
            src="https://open.spotify.com/embed/playlist/PLACEHOLDER"
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
          ></iframe>
        </div>
        {/* Dances table/list */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Gedanste dansen</h2>
          {/* Table placeholder, will be filled with data later */}
          <table className="w-full border rounded-lg">
            <thead className="bg-beige-200">
              <tr>
                <th className="py-2 px-4">Song</th>
                <th className="py-2 px-4">Artiest</th>
                <th className="py-2 px-4">Dansnaam</th>
                <th className="py-2 px-4">Kwartaal</th>
                <th className="py-2 px-4">YouTube demo</th>
              </tr>
            </thead>
            <tbody>
              {/* Data rows will be rendered here */}
              {dances.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    Nog geen dansen toegevoegd.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Admin add form */}
        {user?.role === "admin" && (
          <div className="mb-8">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-lg mb-4"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? "Sluit formulier" : "Voeg nieuwe dans toe"}
            </button>
            {showAddForm && (
              <form className="bg-beige-50 p-4 rounded-lg shadow">
                {/* Form fields for song, artist, dance name, quarter, youtube url */}
                <div className="mb-2">
                  <label className="block mb-1 font-medium">Song</label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div className="mb-2">
                  <label className="block mb-1 font-medium">Artiest</label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div className="mb-2">
                  <label className="block mb-1 font-medium">Dansnaam</label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div className="mb-2">
                  <label className="block mb-1 font-medium">Kwartaal</label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div className="mb-2">
                  <label className="block mb-1 font-medium">
                    YouTube demo URL
                  </label>
                  <input
                    type="url"
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-2"
                >
                  Opslaan
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
