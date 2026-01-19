export const config = () => {
    return {
        jwt: {
            secret: process.env.JWT_SECRET || 'default_jwt_secret',
            expiresIn: process.env.JWT_EXPIRATION || '1h',
        },
        database: {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            username: process.env.DB_USERNAME || 'user',
            password: process.env.DB_PASSWORD || 'password',
            database: process.env.DB_NAME || 'taxis_db',
        },
        cookies: {
            secret: process.env.COOKIE_SECRET || 'default_cookie_secret',
        },
        server: {
            port: process.env.PORT || 3000,
        },
        frontend: {
            url: process.env.FRONTEND_URL || 'http://localhost:5173',
        },
    };
};
