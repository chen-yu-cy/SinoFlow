// FILE: src/app/features/notes/page.tsx
import React from "react";
import { getTranslation } from "@/lib/i18n";
import { NotesFeatureClient, NotesFeatureDictionary } from "@/components/features/notes-feature-client";

export const metadata = {
  title: "Interactive Timestamp Notes | SinoFlow",
  description: "Learn how timestamped interactive notes boost Chinese learning efficiency.",
};

export default async function NotesFeatureIntroPage() {
  const { dict } = await getTranslation();
  const notesDict = (dict as unknown as { notesFeature: NotesFeatureDictionary }).notesFeature;

  return (
    <main>
      <NotesFeatureClient dict={notesDict} />
    </main>
  );
}
