import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | NoobReaders',
  description: 'NoobReaders terms of service and usage agreement',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="mb-6">
            These Terms of Service ("Terms") govern your access to and use of NoobReaders, including any content, functionality, and services offered on or through our website. By using our service, you agree to these Terms.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-6">
            By accessing or using NoobReaders, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not access or use our service.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. User Accounts</h2>
          <p className="mb-6">
            To access certain features of NoobReaders, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
          </p>
          <p className="mb-6">
            You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Content and Conduct</h2>
          <p className="mb-6">
            Our service allows you to post, link, store, share, and otherwise make available certain information, text, graphics, videos, or other material. You retain any rights that you may have in such content.
          </p>
          <p className="mb-6">
            By posting content to NoobReaders, you grant us a non-exclusive, royalty-free, transferable, sub-licensable, worldwide license to use, store, display, reproduce, save, modify, create derivative works, perform, and distribute your content on NoobReaders solely for the purpose of operating, developing, providing, and promoting our service.
          </p>
          <p className="mb-6">
            You are solely responsible for the content that you post on NoobReaders and you agree not to post content that:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li className="mb-2">Is illegal, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive of another's privacy, or otherwise objectionable</li>
            <li className="mb-2">Infringes any patent, trademark, trade secret, copyright, or other intellectual property or other rights of any other person</li>
            <li className="mb-2">Violates the legal rights (including the rights of publicity and privacy) of others or contains any material that could give rise to any civil or criminal liability under applicable laws</li>
            <li className="mb-2">Promotes discrimination, bigotry, racism, hatred, harassment, or harm against any individual or group</li>
            <li className="mb-2">Is likely to deceive any person</li>
            <li className="mb-2">Promotes illegal or harmful activities or substances</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Termination</h2>
          <p className="mb-6">
            We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including, but not limited to, a breach of the Terms.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Changes to Terms</h2>
          <p className="mb-6">
            We reserve the right to modify or replace these Terms at any time. It is your responsibility to check our Terms periodically for changes. Your continued use of the service following the posting of any changes to the Terms constitutes acceptance of those changes.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Contact Us</h2>
          <p className="mb-6">
            If you have any questions about these Terms, please contact us at <a href="mailto:legal@noobreaders.com" className="text-blue-600 hover:text-blue-500">legal@noobreaders.com</a>.
          </p>
          
          <p className="mt-10 text-gray-600 text-sm">Last updated: May 10, 2024</p>
        </div>
      </div>
    </div>
  );
} 