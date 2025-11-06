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
          <h3 className="text-base font-medium text-gray-900">{label}</h3>
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
    <div className="pt-16">
      <h1 className="mb-2">Typography</h1>
      <p className="text-md text-gray-500 mb-12">VCA design system typography styles matching Figma tokens. Each style includes font-size, line-height, and font-weight.</p>
      
      <div className="space-y-12">
        {/* Font Families */}
        <div>
          <h2 className="mb-4">Font Families</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <h3 className="mb-2">SF Pro Text</h3>
                <p className="text-sm text-gray-600 mb-2">Used for body text and small headings</p>
                <code className="text-xs text-gray-500 font-mono">font-vca-text</code>
                <p className="font-vca-text text-2xl text-gray-900 mt-3">The quick brown fox jumps over the lazy dog</p>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <h3 className="mb-2">SF Pro Display</h3>
                <p className="text-sm text-gray-600 mb-2">Used for headings and large display text</p>
                <code className="text-xs text-gray-500 font-mono">font-vca-display</code>
                <p className="font-vca-display text-2xl text-gray-900 mt-3">The quick brown fox jumps over the lazy dog</p>
              </div>
            </div>
          </div>
        </div>

        {/* Body XSmall */}
        <div>
          <h2 className="mb-4">Body XSmall (12px)</h2>
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
          <h2 className="mb-4">Body Small (14px)</h2>
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
          <h2 className="mb-4">Body Medium (16px)</h2>
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
          <h2 className="mb-4">Body Large (20px)</h2>
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
          <h2 className="mb-4">Heading Styles</h2>
          <p className="text-sm text-gray-500 mb-4">All heading styles are semibold (600 weight) by default.</p>
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
          <h2 className="mb-4">Display Styles</h2>
          <p className="text-sm text-gray-500 mb-4">Large display text for prominent UI elements and hero sections.</p>
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

        {/* Usage Guidelines */}
        <div>
          <h2 className="mb-4">Usage Guidelines</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <p className="font-semibold text-gray-900 mb-2">⚠️ Critical: Always Include Font Family Classes</p>
                <p className="mb-2">Typography size tokens (e.g., <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">text-vca-small-bold</code>) do NOT include font-family. You must always add <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">font-vca-text</code> or <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">font-vca-display</code> alongside them.</p>
                <div className="bg-gray-50 border border-gray-200 rounded p-3 mt-2">
                  <p className="text-xs font-medium text-gray-600 mb-1">✅ Correct:</p>
                  <code className="text-xs font-mono text-green-700">className="font-vca-text text-vca-small-bold text-vca-link"</code>
                  <p className="text-xs font-medium text-gray-600 mb-1 mt-2">❌ Wrong (missing font-family):</p>
                  <code className="text-xs font-mono text-red-700">className="text-vca-small-bold text-vca-link"</code>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="font-semibold text-gray-900 mb-2">⚠️ Avoid cn() Conflicts with Typography + Color</p>
                <p className="mb-2">When using <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">cn()</code> (tailwind-merge), typography tokens can be removed if merged with color tokens because both start with <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">text-</code>.</p>
                <div className="bg-gray-50 border border-gray-200 rounded p-3 mt-2">
                  <p className="text-xs font-medium text-gray-600 mb-1">✅ Solution: Use template literals to separate them:</p>
                  <code className="text-xs font-mono text-green-700 block mb-2">{`className={\`font-vca-text text-vca-small-bold \${colorClass}\`}`}</code>
                  <p className="text-xs font-medium text-gray-600 mb-1 mt-2">❌ Problem: cn() removes typography token:</p>
                  <code className="text-xs font-mono text-red-700 block">className={`{cn('font-vca-text text-vca-small-bold', colorClass)}`}</code>
                </div>
                <p className="text-xs text-gray-600 mt-2">See <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">docs/Tailwind-Merge-Typography-Fix.md</code> for details.</p>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p><span className="font-medium">Complete Tokens:</span> Each typography size token includes font-size, line-height, and font-weight together. Use the single token class instead of combining multiple properties.</p>
              </div>

              <div>
                <p><span className="font-medium">Font Families:</span> Body text (12-16px) uses SF Pro Text. Large text and headings (20px+) use SF Pro Display.</p>
              </div>

              <div>
                <p><span className="font-medium">"Open" Variants:</span> Styles with "-open" suffix have increased line-height (1.5 ratio) for better readability in longer text blocks. Standard variants use 1.25 line-height.</p>
              </div>

              <div>
                <p><span className="font-medium">Bold Variants:</span> Use "-bold" suffix for semibold weight (600). Regular variants are 400 weight.</p>
              </div>

              <div>
                <p><span className="font-medium">Line-Heights:</span> All line-heights use unitless ratios (1.25 or 1.5) for better scalability. The pixel values shown are computed results.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypographyView;

