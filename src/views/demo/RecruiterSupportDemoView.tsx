import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  FolderKanban,
  Lightbulb,
  Mail,
  Search,
  Users,
} from 'lucide-react';
import { Container } from '@/components/vca-components/container/Container';
import { Message } from '@/components/vca-components/messages';
import { StatusCard } from '@/components/vca-components/status-card/StatusCard';
import { cn } from '@/utils/cn';
import chatWithSupportIllustration from '@/assets/demo/chat-with-support.svg';
import headerAvatar from '@/assets/demo/header-avatar.png';
import linkedinHelpLogo from '@/assets/demo/linkedin-help-logo-40.svg';
import recruiterInvoicePdf from '@/assets/demo/recruiter-invoice.pdf';
import { DemoPromptChip } from './components/DemoPromptChip';
import { InvoiceDownloadCard } from './components/InvoiceDownloadCard';
import { recruiterInvoiceDemoContent } from './recruiterInvoiceDemoData';

const recruiterShortcuts = [
  'Recruiter Lite Help',
  'AI features in LinkedIn Recruiter',
  'Projects in Recruiter and Recruiter Lite',
  'Post a job in Recruiter',
  'Cancel your Recruiter account',
  'Manage billing on behalf of your company',
];

const recruiterShortcutColumns = [
  recruiterShortcuts.slice(0, 3),
  recruiterShortcuts.slice(3),
];

const recommendedTopics = [
  { label: 'Admin', Icon: Building2 },
  { label: 'Basics', Icon: Lightbulb },
  { label: 'Manage Users', Icon: Users },
  { label: 'Recruiter Lite', Icon: BriefcaseBusiness },
  { label: 'Projects', Icon: FolderKanban },
  { label: 'InMail and Inbox', Icon: Mail },
];

const suggestedArticles = [
  {
    title: 'Send messages in Recruiter and Recruiter Lite',
    category: 'InMail and Inbox, Recruiter Lite, and Messaging',
    excerpt:
      'You can send messages to candidates in LinkedIn Recruiter and LinkedIn Recruiter Lite from:Your search resultsA project’s Talent pool or Pipeline pageA candidate’s profile When you send a message to multiple people in LinkedIn Recruiter or LinkedIn…',
  },
  {
    title: 'Post, edit, and close a job in Recruiter',
    category: 'Manage Jobs',
    excerpt:
      'The Jobs tab in LinkedIn Recruiter allows you to view and manage all jobs you’ve posted within one list. You can access your jobs list by clicking on the Jobs tab within the navigation bar at the top of LinkedIn Recruiter. You can close, edit, and…',
  },
  {
    title: 'Find InMail credits in Recruiter and Recruiter Lite',
    category: 'Basics, InMail and Inbox, and Recruiter Lite',
    excerpt:
      'Every LinkedIn Recruiter and Recruiter Lite license comes with an allotted number of InMail credits each month based on the type of Recruiter account. You can send InMail messages if credits are available on your account. To view InMail credit…',
  },
];

const linkClasses =
  'text-[16px] font-semibold leading-7 text-[#0073b1] transition-colors hover:text-[#0073b1]';

const topicCardClasses =
  'flex min-h-[102px] flex-col items-center justify-center gap-3 rounded-sm border border-[#d9d9d9] bg-white text-[#0073b1] transition-colors hover:border-[#0073b1]/40 hover:bg-[#f7fbff]';

const sectionHeadingClasses = 'text-[18px] font-semibold leading-6 text-[rgba(0,0,0,0.9)]';
type DemoChatPhase = 'opening' | 'welcome' | 'thinking' | 'loading' | 'results';

