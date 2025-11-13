import { vcaSpacingMeta } from '@/design-tokens';

type SpacingToken = {
  name: string;
  class: string;
  value: number;
  unit: string;
  reference: string;
};

const SpacingItem = ({ name, spacingClass, value, unit, reference }: { 
  name: string; 
  spacingClass: string; 
  value: number; 
  unit: string;
  reference: string;
}) => {
  return (
    <div className="space-y-4">
      {/* Visual representation */}
      <div className="flex items-center gap-4">
        <div 
          className="bg-blue-500 rounded"
          style={{ width: `${value}px`, height: '40px' }}
        />
        <div className="text-sm text-gray-400 font-mono">{value}{unit}</div>
      </div>
      
      {/* Token info */}
      <div className="space-y-1">
        <div className="text-sm font-medium text-gray-900">{name}</div>
        <div className="text-xs text-gray-500 font-mono">{spacingClass}</div>
        <div className="text-xs text-gray-400 font-mono">{value}{unit}</div>
        <div className="text-xs text-blue-600 font-mono">{reference}</div>
      </div>
    </div>
  );
};

// Auto-generate spacing tokens from design tokens
const generateSpacingTokens = (): SpacingToken[] => {
  const tokens: SpacingToken[] = [];
  
  const nameMap: Record<string, string> = {
    'vca-none': 'None',
    'vca-xs': 'Extra Small',
    'vca-s': 'Small',
    'vca-md': 'Medium',
    'vca-lg': 'Large',
    'vca-xl': 'Extra Large',
    'vca-xxl': '2X Large',
  };

  for (const [vcaKey, tokenData] of Object.entries(vcaSpacingMeta)) {
    if (tokenData && typeof tokenData === 'object' && 'value' in tokenData) {
      const meta = tokenData as { value: number; unit: string; ref: string | number };
      tokens.push({
        name: nameMap[vcaKey] || vcaKey,
        class: vcaKey,
        value: meta.value,
        unit: meta.unit,
        reference: String(meta.ref),
      });
    }
  }

  // Sort by value
  return tokens.sort((a, b) => a.value - b.value);
};

