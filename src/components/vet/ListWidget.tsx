import * as React from "react";
import { X, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ListWidgetProps<T> {
  title: React.ReactNode;
  items: T[];
  renderItem: (item: T, index: number, isModal: boolean, closeModal: () => void) => React.ReactNode;
  emptyIcon: LucideIcon;
  emptyText: string;
  maxVisible?: number;
  modalTitle: string;
  viewAllText: (count: number) => string;
  containerClassName?: string;
  listClassName?: string;
  modalListClassName?: string;
  modalMaxWidth?: string;
}

export function ListWidget<T>({
  title,
  items = [],
  renderItem,
  emptyIcon: EmptyIcon,
  emptyText,
  maxVisible = 2,
  modalTitle,
  viewAllText,
  containerClassName = "flex flex-col h-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm",
  listClassName = "px-5 pb-5 flex flex-col gap-3 flex-1",
  modalListClassName = "px-6 py-5 overflow-y-auto flex-1 flex flex-col gap-4",
  modalMaxWidth = "sm:max-w-[600px]"
}: ListWidgetProps<T>) {
  const [showModal, setShowModal] = React.useState(false);

  const handleClose = () => setShowModal(false);

  // If empty state
  if (items.length === 0) {
    return (
      <div className={containerClassName}>
        {title}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[140px] text-[var(--color-text-muted)] gap-2 py-8">
          <EmptyIcon size={24} />
          <span className="text-sm font-medium">{emptyText}</span>
        </div>
      </div>
    );
  }

  const visibleItems = items.slice(0, maxVisible);
  const hasMore = items.length > maxVisible;

  return (
    <>
      <div className={containerClassName}>
        {title}
        
        <div className={listClassName}>
          {visibleItems.map((item, i) => renderItem(item, i, false, handleClose))}

          {hasMore && (
            <div className="pt-2 sm:pt-4 border-t-0">
              <button 
                className="text-sm font-semibold text-[var(--color-primary)] hover:underline flex items-center self-start"
                onClick={() => setShowModal(true)}
              >
                {viewAllText(items.length)} &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/40 backdrop-blur-sm sm:px-4">
          <div className={`bg-[var(--color-surface)] w-full ${modalMaxWidth} sm:mx-auto sm:rounded-2xl rounded-t-2xl flex flex-col max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200`}>
            <div className="sticky top-0 z-10 bg-[var(--color-surface)] sm:rounded-t-2xl rounded-t-2xl px-6 pt-5 pb-3 border-b border-[var(--color-border)] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--color-text)]">{modalTitle}</h2>
              <button 
                onClick={handleClose}
                className="p-1 -mr-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-bg)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className={modalListClassName}>
              {items.map((item, i) => renderItem(item, i, true, handleClose))}
            </div>
            
            <div className="sticky bottom-0 z-10 bg-[var(--color-surface)] sm:rounded-b-2xl border-t border-[var(--color-border)] p-4 flex pb-safe sm:pb-4 justify-end">
              <Button variant="outline" className="min-w-[100px]" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
