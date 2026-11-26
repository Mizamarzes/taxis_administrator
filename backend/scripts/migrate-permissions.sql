BEGIN;

ALTER TABLE roles ADD COLUMN IF NOT EXISTS "isSystem" boolean NOT NULL DEFAULT false;
UPDATE roles SET "isSystem" = true WHERE name IN ('SUPERADMIN', 'ADMIN', 'USER');

ALTER TABLE permissions ADD COLUMN IF NOT EXISTS description varchar(255);

DELETE FROM role_permissions;

ALTER TABLE role_permissions
    DROP CONSTRAINT IF EXISTS "UQ_role_permissions_role_permission";
ALTER TABLE role_permissions
    ADD CONSTRAINT "UQ_role_permissions_role_permission" UNIQUE (role_id, permission_id);

COMMIT;
