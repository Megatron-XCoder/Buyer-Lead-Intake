"use server";

import { signIn, signOut } from "@/auth";
import { redirect } from "next/navigation";

export async function signInAction() {
  await signIn("credentials", { redirectTo: "/" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/auth/signin" });
}