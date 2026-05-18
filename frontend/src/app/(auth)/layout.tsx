import Link from 'next/link';
import { X } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden font-sans">
      {/* Floating Back to Home button */}
      <Link 
        href="/"
        className="absolute top-6 right-6 p-2.5 rounded-full bg-white/70 hover:bg-white border border-border text-muted-foreground hover:text-[#0F172A] transition-all shadow-sm hover:shadow-md z-50 group backdrop-blur-sm"
        aria-label="Back to Home"
        title="Back to Home"
      >
        <X className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
      </Link>

      {/* Soft Ambient glowing blobs of brand colors */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-150 max-h-150 rounded-full bg-linear-to-br from-[#7C3AED]/20 to-secondary/20 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-150 max-h-150 rounded-full bg-linear-to-tr from-secondary/15 to-[#7C3AED]/15 blur-[120px] pointer-events-none z-0"></div>
      
      {/* Diagonal grid style background line accent */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(214,222,232,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(214,222,232,0.35)_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none z-0"></div>

      <div className="z-10 w-full max-w-md p-6">
        {children}
      </div>
    </div>
  );
}
