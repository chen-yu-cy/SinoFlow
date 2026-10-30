import React from "react";
import { getTranslation } from "@/lib/i18n";
import { AuthModal } from "@/components/auth/auth-modal";

const LoginPage = async () => {
  const { t } = await getTranslation();

  const translations = {
    loginTitle: t("auth.loginTitle") || "登录 SinoFlow",
    emailLabel: t("auth.emailLabel") || "电子邮箱",
    passwordLabel: t("auth.passwordLabel") || "密码",
    loginButton: t("auth.loginButton") || "登录",
    noAccount: t("auth.noAccount") || "还没有账号？",
    registerLink: t("auth.registerLink") || "立即注册",
    loginError: t("auth.loginError") || "邮箱或密码错误",
    emailPlaceholder: t("auth.emailPlaceholder") || "请输入您的邮箱...",
    passwordPlaceholder: t("auth.passwordPlaceholder") || "请输入您的密码...",
    closeButton: t("auth.closeButton") || "关闭",
    registerTitle: t("auth.registerTitle") || "创建账号",
    nameLabel: t("auth.nameLabel") || "姓名",
    namePlaceholder: t("auth.namePlaceholder") || "请输入您的姓名...",
    registerButton: t("auth.registerButton") || "立即注册",
    haveAccount: t("auth.haveAccount") || "已有账号？",
    loginLink: t("auth.loginLink") || "立即登录",
    registerSuccess: t("auth.registerSuccess") || "注册成功，现在可以登录啦！",
  };

  return <AuthModal initialMode="login" translations={translations} />;
};

export default LoginPage;
