"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button, Input } from "@/components/ui";

/**
 * Register Form Component
 */
export function RegisterForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const secureRegister = useAction(api.authActions.secureRegister);
  const createVerificationToken = useMutation(
    api.auth.createEmailVerificationToken,
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Voornaam is verplicht";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Achternaam is verplicht";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-mailadres is verplicht";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ongeldig e-mailadres";
    }

    if (!formData.password) {
      newErrors.password = "Wachtwoord is verplicht";
    } else if (formData.password.length < 8) {
      newErrors.password = "Wachtwoord moet minimaal 8 tekens bevatten";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Wachtwoorden komen niet overeen";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Register with bcrypt password hashing (server-side)
      const userId = await secureRegister({
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      // Create verification token
      const verificationToken = crypto.randomUUID();
      await createVerificationToken({
        userId,
        token: verificationToken,
      });

      // In production, send verification email here
      console.log("Verification token:", verificationToken);

      setSuccess(true);
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : "Er is iets misgegaan",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Controleer je e-mail
        </h3>
        <p className="text-gray-600">
          We hebben een verificatielink gestuurd naar{" "}
          <strong>{formData.email}</strong>. Klik op de link om je account te
          activeren.
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
      {errors.form && (
        <div className="p-3 bg-rust-50 border border-rust-200 rounded-lg text-rust-600 text-sm">
          {errors.form}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Voornaam"
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          placeholder="Jan"
          required
        />

        <Input
          label="Achternaam"
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
          placeholder="Janssen"
          required
        />
      </div>

      <Input
        label="E-mailadres"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="jouw@email.nl"
        required
        autoComplete="email"
      />

      <Input
        label="Wachtwoord"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Minimaal 8 tekens"
        required
        autoComplete="new-password"
      />

      <Input
        label="Bevestig wachtwoord"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        placeholder="Herhaal je wachtwoord"
        required
        autoComplete="new-password"
      />

      <Button type="submit" fullWidth isLoading={isLoading}>
        Account aanmaken
      </Button>

      <p className="text-center text-sm text-gray-600">
        Heb je al een account?{" "}
        <Link
          href="/login"
          className="text-green-500 hover:text-green-600 font-medium"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
