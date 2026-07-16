import type { AxiosInstance } from 'axios';

import type { AppSchema } from '@/packages/schema';

import { toAxiosRequestConfig } from './helpers/axios-config.helper';
import { parseResponseWithSchema } from './helpers/parse-response.helper';
import type { HttpClient } from './interfaces/http.interfaces';
import type { HttpRequestOptions } from './types/http.types';

/**
 * Axios-backed HttpClient. Every response body crosses a Zod schema before
 * it reaches feature code; transport failures are normalized by the
 * response interceptor installed in the factory.
 */
export class AxiosHttpClient implements HttpClient {
  readonly #instance: AxiosInstance;

  public constructor(instance: AxiosInstance) {
    this.#instance = instance;
  }

  public async get<T>(
    path: string,
    responseSchema: AppSchema<T>,
    options?: HttpRequestOptions,
  ): Promise<T> {
    const response = await this.#instance.request<unknown>({
      ...toAxiosRequestConfig(options),
      method: 'GET',
      url: path,
    });
    return parseResponseWithSchema(responseSchema, response.data);
  }

  public async post<T>(
    path: string,
    body: unknown,
    responseSchema: AppSchema<T>,
    options?: HttpRequestOptions,
  ): Promise<T> {
    const response = await this.#instance.request<unknown>({
      ...toAxiosRequestConfig(options),
      method: 'POST',
      url: path,
      data: body,
    });
    return parseResponseWithSchema(responseSchema, response.data);
  }

  public async put<T>(
    path: string,
    body: unknown,
    responseSchema: AppSchema<T>,
    options?: HttpRequestOptions,
  ): Promise<T> {
    const response = await this.#instance.request<unknown>({
      ...toAxiosRequestConfig(options),
      method: 'PUT',
      url: path,
      data: body,
    });
    return parseResponseWithSchema(responseSchema, response.data);
  }

  public async patch<T>(
    path: string,
    body: unknown,
    responseSchema: AppSchema<T>,
    options?: HttpRequestOptions,
  ): Promise<T> {
    const response = await this.#instance.request<unknown>({
      ...toAxiosRequestConfig(options),
      method: 'PATCH',
      url: path,
      data: body,
    });
    return parseResponseWithSchema(responseSchema, response.data);
  }

  public async delete(path: string, options?: HttpRequestOptions): Promise<void> {
    await this.#instance.request<unknown>({
      ...toAxiosRequestConfig(options),
      method: 'DELETE',
      url: path,
    });
  }

  public async postMultipart<T>(
    path: string,
    form: FormData,
    responseSchema: AppSchema<T>,
    options?: HttpRequestOptions,
  ): Promise<T> {
    const response = await this.#instance.request<unknown>({
      ...toAxiosRequestConfig(options),
      method: 'POST',
      url: path,
      data: form,
    });
    return parseResponseWithSchema(responseSchema, response.data);
  }

  public async download(path: string, options?: HttpRequestOptions): Promise<Blob> {
    const response = await this.#instance.request<Blob>({
      ...toAxiosRequestConfig(options),
      method: 'GET',
      url: path,
      responseType: 'blob',
    });
    return response.data;
  }
}
