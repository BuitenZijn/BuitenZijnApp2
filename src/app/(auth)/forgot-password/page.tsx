import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";

export const metadata: Metadata = {
  title: "Wachtwoord vergeten - BuitenZijn",
  description: "Reset je wachtwoord",
};

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wachtwoord vergeten?</CardTitle>
        <CardDescription>
          Vul je e-mailadres in en we sturen je een link om je wachtwoord te resetten
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  );
}
