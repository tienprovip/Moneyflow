import axios from "axios";

export const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (typeof responseData === "string" && responseData.trim()) {
      return responseData;
    }

    if (
      responseData &&
      typeof responseData === "object" &&
      "message" in responseData &&
      typeof responseData.message === "string" &&
      responseData.message.trim()
    ) {
      return responseData.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};
