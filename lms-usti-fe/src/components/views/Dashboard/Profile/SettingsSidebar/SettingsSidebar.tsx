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
    <div className="flex md:flex-col gap-1 md:gap-0 overflow-x-auto md:overflow-visible pb-2 md:pb-0 border-b md:border-b-0 md:border-r-[3px] md:pr-2 md:pl-2">
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