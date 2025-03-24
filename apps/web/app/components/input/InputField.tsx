"use client";

import React from "react";
import { cn } from "../../../utils/utils";

interface InputFieldProps {
  children: React.ReactNode;
  type: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  className?: string;
}
const InputField: React.FC<InputFieldProps> = ({
  children,
  type,
  name,
  value,
  onChange,
  placeholder,
  className,
}) => {
  const [onFocus, setOnFocus] = React.useState(false);
  return (
    <div
      className={cn(
        ` ${onFocus ? "outline outline-blue-500" : ""}  w-full`,
        className
      )}
    >
      <label htmlFor="" className="block">
        {placeholder}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="outline-none"
        onFocus={() => setOnFocus(true)}
        onBlur={() => setOnFocus(false)}
      />
      {children}
    </div>
  );
};

export default InputField;
