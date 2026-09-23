'use client';
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
function useReturnFocus(override?: React.RefObject<HTMLElement | null>) {
  const target = React.useRef<HTMLElement | null>(null);
  return {
    onOpenAutoFocus: () => {
      target.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
    },
    onCloseAutoFocus: (event: Event) => {
      event.preventDefault();
      const element = override?.current || target.current;
      if (element?.isConnected) element.focus();
    },
  };
}
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide = false,
  busy = false,
  returnFocusRef,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
  wide?: boolean;
  busy?: boolean;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}) {
  const focus = useReturnFocus(returnFocusRef);
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(value) => !busy && onOpenChange(value)}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <DialogPrimitive.Content
          {...focus}
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            if (busy) event.preventDefault();
          }}
          className={cn(
            'fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border bg-background p-6 shadow-lg focus:outline-none',
            wide && 'max-w-3xl'
          )}
        >
          <div className="mb-6 pr-9">
            <DialogPrimitive.Title className="text-xl font-semibold tracking-tight">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </DialogPrimitive.Description>
          </div>
          {children}
          <DialogPrimitive.Close
            disabled={busy}
            className="absolute right-3 top-3 rounded-md p-2 text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <X className="size-4" />
            <span className="sr-only">Close dialog</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirm,
  busy,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  description: string;
  confirm: () => void;
  busy: boolean;
}) {
  const focus = useReturnFocus();
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={(value) => !busy && onOpenChange(value)}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <AlertDialogPrimitive.Content
          {...focus}
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg"
        >
          <AlertDialogPrimitive.Title className="text-lg font-semibold">
            {title}
          </AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description className="mt-3 text-sm leading-6 text-muted-foreground">
            {description}
          </AlertDialogPrimitive.Description>
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialogPrimitive.Cancel
              disabled={busy}
              className={buttonVariants({ variant: 'outline' })}
            >
              Cancel
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action
              disabled={busy}
              className={buttonVariants({ variant: 'destructive' })}
              onClick={(event) => {
                event.preventDefault();
                confirm();
              }}
            >
              {busy ? 'Saving…' : 'Confirm'}
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
