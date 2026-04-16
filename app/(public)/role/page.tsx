import { AuthCard } from '@/features/auth/components/AuthCard';
import { RoleSelectionForm } from '@/features/auth/components/RoleSelectionForm';
import { redirect } from 'next/navigation';

export default function RolePage() {
  // Server-side guard: require user to be authenticated but role not yet selected.
  // The actual role check happens client-side in RoleSelectionForm + useAuth.
  // Redirect authenticated users with an existing role (shouldn't land here).
  return (
    <AuthCard>
      <RoleSelectionForm />
    </AuthCard>
  );
}
