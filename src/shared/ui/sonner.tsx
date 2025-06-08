import { Toaster as Sonner, type ToasterProps } from 'sonner';

import { useTheme } from '@/shared/lib';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();
  return (
    <Sonner
      theme={theme as 'light' | 'dark'}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
