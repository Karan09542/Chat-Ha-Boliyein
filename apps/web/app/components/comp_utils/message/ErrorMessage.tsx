import React from "react";
import { cn } from "../../../../utils/utils";

interface ErrorMessageProps {
  message: React.ReactNode;
  className?: string;
}
const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className }) => {
  return <div className={cn("text-red-500", className)}>{message}</div>;
};

export default ErrorMessage;
