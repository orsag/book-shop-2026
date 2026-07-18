import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Recursively clean strings in an object
export function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;

  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = DOMPurify.sanitize(obj[key]); // Strips HTML tags entirely by default
    } else if (
      typeof obj[key] === 'object' &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      sanitizeObject(obj[key]);
    }
  }
  return obj;
}
