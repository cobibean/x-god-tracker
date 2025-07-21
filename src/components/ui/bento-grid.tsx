import { ReactNode } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[280px]",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  children,
}: {
  name: string;
  className: string;
  background: ReactNode;
  Icon: React.ComponentType<{ className?: string }>;
  description: string;
  href: string;
  cta: string;
  children?: ReactNode;
}) => (
  <div
    key={name}
    className={cn(
      "group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg",
      className,
    )}
  >
    <div className="absolute inset-0">{background}</div>
    
    <div className="relative z-10 flex transform-gpu flex-col gap-2 p-6 transition-all duration-300 group-hover:-translate-y-2">
      <Icon className="h-8 w-8 origin-left transform-gpu text-muted-foreground transition-all duration-300 ease-in-out group-hover:scale-110" />
      <h3 className="text-lg font-semibold text-foreground">
        {name}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
    
    {children && (
      <div className="relative z-20 flex-1 overflow-hidden">
        {children}
      </div>
    )}

    <div
      className={cn(
        "relative z-30 p-4 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
      )}
    >
      <Button variant="ghost" asChild size="sm" className="w-full justify-between">
        <a href={href}>
          {cta}
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
    
    <div className="absolute inset-0 bg-gradient-to-t from-background/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
  </div>
);

export { BentoCard, BentoGrid }; 