"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button, Input } from "@/components/ui";

/**
 * Reset Password Form Component
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const secureResetPassword = useAction(api.authActions.secureResetPassword);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = "Wachtwoord is verplicht";
    } else if (password.length < 8) {
      newErrors.password = "Wachtwoord moet minimaal 8 tekens bevatten";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Wachtwoorden komen niet overeen";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!token) {
      setErrors({ form: "Geen reset token gevonden" });
      return;
    }

    setIsLoading(true);

    try {
      // Reset password with bcrypt hashing (server-side)
      await secureResetPassword({
        token,
        newPassword: password,
      });

      setSuccess(true);
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : "Er is iets misgegaan",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-rust-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-rust-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Ongeldige link</h3>
        <p className="text-gray-600">
          Deze wachtwoord reset link is ongeldig of verlopen.
        </p>
        <Link href="/forgot-password">
          <Button fullWidth>Nieuwe link aanvragen</Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Wachtwoord gewijzigd!
        </h3>
        <p className="text-gray-600">
          Je wachtwoord is succesvol gewijzigd. Je kunt nu inloggen met je
          nieuwe wachtwoord.
        </p>
        <Link href="/login">
          <Button fullWidth>Ga naar inloggen</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.form && (
        <div className="p-3 bg-rust-50 border border-rust-200 rounded-lg text-rust-600 text-sm">
          {errors.form}
        </div>
      )}

      <Input
        label="Nieuw wachtwoord"
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="Minimaal 8 tekens"
        required
        autoComplete="new-password"
      />

      <Input
        label="Bevestig wachtwoord"
        type="password"
        name="confirmPassword"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        placeholder="Herhaal je wachtwoord"
        required
        autoComplete="new-password"
      />

      <Button type="submit" fullWidth isLoading={isLoading}>
        Wachtwoord wijzigen
      </Button>
    </form>
  );
}
