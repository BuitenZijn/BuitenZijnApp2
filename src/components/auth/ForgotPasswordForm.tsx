"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button, Input } from "@/components/ui";

/**
 * Forgot Password Form Component
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const createPasswordResetToken = useMutation(api.auth.createPasswordResetToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Generate reset token
      const resetToken = crypto.randomUUID();
      
      await createPasswordResetToken({
        email,
        token: resetToken,
      });

      // In production, send password reset email here
      console.log("Reset token:", resetToken);
      
      setSuccess(true);
    } catch (err) {
      // Don't reveal if email exists or not for security
      setSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Controleer je e-mail
        </h3>
        <p className="text-gray-600">
          Als er een account bestaat met <strong>{email}</strong>, ontvang je binnen enkele minuten een e-mail met instructies om je wachtwoord te resetten.
        </p>
        <Link href="/login">
          <Button variant="outline" fullWidth>
            Terug naar inloggen
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-rust-50 border border-rust-200 rounded-lg text-rust-600 text-sm">
          {error}
        </div>
      )}

      <Input
        label="E-mailadres"
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="jouw@email.nl"
        required
        autoComplete="email"
      />

      <Button type="submit" fullWidth isLoading={isLoading}>
        Reset link versturen
      </Button>

      <p className="text-center text-sm text-gray-600">
        Weet je je wachtwoord weer?{" "}
        <Link href="/login" className="text-green-500 hover:text-green-600 font-medium">
          Log in
        </Link>
      </p>
    </form>
  );
}
