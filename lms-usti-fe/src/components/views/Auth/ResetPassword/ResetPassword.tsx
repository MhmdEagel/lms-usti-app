"use client";

import Image from "next/image";
import Link from "next/link";
import useResetPassword from "./useResetPassword";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import ErrorCard from "@/components/common/ErrorCard/ErrorCard";

export default function ResetPassword() {
  const { handleResetPassword, errors, form, isPending } = useResetPassword();

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
            <p className="text-sm text-gray-500">Masukkan email anda.</p>
          </div>
          <Form {...form}>
            <form
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit(handleResetPassword)}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
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
          width={480}
          height={480}
          alt="login ilustration"
        />
      </div>
    </>
  );
}
