import NavbarItem from "./NavbarItem/NavbarItem";

const NAVBAR_ITEMS = [
  {
    lable: "Detail",
    description: "Pengaturan umum dari kelas",
  },
  {
    lable: "Tugas dan Forum",
    description: "Pengaturan tugas dan forum kelas",
  },
];

export default function Navbar({isActive, handleActiveBar} : {isActive: string; handleActiveBar: (identifier: string) => void}) {
  return (
    <div className="mt-4 border-r-0 md:border-r-[3px] border-b md:border-b-0 pb-4 md:pb-0 md:pr-4 flex flex-row md:flex-col gap-2 overflow-x-auto">
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
