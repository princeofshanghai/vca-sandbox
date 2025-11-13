import { vcaColorsMeta } from '@/design-tokens';

type ColorToken = {
  name: string;
  class: string;
  value: string;
  reference?: string;
};

type ColorCategory = {
  title: string;
  description?: string;
  colors: ColorToken[];
};

const ColorSwatch = ({ name, colorClass, value, reference }: { name: string; colorClass: string; value: string; reference?: string }) => {
  return (
    <div className="space-y-3">
      <div className={`w-full h-20 rounded-lg border border-gray-200 ${colorClass}`} />
      <div className="space-y-1">
        <div className="text-sm font-medium text-gray-900">{name}</div>
        <div className="text-xs text-gray-500 font-mono">{colorClass}</div>
        <div className="text-xs text-gray-400 font-mono">{value}</div>
        {reference && (
          <div className="text-xs text-blue-600 font-mono">{reference}</div>
        )}
      </div>
    </div>
  );
};

const ColorCategory = ({ title, description, colors }: { title: string; description?: string; colors: ColorToken[] }) => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="mb-4">{title}</h2>
        {description && <p className="text-md text-gray-900">{description}</p>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {colors.map((color) => (
          <ColorSwatch
            key={color.class}
            name={color.name}
            colorClass={color.class}
            value={color.value}
            reference={color.reference}
          />
        ))}
      </div>
    </div>
  );
};

// Auto-generate color categories from design tokens
const generateColorCategories = (): ColorCategory[] => {
  const categories: ColorCategory[] = [];
  
  const categoryInfo: Record<string, { title: string; description: string }> = {
    'vca-action': {
      title: 'Action',
      description: 'Primary interactive elements like buttons and links',
    },
    'vca-text': {
      title: 'Text',
      description: 'Text colors for different contexts and states',
    },
    'vca-background': {
      title: 'Background',
      description: 'Surface and background colors',
    },
    'vca-border': {
      title: 'Border',
      description: 'Border colors for dividers and outlines',
    },
    'vca-surface': {
      title: 'Surface',
      description: 'Tinted surface colors',
    },
    'vca-link': {
      title: 'Link',
      description: 'Hyperlink colors and states',
    },
    'vca-icon': {
      title: 'Icon',
      description: 'Icon colors and interaction states',
    },
    'vca-label': {
      title: 'Label',
      description: 'Label and button text colors',
    },
    'vca-positive': {
      title: 'Positive',
      description: 'Success and positive status colors',
    },
    'vca-negative': {
      title: 'Negative',
      description: 'Error and negative status colors',
    },
    'vca-neutral': {
      title: 'Neutral',
      description: 'Neutral status colors',
    },
    'vca-premium': {
      title: 'Premium',
      description: 'Premium feature colors',
    },
    'vca-brand': {
      title: 'Brand',
      description: 'LinkedIn brand colors',
    },
    'vca-accent': {
      title: 'Accent',
      description: 'Accent and emphasis colors',
    },
    'vca-track': {
      title: 'Track',
      description: 'Progress track color',
    },
    'vca-shadow': {
      title: 'Shadow',
      description: 'Shadow colors',
    },
    'vca-action-transparent': {
      title: 'Action Transparent',
      description: 'Transparent action overlay colors',
    },
    'vca-action-background-transparent': {
      title: 'Action Background Transparent',
      description: 'Transparent action background colors (alias)',
    },
    'vca-background-action-transparent': {
      title: 'Background Action Transparent',
      description: 'Transparent background action colors (alias)',
    },
    'vca-shadow-supplemental': {
      title: 'Shadow Supplemental',
      description: 'Supplemental shadow color',
    },
    'vca-white': {
      title: 'White',
      description: 'Pure white color',
    },
    'vca-spec-orange': {
      title: 'Spec Orange',
      description: 'Specification orange color',
    },
  };

  // Helper to format token name
  const formatTokenName = (vcaKey: string, tokenKey: string): string => {
    const baseName = vcaKey.replace('vca-', '');
    if (tokenKey === 'DEFAULT') {
      return baseName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    const suffix = tokenKey.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return `${baseName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} ${suffix}`;
  };

  // Process each category from vcaColorsMeta
  for (const [vcaKey, tokens] of Object.entries(vcaColorsMeta)) {
    const colors: ColorToken[] = [];
    
    if (typeof tokens === 'object' && tokens !== null && 'value' in tokens && 'ref' in tokens) {
      // Single color token (like vca-track, vca-shadow)
      colors.push({
        name: formatTokenName(vcaKey, 'DEFAULT'),
        class: `bg-${vcaKey}`,
        value: (tokens as { value: string; ref: string }).value,
        reference: (tokens as { value: string; ref: string }).ref,
      });
    } else {
      // Nested tokens (like vca-action with DEFAULT, hover, active)
      for (const [tokenKey, tokenData] of Object.entries(tokens as Record<string, { value: string; ref: string }>)) {
        const suffix = tokenKey === 'DEFAULT' ? '' : `-${tokenKey}`;
        colors.push({
          name: formatTokenName(vcaKey, tokenKey),
          class: `bg-${vcaKey}${suffix}`,
          value: tokenData.value,
          reference: tokenData.ref,
        });
      }
    }

    if (colors.length > 0) {
      categories.push({
        title: categoryInfo[vcaKey]?.title || vcaKey,
        description: categoryInfo[vcaKey]?.description,
        colors,
      });
    }
  }

  return categories;
};

const ColorsView = () => {
  const colorCategories = generateColorCategories();
  
  return (
    <div className="pt-16">
      <h1 className="mb-4">Colors</h1>
      <p className="text-base text-gray-500 mb-12">
        VCA design system color palette and tokens. Each token shows its Tailwind class, hex value, and the primitive it references from Figma.
      </p>
      
      <div className="space-y-16">
        {colorCategories.map((category) => (
          <ColorCategory
            key={category.title}
            title={category.title}
            description={category.description}
            colors={category.colors}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorsView;
