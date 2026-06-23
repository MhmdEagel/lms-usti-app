"use client";
import Image from "next/image";
import useNewVerification from "./useActivation";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Activation() {
  const { success, error } = useNewVerification();
  return (
    <div className="flex flex-col items-center justify-center w-full">
      {!success && !error && (
        <Spinner className="text-primary" size={200} variant="circle" />
      )}

      {error && (
        <div>
          <p className="mx-auto mb-4 w-fit text-red-500">{error}</p>
          <h1 className="mb-4 text-xl md:text-2xl">Silahkan hubungi admin untuk mendapatkan akun baru.</h1>
        </div>
      )}
      {success && (
        <>
          <Image
            className="mx-auto"
            src={"/images/ilustration/success.svg"}
            width={300}
            height={400}
            alt="Verification Ilustration"
          />
          <div className="flex flex-col gap-8">
            <div className="text-center">
              <h1 className="mb-1 text-2xl md:text-3xl font-bold text-blue-600">
                Aktivasi Email Berhasil
              </h1>
              <p className="mb-4 text-base md:text-lg text-gray-600">
                Klik tombol di bawah ini untuk login.
              </p>
              <Link href="/auth/login">
                <Button className="w-full">Login</Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
