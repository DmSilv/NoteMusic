// Test file to verify Design System imports
import { colors, theme } from './index';

console.log('Colors:', colors);
console.log('Theme:', theme);

// Test if colors exist
if (colors && colors.primary) {
  console.log('✅ Colors imported successfully');
} else {
  console.log('❌ Colors import failed');
}

// Test if theme exists
if (theme && theme.colors) {
  console.log('✅ Theme imported successfully');
} else {
  console.log('❌ Theme import failed');
} 