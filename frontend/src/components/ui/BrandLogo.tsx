import boraMeiLogo from "../../assets/favicon.png";
import { cn } from "../../lib/cn";

type BrandLogoProps = {
  className?: string;
};

function BrandLogo({ className }: BrandLogoProps) {
  return (
    <img
      alt="BoraMEI"
      className={cn("h-12 w-12 shrink-0 object-contain", className)}
      src={boraMeiLogo}
    />
  );
}

export default BrandLogo;
