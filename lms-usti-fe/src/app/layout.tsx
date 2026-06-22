import "./globals.css";
import { Metadata } from "next";
import LoadingBar from "@/components/ui/loading-bar";

export const metadata: Metadata = {
  title: {
    default: "LMS USTI",
    template: "LMS | %s",
  },
  description:
    "LMS USTI merupakan sistem manajemen pembelajaran yang dikhususkan untuk menunjang kegiatan akademik di kampus Universitas Sains Dan Teknologi Indonesia.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LoadingBar />
        {children}
      </body>
    </html>
  );
}
