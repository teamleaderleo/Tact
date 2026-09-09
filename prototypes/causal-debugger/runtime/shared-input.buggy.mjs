export function normalizeText(value) {
  const text = String(value ?? "");
  if (/\s/.test(text)) {
    throw new Error("E_INTERNAL_SPACE: text values cannot contain whitespace");
  }
  if (!text) {
    throw new Error("E_EMPTY: text value is required");
  }
  return text;
}

export function saveProfile(input) {
  return { saved: true, displayName: normalizeText(input.displayName) };
}

export function sendInvite(input) {
  return { sent: true, role: normalizeText(input.role) };
}
