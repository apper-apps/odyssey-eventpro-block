import React from "react";
import Label from "@/components/atoms/Label";
import Input from "@/components/atoms/Input";
import { cn } from "@/utils/cn";

const FormField = ({ 
  label, 
  error, 
  className,
  children,
  ...props 
}) => {
  return (
    <div className={cn("space-y-1", className)}>
      {label && <Label>{label}</Label>}
      {children || <Input {...props} />}
      {error && (
        <p className="text-sm text-error mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormField;