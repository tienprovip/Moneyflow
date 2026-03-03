import AuthCard from "@/components/auth/AuthCard";
import financeIllustration from "@/assets/finance-illustration.png";

const AuthPage = () => {
  return (
    <main className="min-h-svh auth-gradient flex flex-col lg:flex-row">
      {/* Auth section */}
      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12 md:px-8">
        <AuthCard />
      </div>

      {/* Illustration panel — tablet shows compact, desktop full */}
      <div className="hidden md:flex lg:flex-1 items-center justify-center bg-accent/40 px-6 py-8 lg:p-12">
        <div className="max-w-xs lg:max-w-sm text-center space-y-4 lg:space-y-6 animate-fade-in">
          <img
            src={financeIllustration}
            alt="Secure personal finance illustration with wallet, chart, and shield"
            className="mx-auto w-40 h-40 lg:w-64 lg:h-64 object-contain"
            loading="lazy"
          />
          <h2 className="text-lg lg:text-xl font-bold text-foreground">
            Take control of your finances
          </h2>
          <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed">
            Track spending, set budgets, and grow your wealth — all in one
            secure place.
          </p>
        </div>
      </div>
    </main>
  );
};

export default AuthPage;
