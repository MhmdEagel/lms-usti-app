import Image from "next/image";
import BackBtn from "./BackBtn/BackBtn";

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col justify-center items-center gap-4">
      <Image
        src={"/images/ilustration/404.svg"}
        width={250}
        height={250}
        alt="Page Not Found"
      />
      <div className="space-y-2 text-center">
        <div className="text-2xl md:text-4xl text-primary font-bold">404</div>
        <div className="text-base md:text-xl font-semibold">Halaman Tidak Ditemukan</div>
        <BackBtn />
      </div>
    </div>
  );
}
