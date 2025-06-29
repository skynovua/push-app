import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

import { Button } from './button';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from './responsive-dialog';

interface DeleteConfirmDialogProps {
  title: string;
  description: string;
  onConfirm: () => void;
  children: React.ReactNode;
  destructive?: boolean;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  title,
  description,
  onConfirm,
  children,
  destructive = true,
}) => {
  const [open, setOpen] = React.useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>{children}</ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            {destructive ? (
              <AlertTriangle className="text-destructive h-5 w-5" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
            {title}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>{description}</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ResponsiveDialogFooter className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={handleConfirm}
            className="w-full"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Видалити
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)} className="w-full">
            Скасувати
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
