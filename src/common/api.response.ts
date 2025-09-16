export class ApiResponse {
  response({
    data,
    message = 'Success',
    meta = null,
  }: {
    data: any;
    message?: string;
    meta?: any;
  }) {
    return { message, data, meta };
  }
}
