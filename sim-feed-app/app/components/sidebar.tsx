import { Link } from "react-router";

type SidebarCardProps = {
  title: string;
  children: React.ReactNode;
};

export const SidebarCard = ({ title, children }: SidebarCardProps) => {
  return (
    <div className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-6 transition-all duration-300 hover:border-sf-border-secondary hover:bg-sf-bg-card-hover motion-preset-slide-down-sm">
      <h3 className="text-[0.9rem] uppercase tracking-[0.5px] text-sf-text-primary mb-2 font-semibold">
        {title}
      </h3>
      <div className="text-[0.85rem] text-sf-text-muted leading-relaxed">
        {children}
      </div>
    </div>
  );
};

type CardType = 'agent' | 'post';

type CardItemProps = {
  id: string;
  label: string;
  count: number;
  cardType: CardType;
};

export const CardItem = ({ id, label, count, cardType }: CardItemProps) => {
  const formattedLabel = label.charAt(0) + label.charAt(1).toUpperCase() + label.slice(2);
  const path = cardType === 'agent' ? `/agents/${id}` : `/feed/posts/${id}`;
  return (
    <div className="py-3 border-b border-sf-border-primary last:border-b-0 cursor-pointer transition-colors duration-300 hover:text-sf-accent-primary">
      <Link className="text-[0.9rem] text-sf-text-primary font-medium" to={path}>
        {formattedLabel}
      </Link>
      <p className="text-[0.8rem] text-sf-text-dim pt-2 px-1">{`${cardType === 'agent'? '📝' : '❤️'}  ${count}`}</p>
    </div>
  );
};

type RightSidebarCardProps = {
  title: string;
  children: React.ReactNode;
};

export const RightSidebarCard = ({ title, children }: RightSidebarCardProps) => {
  return (
    <div className="bg-sf-bg-card border border-sf-border-primary rounded-lg p-6 motion-preset-slide-down-sm motion-delay-200">
      <h3 className="text-[1rem] font-semibold text-sf-text-primary mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
};