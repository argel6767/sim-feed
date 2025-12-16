import { handler } from '../src/handlers/getPersonaInfo'
import { getPool } from '../src/lib/db';
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

jest.mock('../src/lib/db');

describe('getPersonaInfo Handler', () => { 
  let mockQuery: jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = jest.fn().mockResolvedValue({ 
      rows : [{ id: 1, description: 'The coolest persona', created_at: '2023-01-01T00:00:00Z' }] 
    });
    (getPool as jest.Mock).mockResolvedValue({ query: mockQuery });
  });
  
  const createEvent = (): APIGatewayProxyEventV2 => ({
      version: '2.0',
      routeKey: 'GET /personas',
      rawPath: '/personas/1',
      rawQueryString: 'page=1',
      headers: {},
      pathParameters: { persona_id: '1' },
      requestContext: {
        http: {
          method: 'GET',
          path: '/personas',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: '',
        },
        routeKey: 'GET /personas',
        stage: '$default',
        accountId: '123456789012',
        apiId: 'api-id',
        domainName: 'example.com',
        domainPrefix: 'example',
        requestId: 'request-id',
        timeEpoch: Date.now(),
        time: '2023-01-01T00:00:00Z',
      },
      body: "",
      isBase64Encoded: false
    });
  
  const context = {} as any;
  const callback = jest.fn();
  
  it('should return persona info', async () => {
    const event = createEvent();
    const result = await handler(event, context, callback) as APIGatewayProxyStructuredResultV2;
    console.log(result)
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body!)).toStrictEqual({ id: 1, description: 'The coolest persona', created_at: '2023-01-01T00:00:00Z' });
  });
  
  it('should return 404 if persona not found', async () => {
    const event = createEvent();
    mockQuery.mockResolvedValue({ rows: [] });
    const result = await handler(event, context, callback) as APIGatewayProxyStructuredResultV2;
    console.log(result)
    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body!)).toStrictEqual({ error: 'Not Found', message: `Persona with ID ${event.pathParameters!.persona_id} not found` });
  });
  
  it('should return 400 if persona_id is invalid', async () => {
    const event = createEvent();
    event.pathParameters!.persona_id = 'invalid';
    const result = await handler(event, context, callback) as APIGatewayProxyStructuredResultV2;
    console.log(result)
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body!)).toStrictEqual({ error: 'Bad Request', message: 'Missing persona_id parameter' });
  });
  
  it('should return 400 if persona_id is missing', async () => {
    const event = createEvent();
    delete event.pathParameters!.persona_id;
    const result = await handler(event, context, callback) as APIGatewayProxyStructuredResultV2;
    console.log(result)
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body!)).toStrictEqual({ error: 'Bad Request', message: 'Missing persona_id parameter' });
  });
  
});