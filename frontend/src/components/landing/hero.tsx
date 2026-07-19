export function Hero() {
  return (
    <section className="py-20 md:py-28 lg:py-32 px-4 bg-background overflow-hidden">
      <div className=" z-10">
        <div className=" container max-w-7xl mx-auto px-4">
          {/* Status line */}
          <div className="font-mono text-xs text-muted-foreground mb-8">
            <span className="inline-block terminal-border px-3 py-1">
              &gt; SYSTEM INITIALIZED...
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8 leading-tight font-mono">
            <span className="glow-text">&gt; INITIATE</span>
            <br />
            <span className="glow-accent">VULNERABILITY</span>
            <br />
            <span className="glow-text">SCAN</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl font-mono">
            $ scan --target=&quot;your-domain.com&quot; --deep
            <br />
            Real-time threat detection, detailed security analysis, instant
            remediation guidance.
          </p>

          {/* Scanning activity visualization */}
          <div className="mb-12 font-mono text-sm space-y-2 text-accent/70">
            <div className="flex items-center gap-2">
              <span className="text-accent animate-pulse">■</span>
              <span>Initializing scanning module...</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent/50">■</span>
              <span>Connecting to detection engine...</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent/30">■</span>
              <span>Ready for execution</span>
            </div>
          </div>

          {/* Footer text */}
          <p className="text-xs text-muted-foreground font-mono">
            // No credit card required • Full feature access • 30-day trial
          </p>
        </div>
      </div>
    </section>
  );
}
