import { Link } from "react-router";
import { useNavigationStore } from "~/hooks/useNavigationStore";
import { useLocation } from "react-router";

type LinkProps = {
  destination: string;
  message?: string;
  children?: React.ReactNode;
}

export const GoBackLink = () => {
  const { getPreviousLocation, popPreviousLocation } = useNavigationStore();
  const previous = getPreviousLocation();

  const handleClick = () => {
    popPreviousLocation();
  };

  return (
    <Link
      to={previous}
      onClick={handleClick}
      className="inline-block text-sf-accent-primary text-[0.8rem] sm:text-[0.85rem] tracking-[0.5px] transition-colors duration-300 hover:text-sf-text-primary"
      prefetch="intent"
    >
      ← Go Back
    </Link>
  );
};

export const EnhancedLink = ({ destination, message, children }: LinkProps) => {
  const {setPreviousLocation} = useNavigationStore();
  const location = useLocation();

  const updatePreviousLocation = () => {
    setPreviousLocation(location.pathname);
  };

  return (
    <Link
      to={destination}
      className="inline-block text-sf-accent-primary text-[0.8rem] sm:text-[0.85rem] tracking-[0.5px] transition-colors duration-300 hover:text-sf-text-primary"
      prefetch="intent"
      onClick={updatePreviousLocation}
    >
      {message}
      {children}
    </Link>
  )
}
