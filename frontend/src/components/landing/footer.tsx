import { Terminal } from "lucide-react";

export function Footer() {
  const date = new Date();
  const currentYear = date.getFullYear();

  return (
    <footer className="border-t border-accent/30 bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="terminal-border p-2">
                <Terminal className="w-5 h-5 text-accent" />
              </div>
              <span className="font-mono font-bold text-accent glow-text">
                VULNSCAN
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              Enterprise vulnerability scanning for modern web applications.
              Real-time threat detection.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-mono font-bold text-foreground mb-4 text-sm">
              &gt; PRODUCT
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground font-mono">
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  $ features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  $ security
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  $ api
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-mono font-bold text-foreground mb-4 text-sm">
              &gt; COMPANY
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground font-mono">
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  $ about
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  $ blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  $ careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  $ contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-mono font-bold text-foreground mb-4 text-sm">
              &gt; LEGAL
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground font-mono">
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  $ privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  $ terms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  $ compliance
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  $ sitemap
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-accent/30 pt-8">
          {/* Bottom section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground font-mono">
              &copy; {currentYear} VulnScan. All rights reserved. // v1.0-prod
            </p>
            <div className="flex gap-6 font-mono text-xs">
              <a
                href="#"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                twitter.com/vulnscan
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                github.com/vulnscan
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                linkedin.com/company/vulnscan
              </a>
            </div>
          </div>

          {/* System info */}
          <div className="mt-6 pt-6 border-t border-accent/20 text-center font-mono text-xs text-muted-foreground space-y-1">
            <div>&gt; SYSTEM UPTIME: 99.99%</div>
            <div>&gt; RESPONSE_TIME: &lt;200ms</div>
            <div>&gt; STATUS: OPERATIONAL</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
