import os

structure = [
    ".github/",
    "src/config/",
    "src/controllers/",
    "src/interfaces/",
    "src/lib/",
    "src/middlewares/",
    "src/routes/",
    "src/services/",
    "src/services/providers/",
    "src/sockets/",
    "src/jobs/",
    "src/utils/",
    "tests/unit/",
    "tests/integration/"
]

files = [
    "src/config/config.ts",
    "src/config/redis.ts",

    "src/controllers/token.controller.ts",

    "src/interfaces/token.interface.ts",
    "src/interfaces/api.interface.ts",

    "src/lib/httpClient.ts",
    "src/lib/logger.ts",

    "src/middlewares/errorHandler.ts",
    "src/middlewares/rateLimiter.ts",

    "src/routes/token.routes.ts",

    "src/services/aggregation.service.ts",
    "src/services/cache.service.ts",
    "src/services/providers/base.provider.ts",
    "src/services/providers/dexscreener.ts",
    "src/services/providers/jupiter.ts",

    "src/sockets/socketServer.ts",
    "src/sockets/events.ts",

    "src/jobs/dataFetcher.job.ts",

    "src/utils/math.ts",
    "src/utils/normalizers.ts",

    "src/app.ts",
    "src/server.ts",

    ".env",
    ".gitignore",
    "docker-compose.yml",
    "jest.config.js",
    "package.json",
    "README.md",
    "tsconfig.json"
]


def create_structure():
    # Create directories
    for folder in structure:
        os.makedirs(folder, exist_ok=True)

    # Create empty files
    for file in files:
        with open(file, "w", encoding="utf-8") as f:
            pass

    print("Project structure created successfully!")


if __name__ == "__main__":
    create_structure()
