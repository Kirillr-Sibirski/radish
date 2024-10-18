import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  buttonText: string;
  onClick: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, buttonText, onClick, ...props }, ref) => {
    return (
      <div className="flex flex-row h-10 w-full px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background">
        <input
          type={type}
          className={cn(
            "h-full bg-background rounded-sm",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-[1px] focus-visible:ring-input focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          {...props}
        />
        <div className="h-full w-[1px] bg-input rounded-md mx-2" />
        <button className="font-semibold" onClick={onClick}>
          {buttonText}
        </button>
      </div>
    );
  },
);
Input.displayName = "InputInlineButton";

export { Input as InputIB };
