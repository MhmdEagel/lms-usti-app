import Image from "next/image";

export default async function Beranda() {
  return (
    <>
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-[linear-gradient(to_bottom,rgba(0,0,0,.9),rgba(0,0,0,.5)),url('/images/background/background.jpg')] bg-cover bg-no-repeat">
        <Image
          src={"/images/general/logo_usti.svg"}
          width={120}
          height={120}
          alt="logo"
        />
        <div className="text-center text-white">
          <h1 className="text-2xl md:text-4xl font-bold">Learning Management System</h1>
          <h2 className="mb-4 text-base md:text-2xl font-semibold text-orange-200">
            Universitas Sains Teknologi Indonesia
          </h2>
        </div>
      </div>
    </>
  );
}
