import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { cn } from '@/lib/utils';

interface NewsletterProps {
  className?: string;
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
}

const Newsletter: React.FC<NewsletterProps> = ({
  className,
  title = "Get the latest memes",
  description = "Subscribe to our newsletter for the best memes delivered to your inbox.",
  placeholder = "Enter your email",
  buttonText = "Subscribe"
}) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log('Subscribing email:', email);
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6", className)}>
      <div className="text-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder={placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            required
          />
          <Button
            type="submit"
            disabled={isSubscribed}
            className="whitespace-nowrap"
          >
            {isSubscribed ? 'Subscribed!' : buttonText}
          </Button>
        </div>
      </form>
    </div>
  );
};

export { Newsletter };
export type { NewsletterProps }; 