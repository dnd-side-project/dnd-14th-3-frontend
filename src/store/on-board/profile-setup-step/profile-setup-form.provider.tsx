import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider , useForm } from "react-hook-form";

import {
  PROFILE_SETUP_FORM_DEFAULTS,
  profileSetupDataSchema,
  type ProfileSetupFormValues,
} from "@/types/profile";

export function ProfileSetupFormProvider({ children }: { children: React.ReactNode }) {
    const form = useForm<ProfileSetupFormValues>({
        resolver: zodResolver(profileSetupDataSchema),
        defaultValues: PROFILE_SETUP_FORM_DEFAULTS,
    });
    
    return <FormProvider {...form}>{children}</FormProvider>;
}