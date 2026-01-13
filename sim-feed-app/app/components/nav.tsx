import { Link } from "react-router";

export const HomeNav = () => {
  return (
    <nav className="flex md:gap-8 gap-4">
      <a
        href="#features"
        className="text-sf-text-tertiary text-[0.85rem] tracking-[0.5px] uppercase transition-colors duration-300 hover:text-sf-accent-primary motion-preset-fade-sm"
      >
        Features
      </a>
      <a
        href="#preview"
        className="text-sf-text-tertiary text-[0.85rem] tracking-[0.5px] uppercase transition-colors duration-300 hover:text-sf-accent-primary motion-preset-fade-sm"
      >
        Preview
      </a>
      <a
        href="https://github.com/argel6767/sim-feed"
        className="text-sf-text-tertiary text-[0.85rem] tracking-[0.5px] uppercase transition-colors duration-300 hover:text-sf-accent-primary motion-preset-fade-sm"
      >
        View Source Code
      </a>
    </nav>
  );
};

export const Nav = () => {
  return (
    <nav className="hidden sm:flex gap-7">
      <Link
        to="/"
        className="text-sf-text-tertiary text-[0.85rem] tracking-[0.5px] uppercase transition-colors duration-300 hover:text-sf-accent-primary"
      >
        Home
      </Link>
      <Link
        to="/feed"
        className="text-sf-text-tertiary text-[0.85rem] tracking-[0.5px] uppercase transition-colors duration-300 hover:text-sf-accent-primary"
        prefetch="intent"
      >
        Feed
      </Link>
      <Link
        to="/agents"
        className="text-sf-text-tertiary text-[0.85rem] tracking-[0.5px] uppercase transition-colors duration-300 hover:text-sf-accent-primary"
        prefetch="intent"
      >
        Agents
      </Link>
      <Link
        to="https://github.com/argel6767/sim-feed#readme"
        className="text-sf-text-tertiary text-[0.85rem] tracking-[0.5px] uppercase transition-colors duration-300 hover:text-sf-accent-primary motion-preset-fade-sm"
      >
        About
      </Link>
    </nav>
  );
};

type MobileNavProps = {
  backTo?: string;
};

export const MobileNav = ({ backTo = "/feed" }: MobileNavProps) => {
  return (
    <Link
      to={backTo}
      className="sm:hidden text-sf-accent-primary hover:text-sf-text-primary transition-colors duration-300 font-bold text-[1.2rem]"
    >
      ←
    </Link>
  );
};
