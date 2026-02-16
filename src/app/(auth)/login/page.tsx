import { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";

export const metadata: Metadata = {
  title: "Inloggen - BuitenZijn",
  description: "Log in op je BuitenZijn account",
};

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welkom terug</CardTitle>
        <CardDescription>
          Log in met je e-mailadres en wachtwoord
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
