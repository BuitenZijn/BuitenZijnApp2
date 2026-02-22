"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/app/providers";

/**
 * Login Form Component
 */
export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const secureLogin = useAction(api.authActions.secureLogin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await secureLogin({
        email,
        password,
        rememberMe,
      });

      if (!result.success) {
        setError(result.error || "Ongeldig e-mailadres of wachtwoord");
        return;
      }

      // Store session — stay on current page
      login(result.sessionToken!, {
        id: result.user!.id,
        email: result.user!.email,
        name: result.user!.name,
        firstName: result.user!.firstName,
        lastName: result.user!.lastName,
        roles: result.user!.roles as (
          | "admin"
          | "member"
          | "guest"
          | "lijndans"
          | "ella"
        )[],
        emailVerified: result.user!.emailVerified,
      });

      // Go back to the page the user came from, or home
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is iets misgegaan");
    } finally {
      setIsLoading(false);
    }
  };

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

      <Input
        label="Wachtwoord"
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
          />
          <span className="text-sm text-gray-600">Onthoud mij</span>
        </label>

        <Link
          href="/forgot-password"
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          Wachtwoord vergeten?
        </Link>
      </div>

      <Button type="submit" fullWidth isLoading={isLoading}>
        Inloggen
      </Button>

      <p className="text-center text-sm text-gray-600">
        Nog geen account?{" "}
        <Link
          href="/register"
          className="text-green-500 hover:text-green-600 font-medium"
        >
          Registreer nu
        </Link>
      </p>
    </form>
  );
}
