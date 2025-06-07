import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useT } from '../hooks/useTranslation';
import { useWorkoutData } from '../hooks/useWorkoutData';
import { useToast } from '../utils/toast';
import type { ImportResult } from '../types';

interface ImportDialogProps {
  trigger?: React.ReactNode;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({ trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const t = useT();
  const { importData } = useWorkoutData();
  const { addToast } = useToast();

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Перевіряємо тип файлу
    if (!file.name.endsWith('.json')) {
      addToast({
        type: 'error',
        title: t.settings.importError,
        description: t.settings.importInvalidFile
      });
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const result = await importData(file);
      setImportResult(result);

      if (result.success) {
        addToast({
          type: 'success',
          title: t.settings.importSuccess,
          description: `${result.imported} ${t.settings.importSessionsAdded}${result.duplicates > 0 ? `, ${result.duplicates} ${t.settings.importDuplicates}` : ''}`
        });
      } else {
        addToast({
          type: 'error',
          title: t.settings.importError,
          description: result.errors.join(', ')
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: t.settings.importError,
        description: `${error}`
      });
    } finally {
      setImporting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    setIsOpen(false);
    setImportResult(null);
    setDragOver(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {t.settings.importData}
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t.settings.importData}
          </DialogTitle>
          <DialogDescription>
            {t.settings.importDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Зона для перетягування файлів */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Перетягніть JSON файл сюди або
            </p>
            <Button 
              variant="outline" 
              onClick={openFileDialog}
              disabled={importing}
            >
              {importing ? 'Імпортування...' : t.settings.importButton}
            </Button>
          </div>

          {/* Результат імпорту */}
          {importResult && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  {importResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-2">
                    <h4 className="font-medium">
                      {t.settings.importResults}
                    </h4>
                    
                    {importResult.success ? (
                      <div className="space-y-1">
                        <div className="flex gap-2">
                          <Badge variant="secondary">
                            {importResult.imported} {t.settings.importSessionsAdded}
                          </Badge>
                          {importResult.duplicates > 0 && (
                            <Badge variant="outline">
                              {importResult.duplicates} {t.settings.importDuplicates}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {importResult.errors.map((error, index) => (
                          <p key={index} className="text-sm text-red-600">
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Приховане поле для вибору файлу */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              {t.common.close}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
