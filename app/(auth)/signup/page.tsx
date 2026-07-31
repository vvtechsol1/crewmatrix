import type { Metadata } from "next";
import { SignupFlow } from "@/components/signup-flow";

export const metadata: Metadata = {
  title: "Create an account — CrewMatrix",
  description: "Sign up as a general contractor or a subcontractor and get matched to work.",
};

export default function SignupPage() {
  return <SignupFlow />;
}
