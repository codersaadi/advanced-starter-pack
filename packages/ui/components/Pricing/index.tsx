'use client';

import NumberFlow from '@number-flow/react';
import { buttonVariants } from '@repo/ui/components/ui/button';
import { Label } from '@repo/ui/components/ui/label';
import { Switch } from '@repo/ui/components/ui/switch';
import { useMediaQuery } from '@repo/ui/hooks/use-media-query';
import { cn } from '@repo/ui/lib/utils';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = 'Simple, Transparent Pricing',
  description = 'Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.',
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: [
          'hsl(var(--primary))',
          'hsl(var(--accent))',
          'hsl(var(--secondary))',
          'hsl(var(--muted))',
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ['circle'],
      });
    }
  };

  return (
    <div className="container py-20">
      <div className="mb-12 space-y-4 text-center">
        <h2 className="font-bold text-4xl tracking-tight sm:text-5xl">
          {title}
        </h2>
        <p className="whitespace-pre-line text-lg text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mb-10 flex justify-center">
        {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
        <label className="relative inline-flex cursor-pointer items-center">
          <Label>
            <Switch
              ref={switchRef}
              checked={!isMonthly}
              onCheckedChange={handleToggle}
              className="relative"
            />
          </Label>
        </label>
        <span className="ml-2 font-semibold">
          Annual billing <span className="text-primary">(Save 20%)</span>
        </span>
      </div>

      <div className="sm:2 grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 1 }}
            whileInView={
              isDesktop
                ? {
                    y: plan.isPopular ? -20 : 0,
                    opacity: 1,
                    x: index === 2 ? -30 : index === 0 ? 30 : 0,
                    scale: index === 0 || index === 2 ? 0.94 : 1.0,
                  }
                : {}
            }
            viewport={{ once: true }}
            transition={{
              duration: 1.6,
              type: 'spring',
              stiffness: 100,
              damping: 30,
              delay: 0.4,
              opacity: { duration: 0.5 },
            }}
            className={cn(
              'relative rounded-2xl border-[1px] bg-background p-6 text-center lg:flex lg:flex-col lg:justify-center',
              plan.isPopular ? 'border-2 border-primary' : 'border-border',
              'flex flex-col',
              !plan.isPopular && 'mt-5',
              index === 0 || index === 2
                ? '-translate-z-[50px] z-0 translate-x-0 translate-y-0 rotate-y-[10deg] transform'
                : 'z-10',
              index === 0 && 'origin-right',
              index === 2 && 'origin-left'
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 flex items-center rounded-tr-xl rounded-bl-xl bg-primary px-2 py-0.5">
                <Star className="h-4 w-4 fill-current text-primary-foreground" />
                <span className="ml-1 font-sans font-semibold text-primary-foreground">
                  Popular
                </span>
              </div>
            )}
            <div className="flex flex-1 flex-col">
              <p className="font-semibold text-base text-muted-foreground">
                {plan.name}
              </p>
              <div className="mt-6 flex items-center justify-center gap-x-2">
                <span className="font-bold text-5xl text-foreground tracking-tight">
                  <NumberFlow
                    value={
                      isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)
                    }
                    format={{
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }}
                    transformTiming={{
                      duration: 500,
                      easing: 'ease-out',
                    }}
                    willChange
                    className="font-variant-numeric: tabular-nums"
                  />
                </span>
                {plan.period !== 'Next 3 months' && (
                  <span className="font-semibold text-muted-foreground text-sm leading-6 tracking-wide">
                    / {plan.period}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground text-xs leading-5">
                {isMonthly ? 'billed monthly' : 'billed annually'}
              </p>

              <ul className="mt-5 flex flex-col gap-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="text-left">{feature}</span>
                  </li>
                ))}
              </ul>

              <hr className="my-4 w-full" />

              <Link
                href={plan.href}
                className={cn(
                  buttonVariants({
                    variant: 'outline',
                  }),
                  'group relative w-full gap-2 overflow-hidden font-semibold text-lg tracking-tighter',
                  'transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-1',
                  plan.isPopular
                    ? 'bg-primary text-sky-500'
                    : 'bg-background text-foreground'
                )}
              >
                {plan.buttonText}
              </Link>
              <p className="mt-6 text-muted-foreground text-xs leading-5">
                {plan.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
