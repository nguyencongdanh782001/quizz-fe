import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

type CallbackSearchParams = Promise<{
  error?: string | string[];
  needs_onboarding?: string | string[];
}>;

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getPreferredLocalHost() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  try {
    const hostname = new URL(apiUrl).hostname;
    return LOCAL_HOSTS.has(hostname) ? hostname : null;
  } catch {
    return null;
  }
}

async function redirectToPreferredLocalHostIfNeeded(
  searchParams: Awaited<CallbackSearchParams>,
) {
  const preferredHost = getPreferredLocalHost();
  if (!preferredHost) return;

  const requestHeaders = await headers();
  const requestHost =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (!requestHost) return;

  const [hostname, port] = requestHost.split(":");
  if (!LOCAL_HOSTS.has(hostname) || hostname === preferredHost) {
    return;
  }

  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const target = new URL(
    `/auth/callback`,
    `${protocol}://${preferredHost}${port ? `:${port}` : ""}`,
  );

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => target.searchParams.append(key, item));
      return;
    }

    if (value) {
      target.searchParams.set(key, value);
    }
  });

  redirect(target.toString());
}

function redirectBySession(
  roleName: "teacher" | "student" | null,
  needsOnboarding: boolean,
) {
  if (needsOnboarding || !roleName) {
    redirect("/role");
  }

  redirect(roleName === "teacher" ? "/teacher" : "/student");
}

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: CallbackSearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  await redirectToPreferredLocalHostIfNeeded(resolvedSearchParams);

  if (getSingleValue(resolvedSearchParams.error)) {
    redirect("/login?error=oauth_failed");
  }

  const session = await getServerSession();
  if (!session) {
    redirect("/login?error=session_not_found");
  }

  const queryNeedsOnboarding =
    getSingleValue(resolvedSearchParams.needs_onboarding) === "true";
  redirectBySession(
    session.role_name,
    queryNeedsOnboarding || session.needs_onboarding,
  );
}
