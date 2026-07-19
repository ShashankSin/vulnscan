import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";
import LinkComponent from "../ui/Link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-accent/30 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="terminal-border p-2">
            <Terminal className="w-5 h-5 text-accent glow-accent" />
          </div>
          <LinkComponent
            href="/"
            className="font-mono font-bold text-lg text-accent glow-text"
          >
            VULNSCAN v1.0
          </LinkComponent>
          <span className="text-xs text-muted-foreground ml-2">
            // SYS.ONLINE
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 font-mono text-sm">
          <a
            href="#features"
            className="text-muted-foreground hover:text-accent transition-colors hover:glow-text"
          >
            &gt; features
          </a>
          <a
            href="#benefits"
            className="text-muted-foreground hover:text-accent transition-colors hover:glow-text"
          >
            &gt; stats
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <LinkComponent href="/login">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-mono text-xs">
              LOGIN
            </Button>
          </LinkComponent>
          <LinkComponent href="/register">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-mono text-xs">
              SIGNUP
            </Button>
          </LinkComponent>
        </div>
      </div>
    </header>
  );
}
