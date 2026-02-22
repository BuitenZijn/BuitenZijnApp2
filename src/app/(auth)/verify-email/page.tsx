"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";
import { Button } from "@/components/ui";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  const verifyEmail = useMutation(api.auth.verifyEmail);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error");
        setMessage("Geen verificatietoken gevonden");
        return;
      }

      try {
        await verifyEmail({ token });
        setStatus("success");
        setMessage("Je e-mailadres is geverifieerd!");
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Er is iets misgegaan bij het verifiëren van je e-mailadres",
        );
      }
    }

    verify();
  }, [token, verifyEmail]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>E-mail verificatie</CardTitle>
        <CardDescription>
          {status === "loading" && "Bezig met verifiëren..."}
          {status === "success" && "Verificatie geslaagd"}
          {status === "error" && "Verificatie mislukt"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          {status === "loading" && (
            <div className="flex justify-center">
              <svg
                className="animate-spin h-8 w-8 text-green-500"
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
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
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
              <p className="text-gray-600">{message}</p>
              <Link href="/login">
                <Button fullWidth>Ga naar inloggen</Button>
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="text-gray-600">{message}</p>
              <Link href="/login">
                <Button variant="outline" fullWidth>
                  Terug naar inloggen
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardHeader>
            <CardTitle>E-mail verificatie</CardTitle>
            <CardDescription>Bezig met verifiëren...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <svg
                className="animate-spin h-8 w-8 text-green-500"
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
            </div>
          </CardContent>
        </Card>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
