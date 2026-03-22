"use client";

import React from "react";
import { Modal, Button, Group } from "@mantine/core";
import Logo from "../common/Logo";

interface ConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  zIndex?: number;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  loading = false,
  error = null,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmColor = "#2ECC71",
  zIndex = 10000, // IMPORTANT: always above other modals
}) => {
  return (
    <Modal
      opened={opened}
      onClose={() => {
        if (loading) return;
        onClose();
      }}
      centered
      withinPortal
      zIndex={zIndex}
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
      withCloseButton={!loading}
      overlayProps={{ opacity: 0.55, blur: 2 }}
      trapFocus
      title={<Logo size="large" />}
    >
      <div className="text-lg font-bold custom-black-white-theme-switch-text">
        {title}
      </div>

      <div className="mt-2 text-sm custom-black-white-theme-switch-text">
        {message}
      </div>

      {error ? (
        <div className="mt-3 text-sm text-red-600 dark:text-red-400 font-semibold">
          {error}
        </div>
      ) : null}

      <Group justify="flex-end" mt="lg" gap="sm">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} loading={loading} color={confirmColor}>
          {confirmLabel}
        </Button>
      </Group>
    </Modal>
  );
};

export default ConfirmationModal;
