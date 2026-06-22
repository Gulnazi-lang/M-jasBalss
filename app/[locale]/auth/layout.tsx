export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-layout-screen fixed inset-0 z-50 overflow-y-auto bg-screen">
      {children}
    </div>
  )
}