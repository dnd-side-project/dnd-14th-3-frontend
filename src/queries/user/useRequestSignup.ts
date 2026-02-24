import { useMutation } from "@tanstack/react-query";

import { signUpApi, type SignupRequest } from "@/api/auth/sign-up.api";

interface RequestSignupParams {
  token: string;
  data: SignupRequest;
}

export function useRequestSignup() {
  return useMutation({
    mutationFn: ({ token, data }: RequestSignupParams) => signUpApi(token, data),
  });
}
