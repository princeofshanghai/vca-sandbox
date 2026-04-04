import { ButtonIcon } from '@/components/vca-components/buttons/ButtonIcon';
import { VcaIcon } from '@/components/vca-components/icons';

type InvoiceDownloadCardProps = {
  amount: string;
  date: string;
  isDownloadable?: boolean;
  onDownload?: () => void;
};

export function InvoiceDownloadCard({
  amount,
  date,
  isDownloadable = false,
  onDownload,
}: InvoiceDownloadCardProps) {
  const buttonClasses =
    'flex h-8 w-8 items-center justify-center rounded-full border border-[#0a66c2] p-2 text-[#0a66c2] transition-colors';

  return (
    <div className="flex items-center gap-2 rounded-[8px] border border-[rgba(140,140,140,0.2)] bg-white p-4">
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold leading-[1.25] tracking-[-0.15px] text-[rgba(0,0,0,0.75)]">
          {amount}
        </p>
        <p className="mt-1 text-[12px] font-normal leading-[1.25] text-[rgba(0,0,0,0.6)]">
          {date}
        </p>
      </div>

      {isDownloadable ? (
        <ButtonIcon
          variant="secondary"
          emphasis={true}
          size="sm"
          icon="download"
          onClick={onDownload}
          aria-label={`Download invoice for ${date}`}
        />
      ) : (
        <div aria-hidden="true" className={buttonClasses}>
          <VcaIcon icon="download" size="sm" className="text-[#0a66c2]" />
        </div>
      )}
    </div>
  );
}
