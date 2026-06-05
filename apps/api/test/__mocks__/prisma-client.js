class PrismaClient {
  constructor() {
    this.$connect = jest.fn().mockResolvedValue(undefined);
    this.$disconnect = jest.fn().mockResolvedValue(undefined);
  }
}

module.exports = {
  PrismaClient,
  Prisma: {},
};
