export function Footer() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || "dev";

  return (
    <footer className="fixed bottom-1 right-2">
      <span className="text-xs text-gray-500">v{version}</span>
    </footer>
  );
}
