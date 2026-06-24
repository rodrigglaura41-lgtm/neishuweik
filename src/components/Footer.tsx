import React from 'react';

export function Footer() {
  return (
    <footer className="w-full bg-background border-t-2 border-border py-3">
      <div className="w-full max-w-lg mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} arandomCore </p>
      </div>
    </footer>
  );
}
