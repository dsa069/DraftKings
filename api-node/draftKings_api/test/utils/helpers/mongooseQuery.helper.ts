export const mockExecResolved = <T>(value: T): { exec: jest.Mock } => ({
  exec: jest.fn().mockResolvedValue(value),
});

export const mockExecRejected = (error: unknown): { exec: jest.Mock } => ({
  exec: jest.fn().mockRejectedValue(error),
});
