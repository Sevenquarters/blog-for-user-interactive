'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui';

type AuthSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  disabled?: boolean;
};

export function AuthSubmitButton({
  idleLabel,
  pendingLabel,
  disabled = false,
}: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <Button
      type="submit"
      disabled={isDisabled}
      variant="primary"
      size="lg"
    >
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
