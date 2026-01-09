import { vcaRadiusMeta } from '@/design-tokens';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';

type RadiusTokenDisplay = {
  name: string;
  class: string;
  value: string;
  reference?: string;
};

const RadiusSwatch = ({ name, class: tailwindClass, value, reference }: RadiusTokenDisplay) => {
  return (
    <div className="flex items-start gap-6">
      <div className="flex-shrink-0">
        <div
          className={`w-24 h-24 bg-blue-100 border-2 border-blue-400 ${tailwindClass}`}
        />
      </div>
      <div className="space-y-1 pt-1">
        <div className="text-sm font-medium text-gray-900">{name}</div>
        <div className="text-xs text-gray-500 font-mono">{tailwindClass}</div>
        <div className="text-xs text-gray-400 font-mono">{value}</div>
        {reference && <div className="text-xs text-blue-600 font-mono">{reference}</div>}
      </div>
    </div>
  );
};

const RadiusView = () => {
  const radiusTokens: RadiusTokenDisplay[] = Object.entries(vcaRadiusMeta).map(([tokenName, tokenData]) => {
    const meta = tokenData as { value: number; unit: string; ref: string | number };
    const name = tokenName.replace('vca-', '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return {
      name: name === 'None' ? 'None' : name,
      class: `rounded-${tokenName}`,
      value: `${meta.value}${meta.unit}`,
      reference: meta.ref !== undefined && meta.ref !== null && meta.ref !== 0 ? String(meta.ref) : undefined,
    };
  });



  return (
    <ComponentViewLayout
      title="Border Radius"
      description="Radius in VCA is based on the Mercado radius scale."
    >
      <div className="space-y-20">
        {/* Radius Scale */}
        <div>
          <h2 className="mb-4">Radius scale</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6 grid grid-cols-1 gap-8">
            {radiusTokens.map((token) => (
              <RadiusSwatch key={token.class} {...token} />
            ))}
          </div>
        </div>

        {/* Usage Examples */}
        <div>
          <h2 className="mb-4">Usage examples</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-8">
            {/* Buttons */}
            <div>
              <h3 className="mb-2">Buttons</h3>
              <p className="text-md text-gray-900 mb-4">Primary buttons use `rounded-vca-lg` for a friendly, approachable appearance.</p>
              <div className="flex flex-wrap items-center gap-4">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-vca-lg font-medium hover:bg-blue-700 transition-colors">
                  Primary Button
                </button>
                <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded-vca-lg font-medium hover:bg-gray-300 transition-colors">
                  Secondary Button
                </button>
              </div>
            </div>

            {/* Cards */}
            <div>
              <h3 className="mb-2">Cards & Containers</h3>
              <p className="text-md text-gray-900 mb-4">Cards typically use `rounded-vca-md` for moderate softness.</p>
              <div className="flex flex-wrap items-start gap-4">
                <div className="bg-white border border-gray-200 rounded-vca-md p-4 w-48">
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">Card Title</h4>
                  <p className="text-xs text-gray-600">This card uses rounded-vca-md (16px)</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-vca-md p-4 w-48">
                  <h4 className="text-sm font-semibold text-blue-800 mb-1">Info Card</h4>
                  <p className="text-xs text-gray-600">Consistent radius creates harmony</p>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div>
              <h3 className="mb-2">Inputs & Forms</h3>
              <p className="text-md text-gray-900 mb-4">Text inputs use `rounded-vca-md` to match the overall design system.</p>
              <div className="space-y-3 max-w-md">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-vca-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-vca-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Circular Elements */}
            <div>
              <h3 className="mb-2">Circular elements</h3>
              <p className="text-md text-gray-900 mb-4">Use `rounded-full` (standard Tailwind) for avatars, icons, and perfect circles. Use `rounded-vca-round` for very large radius corners.</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  JD
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                  AM
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  SK
                </div>
              </div>
            </div>

            {/* Badges & Tags */}
            <div>
              <h3 className="mb-2">Badges & Tags</h3>
              <p className="text-md text-gray-900 mb-4">Small labels use `rounded-vca-sm` for subtle corners.</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-vca-sm font-medium">New</span>
                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-vca-sm font-medium">Active</span>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-vca-sm font-medium">Pending</span>
                <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-vca-sm font-medium">Urgent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div>
          <h2 className="mb-4">Usage guidelines</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-3 text-sm text-gray-700">
              <p><span className="font-medium">Consistency:</span> Always use VCA radius tokens for consistent corner treatment across the design system.</p>
              <p><span className="font-medium">Semantic Naming:</span> Token names reflect their relative size (xs, sm, md, lg, etc.), not absolute pixel values.</p>
              <p><span className="font-medium">Hierarchy:</span> Larger components (cards, modals) typically use larger radius values; smaller elements (badges, buttons) use smaller values.</p>
              <p><span className="font-medium">Perfect Circles:</span> For circular elements like avatars and icon buttons, use `rounded-full` (standard Tailwind) rather than `rounded-vca-round`.</p>
              <p><span className="font-medium">Avoid Hardcoding:</span> Never use raw pixel values for border radius; always use a VCA token.</p>
              <p><span className="font-medium">Responsive Design:</span> Combine with Tailwind's responsive prefixes (e.g., `md:rounded-vca-lg`) for adaptive designs.</p>
            </div>
          </div>
        </div>
      </div>
    </ComponentViewLayout>
  );
};

export default RadiusView;