const SpacingView = () => {
  const spacingTokens = generateSpacingTokens();
  
  return (
    <div className="pt-16">
      <h1 className="mb-4">Spacing</h1>
      <p className="text-base text-gray-500 mb-12">
        VCA design system spacing scale. Each token shows its visual size, Tailwind class, pixel value, and the primitive it references from Figma.
      </p>
      
      <div className="space-y-12">
        {/* Spacing Scale */}
        <div>
          <h2 className="mb-4">Spacing scale</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {spacingTokens.map((token) => (
              <SpacingItem
                key={token.class}
                name={token.name}
                spacingClass={token.class}
                value={token.value}
                unit={token.unit}
                reference={token.reference}
              />
            ))}
          </div>
        </div>

        {/* Usage Examples */}
        <div>
          <h2 className="mb-4">Usage examples</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-8">
            
            {/* Padding Example */}
            <div>
              <h3 className="mb-2">Padding</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <code className="text-xs text-gray-500 font-mono w-32">p-vca-xs</code>
                  <div className="bg-blue-100 border-2 border-blue-500 border-dashed inline-block">
                    <div className="p-vca-xs bg-blue-500 text-white text-xs font-mono">4px padding</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <code className="text-xs text-gray-500 font-mono w-32">p-vca-md</code>
                  <div className="bg-blue-100 border-2 border-blue-500 border-dashed inline-block">
                    <div className="p-vca-md bg-blue-500 text-white text-xs font-mono">12px padding</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <code className="text-xs text-gray-500 font-mono w-32">p-vca-xl</code>
                  <div className="bg-blue-100 border-2 border-blue-500 border-dashed inline-block">
                    <div className="p-vca-xl bg-blue-500 text-white text-xs font-mono">20px padding</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gap Example */}
            <div>
              <h3 className="mb-2">Gap (Flexbox/Grid)</h3>
              <div className="space-y-4">
                <div>
                  <code className="text-xs text-gray-500 font-mono mb-2 block">gap-vca-s</code>
                  <div className="flex gap-vca-s">
                    <div className="w-16 h-16 bg-blue-500 rounded"></div>
                    <div className="w-16 h-16 bg-blue-500 rounded"></div>
                    <div className="w-16 h-16 bg-blue-500 rounded"></div>
                  </div>
                </div>
                <div>
                  <code className="text-xs text-gray-500 font-mono mb-2 block">gap-vca-lg</code>
                  <div className="flex gap-vca-lg">
                    <div className="w-16 h-16 bg-blue-500 rounded"></div>
                    <div className="w-16 h-16 bg-blue-500 rounded"></div>
                    <div className="w-16 h-16 bg-blue-500 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Margin Example */}
            <div>
              <h3 className="mb-2">Margin</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <code className="text-xs text-gray-500 font-mono w-32">mb-vca-xs</code>
                  <div className="bg-gray-100 p-2 inline-block">
                    <div className="bg-blue-500 text-white text-xs font-mono p-2 mb-vca-xs">Box 1</div>
                    <div className="bg-blue-500 text-white text-xs font-mono p-2">Box 2</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <code className="text-xs text-gray-500 font-mono w-32">mb-vca-lg</code>
                  <div className="bg-gray-100 p-2 inline-block">
                    <div className="bg-blue-500 text-white text-xs font-mono p-2 mb-vca-lg">Box 1</div>
                    <div className="bg-blue-500 text-white text-xs font-mono p-2">Box 2</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Space Between Example */}
            <div>
              <h3 className="mb-2">Space between</h3>
              <div className="space-y-4">
                <div>
                  <code className="text-xs text-gray-500 font-mono mb-2 block">space-y-vca-s</code>
                  <div className="space-y-vca-s bg-gray-100 p-4 inline-block">
                    <div className="bg-blue-500 text-white text-xs font-mono p-2">Item 1</div>
                    <div className="bg-blue-500 text-white text-xs font-mono p-2">Item 2</div>
                    <div className="bg-blue-500 text-white text-xs font-mono p-2">Item 3</div>
                  </div>
                </div>
                <div>
                  <code className="text-xs text-gray-500 font-mono mb-2 block">space-y-vca-lg</code>
                  <div className="space-y-vca-lg bg-gray-100 p-4 inline-block">
                    <div className="bg-blue-500 text-white text-xs font-mono p-2">Item 1</div>
                    <div className="bg-blue-500 text-white text-xs font-mono p-2">Item 2</div>
                    <div className="bg-blue-500 text-white text-xs font-mono p-2">Item 3</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Guidelines */}
        <div>
          <h2 className="mb-4">Usage guidelines</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <span className="font-semibold">Consistent Spacing:</span> Always use VCA spacing tokens instead of arbitrary values for consistent spacing across the design system.
              </div>
              <div>
                <span className="font-semibold">Semantic Names:</span> Token names indicate size (xs, s, md, lg, xl, xxl) for easy selection.
              </div>
              <div>
                <span className="font-semibold">Common Uses:</span>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li><code className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded">vca-xs</code> (4px) - Tight spacing, small gaps</li>
                  <li><code className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded">vca-s</code> (8px) - Compact layouts, between related items</li>
                  <li><code className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded">vca-md</code> (12px) - Default spacing for most components</li>
                  <li><code className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded">vca-lg</code> (16px) - Section spacing, comfortable gaps</li>
                  <li><code className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded">vca-xl</code> (20px) - Large component spacing</li>
                  <li><code className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded">vca-xxl</code> (24px) - Major section dividers</li>
                </ul>
              </div>
              <div>
                <span className="font-semibold">Tailwind Utilities:</span> Use with any Tailwind spacing utility: <code className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded">p-vca-*</code>, <code className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded">m-vca-*</code>, <code className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded">gap-vca-*</code>, <code className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded">space-vca-*</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpacingView;
