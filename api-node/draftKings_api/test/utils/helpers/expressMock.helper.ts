import type { Request, Response } from "express";

export interface ExpressMockContext<
  TRequest extends Partial<Request> = Partial<Request>,
> {
  req: TRequest;
  res: Partial<Response>;
  statusMock: jest.Mock;
  jsonMock: jest.Mock;
  sendMock: jest.Mock;
}

export const createExpressMockContext = <
  TRequest extends Partial<Request> = Partial<Request>,
>(
  requestInit?: TRequest,
): ExpressMockContext<TRequest> => {
  const jsonMock = jest.fn();
  const sendMock = jest.fn();
  const statusMock = jest
    .fn()
    .mockReturnValue({ json: jsonMock, send: sendMock });

  const req = { body: {}, ...(requestInit ?? {}) } as unknown as TRequest;
  const res: Partial<Response> = {
    status: statusMock,
    json: jsonMock,
    send: sendMock,
  };

  return {
    req,
    res,
    statusMock,
    jsonMock,
    sendMock,
  };
};
