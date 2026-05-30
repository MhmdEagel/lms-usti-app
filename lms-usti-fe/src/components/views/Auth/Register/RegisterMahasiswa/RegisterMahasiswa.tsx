"use client";

import useRegister from "./useRegisterMahasiswa";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeOff } from "lucide-react";
import ErrorCard from "@/components/common/ErrorCard/ErrorCard";

export default function RegisterMahasiswa() {
  const {
    form,
    handleRegister,
    errors,
    isPending,
    visibility,
    toggleVisibility,
  } = useRegister();

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full shadow-sm py-10 px-4 lg:p-0 lg:w-1/2">
        <div className="flex max-w-lg flex-col gap-4">
          <div>
            <h1 className="mb-1 text-xl font-bold text-primary md:text-3xl">
              Register Mahasiswa
            </h1>
            <p className="text-sm text-gray-500">
              Dengan mendaftar. Anda menyetujui syarat dan ketentuan yang
              berlaku.
            </p>
          </div>
          {errors.root && <ErrorCard>{errors.root.message}</ErrorCard>}
          <Form {...form}>
            <form
              className={cn(
                "flex flex-col",
                Object.keys(errors).length > 0 ? "gap-1" : "gap-4"
              )}
              onSubmit={form.handleSubmit(handleRegister)}
            >
              <FormField
                control={form.control}
                name="fullname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          className="pe-9"
                          value={field.value ?? ""}
                          type={visibility.password ? "text" : "password"}
                        />
                        <button
                          className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10  =focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                          type="button"
                          onClick={() => toggleVisibility("password")}
                        >
                          {visibility.password ? (
                            <EyeOff
                              size={16}
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                          ) : (
                            <Eye size={16} strokeWidth={2} aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konfirmasi Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          className="pe-9"
                          value={field.value ?? ""}
                          type={
                            visibility.confirmPassword ? "text" : "password"
                          }
                        />
                        <button
                          className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10  =focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                          type="button"
                          onClick={() => toggleVisibility("confirmPassword")}
                        >
                          {visibility.confirmPassword ? (
                            <EyeOff
                              size={16}
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                          ) : (
                            <Eye size={16} strokeWidth={2} aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <p className="mb-2 text-sm">
                  Bukan Mahasiswa? Register sebagai dosen{" "}
                  <Link
                    className="font-bold text-primary hover:underline"
                    href={"/auth/register/dosen"}
                  >
                    disini
                  </Link>
                </p>
                <Button type="submit" className="w-full mb-2">
                  {isPending ? (
                    <Spinner variant="circle" color="white" />
                  ) : (
                    "Register"
                  )}
                </Button>
                <p className="text-center">
                  Sudah punya akun?{" "}
                  <Link
                    className="font-bold text-primary hover:underline"
                    href={"/auth/login"}
                  >
                    login
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </div>
        <div className="absolute left-1 top-1">
          <Image
            src={"/images/general/logo_usti_2.png"}
            alt="logo"
            width={80}
            height={80}
          />
        </div>
      </div>
      <div className="items-center justify-center hidden w-1/2 bg-blue-500 lg:flex">
        <Image
          src={"/images/ilustration/register.svg"}
          width={400}
          height={400}
          alt="login ilustration"
        />
      </div>
    </>
  );
}
