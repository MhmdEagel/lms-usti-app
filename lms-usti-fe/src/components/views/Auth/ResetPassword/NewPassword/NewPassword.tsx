"use client";

import Image from "next/image";
import useNewPasswordForm from "./useNewPassword";
import { cn } from "@/lib/utils";
import ErrorCard from "@/components/common/ErrorCard/ErrorCard";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeOff } from "lucide-react";

export default function NewPassword() {
  const {
    handleNewPassword,
    errors,
    form,
    isPending,
    visibility,
    toggleVisibility,
  } = useNewPasswordForm();

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full shadow-sm pt-6 pb-10 px-4 lg:p-0 lg:w-1/2">
        <div
          className={cn(
            "flex max-w-lg flex-col sm:min-w-md lg:min-w-lg",
            Object.keys(errors).length > 0 ? "gap-4" : "gap-8"
          )}
        >
          {errors.root && <ErrorCard>{errors.root.message}</ErrorCard>}
          <div>
            <h1 className="mb-1 text-xl font-bold text-primary md:text-3xl">
              Reset Password
            </h1>
            <p className="text-sm text-gray-500">Masukkan password baru anda.</p>
          </div>
          <Form {...form}>
            <form
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit(handleNewPassword)}
            >
              <FormField
                control={form.control}
                name="old_password"
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
                name="new_password"
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

              <Button className="w-full mb-4" type="submit">
                {isPending ? (
                  <Spinner variant="circle" color="white" />
                ) : (
                  "Submit"
                )}
              </Button>
              <Link
                className="font-bold text-primary hover:underline text-center"
                href={"/auth/login"}
              >
                Kembali ke login
              </Link>
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
          src={"/images/ilustration/reset-password.svg"}
          width={400}
          height={400}
          alt="login ilustration"
        />
      </div>
    </>
  );
}
