import NavbarItem from "./NavbarItem/NavbarItem";

const NAVBAR_ITEMS = [
  {
    lable: "Detail",
    description: "Pengaturan umum dari kelas",
  },
  {
    lable: "Privasi",
    description: "Pengaturan izin mahasiswa kelas",
  },
  {
    lable: "Penilaian",
    description: "Pengaturan nilai untuk mahasiswa",
  },
];

export default function Navbar({isActive, handleActiveBar} : {isActive: string; handleActiveBar: (identifier: string) => void}) {
  return (
    <div className="mt-4 border-r-[3px] pr-4 space-y-2">
      {NAVBAR_ITEMS.map((item) => (
        <NavbarItem
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
