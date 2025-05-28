import { toast } from '@repo/ui/components/ui/sonner';
import { t } from 'i18next'; // Import the translation function
import { AlertTriangle, XCircle } from 'lucide-react'; // For icons
import Description from './Description';
import RedirectLogin from './RedirectLogin';


export const fetchErrorNotification = {
  error: ({
    status,
    errorMessage,
  }: { errorMessage: string; status: number }) => {
    toast.error(t("fetchError.title", { ns: 'error' }), {
      description: (
        <Description message={errorMessage} statusOrErrorCode={status} />
      ),
      icon: <XCircle className="h-5 w-5" />, // Or appropriate emoji/icon
      // type: 'error' is implicit with toast.error
    });
  },
};

export const loginRequiredNotification = {
  redirect: ({ timeout = 2000 }: { timeout?: number } = {}) => {
    toast(t('loginRequired.title', { ns: 'error' }), {
      // Using generic toast, can be toast.warning
      description: <RedirectLogin timeout={timeout} />,
      duration: timeout + 500, // Give a bit more time than the redirect itself
      icon: <AlertTriangle className="h-5 w-5 text-orange-500" />, // Or appropriate emoji/icon
      // showProgress and type: 'warning' are specific to antd, sonner handles this differently
      // Sonner has a progress bar by default for timed toasts.
    });
  },
};
