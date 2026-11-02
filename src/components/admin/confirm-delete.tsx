"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useI18n } from "@/lib/i18n";

export function ConfirmDelete({
  onConfirm,
  title,
  description,
  children,
  testId = "confirm-delete-trigger",
}: {
  onConfirm: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  testId?: string;
}) {
  const { t } = useI18n();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="rounded-none">
        <AlertDialogHeader>
          <AlertDialogTitle data-testid="confirm-delete-title">{title ?? t("admin.confirmDelete.title")}</AlertDialogTitle>
          <AlertDialogDescription data-testid="confirm-delete-description">
            {description ?? t("admin.confirmDelete.body")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="confirm-delete-cancel">{t("theme.system") === "Sistem" ? "Batal" : "Cancel"}</AlertDialogCancel>
          <AlertDialogAction
            data-testid="confirm-delete-confirm"
            onClick={onConfirm}
            className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t("cart.remove")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
