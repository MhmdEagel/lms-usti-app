import SettingsSidebarItem from "./SettingsSidebarItem";
const SIDEBAR_ITEMS = [
  {
    lable: "Data Diri",
    description: "Kelola informasi profil Anda",
  },
  {
    lable: "Keamanan",
    description: "Pengaturan kata sandi dan keamanan",
  },
  {
    lable: "Notifikasi",
    description: "Pengaturan notifikasi akun",
  },
];
export default function SettingsSidebar({isActive, handleActiveBar} : {isActive: string; handleActiveBar: (identifier: string) => void}) {
  return (
    <div className="mt-4 border-r-[3px] pr-4 space-y-2 pl-4">
      {SIDEBAR_ITEMS.map((item) => (
        <SettingsSidebarItem
          key={item.lable}
          lable={item.lable}
          description={item.description}
          isActiveNavbar={isActive}
          handleClick={handleActiveBar}
        />
      ))}
    </div>
  );
}