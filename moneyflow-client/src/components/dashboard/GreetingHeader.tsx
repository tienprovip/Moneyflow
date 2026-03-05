import { TrendingUp } from "lucide-react";
import React from "react";

const GreetingHeader = () => {
  const hour = new Date().getHours();
  let greeting: string;

  if (hour < 12) {
    greeting = "Chào buổi sáng";
  } else if (hour < 18) {
    greeting = "Chào buổi chiều";
  } else {
    greeting = "Chào buổi tối";
  }

  return (
    <div className="mb-6 sm:mb-8 animate-fade-in">
      <p className="text-muted-foreground text-sm font-medium mb-1">
        {greeting}, Tiến 👋
      </p>
      <div className="flex items-end gap-2 sm:gap-4 flex-wrap">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl text-money text-foreground">
          3.500.000đ
        </h1>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+12.5%</span>
        </div>
      </div>
    </div>
  );
};

export default GreetingHeader;