export default function RecruiterSupportDemoView() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [composerValue, setComposerValue] = useState('');
  const [chatPhase, setChatPhase] = useState<DemoChatPhase>('welcome');
  const [submittedText, setSubmittedText] = useState<string | null>(null);
  const [visibleWelcomeMessageCount, setVisibleWelcomeMessageCount] = useState(0);
  const [streamedWelcomeMessages, setStreamedWelcomeMessages] = useState<string[]>([]);
  const [visiblePromptCount, setVisiblePromptCount] = useState(0);
  const [streamedResultMessage, setStreamedResultMessage] = useState('');
  const [visibleInvoiceCount, setVisibleInvoiceCount] = useState(0);
  const chatContentRef = useRef<HTMLDivElement>(null);
  const phaseTimerRefs = useRef<number[]>([]);

  const clearPhaseTimers = useCallback(() => {
    phaseTimerRefs.current.forEach((timerId) => window.clearTimeout(timerId));
    phaseTimerRefs.current = [];
  }, []);

  const schedulePhaseTimer = useCallback((callback: () => void, delay: number) => {
    const timerId = window.setTimeout(() => {
      phaseTimerRefs.current = phaseTimerRefs.current.filter((id) => id !== timerId);
      callback();
    }, delay);

    phaseTimerRefs.current.push(timerId);
    return timerId;
  }, []);

  const streamText = useCallback((
    fullText: string,
    onUpdate: (value: string) => void,
    onComplete?: () => void,
    options?: { chunkSize?: number; delay?: number }
  ) => {
    const chunkSize = options?.chunkSize ?? 2;
    const delay = options?.delay ?? 24;
    let cursor = 0;

    const step = () => {
      cursor = Math.min(cursor + chunkSize, fullText.length);
      onUpdate(fullText.slice(0, cursor));

      if (cursor < fullText.length) {
        schedulePhaseTimer(step, delay);
        return;
      }

      onComplete?.();
    };

    step();
  }, [schedulePhaseTimer]);

  const startWelcomeSequence = useCallback(() => {
    const welcomeMessages = recruiterInvoiceDemoContent.welcomeMessages;

    setVisibleWelcomeMessageCount(1);
    setStreamedWelcomeMessages(new Array(welcomeMessages.length).fill(''));
    setVisiblePromptCount(0);

    streamText(
      welcomeMessages[0] ?? '',
      (value) => {
        setStreamedWelcomeMessages((current) => {
          const next = [...current];
          next[0] = value;
          return next;
        });
      },
      () => {
        setVisibleWelcomeMessageCount(2);

        streamText(
          welcomeMessages[1] ?? '',
          (value) => {
            setStreamedWelcomeMessages((current) => {
              const next = [...current];
              next[1] = value;
              return next;
            });
          },
          () => {
            recruiterInvoiceDemoContent.suggestedPrompts.forEach((_, index) => {
              schedulePhaseTimer(() => {
                setVisiblePromptCount(index + 1);
              }, index * 140);
            });
          },
          { chunkSize: 2, delay: 22 }
        );
      },
      { chunkSize: 2, delay: 18 }
    );
  }, [schedulePhaseTimer, streamText]);

  const startResultsSequence = useCallback(() => {
    setStreamedResultMessage('');
    setVisibleInvoiceCount(0);

    streamText(
      recruiterInvoiceDemoContent.resultMessage,
      setStreamedResultMessage,
      () => {
        recruiterInvoiceDemoContent.invoices.forEach((_, index) => {
          schedulePhaseTimer(() => {
            setVisibleInvoiceCount(index + 1);
          }, index * 150);
        });
      },
      { chunkSize: 2, delay: 20 }
    );
  }, [schedulePhaseTimer, streamText]);

  const resetChat = useCallback(() => {
    clearPhaseTimers();
    setComposerValue('');
    setSubmittedText(null);
    setChatPhase('welcome');
    setVisibleWelcomeMessageCount(0);
    setStreamedWelcomeMessages([]);
    setVisiblePromptCount(0);
    setStreamedResultMessage('');
    setVisibleInvoiceCount(0);
  }, [clearPhaseTimers]);

  const handleOpenChat = useCallback(() => {
    resetChat();
    setIsChatOpen(true);
    setChatPhase('opening');

    schedulePhaseTimer(() => {
      setChatPhase('welcome');
      startWelcomeSequence();
    }, 750);
  }, [resetChat, schedulePhaseTimer, startWelcomeSequence]);

  const handleCloseChat = useCallback(() => {
    setIsChatOpen(false);
    resetChat();
  }, [resetChat]);

  const triggerInvoiceDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = recruiterInvoicePdf;
    link.download = 'linkedin-recruiter-invoice-sep-2026.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, []);

  const startInvoiceLookup = useCallback((text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    clearPhaseTimers();
    setSubmittedText(trimmedText);
    setComposerValue('');
    setChatPhase('thinking');
    setVisiblePromptCount(recruiterInvoiceDemoContent.suggestedPrompts.length);
    setVisibleWelcomeMessageCount(recruiterInvoiceDemoContent.welcomeMessages.length);
    setStreamedWelcomeMessages([...recruiterInvoiceDemoContent.welcomeMessages]);
    setStreamedResultMessage('');
    setVisibleInvoiceCount(0);

    schedulePhaseTimer(() => {
      setChatPhase('loading');

      schedulePhaseTimer(() => {
        setChatPhase('results');
        startResultsSequence();
      }, 950);
    }, 900);
  }, [clearPhaseTimers, schedulePhaseTimer, startResultsSequence]);

  const handleComposerSend = useCallback(() => {
    startInvoiceLookup(composerValue);
  }, [composerValue, startInvoiceLookup]);

  useEffect(() => () => {
    clearPhaseTimers();
  }, [clearPhaseTimers]);

  useEffect(() => {
    if (!isChatOpen) return;

    const frameId = window.requestAnimationFrame(() => {
      chatContentRef.current?.scrollTo({
        top: chatContentRef.current.scrollHeight,
        behavior: 'smooth',
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [
    chatPhase,
    isChatOpen,
    submittedText,
    streamedResultMessage,
    streamedWelcomeMessages,
    visibleInvoiceCount,
    visiblePromptCount,
  ]);

  return (
    <div className="min-h-screen bg-[#f3f2ef] text-[#191919]">
      <div className="bg-[#0073b1] text-white shadow-[inset_0_-1px_0_rgba(255,255,255,0.14)]">
        <header className="mx-auto flex h-[69px] w-full max-w-[1180px] items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <img
              src={linkedinHelpLogo}
              alt="LinkedIn"
              className="h-[34px] w-[34px] shrink-0"
            />
            <span className="font-sans text-[24px] font-semibold leading-[32px] tracking-normal text-white">
              Help
            </span>
          </div>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/25 bg-white/15 backdrop-blur-sm"
            aria-label="Open profile menu"
          >
            <img
              src={headerAvatar}
              alt="Charles"
              className="h-8 w-8 rounded-full object-cover"
            />
          </button>
        </header>

        <section className="mx-auto w-full max-w-[1180px] px-6 pb-9 pt-7">
          <h1 className="mb-4 font-sans text-[32px] font-normal leading-[40px] text-white">
            Hi Charles, we&apos;re here to help.
          </h1>

          <div className="flex max-w-[740px] overflow-hidden rounded-[2px] border border-[#d0d0d0] bg-white shadow-[0_1px_0_rgba(0,0,0,0.08)]">
            <button
              type="button"
              className="flex h-[40px] items-center gap-2 border-r border-[#d0d0d0] px-4 text-[16px] font-semibold text-[#525252]"
            >
              Recruiter
              <ChevronDown className="h-4 w-4" strokeWidth={2.2} />
            </button>
            <div className="flex h-[40px] flex-1 items-center justify-between px-4 text-[16px] text-[#666666]">
              <span>Ask or search anything</span>
              <Search className="h-4 w-4 text-[#666666]" strokeWidth={2.4} />
            </div>
          </div>
        </section>
      </div>

      <main className="bg-white">
        <div className="mx-auto grid w-full max-w-[1180px] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_365px]">
          <section className="border-b border-[#e6e6e6] px-6 py-8 lg:border-b-0 lg:border-r lg:border-[#e6e6e6]">
            <div className="mb-14">
              <h2 className={cn('mb-4', sectionHeadingClasses)}>Recruiter shortcuts</h2>

              <div className="grid gap-x-12 gap-y-6 sm:grid-cols-2">
                {recruiterShortcutColumns.map((column, columnIndex) => (
                  <div key={`shortcut-column-${columnIndex}`} className="flex flex-col gap-3">
                    {column.map((shortcut) => (
                      <button key={shortcut} type="button" className={cn('text-left', linkClasses)}>
                        {shortcut}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <div className="mb-6 flex items-center justify-between gap-3">
                <h2 className={sectionHeadingClasses}>Recommended topics</h2>
                <button type="button" className="text-[16px] font-semibold text-[#0073b1] hover:text-[#0073b1]">
                  View all
                </button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {recommendedTopics.map(({ label, Icon }) => (
                  <button key={label} type="button" className={topicCardClasses}>
                    <Icon className="h-6 w-6" strokeWidth={1.9} />
                    <span className="text-[14px] font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pb-4">
              <h2 className={cn('mb-4', sectionHeadingClasses)}>Suggested articles</h2>

              <div className="flex flex-col gap-10">
                {suggestedArticles.map((article) => (
                  <button key={article.title} type="button" className="text-left">
                    <h3 className="mb-0.5 text-[16px] font-semibold leading-6 text-[#0073b1]">{article.title}</h3>
                    <p className="mb-2 text-[12px] font-normal leading-4 text-[#666666]">{article.category}</p>
                    <p className="max-w-[940px] text-[14px] leading-[1.45] text-[rgba(0,0,0,0.9)]">{article.excerpt}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="px-6 py-8">
            <h2 className={cn('mb-4', sectionHeadingClasses)}>Contact Recruiter support</h2>

            <div className="mb-4 w-[340px] max-w-full rounded-[4px] border border-[#d9d9d9] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
              <div className="flex items-start gap-2">
                <img
                  src={chatWithSupportIllustration}
                  alt=""
                  aria-hidden="true"
                  className={cn(
                    'h-12 w-12 shrink-0 transition-all',
                    isChatOpen && 'grayscale opacity-55'
                  )}
                />

                <div className="ml-0 flex-1">
                  <div className="mb-1 text-[14px] font-semibold leading-5 text-[rgba(0,0,0,0.9)]">Chat with support</div>
                  <div className="mb-3 text-[12px] leading-4 text-[rgba(0,0,0,0.9)]">
                    {isChatOpen ? 'Currently chatting' : 'Online now'}
                  </div>

                  {!isChatOpen ? (
                  <button
                    type="button"
                    onClick={handleOpenChat}
                    className="rounded-full border border-[#0073b1] px-3 py-[6px] text-[14px] font-semibold leading-5 text-[#0073b1] transition-colors hover:bg-[#e8f3ff]"
                  >
                    Start Chat
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <div className="mx-auto w-full max-w-[1180px] px-6 py-5 text-[12px] text-[#666666]">
        LinkedIn Corporation © 2026
      </div>

      <div className="pointer-events-none fixed inset-0 z-50">
        <div
          className={cn(
            'absolute bottom-6 right-6 transition-all duration-300 ease-out',
            isChatOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          )}
        >
          <div className={cn('pointer-events-auto', !isChatOpen && 'hidden')}>
            <Container
              headerTitle="Help"
              className="bg-shell-bg"
              composerValue={composerValue}
              onComposerChange={setComposerValue}
              onComposerSend={handleComposerSend}
              contentRef={chatContentRef}
              onHeaderClose={handleCloseChat}
            >
              <div className="flex flex-col gap-vca-lg">
                {chatPhase === 'opening' ? (
                  <Message isThinking />
                ) : (
                  <>
                    <Message variant="disclaimer" />

                    {recruiterInvoiceDemoContent.welcomeMessages
                      .slice(0, visibleWelcomeMessageCount)
                      .map((message, index) => (
                        <Message
                          key={message}
                          defaultText={streamedWelcomeMessages[index] ?? ''}
                        />
                      ))}

                    {visiblePromptCount > 0 ? (
                      <div className="flex flex-col items-start gap-4">
                        {recruiterInvoiceDemoContent.suggestedPrompts
                          .slice(0, visiblePromptCount)
                          .map((prompt) => (
                          <div key={prompt} className="animate-fade-in">
                            <DemoPromptChip text={prompt} />
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {submittedText ? (
                      <Message variant="user" userText={submittedText} />
                    ) : null}

                    {chatPhase === 'thinking' ? <Message isThinking /> : null}

                    {chatPhase === 'loading' ? (
                      <StatusCard
                        status="in-progress"
                        title={recruiterInvoiceDemoContent.statusLoadingTitle}
                      />
                    ) : null}

                    {chatPhase === 'results' ? (
                      <>
                        <StatusCard
                          status="success"
                          title={recruiterInvoiceDemoContent.statusSuccessTitle}
                        />
                        {streamedResultMessage ? (
                          <Message defaultText={streamedResultMessage} />
                        ) : null}
                        {visibleInvoiceCount > 0 ? (
                          <div className="flex flex-col gap-2">
                            {recruiterInvoiceDemoContent.invoices
                              .slice(0, visibleInvoiceCount)
                              .map((invoice) => (
                                <div key={invoice.id} className="animate-fade-in">
                                  <InvoiceDownloadCard
                                    amount={invoice.amount}
                                    date={invoice.date}
                                    isDownloadable={invoice.isDownloadable}
                                    onDownload={invoice.isDownloadable ? triggerInvoiceDownload : undefined}
                                  />
                                </div>
                              ))}
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </>
                )}
              </div>
            </Container>
          </div>
        </div>
      </div>
    </div>
  );
}
