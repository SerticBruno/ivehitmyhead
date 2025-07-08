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
  showSocial?: boolean;
}

const Newsletter: React.FC<NewsletterProps> = ({
  className,
  title = "Stay Updated",
  description = "Get the latest memes and updates delivered to your inbox!",
  placeholder = "Enter your email address",
  buttonText = "Subscribe",
  showSocial = true
}) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Here you would typically send the email to your backend
      console.log('Subscribing email:', email);
      setIsSubscribed(true);
      setEmail('');
      // Reset after 3 seconds
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const socialLinks = [
    { name: 'Twitter', icon: '🐦', url: '#' },
    { name: 'Discord', icon: '💬', url: '#' },
    { name: 'Instagram', icon: '📸', url: '#' },
    { name: 'YouTube', icon: '📺', url: '#' }
  ];

  return (
    <div className={cn("bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white", className)}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-blue-100">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder={placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-blue-200"
            required
          />
          <Button
            type="submit"
            className="bg-white text-blue-600 hover:bg-blue-50"
            disabled={isSubscribed}
          >
            {isSubscribed ? '✅ Subscribed!' : buttonText}
          </Button>
        </div>
      </form>

      {showSocial && (
        <div className="text-center">
          <p className="text-blue-100 mb-3">Follow us on social media</p>
          <div className="flex justify-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                className="text-2xl hover:scale-110 transition-transform cursor-pointer"
                title={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { Newsletter };
export type { NewsletterProps }; 