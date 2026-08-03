"use client";

const LOGIN_SUCCESS_FLASH_KEY = "quizzvn-login-success";

export function setLoginSuccessFlash(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(LOGIN_SUCCESS_FLASH_KEY, "1");
}

export function consumeLoginSuccessFlash(): boolean {
  if (typeof window === "undefined") return false;

  const hasFlash = window.sessionStorage.getItem(LOGIN_SUCCESS_FLASH_KEY) === "1";
  window.sessionStorage.removeItem(LOGIN_SUCCESS_FLASH_KEY);
  return hasFlash;
}
