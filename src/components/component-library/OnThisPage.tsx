import { useEffect, useState } from 'react';
import { cn } from '@/utils';

type HeadingItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

/**
 * OnThisPage - Sticky sidebar navigation for component view pages
 * Automatically detects headings (default h2, h3) and creates anchor links
 */
export const OnThisPage = ({ selectors = 'h2, h3' }: { selectors?: string }) => {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Find all matching elements based on selectors
    const headingElements = document.querySelectorAll(selectors);
    const headingItems: HeadingItem[] = [];

    headingElements.forEach((heading) => {
      const text = heading.textContent || '';
      const level = heading.tagName === 'H2' ? 2 : 3;

      // Generate ID from text (convert to lowercase, replace spaces with hyphens)
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Set the ID on the heading element if it doesn't have one
      if (!heading.id) {
        heading.id = id;
      }

      headingItems.push({
        id: heading.id || id,
        text: text.trim(),
        level,
      });
    });

    setHeadings(headingItems);

    // Set up intersection observer to highlight active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -70% 0%',
        threshold: 0,
      }
    );

    headingElements.forEach((heading) => {
      observer.observe(heading);
    });

    return () => {
      observer.disconnect();
    };
  }, [selectors]);

  if (headings.length === 0) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Find the scroll container (main element with overflow-y-auto)
      const scrollContainer = document.querySelector('main');

      if (scrollContainer) {
        // Get the element's position relative to the scroll container
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        // Calculate the scroll position needed
        const offset = 20; // Small offset from top
        const scrollTop = scrollContainer.scrollTop;
        const elementTop = elementRect.top - containerRect.top + scrollTop;

        scrollContainer.scrollTo({
          top: elementTop - offset,
          behavior: 'smooth',
        });
      } else {
        // Fallback to window scroll if main container not found
        const offset = 20; // Account for padding (TopNavigation removed)
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h4 className="text-xs font-medium text-shell-muted">On this page</h4>
      </div>
      <nav className="space-y-1">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            onClick={(e) => handleClick(e, heading.id)}
            className={cn(
              'block text-[13px] transition-colors',
              heading.level === 2
                ? 'text-shell-muted hover:text-shell-text font-medium'
                : 'text-shell-muted hover:text-shell-muted-strong pl-4',
              activeId === heading.id && 'text-shell-text font-medium'
            )}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  );
};

