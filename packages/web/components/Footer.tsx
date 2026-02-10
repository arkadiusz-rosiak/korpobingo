export function Footer() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || "dev";

  return (
    <footer className="text-center py-2">
      <span className="text-xs text-gray-400">v{version}</span>
    </footer>
  );
}
