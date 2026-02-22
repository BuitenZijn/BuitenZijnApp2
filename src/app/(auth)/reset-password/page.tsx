import { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Wachtwoord resetten - BuitenZijn",
  description: "Stel een nieuw wachtwoord in",
};

export default function ResetPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nieuw wachtwoord instellen</CardTitle>
        <CardDescription>
          Kies een nieuw wachtwoord voor je account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense
          fallback={<p className="text-gray-500 text-center">Laden...</p>}
        >
          <ResetPasswordForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
