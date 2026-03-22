import React from 'react';
import { Modal, Group, Text } from '@mantine/core';
import Logo from '../common/Logo';

interface StandardModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: string;
}

const StandardModal: React.FC<StandardModalProps> = ({
  opened,
  onClose,
  title,
  children,
  size = "lg"
}) => {
  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={
        <Group gap="sm" align="center">
          <Logo size="large" />
          <Text fw={700} size="lg">{title}</Text>
        </Group>
      } 
      size={size as any}
      centered
    >
      {children}
    </Modal>
  );
};

export default StandardModal;







