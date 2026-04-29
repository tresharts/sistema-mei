import { NavLink } from "react-router-dom";
import { cn } from "../../lib/cn";
import { APP_NAVIGATION } from "../../lib/constants";
import AppIcon from "../ui/AppIcon";

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md rounded-t-[3rem] border-t border-on-surface/10 bg-background px-4 pb-6 pt-3 shadow-[0_-8px_24px_rgba(52,50,47,0.06)] lg:hidden">
      <ul className="flex items-center justify-around gap-2">
        {APP_NAVIGATION.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center rounded-full px-4 py-2 text-[11px] font-medium transition",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface/50 hover:bg-primary/5 hover:text-on-surface",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <AppIcon
                    className="h-5 w-5"
                    filled={isActive}
                    name={item.icon}
                  />
                  <span className="mt-1 font-body">{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default BottomNav;
