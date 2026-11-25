
import { useState } from "react";
import { UserRound, LogOut, ChevronDown, X } from "lucide-react";

export type PlannixUser = {
  name: string;
  email: string;
};

type UserProfileMenuProps = {
  user: PlannixUser;
  onLogout: () => void;
};

function UserProfileMenu({ user, onLogout }: UserProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const firstLetter = user.name.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-[#f1f5ef]"
        aria-label="Open user profile"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dce9dc] font-semibold text-[#355b43]">
          {firstLetter}
        </div>
        <ChevronDown size={15} className="text-[#809184]" />
      </button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
            aria-label="Close profile menu"
          />

          <div className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-[#e6ece4] bg-white shadow-xl shadow-[#294436]/10">
            <div className="flex items-start justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dce9dc] text-lg font-bold text-[#355b43]">
                  {firstLetter}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-[#294436]">
                    {user.name}
                  </h3>
                  <p className="truncate text-xs text-[#89978c]">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-[#89978c] hover:bg-[#f3f6f1]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="border-t border-[#edf1eb] px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-[#607365]">
                <UserRound size={16} />
                <span>Personal account</span>
              </div>
            </div>

            <div className="border-t border-[#edf1eb] p-2">
              <button
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UserProfileMenu;
