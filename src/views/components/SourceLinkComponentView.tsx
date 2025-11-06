import { SourceLink } from '@/components/vca-components/source-link';

const SourceLinkComponentView = () => {
  return (
    <div className="pt-16">
      <h1 className="mb-2">Source Link</h1>
      <p className="text-md text-gray-500 mb-12">Small citation and source link component with multiple states for references and external links.</p>
      
      <div className="space-y-12">
        {/* Enabled State */}
        <div>
          <h2 className="mb-4">Enabled</h2>
          <p className="text-sm text-gray-500 mb-3">Default state with gray text and underline.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <SourceLink 
                state="enabled"
                text="This is title of link"
                href="https://example.com"
              />
            </div>
          </div>
        </div>

        {/* Hover State */}
        <div>
          <h2 className="mb-4">Hover</h2>
          <p className="text-sm text-gray-500 mb-3">Interactive state when user hovers over the link.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <SourceLink 
                state="hover"
                text="This is title of link"
              />
            </div>
          </div>
        </div>

        {/* Active State */}
        <div>
          <h2 className="mb-4">Active</h2>
          <p className="text-sm text-gray-500 mb-3">State when user clicks/presses the link.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <SourceLink 
                state="active"
                text="This is title of link"
              />
            </div>
          </div>
        </div>

        {/* Visited State */}
        <div>
          <h2 className="mb-4">Visited</h2>
          <p className="text-sm text-gray-500 mb-3">State for previously visited links (purple).</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <SourceLink 
                state="visited"
                text="This is title of link"
              />
            </div>
          </div>
        </div>

        {/* In Context Example */}
        <div>
          <h2 className="mb-4">In Context</h2>
          <p className="text-sm text-gray-500 mb-3">Example showing how source links appear within text content.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <p className="font-vca-text text-[14px] leading-[21px] text-vca-text">
                According to recent research, user engagement increased by 45% after implementing AI recommendations.{' '}
                <SourceLink 
                  state="enabled"
                  text="Source: LinkedIn Study 2024"
                  href="https://example.com/study"
                />
              </p>
            </div>
          </div>
        </div>

        {/* Multiple Links Example */}
        <div>
          <h2 className="mb-4">Multiple Sources</h2>
          <p className="text-sm text-gray-500 mb-3">Example with multiple source citations in a single paragraph.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <p className="font-vca-text text-[14px] leading-[21px] text-vca-text">
                The data shows significant improvements in productivity (
                <SourceLink 
                  state="enabled"
                  text="Study A"
                  href="https://example.com/a"
                />, {' '}
                <SourceLink 
                  state="visited"
                  text="Study B"
                  href="https://example.com/b"
                />) and user satisfaction (
                <SourceLink 
                  state="enabled"
                  text="Survey 2024"
                  href="https://example.com/survey"
                />).
              </p>
            </div>
          </div>
        </div>

        {/* Usage Notes */}
        <div>
          <h2 className="mb-4">Usage Notes</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-3">
              <p><span className="font-medium">Small Font:</span> Uses 12px font size (VCA xsmall) for compact citations.</p>
              <p><span className="font-medium">Always Underlined:</span> All states include underline for clear link affordance.</p>
              <p><span className="font-medium">Color States:</span> Gray (enabled), blue (hover/active), purple (visited).</p>
              <p><span className="font-medium">Flexible Width:</span> No fixed width - adapts to text content length.</p>
              <p><span className="font-medium">External Links:</span> When href is provided, opens in new tab with noopener/noreferrer.</p>
              <p><span className="font-medium">Use Cases:</span> Citations, sources, references, "Learn more" links in AI messages.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceLinkComponentView;

