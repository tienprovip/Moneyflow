import React from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

const PasswordInput = ({
  id,
  label,
  value,
  onChange,
  error,
  placeholder = "••••••••",
}: PasswordInputProps) => {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border bg-card px-4 py-3 pr-11 text-sm text-card-foreground placeholder:text-muted-foreground input-focus-ring"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="text-xs text-destructive animate-fade-in"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default PasswordInput;
