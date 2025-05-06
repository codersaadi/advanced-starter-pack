import {
  CheckCircledIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons';
interface FormFeedbackProps {
  message?: string;
  type?: 'error' | 'success';
}
export function FormFeedback({ message, type }: FormFeedbackProps) {
  if (!message) {
    return null;
  }
  const errorClass = `
      bg-destructive/15 text-destructive
      `;
  const successClass = `
      bg-emerald-600/15 text-emerald-600
      `;

  return (
    <div
      className={`${type === 'success' ? successClass : errorClass}px-2 mt-1 flex items-center gap-x-3 rounded-md py-1 text-sm `}
    >
      {type === 'success' ? <CheckCircledIcon /> : <ExclamationTriangleIcon />}
      <span>{message}</span>
    </div>
  );
}
