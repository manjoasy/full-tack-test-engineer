import { validate } from '../../middleware/validate.middleware';
import { Request, Response, NextFunction } from 'express';

describe('Validate Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  const nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockReq = { body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it('should call next(error) if an unexpected error occurs', () => {
    const schema = {
      parse: jest.fn().mockImplementation(() => {
        throw new Error('Unexpected error');
      }),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const middleware = validate(schema as any);
    middleware(mockReq as Request, mockRes as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
  });
});
