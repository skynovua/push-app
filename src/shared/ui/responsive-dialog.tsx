'use client';

import * as React from 'react';

import { useMediaQuery } from '@/shared/lib';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer';

/**
 * Responsive Dialog Props
 * Combines Dialog and Drawer functionality for responsive design
 */
interface ResponsiveDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Responsive Dialog Root Component
 * Renders Dialog on desktop and Drawer on mobile
 */
function ResponsiveDialog({ children, ...props }: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return <Dialog {...props}>{children}</Dialog>;
  }

  return <Drawer {...props}>{children}</Drawer>;
}

/**
 * Responsive Dialog Trigger
 * Works for both Dialog and Drawer
 */
function ResponsiveDialogTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogTrigger>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <DialogTrigger className={className} {...props}>
        {children}
      </DialogTrigger>
    );
  }

  return (
    <DrawerTrigger className={className} {...props}>
      {children}
    </DrawerTrigger>
  );
}

/**
 * Responsive Dialog Content
 * Adapts content container for mobile and desktop
 */
interface ResponsiveDialogContentProps extends React.ComponentProps<typeof DialogContent> {
  className?: string;
}

function ResponsiveDialogContent({ className, children, ...props }: ResponsiveDialogContentProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <DialogContent className={className} {...props}>
        {children}
      </DialogContent>
    );
  }

  return (
    <DrawerContent className={className} {...props}>
      <div className="mx-auto w-full max-w-sm">{children}</div>
    </DrawerContent>
  );
}

/**
 * Responsive Dialog Header
 * Adapts header styling for mobile and desktop
 */
function ResponsiveDialogHeader({
  className,
  ...props
}: React.ComponentProps<typeof DialogHeader>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return <DialogHeader className={className} {...props} />;
  }

  return <DrawerHeader className={className} {...props} />;
}

/**
 * Responsive Dialog Title
 * Adapts title styling for mobile and desktop
 */
function ResponsiveDialogTitle({ className, ...props }: React.ComponentProps<typeof DialogTitle>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return <DialogTitle className={className} {...props} />;
  }

  return <DrawerTitle className={className} {...props} />;
}

/**
 * Responsive Dialog Description
 * Adapts description styling for mobile and desktop
 */
function ResponsiveDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return <DialogDescription className={className} {...props} />;
  }

  return <DrawerDescription className={className} {...props} />;
}

/**
 * Responsive Dialog Footer
 * Only used for Drawer on mobile
 */
function ResponsiveDialogFooter({
  className,
  ...props
}: React.ComponentProps<typeof DrawerFooter>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return <div className={className} {...props} />;
  }

  return <DrawerFooter className={className} {...props} />;
}

/**
 * Responsive Dialog Close
 * Adapts close functionality for mobile and desktop
 */
function ResponsiveDialogClose({ className, ...props }: React.ComponentProps<typeof DrawerClose>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    // For Dialog, we don't need explicit close as it has built-in X button
    return null;
  }

  return <DrawerClose className={className} {...props} />;
}

export {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
};
