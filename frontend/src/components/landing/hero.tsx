export function Hero() {
  return (
    <section className="relative py-20 md:py-32 lg:py-40 px-4 bg-background overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 opacity-10 pointer-events-none">
        <div className="border-r border-border"></div>
      </div>

      <div className="container max-w-7xl mx-auto relative z-10">
        <div className="max-w-3xl">
          <div className="inline-block px-4 py-1 rounded-full bg-secondary mb-6">
            <p className="text-sm font-medium text-foreground">
              Secure your web applications
            </p>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Comprehensive Web Application Vulnerability Scanning
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
            Detect and eliminate security threats before they become breaches.
            Real-time scanning, detailed reporting, and instant remediation
            guidance for modern web applications.
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
    </section>
  );
}
