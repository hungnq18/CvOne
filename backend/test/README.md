# Test Setup Guide

Hướng dẫn thiết lập và chạy system tests cho backend.

## Cấu trúc Test

```
test/
├── jest-e2e.json          # Jest configuration cho e2e tests
├── setup-tests.ts         # Global test setup
├── app.e2e-spec.ts        # Main e2e test file
├── utils/                 # Test utilities
│   ├── test-app.util.ts      # Application setup helpers
│   ├── test-database.util.ts # Database utilities
│   └── test-helpers.util.ts  # General test helpers
└── README.md              # This file
```

## Thiết lập ban đầu

### 1. Tạo file `.env.test`

Tạo file `.env.test` trong thư mục `backend/` với nội dung tối thiểu:

```env
# Test Database (REQUIRED)
MONGODB_URI_TEST=mongodb://localhost:27017/cvone_test

# JWT Configuration (REQUIRED)
JWT_SECRET=your-jwt-secret-key-for-testing
JWT_EXPIRES_IN=1d

# Optional
NODE_ENV=test
PORT=8000
FRONTEND_URL=http://localhost:3000
```

**Xem file `test/ENV_TEST_SETUP.md` để biết hướng dẫn chi tiết.**

### 2. Cấu hình Test Database

Cập nhật `MONGODB_URI_TEST` trong `.env.test` với database test của bạn:

```env
MONGODB_URI_TEST=mongodb://localhost:27017/cvone_test
```

**Lưu ý quan trọng:**
- Sử dụng database riêng cho testing để tránh ảnh hưởng đến dữ liệu production
- Database sẽ được tự động clean sau mỗi test

### 3. Cài đặt dependencies (nếu chưa có)

```bash
npm install
```

## Chạy Tests

### Unit Tests
```bash
npm run test              # Chạy tất cả unit tests
npm run test:watch        # Chạy tests ở watch mode
npm run test:cov          # Chạy tests với coverage report
```

### E2E Tests
```bash
npm run test:e2e          # Chạy tất cả e2e tests
npm run test:e2e:watch    # Chạy e2e tests ở watch mode
npm run test:e2e:cov      # Chạy e2e tests với coverage
```

### Chạy tất cả tests
```bash
npm run test:all          # Chạy cả unit và e2e tests
```

## Viết E2E Tests

### Ví dụ cơ bản

```typescript
import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import * as request from 'supertest';
import { createTestApp, closeTestApp } from './utils/test-app.util';
import { dropAllCollections } from './utils/test-database.util';

describe('YourModule (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    app = await createTestApp();
    connection = app.get<Connection>(getConnectionToken());
  });

  afterEach(async () => {
    // Clean database after each test
    await dropAllCollections(connection);
  });

  afterAll(async () => {
    await connection.close();
    await closeTestApp(app);
  });

  it('should test your endpoint', () => {
    return request(app.getHttpServer())
      .get('/api/your-endpoint')
      .expect(200);
  });
});
```

### Sử dụng Test Utilities

#### Authentication Helper
```typescript
import { getAuthToken, authenticatedRequest } from './utils/test-helpers.util';

const token = await getAuthToken(app, 'test@example.com', 'password');
const response = await authenticatedRequest(app, token)
  .get('/api/protected-endpoint')
  .expect(200);
```

#### Database Cleanup
```typescript
import { dropAllCollections } from './utils/test-database.util';

afterEach(async () => {
  await dropAllCollections(connection);
});
```

## Best Practices

1. **Luôn cleanup database**: Sử dụng `dropAllCollections` sau mỗi test để đảm bảo test isolation
2. **Sử dụng test database riêng**: Không bao giờ test trên production database
3. **Đóng connections**: Luôn đóng app và database connections trong `afterAll`
4. **Test isolation**: Mỗi test nên độc lập, không phụ thuộc vào test khác
5. **Sử dụng helpers**: Tận dụng các utility functions để code gọn và dễ maintain

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra `MONGODB_URI_TEST` trong `.env.test`
- Đảm bảo MongoDB đang chạy
- Kiểm tra quyền truy cập database

### Tests chạy chậm
- Sử dụng `maxWorkers: 1` trong jest-e2e.json để tránh race conditions
- Tối ưu database cleanup operations

### Timeout errors
- Tăng `testTimeout` trong jest-e2e.json nếu cần
- Kiểm tra database connection performance

## Cấu trúc Test Files

Tất cả e2e test files nên:
- Có extension `.e2e-spec.ts`
- Đặt trong thư mục `test/`
- Sử dụng `createTestApp()` để setup
- Clean database sau mỗi test
- Đóng connections sau tất cả tests

