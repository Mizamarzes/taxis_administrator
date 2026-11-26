import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PredictionsService } from './predictions.service';

const buildService = (values: Record<string, unknown>) =>
    new PredictionsService({ get: (key: string) => values[key] } as unknown as ConfigService);

const defaultConfig = {
    'ml.url': 'http://ml.test',
    'ml.key': 'secret-key',
    'ml.timeoutMs': 1000,
};

describe('PredictionsService', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        global.fetch = originalFetch;
        jest.restoreAllMocks();
    });

    it('sends the internal key and forwards the vehicle filter', async () => {
        const payload = { training: {}, predictions: [] };
        const fetchMock = jest
            .fn()
            .mockResolvedValue({ ok: true, json: () => Promise.resolve(payload) });
        global.fetch = fetchMock;

        const result = await buildService(defaultConfig).getOilChangePredictions(7);

        expect(result).toEqual(payload);
        const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(url).toBe('http://ml.test/oil-change/predictions?vehicleId=7');
        expect(init.headers).toEqual({ 'X-Internal-Key': 'secret-key' });
    });

    it('returns 503 when the ML service is unreachable', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

        await expect(buildService(defaultConfig).getOilChangePredictions()).rejects.toBeInstanceOf(
            ServiceUnavailableException,
        );
    });

    it('returns 503 when the ML service answers with an error', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 500,
            text: () => Promise.resolve('boom'),
        });

        await expect(buildService(defaultConfig).trainOilChangeModel()).rejects.toBeInstanceOf(
            ServiceUnavailableException,
        );
    });

    it('fails without calling the ML service when the key is missing', async () => {
        const fetchMock = jest.fn();
        global.fetch = fetchMock;

        await expect(
            buildService({ ...defaultConfig, 'ml.key': '' }).getOilChangePredictions(),
        ).rejects.toBeInstanceOf(ServiceUnavailableException);
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
