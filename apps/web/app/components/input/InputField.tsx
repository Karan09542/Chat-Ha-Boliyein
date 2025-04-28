"use client";

import React from "react";
import { cn } from "../../../utils/utils";
import { RegisterOptions } from "react-hook-form";

interface InputFieldProps {
  children?: React.ReactNode;
  type: string;
  name?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  className?: string;
  register?: any
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
}
const InputField: React.FC<InputFieldProps> = ({
  children,
  type,
  name,
  value,
  onChange,
  placeholder,
  className,
  register,
  onFocus
}) => {
  const [onFocusing, setOnFocusing] = React.useState(false);
  return (
    <div
      className={cn(
        ` ${
          onFocusing ? "outline outline-blue-500" : ""
        }  w-full`,
        className
      )}
    >
      <label htmlFor="" className="block">
        {placeholder}
      </label>
      <input
        key={`${name}-1`}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="outline-none"
        onFocus={(e) => {
          setOnFocusing(true)
          if(onFocus) {
            onFocus(e)
          }
        }}
        onBlur={() => setOnFocusing(false)}
        {...register} 
      />
      {children}
    </div>
  );
};

export default InputField;
