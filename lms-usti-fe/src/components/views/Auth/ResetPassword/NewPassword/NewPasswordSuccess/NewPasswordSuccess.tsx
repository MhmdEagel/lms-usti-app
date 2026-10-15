import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function NewPasswordSuccess() {
  return (
    <div className="flex flex-col items-center justify-center w-full shadow-sm">
      <Image
        src={"/images/ilustration/success.svg"}
        width={320}
        height={320}
        alt="Password Change Success"
      />
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h1 className="mb-1 text-2xl font-bold text-primary">
            Ubah Kata Sandi Berhasil
          </h1>
          <p className="mb-4 text-lg text-gray-600">
            Klik tombol di bawah ini untuk masuk.
          </p>
          <Link href="/auth/login/">
            <Button color="primary" className="w-full">
              Masuk
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
