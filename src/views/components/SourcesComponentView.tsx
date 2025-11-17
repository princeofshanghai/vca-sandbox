import { useState } from 'react';
import { Sources } from '@/components/vca-components/sources';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
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
    <ComponentViewLayout
      title="Sources"
      description="Grouping of source citation links."
    >
      
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

      {/* Usage */}
      <div className="mb-8">
        <h2>Usage</h2>
      </div>

      <div className="space-y-12">
        {/* Default - 3 Sources */}
        <div>
          <h3 className="mb-2">Default (3 sources)</h3>
          <p className="mb-3">Standard sources list with three references.</p>
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

        {/* Single source */}
        <div>
          <h3 className="mb-2">Single source</h3>
          <p className="mb-3">Sources list with one reference.</p>
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

        {/* Two sources */}
        <div>
          <h3 className="mb-2">Two sources</h3>
          <p className="mb-3">Sources list with two references.</p>
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
          <h3 className="mb-2">Mixed link states</h3>
          <p className="mb-3">Sources with different link states (enabled, visited).</p>
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

        {/* In context with AI Message */}
        <div>
          <h3 className="mb-2">In context</h3>
          <p className="mb-3">Example showing Sources component after an AI response.</p>
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

      
      </div>
    </ComponentViewLayout>
  );
};

export default SourcesComponentView;

