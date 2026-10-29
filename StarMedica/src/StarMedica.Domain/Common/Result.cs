namespace StarMedica.Domain.Common;

public class Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }
    public int StatusCode { get; }

    private Result(bool isSuccess, T? value, string? error, int statusCode)
    {
        IsSuccess = isSuccess;
        Value = value;
        Error = error;
        StatusCode = statusCode;
    }

    public static Result<T> Success(T value, int statusCode = 200) =>
        new(true, value, null, statusCode);

    public static Result<T> Created(T value) =>
        new(true, value, null, 201);

    public static Result<T> Failure(string error, int statusCode = 400) =>
        new(false, default, error, statusCode);

    public static Result<T> NotFound(string error = "No encontrado") =>
        new(false, default, error, 404);

    public static Result<T> Unauthorized(string error = "No autorizado") =>
        new(false, default, error, 401);
}
