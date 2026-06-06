export type AuthFormState = {
  status: 'idle' | 'success' | 'error';
  code?: string;
};

export function getInitialAuthFormState(): AuthFormState {
  return {
    status: 'idle',
  };
}
