import { validate } from '../../middleware/validate.middleware';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

describe('Validate Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

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

    const middleware = validate(schema as any);
    middleware(mockReq as Request, mockRes as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
  });
});
