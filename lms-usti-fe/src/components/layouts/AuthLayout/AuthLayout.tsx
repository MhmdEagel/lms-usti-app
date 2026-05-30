import { ReactNode } from "react";

interface PropTypes {
  children: ReactNode;
}

export default async function AuthLayout(props: PropTypes) {
  const { children } = props;
  return (
    <div className="min-w-screen flex min-h-screen px-4 py-24 lg:p-0">
      {children}
    </div>
  );
}
