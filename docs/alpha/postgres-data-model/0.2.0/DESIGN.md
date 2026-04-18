# Design: postgres-data-model 0.2.0

**Issue:** #4  
**Question:** Which ORM — TypeORM or Prisma?

## Decision: TypeORM

### Rationale

| Criterion | TypeORM | Prisma |
|-----------|---------|--------|
| NestJS integration | `@nestjs/typeorm` — first-class; `TypeOrmModule.forRootAsync` is idiomatic | Requires a wrapper/adapter; no official NestJS module |
| Entity style | Class + decorator (matches NestJS modules/controllers convention) | Separate `schema.prisma` file; generated client |
| DataSource injection | `@InjectDataSource()` injectable natively — easy to mock in unit tests | Prisma Client is not an NestJS injectable by default |
| Composite PK | Natural via `@PrimaryColumn` × 2 | Supported via `@@id([...])` but less idiomatic with class-based approach |
| Migration runner | `typeorm-ts-node-commonjs -d data-source.ts migration:run` — no compile step | `prisma migrate deploy` — requires Prisma engine binary |
| Tooling overhead | One npm add + tsconfig already set | `prisma generate` compilation step added to every dev setup |

### Negative leverage

TypeORM's decorator-based entities are more verbose than Prisma's schema language. TypeORM 0.3.x has known issues with some complex query builders. If query complexity grows significantly in future cycles, Prisma migration should be reconsidered.

### Invariants preserved

- Monorepo root stays wiring-only; all TypeORM/pg deps land in `apps/backend/package.json`.
- `synchronize: false` — schema is managed exclusively via migrations.
- Entity field names: camelCase in TypeScript, `{ name: 'snake_case' }` in column decorators.

## Architecture layer

This is an **additive platform move** at the persistence layer: we are introducing the database module, not changing an existing boundary. No architecture assumption is challenged. Work shape is MCA (standard NestJS + TypeORM pattern).

## Schema decisions

- All `body` fields are `jsonb` (PostgreSQL) — extensible without future schema migrations.
- `QuestionAnswer(questionId, optionId)` is a composite PK junction table — enforces uniqueness of the grading key pair at DB level.
- `ExpectedAnswer` is a separate entity for `short_text` questions; `isCorrect` is not on `QuestionOption`.
- UUID primary keys generated application-side via TypeORM (`@PrimaryGeneratedColumn('uuid')`); migration enables `uuid-ossp` extension as a safety net for DB-side defaults.
