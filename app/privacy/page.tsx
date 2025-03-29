import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | NoobReaders',
  description: 'NoobReaders privacy policy and data protection information',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="mb-6">
            At NoobReaders, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">We may collect information about you in a variety of ways. The information we may collect includes:</p>
          
          <h3 className="text-xl font-medium mt-6 mb-2">Personal Data</h3>
          <p className="mb-4">
            When you register for an account, we collect personally identifiable information, such as your name, email address, and demographic information. This information is collected on a voluntary basis when you provide it to us.
          </p>
          
          <h3 className="text-xl font-medium mt-6 mb-2">Derivative Data</h3>
          <p className="mb-4">
            Our servers automatically record information that your browser sends whenever you visit our website. This data may include information such as your IP address, browser type, the pages you visit, the time spent on those pages, and other statistics.
          </p>
          
          <h3 className="text-xl font-medium mt-6 mb-2">Financial Data</h3>
          <p className="mb-4">
            If you choose to subscribe to our premium services or make purchases through our platform, we collect financial information, such as payment method details. We store only very limited financial information that we need to process transactions.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use of Your Information</h2>
          <p className="mb-4">Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the website to:</p>
          
          <ul className="list-disc pl-6 mb-6">
            <li className="mb-2">Create and manage your account</li>
            <li className="mb-2">Provide and deliver the products and services you request</li>
            <li className="mb-2">Respond to customer service requests and support needs</li>
            <li className="mb-2">Send you administrative information, such as updates, security alerts, and support messages</li>
            <li className="mb-2">Personalize your experience and deliver content and product offerings relevant to your interests</li>
            <li className="mb-2">Monitor and analyze usage and trends to improve your experience with the website</li>
            <li className="mb-2">Notify you of updates to our website and products</li>
            <li className="mb-2">Prevent fraudulent transactions, monitor against theft, and protect against criminal activity</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Disclosure of Your Information</h2>
          <p className="mb-4">We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
          
          <h3 className="text-xl font-medium mt-6 mb-2">By Law or to Protect Rights</h3>
          <p className="mb-4">
            If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
          </p>
          
          <h3 className="text-xl font-medium mt-6 mb-2">Third-Party Service Providers</h3>
          <p className="mb-4">
            We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Security of Your Information</h2>
          <p className="mb-4">
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Children's Privacy</h2>
          <p className="mb-4">
            We do not knowingly collect information from children under the age of 13. If you are under the age of 13, please do not submit any personal information through the website. If you have reason to believe that a child under the age of 13 has provided personal information to us, please contact us, and we will endeavor to delete that information from our databases.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Changes to This Privacy Policy</h2>
          <p className="mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact Us</h2>
          <p className="mb-6">
            If you have questions or concerns about this Privacy Policy, please contact us at <a href="mailto:privacy@noobreaders.com" className="text-blue-600 hover:text-blue-500">privacy@noobreaders.com</a>.
          </p>
          
          <p className="mt-10 text-gray-600 text-sm">Last updated: May 10, 2024</p>
        </div>
      </div>
    </div>
  );
} 