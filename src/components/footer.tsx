export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <p className="text-xs text-muted-foreground">
          &copy; {year} Reawon Studio
        </p>
        <p className="text-xs text-muted-foreground/60">
          Reafile v1.0
        </p>
      </div>
    </footer>
  );
}
