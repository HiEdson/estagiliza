import Link from "next/link";
import { Briefcase, Heart, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold gradient-brand-text">Estagiliza</span>
          </Link>

          {/* Center */}
          <p className="text-xs text-muted-foreground text-center flex items-center gap-1.5">
            Feito com <Heart className="w-3 h-3 text-red-500 fill-red-500" /> para Angola e a CPLP
          </p>

          {/* Right */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Globe className="w-3.5 h-3.5" />
            <span>Angola · Portugal · Brasil · Moçambique</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© 2025 Estagiliza. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-foreground transition-colors">Privacidade</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Termos</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contacto</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
