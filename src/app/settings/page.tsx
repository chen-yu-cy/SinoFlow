// FILE: src/app/settings/page.tsx
import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTranslation } from "@/lib/i18n";
import { SettingsForm } from "@/components/settings-form";

export const metadata = {
  title: "Account Settings | SinoFlow",
  description: "Manage your account information and update security credentials.",
};

export default async function SettingsPage() {
  const session = await auth();

  // Authentication Boundary: redirect to login if unauthenticated
  if (!session?.user) {
    redirect("/login?callbackUrl=/settings");
  }

  // Retrieve matching dictionary translation keys
  const { t } = await getTranslation();

  const translations = {
    pageTitle: t("settings.pageTitle"),
    pageSubtitle: t("settings.pageSubtitle"),
    labelEmail: t("settings.labelEmail"),
    labelName: t("settings.labelName"),
    titleChangePassword: t("settings.titleChangePassword"),
    labelCurrentPassword: t("settings.labelCurrentPassword"),
    labelNewPassword: t("settings.labelNewPassword"),
    labelConfirmNewPassword: t("settings.labelConfirmNewPassword"),
    placeholderCurrentPassword: t("settings.placeholderCurrentPassword"),
    placeholderNewPassword: t("settings.placeholderNewPassword"),
    placeholderConfirmNewPassword: t("settings.placeholderConfirmNewPassword"),
    btnUpdate: t("settings.btnUpdate"),
    btnUpdating: t("settings.btnUpdating"),
    errMismatch: t("settings.errMismatch"),
    errRequired: t("settings.errRequired"),
    successMessage: t("settings.successMessage"),
  };

  return (
    <main style={{ padding: "3rem 1rem", minHeight: "80vh", background: "#f8f9fa" }}>
      <SettingsForm 
        user={{
          name: session.user.name,
          email: session.user.email,
        }}
        translations={translations}
      />
    </main>
  );
}
