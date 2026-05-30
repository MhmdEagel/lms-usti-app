import AuthLayout from "@/components/layouts/AuthLayout/AuthLayout";

export default function AuthenticationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
