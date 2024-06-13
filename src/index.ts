import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createHash } from 'crypto'


const fetchAsBuffer = async (url: string) => {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

const sha256hash = (buffer: Buffer) => {
  return createHash('sha256').update(buffer).digest('hex')
}

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event?.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Bad Request',
        }),
      }
    }
    const body = JSON.parse(event.body);

    const blob = await fetchAsBuffer(body.url);
    const hash = sha256hash(blob);

    return {
      statusCode: 200,
      body: JSON.stringify({
        url: body.url,
        hash,
        size: Buffer.byteLength(blob)
      }),
    };
  } catch (err: unknown) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: err instanceof Error ? err.message : 'some error happened',
      }),
    };
  }
};
