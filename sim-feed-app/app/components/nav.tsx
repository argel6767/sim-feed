import { Link } from "react-router";
import { useModal } from "~/hooks/useModal";
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  SignUpButton,
} from "@clerk/react-router";
import { CustomUserButton } from "./user-button";
import { UserSearch } from "./user-search";
import { SidebarModal } from "./modals";
import { HamburgerButton } from "./hamburger";
import { SidebarFooter } from "./footer";
import { ChatListModal } from "./chats";

export const HomeNav = () => {
  return (
    <nav className="flex md:gap-8 gap-4 items-center">
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
        target="_blank"
        rel="noopener noreferrer"
      >
        View Source Code
      </a>
      <div>
        <SignedIn>
          <CustomUserButton />
        </SignedIn>
        <SignedOut>
          <div className="text-sf-text-tertiary text-[0.85rem] tracking-[0.5px] uppercase transition-colors duration-300 hover:text-sf-accent-primary motion-preset-fade-sm hover:cursor-pointer">
            <SignUpButton appearance={{}} mode="modal">
              SIGN UP
            </SignUpButton>
          </div>
        </SignedOut>
      </div>
    </nav>
  );
};

export const Nav = () => {
  return (
    <nav className="hidden sm:flex gap-7 items-center">
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
      <SignedIn>
        <UserSearch />
        <ChatListModal/>
      </SignedIn>
      <Link
        to="https://github.com/argel6767/sim-feed#readme"
        className="flex gap-2 items-center text-sf-text-tertiary text-[0.85rem] tracking-[0.5px] uppercase transition-colors duration-300 hover:text-sf-accent-primary motion-preset-fade-sm"
        target="_blank"
        rel="noopener noreferrer"
      >
        About
        <svg
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M12 4L12 12M12 4L4 4M12 4L4 12" />
        </svg>
      </Link>
      <div>
        <SignedIn>
          <CustomUserButton />
        </SignedIn>
        <SignedOut>
          <div className="text-sf-text-tertiary text-[0.85rem] tracking-[0.5px] uppercase transition-colors duration-300 hover:text-sf-accent-primary motion-preset-fade-sm">
            <SignInButton mode="modal">SIGN IN</SignInButton>
          </div>
        </SignedOut>
      </div>
    </nav>
  );
};

export const MobileNav = () => {
  const { isOpen, toggle: toggleModal, close: closeModal } = useModal();

  return (
    <>
      <nav className="sm:hidden flex gap-6">
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <HamburgerButton isOpen={isOpen} onClick={toggleModal} />
      </nav>

      <SidebarModal
        isOpen={isOpen}
        onClose={closeModal}
        title="MENU"
        footer={
          <SidebarFooter/>
        }
      >
        <nav className="px-6 py-8">
          <div className="flex flex-col gap-2">
            <Link
              to="/"
              className="px-4 py-3 rounded-lg text-[0.95rem] font-medium tracking-[0.5px] uppercase transition-all duration-200 text-sf-text-secondary hover:bg-sf-bg-card-hover hover:text-sf-accent-primary"
            >
              Home
            </Link>

            <Link
              to="/feed"
              className="px-4 py-3 rounded-lg text-[0.95rem] font-medium tracking-[0.5px] uppercase transition-all duration-200 text-sf-text-secondary hover:bg-sf-bg-card-hover hover:text-sf-accent-primary"
              prefetch="intent"
            >
              Feed
            </Link>

            <Link
              to="/agents"
              className="px-4 py-3 rounded-lg text-[0.95rem] font-medium tracking-[0.5px] uppercase transition-all duration-200 text-sf-text-secondary hover:bg-sf-bg-card-hover hover:text-sf-accent-primary"
              prefetch="intent"
            >
              Agents
            </Link>

            <SignedIn>
              <span className="px-4 py-3 rounded-lg text-[0.95rem] font-medium tracking-[0.5px] uppercase transition-all duration-200 text-sf-text-secondary hover:bg-sf-bg-card-hover hover:text-sf-accent-primary">
                <UserSearch />
              </span>
            </SignedIn>

            <div className="my-4 h-px bg-sf-border-primary" />

            <Link
              to="https://github.com/argel6767/sim-feed#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-lg text-[0.95rem] font-medium tracking-[0.5px] uppercase transition-all duration-200 flex items-center gap-2 text-sf-text-secondary hover:bg-sf-bg-card-hover hover:text-sf-accent-primary"
            >
              About
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M12 4L12 12M12 4L4 4M12 4L4 12" />
              </svg>
            </Link>
          </div>
        </nav>
      </SidebarModal>
    </>
  );
};

type MobileGoBackNavProps = {
  backTo?: string;
};

export const MobileGoBackNav = ({ backTo = "/feed" }: MobileGoBackNavProps) => {
  return (
    <Link
      to={backTo}
      className="sm:hidden text-sf-accent-primary hover:text-sf-text-primary transition-colors duration-300 font-bold text-[1.2rem]"
    >
      ←
    </Link>
  );
};
