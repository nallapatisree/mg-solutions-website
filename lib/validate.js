// Small, dependency-free validation helpers used by API routes.
// All public input passes through here on the SERVER — client validation is UX only.

export function str(value, { max = 5000 } = {}) {
  if (value === null || value === undefined) return '';
  return String(value).trim().slice(0, max);
}

export function isEmail(value) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(value || '').trim());
}

export function isPhone(value) {
  return /^[0-9+\-\s()]{7,20}$/.test(String(value || '').trim());
}

export function toInt(value, fallback = 0) {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

export function toBoolInt(value) {
  return value === true || value === 1 || value === '1' || value === 'on' || value === 'true' ? 1 : 0;
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// Validates a payload against a resource field config. Returns { values, errors }.
export function validateResource(resource, body) {
  const values = {};
  const errors = {};

  for (const field of resource.fields) {
    const raw = body[field.name];

    switch (field.type) {
      case 'checkbox':
        values[field.name] = toBoolInt(raw);
        break;
      case 'number': {
        let n = toInt(raw, field.default ?? 0);
        if (field.min !== undefined || field.max !== undefined) {
          n = clamp(n, field.min ?? -999999, field.max ?? 999999);
        }
        values[field.name] = n;
        break;
      }
      case 'tags': {
        const arr = Array.isArray(raw)
          ? raw
          : str(raw).split(',').map((t) => t.trim()).filter(Boolean);
        values[field.name] = JSON.stringify(arr);
        break;
      }
      case 'select': {
        const v = str(raw);
        values[field.name] = field.options?.includes(v) ? v : field.default ?? field.options?.[0] ?? '';
        break;
      }
      case 'textarea':
        values[field.name] = str(raw, { max: 20000 });
        break;
      default:
        values[field.name] = str(raw, { max: 1000 });
    }

    if (field.required && !String(values[field.name] ?? '').trim()) {
      errors[field.name] = `${field.label} is required`;
    }
  }

  return { values, errors };
}
