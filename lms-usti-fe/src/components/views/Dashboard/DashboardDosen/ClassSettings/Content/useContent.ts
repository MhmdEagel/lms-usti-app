import { useState } from "react";

export const useContent = () => {
  const [isActive, setIsActive] = useState(
    "Detail"
  );
  const handleActiveBar = (identifier: string) => {
    setIsActive(identifier);
  };

  return {handleActiveBar, isActive};
};
