import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export const Button = ({ variant = 'primary', className = '', ...props }: ButtonProps) => {
    const variants = {
        primary: "btn-premium",
        secondary: "px-6 py-3 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all font-bold uppercase tracking-widest text-xs",
        danger: "px-6 py-3 bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-500 hover:text-white transition-all font-bold uppercase tracking-widest text-xs",
        ghost: "px-4 py-2 bg-transparent text-zinc-500 hover:text-yellow-500 transition-all font-bold uppercase tracking-widest text-[10px]"
    };

    return (
        <button className={`${variants[variant]} ${className} disabled:opacity-50`} {...props} />
    );
};
