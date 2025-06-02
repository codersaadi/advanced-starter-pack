import { serve } from "@repo/notification/novu";
import { welcomeOnboardingEmail } from "@repo/notification/novu/workflows";

// the workflows collection can hold as many workflow definitions as you need
export const { GET, POST, OPTIONS } = serve({
  workflows: [welcomeOnboardingEmail],
});
