import React from 'react';

export const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const base = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base font-semibold"
  };
  const variants = {
    primary: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/20 focus:ring-orange-500",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700 focus:ring-slate-500",
    outline: "border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 focus:ring-orange-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
  };

  return (
    <button className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Card = ({ children, className = '', hover = true, ...props }) => {
  return (
    <div className={`bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl ${hover ? 'hover:border-slate-700/80 transition-all duration-200' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    info: "bg-sky-500/10 text-sky-400 border-sky-500/20"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant] || variants.default} ${className}`} {...props}>
      {children}
    </span>
  );
};

export const HeaderBar = ({ title, subtitle, badgeText }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-black text-slate-950 text-xl">
          🍕
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">{title || "Food Delivery Platform"}</h1>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {badgeText && <Badge variant="info">{badgeText}</Badge>}
    </header>
  );
};
