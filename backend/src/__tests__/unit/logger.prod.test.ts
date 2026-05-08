describe('Logger Production Config', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.resetModules();
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should add file transports in production', () => {
    process.env.NODE_ENV = 'production';
    // We need to re-import config and logger to trigger the logic
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { logger } = require('../../utils/logger');
    
    const fileTransports = logger.transports.filter((t: { filename?: string }) => t.filename);
    expect(fileTransports.length).toBeGreaterThan(0);
  });
});
