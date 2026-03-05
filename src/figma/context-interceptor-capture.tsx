import { createRoot } from 'react-dom/client';
import { ContextInterceptorMessage } from '@/views/studio/components/ContextInterceptorMessage';
import type { Branch } from '@/views/studio/types';
import '@/index.css';

const branches: Branch[] = [
  {
    id: 'branch-admin',
    condition: 'yes',
    logic: {
      variable: 'isAdmin',
      value: 'true',
      operator: 'eq',
    },
  },
  {
    id: 'branch-default',
    condition: 'No',
    isDefault: true,
  },
];

const rootEl = document.getElementById('root');

if (!rootEl) {
  throw new Error('Missing #root element for ContextInterceptor capture');
}

createRoot(rootEl).render(
  <div className="min-h-screen bg-shell-surface-subtle p-10">
    <div className="mx-auto w-full max-w-[560px]">
      <ContextInterceptorMessage
        variableName="isAdmin"
        branches={branches}
        onResolve={() => {}}
      />
    </div>
  </div>
);
