import type { Metadata } from "next";
import { PostProjectFlow } from "@/components/post-project-flow";

export const metadata: Metadata = {
  title: "Post a project — CrewMatrix",
  description: "Publish a scope, a budget range and a start date, and let matching crews bid.",
};

export default function NewProjectPage() {
  return <PostProjectFlow />;
}
