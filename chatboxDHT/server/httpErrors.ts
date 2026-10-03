import type { Response } from 'express';

function redactSensitiveValues(value: string): string {
  return value
    .replace(/(password|passphrase|token|secret|api[_-]?key|authorization)["']?\s*[:=]\s*("[^"]*"|'[^']*'|[^,\s}]+)/gi, '$1=[REDACTED]')
    .replace(/\b(?:mongodb(?:\+srv)?|https?):\/\/[^@\s]+@/gi, 'connection://[REDACTED]@')
    .replace(/\bBearer\s+[A-Za-z0-9._~-]+/gi, 'Bearer [REDACTED]');
}

export function logInternalError(error: unknown, context: string) {
  const detail = error instanceof Error
    ? { name: error.name, message: redactSensitiveValues(error.message) }
    : { message: redactSensitiveValues(String(error)) };
  console.error(`[${context}]`, detail);
}

export function sendInternalServerError(
  res: Response,
  error: unknown,
  context: string,
  status = 500
) {
  logInternalError(error, context);
  return res.status(status).json({
    success: false,
    message: 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.'
  });
}
