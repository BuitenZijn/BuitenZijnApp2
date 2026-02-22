"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  EnvelopeIcon,
  PhoneIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

// ==========================================
// SVG Icons for Social Media
// ==========================================

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// ==========================================
// CONTACT FORM COMPONENT
// ==========================================

function ContactForm() {
  const submitMessage = useMutation(api.contact.submitContactMessage);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await submitMessage({
        name: formData.name,
        email: formData.email,
        message: formData.message,
      });
      setStatus("sent");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-800 mb-2">
          Bericht verzonden!
        </h3>
        <p className="text-green-700 mb-6">
          Bedankt voor je bericht. We nemen zo snel mogelijk contact met je op.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Nog een bericht sturen
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Naam
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Je volledige naam"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-navy-400 focus:border-transparent transition-shadow"
          required
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          E-mailadres
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="je@email.be"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-navy-400 focus:border-transparent transition-shadow"
          required
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Bericht
        </label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          placeholder="Schrijf hier je bericht..."
          rows={5}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-navy-400 focus:border-transparent transition-shadow resize-none"
          required
        />
      </div>

      {status === "error" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          Er ging iets mis. Probeer het later opnieuw of mail ons rechtstreeks.
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full flex items-center justify-center gap-2 bg-navy-700 text-white px-6 py-3 rounded-lg hover:bg-navy-800 disabled:opacity-60 disabled:cursor-not-allowed font-medium transition-colors"
      >
        {status === "sending" ? (
          <>
            <svg
              className="animate-spin w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Verzenden...
          </>
        ) : (
          <>
            <PaperAirplaneIcon className="w-5 h-5" />
            Verstuur bericht
          </>
        )}
      </button>
    </form>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

export default function ContactPage() {
  return (
    <div className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold text-navy-800 mb-4">
            Contact
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Heb je een vraag, suggestie of wil je meer weten over onze
            activiteiten? Neem gerust contact met ons op!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left column: contact info + socials */}
          <div className="lg:col-span-2 space-y-8">
            {/* Section 1: Je kan ons bereiken via */}
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-xl font-bold text-navy-800 mb-6">
                Je kan ons bereiken via
              </h2>

              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center shrink-0">
                    <EnvelopeIcon className="w-6 h-6 text-navy-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      E-mail
                    </p>
                    <a
                      href="mailto:info@buitenzijnvzw.be"
                      className="text-navy-700 hover:text-navy-900 font-medium transition-colors"
                    >
                      info@buitenzijnvzw.be
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <PhoneIcon className="w-6 h-6 text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Telefoon
                    </p>
                    <a
                      href="tel:+32475249825"
                      className="text-navy-700 hover:text-navy-900 font-medium transition-colors"
                    >
                      +32 475 24 98 25
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Volg ons via sociale media */}
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-xl font-bold text-navy-800 mb-6">
                Volg ons via sociale media
              </h2>

              <div className="flex items-center gap-4">
                <a
                  href="https://www.instagram.com/buitenzijnvzw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                >
                  <InstagramIcon className="w-6 h-6" />
                  <span className="font-medium text-sm">Instagram</span>
                </a>

                <a
                  href="https://www.facebook.com/buitenzijnvzw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-5 py-3 bg-[#1877F2] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                >
                  <FacebookIcon className="w-6 h-6" />
                  <span className="font-medium text-sm">Facebook</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right column: Contact form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-xl font-bold text-navy-800 mb-6">
                Stuur ons een bericht
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
