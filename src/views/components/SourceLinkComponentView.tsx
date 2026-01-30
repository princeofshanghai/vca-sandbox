import { useState } from 'react';
import { SourceLink } from '@/components/vca-components/source-link';
import type { SourceLinkStatus } from '@/components/vca-components/source-link/SourceLink';
import { DemoSection } from '@/components/component-library/DemoSection';
import { ComponentViewLayout } from '@/components/component-library/ComponentViewLayout';
import { ToggleButtons, FormInput, FormCheckbox } from '@/components/component-library/DemoControls';

const SourceLinkComponentView = () => {
  // Interactive demo state
  const [status, setStatus] = useState<SourceLinkStatus>('enabled');
  const [text, setText] = useState('This is title of link');
  const [hasHref, setHasHref] = useState(true);

  return (
    <ComponentViewLayout
      title="Source Link"
      description="Source citation link."
    >

      {/* Demo Section */}
      <div className="space-y-20">
        <DemoSection
          controls={
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <ToggleButtons
                label="Status"
                options={['enabled', 'hover', 'active', 'visited'] as const}
                value={status}
                onChange={setStatus}
              />

              <FormCheckbox
                id="hasHref"
                label="External link"
                checked={hasHref}
                onCheckedChange={setHasHref}
              />

              <FormInput
                id="text"
                label="Link text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter link text..."
                className="col-span-2"
              />
            </div>
          }
        >
          <div className="">
            <SourceLink
              status={status}
              text={text}
              href={hasHref ? 'https://example.com' : undefined}
            />
          </div>
        </DemoSection>

        {/* Usage */}
        <div className="space-y-12">
          <div>
            <h2>Usage</h2>
          </div>

          <div className="space-y-12">
            {/* Enabled State */}
            <div>
              <h3 className="mb-2">Enabled</h3>
              <p className="mb-3">Default state with gray text and underline.</p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="">
                  <SourceLink
                    status="enabled"
                    text="This is title of link"
                    href="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* Hover State */}
            <div>
              <h3 className="mb-2">Hover</h3>
              <p className="mb-3">Interactive state when user hovers over the link.</p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="">
                  <SourceLink
                    status="hover"
                    text="This is title of link"
                  />
                </div>
              </div>
            </div>

            {/* Active State */}
            <div>
              <h3 className="mb-2">Active</h3>
              <p className="mb-3">State when user clicks/presses the link.</p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="">
                  <SourceLink
                    status="active"
                    text="This is title of link"
                  />
                </div>
              </div>
            </div>

            {/* Visited State */}
            <div>
              <h3 className="mb-2">Visited</h3>
              <p className="mb-3">State for previously visited links (purple).</p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="">
                  <SourceLink
                    status="visited"
                    text="This is title of link"
                  />
                </div>
              </div>
            </div>

            {/* In context Example */}
            <div>
              <h3 className="mb-2">In context</h3>
              <p className="mb-3">Example showing how source links appear within text content.</p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="">
                  <p className="vca-small-open text-vca-text">
                    According to recent research, user engagement increased by 45% after implementing AI recommendations.{' '}
                    <SourceLink
                      status="enabled"
                      text="Source: LinkedIn Study 2024"
                      href="https://example.com/study"
                    />
                  </p>
                </div>
              </div>
            </div>

            {/* Multiple Links Example */}
            <div>
              <h3 className="mb-2">Multiple sources</h3>
              <p className="mb-3">Example with multiple source citations in a single paragraph.</p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="">
                  <p className="vca-small-open text-vca-text">
                    The data shows significant improvements in productivity (
                    <SourceLink
                      status="enabled"
                      text="Study A"
                      href="https://example.com/a"
                    />, {' '}
                    <SourceLink
                      status="visited"
                      text="Study B"
                      href="https://example.com/b"
                    />) and user satisfaction (
                    <SourceLink
                      status="enabled"
                      text="Survey 2024"
                      href="https://example.com/survey"
                    />).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ComponentViewLayout>
  );
};

export default SourceLinkComponentView;

