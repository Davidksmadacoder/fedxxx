import React from 'react';
import { Modal, Button, Group, Text } from '@mantine/core';
import Logo from '../common/Logo';
import { MdError } from 'react-icons/md';

interface ErrorModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  message: React.ReactNode;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  opened,
  onClose,
  title,
  message
}) => {
  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={
        <Group gap="sm" align="center">
          <Logo size="large" />
          <Text fw={700} size="lg">Error</Text>
        </Group>
      } 
      centered
    >
      <div className="text-center py-4">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <MdError size={40} className="text-red-600" />
          </div>
        </div>
        <Text fw={600} size="lg" className="mb-2">{title}</Text>
        <Text size="sm" c="dimmed" className="mb-6">{message}</Text>
        <Button 
          color="red" 
          onClick={onClose}
          fullWidth
        >
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default ErrorModal;







