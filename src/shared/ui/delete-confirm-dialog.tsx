import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {destructive ? (
              <AlertTriangle className="text-destructive h-5 w-5" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Скасувати
          </Button>
          <Button variant={destructive ? 'destructive' : 'default'} onClick={handleConfirm}>
            <Trash2 className="mr-2 h-4 w-4" />
            Видалити
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
