import { getCurrentUser } from "@/lib/auth";
import ProfileContent from "@/components/views/Dashboard/Profile/ProfileContent";
import ProfileSkeleton from "@/components/views/Dashboard/Profile/ProfileSkeleton";
import { Suspense } from "react";

async function ProfileSection() {
  const user = await getCurrentUser();
  return <ProfileContent user={user} />;
}

export default function PengaturanPage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileSection />
    </Suspense>
  );
}
