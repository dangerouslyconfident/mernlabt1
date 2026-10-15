import GlassButton from './GlassButton';

/**
 * Reusable Glassmorphism Navbar Component
 * Minimal Apple-style navigation bar with frosted glass effect and responsive controls.
 *
 * @param {Object} props
 * @param {string} [props.activeTab='lab1'] - Currently active lab tab
 * @param {Function} [props.onSelectTab] - Callback when lab tab is clicked
 * @param {Object|null} [props.customer] - Authenticated customer data
 * @param {Function} [props.onLogout] - Logout handler
 * @param {boolean} [props.isLoggingOut=false] - Logout loading state
 */
export default function Navbar({
  activeTab = 'lab1',
  onSelectTab = () => {},
  customer = null,
  onLogout = () => {},
  isLoggingOut = false,
}) {
  const labs = [
    { id: 'lab1', name: 'Lab 1', label: 'Auth Service', active: true },
    { id: 'lab2', name: 'Lab 2', label: 'Products', active: false },
    { id: 'lab3', name: 'Lab 3', label: 'Cart', active: false },
    { id: 'lab4', name: 'Lab 4', label: 'Wishlist', active: false },
    { id: 'lab5', name: 'Lab 5', label: 'Orders', active: false },
  ];

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6 w-full max-w-6xl mx-auto transition-all duration-300">
      <nav className="flex items-center justify-between px-5 py-3.5 rounded-3xl bg-zinc-950/50 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-base shadow-md shadow-indigo-500/25">
            S
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white">
                ShopKart
              </span>
              <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-white/[0.08] text-zinc-300 border border-white/[0.06]">
                Lab Series
              </span>
            </div>
          </div>
        </div>

        {/* Labs Tab Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-2xl border border-white/[0.05]">
          {labs.map((lab) => {
            const isSelected = activeTab === lab.id;
            return (
              <button
                key={lab.id}
                onClick={() => onSelectTab(lab.id)}
                disabled={!lab.active}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                    : lab.active
                    ? 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                    : 'text-zinc-600 cursor-not-allowed opacity-60'
                }`}
              >
                <span>{lab.name}</span>
                <span className="ml-1.5 opacity-60 text-[11px] font-normal">
                  {lab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* User / Session Area */}
        <div className="flex items-center gap-2.5">
          {customer ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-medium text-zinc-200 leading-tight">
                  {customer.fullName}
                </span>
                <span className="text-[11px] text-zinc-400 leading-tight truncate max-w-[140px]">
                  {customer.email}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-xs font-semibold text-indigo-300">
                {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <GlassButton
                variant="danger"
                size="sm"
                onClick={onLogout}
                isLoading={isLoggingOut}
              >
                Logout
              </GlassButton>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                API Online
              </span>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
