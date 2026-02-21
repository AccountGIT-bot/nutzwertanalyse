export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="themed-bg min-h-screen">{children}</div>;
}