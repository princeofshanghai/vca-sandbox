import type { AIMessageContent, AIStatusContent, Component, Flow, PromptContent, Turn } from '@/views/studio/types';

export const recruiterInvoiceFlowExport: Flow = {
  version: 1,
  id: 'c48d653c-9f55-4acc-9121-34a535739abd',
  title: 'Untitled',
  lastModified: Date.parse('2026-04-04T23:18:04.791Z'),
  settings: {
    entryPoint: 'custom',
    productName: 'LinkedIn',
    showHotspots: true,
    showDisclaimer: true,
    simulateThinking: true,
  },
  steps: [
    {
      id: '6e3a195f-926a-4fac-8f81-7975c18e27d0',
      type: 'start',
      label: 'Flow 1',
      position: { x: 4, y: 47 },
    },
    {
      id: '8dc9f5df-142c-43dc-80d0-de7d54c6f974',
      type: 'turn',
      label: 'Welcome message',
      phase: 'welcome',
      locked: true,
      speaker: 'ai',
      position: { x: 282.99483836617753, y: 50 },
      components: [
        {
          id: '13713e59-fcb3-4c48-bb85-93d231f29aa6',
          type: 'message',
          content: {
            text: "Hi there! Looking for information about LinkedIn's Premium products? Ask me a question and I'll help you find the right answer.",
          },
        },
        {
          id: 'component-1775343171395-z2s3vw6dv',
          type: 'message',
          content: {
            text: 'You can try asking me something like:',
          },
        },
        {
          id: 'b091e20b-7f39-4843-8284-64ba1270e5f2',
          type: 'prompt',
          content: {
            text: 'How do I edit or post a job?',
            showAiIcon: false,
          },
        },
        {
          id: '9635ed38-e0f2-4783-b7e9-9b6f7b117e06',
          type: 'prompt',
          content: {
            text: 'Can I purchase additional InMail credits in Recruiter Lite?',
            showAiIcon: false,
          },
        },
      ],
    },
    {
      id: '2f536b7a-8c7d-46c3-b1fd-3ab7e11f95d6',
      type: 'user-turn',
      label: 'User Turn 1',
      labelMode: 'auto',
      inputType: 'text',
      position: { x: 813.4477694035184, y: 49.892650860997165 },
      triggerValue: 'I want to download my receipts',
      autoLabel: 'User says I want to download my receipts',
    },
    {
      id: 'a762163e-baff-4f07-92bf-a7e2e7ca188e',
      type: 'turn',
      speaker: 'ai',
      label: 'AI Turn 2',
      position: { x: 1290.5163106700893, y: 38.13130786793853 },
      components: [
        {
          id: 'component-1775343411823-t959b6tsz',
          type: 'statusCard',
          content: {
            loadingTitle: 'Retrieving invoices',
            successTitle: 'Invoices retrieved',
            successDescription: '',
          },
        },
        {
          id: 'component-1775343443923-rck0amqiq',
          type: 'message',
          content: {
            text: 'Here are your 3 most recent invoices. You can download them below.',
          },
        },
      ],
    },
  ],
  connections: [
    {
      id: 'f26e2438-090e-4fb7-8d8f-7a3bcebf1564',
      source: '6e3a195f-926a-4fac-8f81-7975c18e27d0',
      target: '8dc9f5df-142c-43dc-80d0-de7d54c6f974',
    },
    {
      id: 'edge-8dc9f5df-142c-43dc-80d0-de7d54c6f974-2f536b7a-8c7d-46c3-b1fd-3ab7e11f95d6-1775343214222-q56x1',
      source: '8dc9f5df-142c-43dc-80d0-de7d54c6f974',
      sourceHandle: 'main-output',
      target: '2f536b7a-8c7d-46c3-b1fd-3ab7e11f95d6',
    },
    {
      id: 'edge-2f536b7a-8c7d-46c3-b1fd-3ab7e11f95d6-a762163e-baff-4f07-92bf-a7e2e7ca188e-1775344006004',
      source: '2f536b7a-8c7d-46c3-b1fd-3ab7e11f95d6',
      sourceHandle: 'user-output',
      target: 'a762163e-baff-4f07-92bf-a7e2e7ca188e',
      targetHandle: 'main-input',
    },
  ],
  blocks: [],
  metadata: {
    exportedAt: '2026-04-04T23:18:04.791Z',
    exportedBy: 'VCA Sandbox Studio',
  } as Flow['metadata'],
};

const welcomeTurn = (recruiterInvoiceFlowExport.steps || []).find(
  (step): step is Turn => step.type === 'turn' && step.id === '8dc9f5df-142c-43dc-80d0-de7d54c6f974'
);
const lastTurn = (recruiterInvoiceFlowExport.steps || []).find(
  (step): step is Turn => step.type === 'turn' && step.id === 'a762163e-baff-4f07-92bf-a7e2e7ca188e'
);

const welcomeMessages = (welcomeTurn?.components || [])
  .filter((component): component is Component & { type: 'message' } => component.type === 'message')
  .map((component) => (component.content as AIMessageContent).text)
  .filter((text): text is string => typeof text === 'string');

const welcomePrompts = (welcomeTurn?.components || [])
  .filter((component): component is Component & { type: 'prompt' } => component.type === 'prompt')
  .map((component) => (component.content as PromptContent).text)
  .filter((text): text is string => typeof text === 'string');

const invoiceStatusCard = lastTurn?.components.find(
  (component): component is Component & { type: 'statusCard' } => component.type === 'statusCard'
);
const invoiceMessage = lastTurn?.components.find(
  (component): component is Component & { type: 'message' } => component.type === 'message'
);

const statusContent = invoiceStatusCard?.content as AIStatusContent | undefined;
const messageContent = invoiceMessage?.content as AIMessageContent | undefined;

export const recruiterInvoiceDemoContent = {
  welcomeMessages,
  suggestedPrompts: welcomePrompts,
  statusLoadingTitle: statusContent?.loadingTitle || 'Retrieving invoices',
  statusSuccessTitle: statusContent?.successTitle || 'Invoices retrieved',
  resultMessage: typeof messageContent?.text === 'string'
    ? messageContent.text
    : 'Here are your 3 most recent invoices. You can download them below.',
  invoices: [
    { id: 'invoice-sep-2026', amount: '$324.97', date: 'Sep 1, 2026', isDownloadable: true },
    { id: 'invoice-aug-2026', amount: '$311.42', date: 'Aug 1, 2026', isDownloadable: false },
    { id: 'invoice-jul-2026', amount: '$287.50', date: 'Jul 1, 2026', isDownloadable: false },
  ],
} as const;
