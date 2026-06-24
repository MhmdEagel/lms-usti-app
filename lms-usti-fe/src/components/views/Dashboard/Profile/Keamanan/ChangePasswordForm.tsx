"use client";

import { useState } from "react";
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
import { Eye, EyeOff } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { changePasswordSchema } from "@/schemas/schemas";
import { Spinner } from "@/components/ui/spinner";

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

interface ChangePasswordFormProps {
  form: UseFormReturn<ChangePasswordForm>;
  isPending: boolean;
  onSubmit: (values: ChangePasswordForm) => Promise<void>;
}

export default function ChangePasswordForm({
  form,
  isPending,
  onSubmit,
}: ChangePasswordFormProps) {
  const [visibility, setVisibility] = useState({
    old_password: false,
    new_password: false,
    confirmPassword: false,
  });

  const toggleVisibility = (field: "old_password" | "new_password" | "confirmPassword") => {
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="old_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password Lama</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    className="pe-9"
                    type={visibility.old_password ? "text" : "password"}
                  />
                  <button
                    className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    onClick={() => toggleVisibility("old_password")}
                    aria-label={visibility.old_password ? "Hide password" : "Show password"}
                    aria-pressed={visibility.old_password}
                  >
                    {visibility.old_password ? (
                      <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
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
              <FormLabel>Password Baru</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    className="pe-9"
                    type={visibility.new_password ? "text" : "password"}
                  />
                  <button
                    className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    onClick={() => toggleVisibility("new_password")}
                    aria-label={visibility.new_password ? "Hide password" : "Show password"}
                    aria-pressed={visibility.new_password}
                  >
                    {visibility.new_password ? (
                      <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
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
              <FormLabel>Konfirmasi Password Baru</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    className="pe-9"
                    type={visibility.confirmPassword ? "text" : "password"}
                  />
                  <button
                    className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    onClick={() => toggleVisibility("confirmPassword")}
                    aria-label={visibility.confirmPassword ? "Hide password" : "Show password"}
                    aria-pressed={visibility.confirmPassword}
                  >
                    {visibility.confirmPassword ? (
                      <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
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
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Mengirim OTP..." : "Ubah Password"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
