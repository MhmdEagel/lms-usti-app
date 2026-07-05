"use client";

import Image from "next/image";
import useLogin from "./useLogin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import ErrorCard from "@/components/common/ErrorCard/ErrorCard";

export default function Login() {
  const { form, errors, handleLogin, isVisible, handleVisibility, isPending } =
    useLogin();

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full shadow-sm pt-6 pb-10 px-4 lg:p-0 lg:w-1/2">
        <div
          className={cn(
            "flex max-w-lg flex-col",
            Object.keys(errors).length > 0 ? "gap-3" : "gap-4",
          )}
        >
          {errors.root && <ErrorCard>{errors.root.message}</ErrorCard>}
          <div>
            <h1 className="mb-1 text-xl font-bold text-primary md:text-3xl">
              Login
            </h1>
            <p className="text-sm text-gray-500">
              Selamat Datang! Mulai peng alaman belajar mengajar anda bersama
              USTI.
            </p>
          </div>
          <Form {...form}>
            <form
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit(handleLogin)}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        autoComplete="off"
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
                          type={isVisible ? "text" : "password"}
                        />
                        <button
                          className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10  =focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                          type="button"
                          onClick={handleVisibility}
                          aria-label={
                            isVisible ? "Hide password" : "Show password"
                          }
                          aria-pressed={isVisible}
                          aria-controls="password"
                        >
                          {isVisible ? (
                            <Eye size={16} strokeWidth={2} aria-hidden="true" />
                          ) : (
                            <EyeOff
                              size={16}
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Link
                  href={"/auth/reset-password"}
                  className="block mb-4 text-sm font-bold text-primary hover:underline w-fit"
                >
                  Lupa Password?
                </Link>
                <Button
                  disabled={isPending}
                  className="w-full mb-4"
                  type="submit"
                >
                  {isPending ? (
                    <Spinner variant="circle" color="white" />
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
            </form>
          </Form>
          <div className="bg-blue-100 p-4 rounded-lg text-blue-900">
            <div className="font-bold">Akun demo</div>
            <div className="text-sm">
              <span>dosenusti@yopmail.com</span>
              <span>: dosenusti123 (DOSEN)</span>
            </div>
            <div className="text-sm">
              <span>mahasiswausti@yopmail.com</span>
              <span>: mahasiswausti123 (MAHASISWA)</span>
            </div>
            <div className="text-sm">
              <span>proditi@yopmail.com</span>
              <span>: proditi123 (PRODI)</span>
            </div>
          </div>
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
          src={"/images/ilustration/login.svg"}
          width={400}
          height={400}
          alt="login ilustration"
        />
      </div>
    </>
  );
}
