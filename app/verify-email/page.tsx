import { AuthCard } from "@/features/auth/components/AuthCard";
import { EmailVerificationForm } from "@/features/auth/components/EmailVerificationForm";

type VerifyEmailSearchParams = Promise<{
  email?: string | string[];
  next?: string | string[];
  sent?: string | string[];
}>;

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: VerifyEmailSearchParams;
}) {
  const params = await searchParams;

  return (
    <AuthCard className="max-w-md" cardClassName="p-6 sm:p-7">
      <EmailVerificationForm
        email={getSingleValue(params.email)}
        nextPath={getSingleValue(params.next)}
        sent={getSingleValue(params.sent)}
      />
    </AuthCard>
  );
}
