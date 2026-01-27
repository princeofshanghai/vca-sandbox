import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';

const TypographyView = () => {
  // Helper component to display a typography style
  const TypeStyle = ({
    label,
    token,
    size,
    lineHeight,
    weight,
    fontFamily
  }: {
    label: string;
    token: string;
    size: string;
    lineHeight: string;
    weight: string;
    fontFamily: string;
  }) => (
    <div className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{label}</h3>
          <code className="text-xs text-gray-500 font-mono">{token}</code>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">{size} / {lineHeight} / {weight}</p>
          <p className="text-xs text-gray-400">{fontFamily}</p>
        </div>
      </div>
      <p className={`${fontFamily === 'SF Pro Display' ? 'font-vca-display' : 'font-vca-text'} ${token} text-vca-text`}>
        The quick brown fox jumps over the lazy dog
      </p>
    </div>
  );



  return (
    <ComponentViewLayout
      title="Typography"
      description="Typography in VCA uses standard Mercado styles."
      headingSelectors="h2"
    >
      <div className="space-y-20">
        {/* Font Families */}
        <div>
          <h2 className="mb-4">Font families</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <h3 className="mb-2">SF Pro Text</h3>
                <p className="text-sm text-gray-600 mb-2">Used for body text and small headings</p>
                <code className="text-xs text-gray-500 font-mono">font-vca-text</code>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <h3 className="mb-2">SF Pro Display</h3>
                <p className="text-sm text-gray-600 mb-2">Used for headings and large display text</p>
                <code className="text-xs text-gray-500 font-mono">font-vca-display</code>

              </div>
            </div>
          </div>
        </div>

        {/* Body XSmall */}
        <div>
          <h2 className="mb-4">Body xsmall (12px)</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            <TypeStyle
              label="Body XSmall"
              token="text-vca-xsmall"
              size="12px"
              lineHeight="15px"
              weight="400"
              fontFamily="SF Pro Text"
            />
            <TypeStyle
              label="Body XSmall Bold"
              token="text-vca-xsmall-bold"
              size="12px"
              lineHeight="15px"
              weight="600"
              fontFamily="SF Pro Text"
            />
            <TypeStyle
              label="Body XSmall Open"
              token="text-vca-xsmall-open"
              size="12px"
              lineHeight="18px"
              weight="400"
              fontFamily="SF Pro Text"
            />
            <TypeStyle
              label="Body XSmall Bold Open"
              token="text-vca-xsmall-bold-open"
              size="12px"
              lineHeight="18px"
              weight="600"
              fontFamily="SF Pro Text"
            />
          </div>
        </div>

        {/* Body Small */}
        <div>
          <h2 className="mb-4">Body small (14px)</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            <TypeStyle
              label="Body Small"
              token="text-vca-small"
              size="14px"
              lineHeight="18px"
              weight="400"
              fontFamily="SF Pro Text"
            />
            <TypeStyle
              label="Body Small Bold"
              token="text-vca-small-bold"
              size="14px"
              lineHeight="18px"
              weight="600"
              fontFamily="SF Pro Text"
            />
            <TypeStyle
              label="Body Small Open"
              token="text-vca-small-open"
              size="14px"
              lineHeight="21px"
              weight="400"
              fontFamily="SF Pro Text"
            />
            <TypeStyle
              label="Body Small Bold Open"
              token="text-vca-small-bold-open"
              size="14px"
              lineHeight="21px"
              weight="600"
              fontFamily="SF Pro Text"
            />
          </div>
        </div>

        {/* Body Medium */}
        <div>
          <h2 className="mb-4">Body medium (16px)</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            <TypeStyle
              label="Body Medium"
              token="text-vca-medium"
              size="16px"
              lineHeight="20px"
              weight="400"
              fontFamily="SF Pro Text"
            />
            <TypeStyle
              label="Body Medium Bold"
              token="text-vca-medium-bold"
              size="16px"
              lineHeight="20px"
              weight="600"
              fontFamily="SF Pro Text"
            />
            <TypeStyle
              label="Body Medium Open"
              token="text-vca-medium-open"
              size="16px"
              lineHeight="24px"
              weight="400"
              fontFamily="SF Pro Text"
            />
            <TypeStyle
              label="Body Medium Bold Open"
              token="text-vca-medium-bold-open"
              size="16px"
              lineHeight="24px"
              weight="600"
              fontFamily="SF Pro Text"
            />
          </div>
        </div>

        {/* Body Large */}
        <div>
          <h2 className="mb-4">Body large (20px)</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            <TypeStyle
              label="Body Large"
              token="text-vca-large"
              size="20px"
              lineHeight="25px"
              weight="400"
              fontFamily="SF Pro Display"
            />
            <TypeStyle
              label="Body Large Bold"
              token="text-vca-large-bold"
              size="20px"
              lineHeight="25px"
              weight="600"
              fontFamily="SF Pro Display"
            />
            <TypeStyle
              label="Body Large Open"
              token="text-vca-large-open"
              size="20px"
              lineHeight="30px"
              weight="400"
              fontFamily="SF Pro Display"
            />
            <TypeStyle
              label="Body Large Bold Open"
              token="text-vca-large-bold-open"
              size="20px"
              lineHeight="30px"
              weight="600"
              fontFamily="SF Pro Display"
            />
          </div>
        </div>

        {/* Heading Styles */}
        <div>
          <h2 className="mb-4">Heading styles</h2>
          <p className="text-md text-gray-900 mb-4">All heading styles are semibold (600 weight) by default.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            <TypeStyle
              label="Heading Small"
              token="text-vca-heading-small"
              size="14px"
              lineHeight="18px"
              weight="600"
              fontFamily="SF Pro Text"
            />
            <TypeStyle
              label="Heading Medium"
              token="text-vca-heading-medium"
              size="16px"
              lineHeight="20px"
              weight="600"
              fontFamily="SF Pro Text"
            />
            <TypeStyle
              label="Heading Large"
              token="text-vca-heading-large"
              size="20px"
              lineHeight="25px"
              weight="600"
              fontFamily="SF Pro Display"
            />
            <TypeStyle
              label="Heading XLarge"
              token="text-vca-heading-xlarge"
              size="24px"
              lineHeight="30px"
              weight="600"
              fontFamily="SF Pro Display"
            />
          </div>
        </div>

        {/* Display Styles */}
        <div>
          <h2 className="mb-4">Display styles</h2>
          <p className="text-md text-gray-900 mb-4">Large display text for prominent UI elements and hero sections.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            <TypeStyle
              label="Display Large"
              token="text-vca-display-large"
              size="48px"
              lineHeight="60px"
              weight="400"
              fontFamily="SF Pro Display"
            />
            <TypeStyle
              label="Display Large Bold"
              token="text-vca-display-large-bold"
              size="48px"
              lineHeight="60px"
              weight="600"
              fontFamily="SF Pro Display"
            />
            <TypeStyle
              label="Display XLarge"
              token="text-vca-display-xlarge"
              size="64px"
              lineHeight="80px"
              weight="400"
              fontFamily="SF Pro Display"
            />
            <TypeStyle
              label="Display XLarge Bold"
              token="text-vca-display-xlarge-bold"
              size="64px"
              lineHeight="80px"
              weight="600"
              fontFamily="SF Pro Display"
            />
          </div>
        </div>


      </div>
    </ComponentViewLayout>
  );
};

export default TypographyView;

