import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { Shield } from "lucide-react";
import React from "react";

type Tab = "login" | "register";

const AuthCard = () => {
  const [tab, setTab] = React.useState<Tab>("login");
  return (
    <div className="w-full max-w-[min(28rem,100%)] mx-auto">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 sm:gap-2.5 mb-6 sm:mb-8">
        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
          Money<span className="text-primary">Flow</span>
        </h1>
      </div>

      {/* Card */}
      <div className="rounded-2xl border bg-card p-5 sm:p-6 md:p-8 shadow-lg shadow-primary/5">
        {/* Tabs */}
        <div className="relative mb-6 flex rounded-lg bg-secondary p-1">
          <button
            onClick={() => setTab("login")}
            className={`relative z-10 flex-1 rounded-md py-2.5 text-sm font-semibold transition-colors ${
              tab === "login"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setTab("register")}
            className={`relative z-10 flex-1 rounded-md py-2.5 text-sm font-semibold transition-colors ${
              tab === "register"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Register
          </button>

          {/* Sliding indicator */}
          <div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-card shadow-sm transition-all duration-300 ease-out"
            style={{ left: tab === "login" ? "4px" : "calc(50% + 0px)" }}
          />
        </div>

        {/* Form */}
        <div key={tab}>
          {tab === "login" ? (
            <LoginForm onSwitchTab={() => setTab("register")} />
          ) : (
            <RegisterForm onSwitchTab={() => setTab("login")} />
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Your data is protected with 256-bit encryption
      </p>
    </div>
  );
};

export default AuthCard;
