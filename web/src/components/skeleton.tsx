import { useTheme } from "@/providers/theme-provider";
import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement>;

export const Skeleton = ({ style, className, ...props }: Props) => {
  const { colors } = useTheme();

  return (
    <div
      className={`skeleton-loader ${className}`}
      style={{
        backgroundColor: colors.border,
        ...style,
      }}
      {...props}
    />
  );
};
