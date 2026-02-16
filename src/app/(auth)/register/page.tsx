import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";

export const metadata: Metadata = {
  title: "Registreren - BuitenZijn",
  description: "Maak een nieuw BuitenZijn account aan",
};

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account aanmaken</CardTitle>
        <CardDescription>
          Vul je gegevens in om een account aan te maken
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
