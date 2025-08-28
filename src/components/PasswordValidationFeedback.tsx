import { Check, X } from 'lucide-react';

interface PasswordValidationFeedbackProps {
  password: string;
}

interface ValidationCriteria {
  label: string;
  isValid: boolean;
}

export const PasswordValidationFeedback = ({ password }: PasswordValidationFeedbackProps) => {
  const criteria: ValidationCriteria[] = [
    {
      label: 'Mínimo 8 caracteres',
      isValid: password.length >= 8,
    },
    {
      label: 'Pelo menos uma letra maiúscula',
      isValid: /[A-Z]/.test(password),
    },
    {
      label: 'Pelo menos um número',
      isValid: /[0-9]/.test(password),
    },
  ];

  // Only show if user has started typing
  if (!password) return null;

  return (
    <div className="mt-2 p-3 bg-muted/50 rounded-md border">
      <p className="text-sm font-medium text-foreground mb-2">A senha deve conter:</p>
      <ul className="space-y-1">
        {criteria.map((criterion, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            {criterion.isValid ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <X className="w-4 h-4 text-destructive" />
            )}
            <span
              className={
                criterion.isValid
                  ? 'text-green-600'
                  : 'text-muted-foreground'
              }
            >
              {criterion.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};