import { H3Event, setResponseStatus } from 'h3';
export function createAuthResponse(event: H3Event, {
  response = {},
  status,
  statusCode = 401,
}: {
  status: 'ok' | 'error',
  response?: any,
  statusCode?: number,

}) {
  if (status === 'error') {
    setResponseStatus(event, statusCode);
  }
  return {
    status,
    response,
  };
}


