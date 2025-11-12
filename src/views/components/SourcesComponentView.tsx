import { useState } from 'react';
import { Sources } from '@/components/vca-components/sources';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ToggleButtons } from '@/components/component-library/DemoControls';

const SourcesComponentView = () => {
  // Interactive demo state
  const [sourceCount, setSourceCount] = useState<'1' | '2' | '3'>('3');

  const getSources = () => {
    const allSources = [
      { text: 'LinkedIn Research Study 2024', href: 'https://example.com/study1', state: 'enabled' as const },
      { text: 'User Engagement Metrics Report', href: 'https://example.com/report', state: 'enabled' as const },
      { text: 'Industry Benchmark Analysis', href: 'https://example.com/analysis', state: 'visited' as const },
    ];
    return allSources.slice(0, Number(sourceCount));
  };

  return (
    <div className="pt-16">
      <h1 className="mb-2">Sources</h1>
      <p className="text-md text-gray-500 mb-12">List of source citations and references with heading for AI-generated content.</p>
      
      {/* Demo Section */}
      <DemoSection
        controls={
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <ToggleButtons
              label="Number of Sources"
              options={['1', '2', '3'] as const}
              value={sourceCount}
              onChange={setSourceCount}
            />
          </div>
        }
      >
        <div className="px-vca-xxl">
          <Sources sources={getSources()} />
        </div>
      </DemoSection>

      <div className="space-y-12">
        {/* Default - 3 Sources */}
        <div>
          <h2 className="mb-4">Default (3 Sources)</h2>
          <p className="text-sm text-gray-500 mb-3">Standard sources list with three references.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <Sources 
                sources={[
                  { text: 'LinkedIn Research Study 2024', href: 'https://example.com/study1', state: 'enabled' },
                  { text: 'User Engagement Metrics Report', href: 'https://example.com/report', state: 'enabled' },
                  { text: 'Industry Benchmark Analysis', href: 'https://example.com/analysis', state: 'enabled' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Single Source */}
        <div>
          <h2 className="mb-4">Single Source</h2>
          <p className="text-sm text-gray-500 mb-3">Sources list with one reference.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <Sources 
                sources={[
                  { text: 'LinkedIn Help Center Documentation', href: 'https://help.linkedin.com', state: 'enabled' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Two Sources */}
        <div>
          <h2 className="mb-4">Two Sources</h2>
          <p className="text-sm text-gray-500 mb-3">Sources list with two references.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <Sources 
                sources={[
                  { text: 'Product Documentation', href: 'https://example.com/docs', state: 'enabled' },
                  { text: 'API Reference Guide', href: 'https://example.com/api', state: 'visited' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Mixed States */}
        <div>
          <h2 className="mb-4">Mixed Link States</h2>
          <p className="text-sm text-gray-500 mb-3">Sources with different link states (enabled, visited).</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl">
              <Sources 
                sources={[
                  { text: 'New Study on Team Collaboration', href: 'https://example.com/new', state: 'enabled' },
                  { text: 'Previously Viewed Report', href: 'https://example.com/old', state: 'visited' },
                  { text: 'Another New Resource', href: 'https://example.com/resource', state: 'enabled' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* In Context with AI Message */}
        <div>
          <h2 className="mb-4">In Context</h2>
          <p className="text-sm text-gray-500 mb-3">Example showing Sources component after an AI response.</p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="px-vca-xxl space-y-4">
              <p className="font-vca-text text-[14px] leading-[21px] text-vca-text">
                Based on recent data, implementing seat assignments can increase team productivity by up to 45% and improve user engagement significantly. Organizations that proactively manage licenses see better ROI and reduced administrative overhead.
              </p>
              <Sources 
                sources={[
                  { text: 'LinkedIn Productivity Study 2024', href: 'https://example.com/productivity', state: 'enabled' },
                  { text: 'License Management Best Practices', href: 'https://example.com/best-practices', state: 'enabled' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Usage Notes */}
        <div>
          <h2 className="mb-4">Usage Notes</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-3">
              <p><span className="font-medium">Purpose:</span> Display citations and references for AI-generated content to build trust and transparency.</p>
              <p><span className="font-medium">Heading:</span> "Sources" label in 12px semibold gray text.</p>
              <p><span className="font-medium">Link List:</span> Uses SourceLink components with 8px vertical spacing.</p>
              <p><span className="font-medium">Flexible Length:</span> Supports 1-N sources (typically 1-3 for readability).</p>
              <p><span className="font-medium">No Fixed Width:</span> Adapts to parent container width.</p>
              <p><span className="font-medium">Link States:</span> Each source can have its own state (enabled, visited, etc.).</p>
              <p><span className="font-medium">Use Case:</span> Append to AI messages, recommendations, or any generated content requiring citations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourcesComponentView;

