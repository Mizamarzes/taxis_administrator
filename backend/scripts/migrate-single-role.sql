BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id int;

UPDATE users u
SET role_id = picked.role_id
FROM (
    SELECT DISTINCT ON (ur.user_id) ur.user_id, ur.role_id
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    ORDER BY ur.user_id,
             CASE r.name WHEN 'SUPERADMIN' THEN 1 WHEN 'ADMIN' THEN 2 ELSE 3 END
) picked
WHERE u.id = picked.user_id AND u.role_id IS NULL;

UPDATE users
SET role_id = (SELECT id FROM roles WHERE name = 'USER')
WHERE role_id IS NULL;

ALTER TABLE users ALTER COLUMN role_id SET NOT NULL;

DROP TABLE user_roles;

COMMIT;
