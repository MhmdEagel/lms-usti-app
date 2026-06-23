"use client";

import Profile from "./Profile";
import SettingsSidebar from "./SettingsSidebar/SettingsSidebar";
import { useProfileContent } from "./useProfileContent";
import Keamanan from "./Keamanan/Keamanan";
import Notifikasi from "./Notifikasi/Notifikasi";

export default function ProfileContent({
  user,
}: {
  user: {
    userId: string;
    fullname: string;
    email: string;
    role: string;
    profile?: string;
    nim?: string;
    nidn?: string;
  };
}) {
  const { isActive, handleActiveBar } = useProfileContent();

  const renderContent = () => {
    switch (isActive) {
      case "Data Diri":
        return <Profile user={user} />;
      case "Keamanan":
        return <Keamanan />;
      case "Notifikasi":
        return <Notifikasi />;
    }
  };
  return (
    <div className="flex min-h-[450px]">
      <SettingsSidebar isActive={isActive} handleActiveBar={handleActiveBar} />
      <div className="flex-1 px-6 pt-6">{renderContent()}</div>
    </div>
  );
}
