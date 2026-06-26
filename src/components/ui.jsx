// Shared neutral-minimal design system.
// Single barrel file so pages import one place: import { Card, Button, ... } from "../components/ui";

const cn = (...parts) => parts.filter(Boolean).join(" ");

/* ----------------------------------------------------------- Card */
export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-xl shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* --------------------------------------------------------- Button */
const BUTTON_VARIANTS = {
  primary:
    "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300",
  secondary:
    "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 disabled:opacity-50",
};

const BUTTON_SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------- Badge */
const BADGE_VARIANTS = {
  neutral: "bg-slate-100 text-slate-600 border-slate-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
};

export function Badge({ variant = "neutral", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        BADGE_VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

/* ---------------------------------------------------------- Input */
export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200",
        className
      )}
      {...props}
    />
  );
}

/* --------------------------------------------------------- Select */
export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

/* ----------------------------------------------------------- Field */
// label + control wrapper for consistent form spacing.
export function Field({ label, children, className }) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

/* -------------------------------------------------------- StatCard */
const STAT_ACCENTS = {
  neutral: "text-slate-900",
  debit: "text-rose-600",
  credit: "text-emerald-600",
  matched: "text-emerald-600",
  unmatched: "text-rose-600",
};

export function StatCard({ label, value, accent = "neutral" }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={cn("mt-2 text-2xl font-bold", STAT_ACCENTS[accent])}>
        {value}
      </p>
    </Card>
  );
}

/* ------------------------------------------------------ EmptyState */
export function EmptyState({ icon = "📄", title, subtitle }) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="text-5xl">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold text-slate-700">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

/* --------------------------------------------------------- Spinner */
export function Spinner({ className }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700",
        className
      )}
    />
  );
}

/* ------------------------------------------------------ TabButton */
export function TabButton({ active, children, ...props }) {
  return (
    <button
      className={cn(
        "border-b-2 px-4 py-2.5 text-sm font-medium transition",
        active
          ? "border-slate-900 text-slate-900"
          : "border-transparent text-slate-500 hover:text-slate-700"
      )}
      {...props}
    >
      {children}
    </button>
  );
}
