import { useState } from "react";

export const useProfileContent = () => {
  const [isActive, setIsActive] = useState(
    "Data Diri"
  );
  const handleActiveBar = (identifier: string) => {
    setIsActive(identifier);
  };

  return {handleActiveBar, isActive};
};
